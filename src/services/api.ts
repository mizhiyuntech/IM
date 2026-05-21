const BASE_URL = 'https://app.mizhiyun.cloud/api';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken(): string | null {
  return authToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
  };
}

export interface ConversationResponse {
  id: string;
  type: string;
  name: string;
  avatar: string;
  last_message: string;
  updated_at: string;
  unread_count: number;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
}

export interface MessagesListResponse {
  total: number;
  page: number;
  page_size: number;
  data: MessageResponse[];
}

export const api = {
  login(phone: string, password: string): Promise<LoginResponse> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  },

  register(phone: string, password: string, name: string): Promise<LoginResponse> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, password, name }),
    });
  },

  getCurrentUser(): Promise<{ id: string; name: string; avatar: string; phone: string }> {
    return request('/user/me');
  },

  getUsers(): Promise<{ id: string; name: string; avatar: string; phone: string }[]> {
    return request('/users');
  },

  getContacts(): Promise<{ id: string; name: string; avatar: string; phone: string }[]> {
    return request('/users/contacts');
  },

  getUserById(id: string): Promise<{ id: string; name: string; avatar: string; phone: string }> {
    return request(`/users/${id}`);
  },

  searchUsers(keyword: string): Promise<{ id: string; name: string; avatar: string; phone: string }[]> {
    return request(`/users/search?keyword=${encodeURIComponent(keyword)}`);
  },

  addContact(contactId: string): Promise<{ message: string }> {
    return request('/users/contacts', {
      method: 'POST',
      body: JSON.stringify({ contact_id: contactId }),
    });
  },

  deleteContact(contactId: string): Promise<{ message: string }> {
    return request(`/users/contacts/${contactId}`, { method: 'DELETE' });
  },

  getConversations(): Promise<ConversationResponse[]> {
    return request('/conversations');
  },

  markAsRead(conversationId: string): Promise<{ message: string }> {
    return request(`/conversations/${conversationId}/read`, { method: 'PUT' });
  },

  deleteConversation(conversationId: string): Promise<{ message: string }> {
    return request(`/conversations/${conversationId}`, { method: 'DELETE' });
  },

  getMessages(
    conversationId: string,
    page = 1,
    pageSize = 50,
  ): Promise<MessagesListResponse> {
    return request(
      `/conversations/${conversationId}/messages?page=${page}&page_size=${pageSize}`,
    );
  },

  sendMessage(
    conversationId: string,
    content: string,
    type = 'text',
  ): Promise<MessageResponse> {
    return request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  },
};
