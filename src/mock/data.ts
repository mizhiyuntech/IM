import { User, Conversation, Message, Group } from '../types';

const CURRENT_USER_ID = 'user_001';

export const currentUser: User = {
  id: CURRENT_USER_ID,
  name: '张三',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20photo%20of%20a%20young%20chinese%20man%20simple%20clean%20background&image_size=square',
  phone: '13800138000',
};

export const users: User[] = [
  {
    id: 'user_002',
    name: '李四',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20photo%20of%20a%20young%20chinese%20woman%20simple%20clean%20background&image_size=square',
    phone: '13800138001',
  },
  {
    id: 'user_003',
    name: '王五',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20photo%20of%20a%20middle%20aged%20chinese%20man%20simple%20clean%20background&image_size=square',
    phone: '13800138002',
  },
  {
    id: 'user_004',
    name: '赵六',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20photo%20of%20a%20young%20chinese%20man%20glasses%20simple%20clean%20background&image_size=square',
    phone: '13800138003',
  },
  {
    id: 'user_005',
    name: '孙七',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20photo%20of%20a%20young%20chinese%20woman%20smile%20simple%20clean%20background&image_size=square',
    phone: '13800138004',
  },
  {
    id: 'user_006',
    name: '周八',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20photo%20of%20a%20chinese%20man%20professional%20simple%20clean%20background&image_size=square',
    phone: '13800138005',
  },
  {
    id: 'user_007',
    name: '吴九',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20photo%20of%20a%20chinese%20woman%20professional%20simple%20clean%20background&image_size=square',
    phone: '13800138006',
  },
  {
    id: 'user_008',
    name: '郑十',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20photo%20of%20a%20chinese%20man%20casual%20simple%20clean%20background&image_size=square',
    phone: '13800138007',
  },
];

export const groups: Group[] = [
  {
    id: 'group_001',
    name: '项目组',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=group%20icon%20teamwork%20blue%20simple%20clean%20background&image_size=square',
    members: ['user_001', 'user_002', 'user_003', 'user_004'],
    ownerId: 'user_001',
  },
  {
    id: 'group_002',
    name: '周末活动群',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=group%20icon%20activity%20green%20simple%20clean%20background&image_size=square',
    members: ['user_001', 'user_005', 'user_006', 'user_007', 'user_008'],
    ownerId: 'user_005',
  },
];

export const conversations: Conversation[] = [
  {
    id: 'conv_001',
    type: 'private',
    name: '李四',
    avatar: users[0].avatar,
    lastMessage: '明天下午3点开会，别忘了',
    unreadCount: 2,
    updatedAt: '2026-05-20T14:30:00Z',
  },
  {
    id: 'conv_002',
    type: 'group',
    name: '项目组',
    avatar: groups[0].avatar,
    lastMessage: '王五: 代码已经提交了',
    unreadCount: 5,
    updatedAt: '2026-05-20T13:20:00Z',
  },
  {
    id: 'conv_003',
    type: 'private',
    name: '赵六',
    avatar: users[2].avatar,
    lastMessage: '好的，收到',
    unreadCount: 0,
    updatedAt: '2026-05-20T11:00:00Z',
  },
  {
    id: 'conv_004',
    type: 'group',
    name: '周末活动群',
    avatar: groups[1].avatar,
    lastMessage: '孙七: 周六去爬山吗？',
    unreadCount: 12,
    updatedAt: '2026-05-20T10:45:00Z',
  },
  {
    id: 'conv_005',
    type: 'private',
    name: '王五',
    avatar: users[1].avatar,
    lastMessage: '那个bug修好了吗？',
    unreadCount: 1,
    updatedAt: '2026-05-20T09:30:00Z',
  },
  {
    id: 'conv_006',
    type: 'private',
    name: '孙七',
    avatar: users[3].avatar,
    lastMessage: '晚上一起吃饭？',
    unreadCount: 0,
    updatedAt: '2026-05-19T18:00:00Z',
  },
  {
    id: 'conv_007',
    type: 'private',
    name: '周八',
    avatar: users[4].avatar,
    lastMessage: '报告已经发你邮箱了',
    unreadCount: 0,
    updatedAt: '2026-05-19T15:20:00Z',
  },
  {
    id: 'conv_008',
    type: 'private',
    name: '吴九',
    avatar: users[5].avatar,
    lastMessage: '周末有空吗？',
    unreadCount: 0,
    updatedAt: '2026-05-18T20:00:00Z',
  },
];

export const messagesMap: Record<string, Message[]> = {
  conv_001: [
    {
      id: 'msg_001',
      conversationId: 'conv_001',
      senderId: 'user_002',
      content: '你好，明天的会议你参加吗？',
      type: 'text',
      createdAt: '2026-05-20T14:00:00Z',
    },
    {
      id: 'msg_002',
      conversationId: 'conv_001',
      senderId: CURRENT_USER_ID,
      content: '参加的，几点开始？',
      type: 'text',
      createdAt: '2026-05-20T14:05:00Z',
    },
    {
      id: 'msg_003',
      conversationId: 'conv_001',
      senderId: 'user_002',
      content: '下午3点，在3号会议室',
      type: 'text',
      createdAt: '2026-05-20T14:10:00Z',
    },
    {
      id: 'msg_004',
      conversationId: 'conv_001',
      senderId: CURRENT_USER_ID,
      content: '好的，我准时到',
      type: 'text',
      createdAt: '2026-05-20T14:15:00Z',
    },
    {
      id: 'msg_005',
      conversationId: 'conv_001',
      senderId: 'user_002',
      content: '明天下午3点开会，别忘了',
      type: 'text',
      createdAt: '2026-05-20T14:30:00Z',
    },
  ],
  conv_002: [
    {
      id: 'msg_101',
      conversationId: 'conv_002',
      senderId: 'user_003',
      content: '大家今天的任务完成了吗？',
      type: 'text',
      createdAt: '2026-05-20T10:00:00Z',
    },
    {
      id: 'msg_102',
      conversationId: 'conv_002',
      senderId: CURRENT_USER_ID,
      content: '我的部分已经做完了',
      type: 'text',
      createdAt: '2026-05-20T10:10:00Z',
    },
    {
      id: 'msg_103',
      conversationId: 'conv_002',
      senderId: 'user_004',
      content: '还在处理中，大概还需要1小时',
      type: 'text',
      createdAt: '2026-05-20T10:20:00Z',
    },
    {
      id: 'msg_104',
      conversationId: 'conv_002',
      senderId: 'user_002',
      content: '加油，今天下班前提交就行',
      type: 'text',
      createdAt: '2026-05-20T11:00:00Z',
    },
    {
      id: 'msg_105',
      conversationId: 'conv_002',
      senderId: 'user_003',
      content: '代码已经提交了',
      type: 'text',
      createdAt: '2026-05-20T13:20:00Z',
    },
  ],
  conv_003: [
    {
      id: 'msg_201',
      conversationId: 'conv_003',
      senderId: CURRENT_USER_ID,
      content: '文件收到了吗？',
      type: 'text',
      createdAt: '2026-05-20T10:30:00Z',
    },
    {
      id: 'msg_202',
      conversationId: 'conv_003',
      senderId: 'user_004',
      content: '好的，收到',
      type: 'text',
      createdAt: '2026-05-20T11:00:00Z',
    },
  ],
  conv_004: [
    {
      id: 'msg_301',
      conversationId: 'conv_004',
      senderId: 'user_005',
      content: '这周末有什么安排？',
      type: 'text',
      createdAt: '2026-05-20T09:00:00Z',
    },
    {
      id: 'msg_302',
      conversationId: 'conv_004',
      senderId: 'user_006',
      content: '还没想好呢',
      type: 'text',
      createdAt: '2026-05-20T09:15:00Z',
    },
    {
      id: 'msg_303',
      conversationId: 'conv_004',
      senderId: 'user_005',
      content: '周六去爬山吗？',
      type: 'text',
      createdAt: '2026-05-20T10:45:00Z',
    },
  ],
  conv_005: [
    {
      id: 'msg_401',
      conversationId: 'conv_005',
      senderId: 'user_003',
      content: '那个bug修好了吗？',
      type: 'text',
      createdAt: '2026-05-20T09:30:00Z',
    },
  ],
  conv_006: [
    {
      id: 'msg_501',
      conversationId: 'conv_006',
      senderId: 'user_005',
      content: '晚上一起吃饭？',
      type: 'text',
      createdAt: '2026-05-19T18:00:00Z',
    },
  ],
  conv_007: [
    {
      id: 'msg_601',
      conversationId: 'conv_007',
      senderId: 'user_006',
      content: '报告已经发你邮箱了',
      type: 'text',
      createdAt: '2026-05-19T15:20:00Z',
    },
  ],
  conv_008: [
    {
      id: 'msg_701',
      conversationId: 'conv_008',
      senderId: 'user_007',
      content: '周末有空吗？',
      type: 'text',
      createdAt: '2026-05-18T20:00:00Z',
    },
  ],
};

export function getUserById(id: string): User | undefined {
  if (id === CURRENT_USER_ID) return currentUser;
  return users.find(u => u.id === id);
}

export function getGroupById(id: string): Group | undefined {
  return groups.find(g => g.id === id);
}
