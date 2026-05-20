export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text';
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  name: string;
  avatar: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
  members?: string[];
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  members: string[];
  ownerId: string;
}
