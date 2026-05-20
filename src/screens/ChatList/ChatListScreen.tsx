import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Colors, Spacing } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { Conversation } from '../../types';
import ConversationItem from '../../components/ConversationItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

type ChatListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function ChatListScreen() {
  const { state, markAsRead, deleteConversation } = useAppContext();
  const navigation = useNavigation<ChatListNavigationProp>();

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
      Alert.alert(
        conversation.name,
        '选择操作',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除会话',
            style: 'destructive',
            onPress: () => deleteConversation(conversation.id),
          },
          {
            text: '标记已读',
            onPress: () => markAsRead(conversation.id),
          },
        ],
        { cancelable: true },
      );
    },
    [deleteConversation, markAsRead],
  );

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
});
