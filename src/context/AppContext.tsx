import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Conversation, Message } from '../types';
import {
  currentUser,
  conversations as mockConversations,
  messagesMap as mockMessagesMap,
  users as mockUsers,
  groups as mockGroups,
} from '../mock/data';
import { generateId } from '../utils';

interface AppState {
  isLoggedIn: boolean;
  currentUser: User | null;
  conversations: Conversation[];
  messagesMap: Record<string, Message[]>;
  users: User[];
  groups: typeof mockGroups;
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'DELETE_CONVERSATION'; payload: string };

const initialState: AppState = {
  isLoggedIn: false,
  currentUser: null,
  conversations: mockConversations,
  messagesMap: mockMessagesMap,
  users: mockUsers,
  groups: mockGroups,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        currentUser: null,
      };
    case 'SEND_MESSAGE': {
      const msg = action.payload;
      const existingMessages = state.messagesMap[msg.conversationId] || [];
      const updatedMessagesMap = {
        ...state.messagesMap,
        [msg.conversationId]: [...existingMessages, msg],
      };
      const updatedConversations = state.conversations.map(conv => {
        if (conv.id === msg.conversationId) {
          return {
            ...conv,
            lastMessage: msg.content,
            updatedAt: msg.createdAt,
          };
        }
        return conv;
      });
      return {
        ...state,
        messagesMap: updatedMessagesMap,
        conversations: updatedConversations,
      };
    }
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
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(
          conv => conv.id !== action.payload,
        ),
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  login: (phone: string, password: string) => void;
  logout: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  markAsRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  getConversationMessages: (conversationId: string) => Message[];
  getConversationById: (id: string) => Conversation | undefined;
  getUserById: (id: string) => User | undefined;
  getGroupById: (id: string) => typeof mockGroups[0] | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = (_phone: string, _password: string) => {
    dispatch({ type: 'LOGIN', payload: currentUser });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const sendMessage = (conversationId: string, content: string) => {
    const msg: Message = {
      id: generateId(),
      conversationId,
      senderId: state.currentUser?.id || 'user_001',
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'SEND_MESSAGE', payload: msg });
  };

  const markAsRead = (conversationId: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: conversationId });
  };

  const deleteConversation = (conversationId: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId });
  };

  const getConversationMessages = (conversationId: string): Message[] => {
    return state.messagesMap[conversationId] || [];
  };

  const getConversationById = (id: string): Conversation | undefined => {
    return state.conversations.find(conv => conv.id === id);
  };

  const getUserById = (id: string): User | undefined => {
    if (id === state.currentUser?.id) return state.currentUser;
    return state.users.find(u => u.id === id);
  };

  const getGroupById = (id: string) => {
    return state.groups.find(g => g.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        sendMessage,
        markAsRead,
        deleteConversation,
        getConversationMessages,
        getConversationById,
        getUserById,
        getGroupById,
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
