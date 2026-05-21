import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect, useRef } from 'react';
import { User, Conversation, Message } from '../types';
import { api, setToken } from '../services/api';
import { connectWS, disconnectWS, addWSHandler, removeWSHandler } from '../services/websocket';
import { initNotification, showNotification, requestNotificationPermission } from '../services/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState as RNAppState } from 'react-native';

const STORAGE_KEY_TOKEN = 'im_token';
const STORAGE_KEY_USER = 'im_user';

interface AppGlobalState {
  isLoggedIn: boolean;
  currentUser: User | null;
  conversations: Conversation[];
  users: User[];
  loading: boolean;
  restoring: boolean;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'REMOVE_CONVERSATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'RESTORE_DONE' };

const initialState: AppGlobalState = {
  isLoggedIn: false,
  currentUser: null,
  conversations: [],
  users: [],
  loading: false,
  restoring: true,
};

function appReducer(state: AppGlobalState, action: Action): AppGlobalState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        currentUser: null,
        conversations: [],
        users: [],
      };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? action.payload : conv,
        ),
      };
    case 'REMOVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(
          conv => conv.id !== action.payload,
        ),
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        conversations: state.conversations.map(conv => {
          if (conv.id === action.payload) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        }),
      };
    case 'ADD_MESSAGE': {
      const { conversationId, message } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: message.content,
              updatedAt: message.createdAt,
              unreadCount: conv.unreadCount + 1,
            };
          }
          return conv;
        }),
      };
    }
    case 'RESTORE_DONE':
      return { ...state, restoring: false };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppGlobalState;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
  onWSMessage: (msg: any) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const appStateRef = useRef(RNAppState.currentState);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);

  const restoreSession = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      const savedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);

      if (savedToken && savedUser) {
        setToken(savedToken);
        const user: User = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN', payload: { user } });

        connectWS(savedToken);

        try {
          const freshUser = await api.getCurrentUser();
          const updatedUser: User = {
            id: freshUser.id,
            name: freshUser.name,
            avatar: freshUser.avatar,
            phone: freshUser.phone,
          };
          await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
          dispatch({ type: 'LOGIN', payload: { user: updatedUser } });
        } catch {
          await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEY_USER);
          setToken(null);
          disconnectWS();
          dispatch({ type: 'LOGOUT' });
        }
      }
    } catch {
      // AsyncStorage error
    } finally {
      dispatch({ type: 'RESTORE_DONE' });
    }
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.login(phone, password);
      setToken(res.token);
      const user: User = {
        id: res.user.id,
        name: res.user.name,
        avatar: res.user.avatar,
        phone: res.user.phone,
      };
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, res.token);
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      dispatch({ type: 'LOGIN', payload: { user } });
      connectWS(res.token);
      await requestNotificationPermission();
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    disconnectWS();
    await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.getConversations();
      const conversations: Conversation[] = res.map(item => ({
        id: item.id,
        type: item.type as 'private' | 'group',
        name: item.name,
        avatar: item.avatar,
        lastMessage: item.last_message,
        unreadCount: item.unread_count,
        updatedAt: item.updated_at,
        groupId: item.group_id || undefined,
      }));
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
    } catch {
      // ignore
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.getContacts();
      const users: User[] = res.map(item => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        phone: item.phone,
      }));
      dispatch({ type: 'SET_USERS', payload: users });
    } catch {
      // ignore
    }
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      const res = await api.sendMessage(conversationId, content);
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) {
        dispatch({
          type: 'UPDATE_CONVERSATION',
          payload: {
            ...conv,
            lastMessage: res.content,
            updatedAt: res.created_at,
          },
        });
      }
    },
    [state.conversations],
  );

  const markAsRead = useCallback(async (conversationId: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: conversationId });
    try {
      await api.markAsRead(conversationId);
    } catch {
      // ignore
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    dispatch({ type: 'REMOVE_CONVERSATION', payload: conversationId });
    try {
      await api.deleteConversation(conversationId);
    } catch {
      // ignore
    }
  }, []);

  const getUserById = useCallback(
    (id: string): User | undefined => {
      if (id === state.currentUser?.id) return state.currentUser;
      return state.users.find(u => u.id === id);
    },
    [state.currentUser, state.users],
  );

  const onWSMessage = useCallback((msg: any) => {
    if (msg.type === 'new_message' && msg.data) {
      const wsMsg = msg.data;
      const message: Message = {
        id: wsMsg.id,
        conversationId: wsMsg.conversation_id,
        senderId: wsMsg.sender_id,
        content: wsMsg.content,
        type: wsMsg.type || 'text',
        createdAt: wsMsg.created_at,
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId: message.conversationId, message },
      });

      if (message.conversationId !== activeConversationId) {
        const senderName = state.users.find(u => u.id === message.senderId)?.name || '用户';
        showNotification(senderName, message.content);
      }
    } else if (msg.type === 'friend_added' && msg.data) {
      showNotification('新好友', `${msg.data.user_name} 添加你为好友`);
      fetchUsers();
      fetchConversations();
    } else if (msg.type === 'new_conversation' && msg.data) {
      fetchConversations();
    }
  }, [state.users, fetchUsers, fetchConversations, activeConversationId]);

  useEffect(() => {
    initNotification();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const sub = RNAppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        if (state.isLoggedIn) {
          fetchConversations();
        }
      }
      appStateRef.current = nextAppState;
    });
    return () => sub.remove();
  }, [state.isLoggedIn, fetchConversations]);

  useEffect(() => {
    addWSHandler(onWSMessage);
    return () => removeWSHandler(onWSMessage);
  }, [onWSMessage]);

  if (state.restoring) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        logout,
        fetchConversations,
        fetchUsers,
        sendMessage,
        markAsRead,
        deleteConversation,
        getUserById,
        onWSMessage,
        activeConversationId,
        setActiveConversationId,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
