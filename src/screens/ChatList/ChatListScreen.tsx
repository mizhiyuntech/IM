import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { Conversation } from '../../types';
import ConversationItem from '../../components/ConversationItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { Modal, Input } from '@ant-design/react-native';
import { IconOutline } from '@ant-design/icons-react-native';

type ChatListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function ChatListScreen() {
  const { state, markAsRead, deleteConversation, fetchConversations } = useAppContext();
  const navigation = useNavigation<ChatListNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filteredConversations = useMemo(() => {
    const sorted = [...state.conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    const k = keyword.trim().toLowerCase();
    if (!k) return sorted;
    return sorted.filter(
      c =>
        c.name.toLowerCase().includes(k) ||
        (c.lastMessage || '').toLowerCase().includes(k),
    );
  }, [state.conversations, keyword]);

  const totalUnread = useMemo(
    () => state.conversations.reduce((s, c) => s + (c.unreadCount || 0), 0),
    [state.conversations],
  );

  const handlePress = useCallback(
    (conversation: Conversation) => {
      markAsRead(conversation.id);
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        conversationName: conversation.name,
        conversationType: conversation.type,
        groupId: conversation.groupId,
      });
    },
    [markAsRead, navigation],
  );

  const handleLongPress = useCallback((conversation: Conversation) => {
    setSelectedConv(conversation);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedConv) deleteConversation(selectedConv.id);
    setModalVisible(false);
    setSelectedConv(null);
  }, [selectedConv, deleteConversation]);

  const handleMarkRead = useCallback(() => {
    if (selectedConv) markAsRead(selectedConv.id);
    setModalVisible(false);
    setSelectedConv(null);
  }, [selectedConv, markAsRead]);

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        conversation={item}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />
    ),
    [handlePress, handleLongPress],
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <IconOutline name="search" size={16} color={Colors.textHint} />
          <Input
            placeholder="搜索聊天"
            value={keyword}
            onChangeText={setKeyword}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
        </View>
        {totalUnread > 0 && (
          <View style={styles.unreadBanner}>
            <View style={styles.unreadDot} />
            <Text style={styles.unreadText}>
              你有 {totalUnread} 条未读消息
            </Text>
          </View>
        )}
      </View>
    ),
    [keyword, totalUnread],
  );

  const EmptyState = useMemo(
    () => (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <IconOutline name="message" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>
          {keyword ? '没有找到相关聊天' : '还没有聊天'}
        </Text>
        <Text style={styles.emptyHint}>
          {keyword ? '试试其他关键词' : '去通讯录开始一段新对话吧'}
        </Text>
      </View>
    ),
    [keyword],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredConversations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        ItemSeparatorComponent={ItemSeparator}
      />
      <Modal
        visible={modalVisible}
        transparent
        onClose={() => setModalVisible(false)}
        footer={[
          { text: '取消', onPress: () => setModalVisible(false) },
          { text: '标记已读', onPress: handleMarkRead },
          {
            text: '删除会话',
            onPress: handleDelete,
            style: { color: Colors.danger },
          },
        ]}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedConv?.name}</Text>
          <Text style={styles.modalDesc}>选择操作</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing.lg,
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    backgroundColor: 'transparent',
    height: 40,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primarySoft,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  unreadText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.lg + 50 + Spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyHint: {
    fontSize: FontSize.md,
    color: Colors.textHint,
  },
  modalContent: {
    paddingVertical: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: FontSize.md,
    color: Colors.textHint,
    textAlign: 'center',
  },
});
