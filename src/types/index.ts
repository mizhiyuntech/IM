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
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export type GroupRole = 'owner' | 'admin' | 'member';

export interface GroupMemberInfo {
  id: number;
  group_id: string;
  user_id: string;
  role: GroupRole;
  created_at: string;
  name: string;
  avatar: string;
  phone: string;
}
