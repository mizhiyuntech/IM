import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { Colors, Spacing } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { Conversation } from '../../types';
import ConversationItem from '../../components/ConversationItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { Modal } from '@ant-design/react-native';

type ChatListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function ChatListScreen() {
  const { state, markAsRead, deleteConversation, fetchConversations } = useAppContext();
  const navigation = useNavigation<ChatListNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const sortedConversations = [...state.conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const handlePress = useCallback(
    (conversation: Conversation) => {
      markAsRead(conversation.id);
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        conversationName: conversation.name,
      });
    },
    [markAsRead, navigation],
  );

  const handleLongPress = useCallback(
    (conversation: Conversation) => {
      setSelectedConv(conversation);
      setModalVisible(true);
    },
    [],
  );

  const handleDelete = useCallback(() => {
    if (selectedConv) {
      deleteConversation(selectedConv.id);
    }
    setModalVisible(false);
    setSelectedConv(null);
  }, [selectedConv, deleteConversation]);

  const handleMarkRead = useCallback(() => {
    if (selectedConv) {
      markAsRead(selectedConv.id);
    }
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

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedConversations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
      />
      <Modal
        visible={modalVisible}
        transparent
        onClose={() => setModalVisible(false)}
        footer={[
          {
            text: '取消',
            onPress: () => setModalVisible(false),
          },
          {
            text: '标记已读',
            onPress: handleMarkRead,
          },
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
    backgroundColor: Colors.white,
  },
  listContent: {
    paddingBottom: Spacing.sm,
  },
  modalContent: {
    paddingVertical: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.textHint,
    textAlign: 'center',
  },
});
