import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { User, Conversation } from '../types';
import { api, setToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_TOKEN = 'im_token';
const STORAGE_KEY_USER = 'im_user';

interface AppState {
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
  | { type: 'RESTORE_DONE' };

const initialState: AppState = {
  isLoggedIn: false,
  currentUser: null,
  conversations: [],
  users: [],
  loading: false,
  restoring: true,
};

function appReducer(state: AppState, action: Action): AppState {
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
    case 'RESTORE_DONE':
      return { ...state, restoring: false };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      const savedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);

      if (savedToken && savedUser) {
        setToken(savedToken);
        const user: User = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN', payload: { user } });

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
          // token expired, clear session
          await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEY_USER);
          setToken(null);
          dispatch({ type: 'LOGOUT' });
        }
      }
    } catch {
      // AsyncStorage error
    } finally {
      dispatch({ type: 'RESTORE_DONE' });
    }
  };

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
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
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
