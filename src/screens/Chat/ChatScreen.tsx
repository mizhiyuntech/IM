import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { Message } from '../../types';
import ChatBubble from '../../components/ChatBubble';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { Input } from '@ant-design/react-native';
import { IconOutline } from '@ant-design/icons-react-native';
import { api } from '../../services/api';
import { addWSHandler, removeWSHandler } from '../../services/websocket';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<ChatNavProp>();
  const { conversationId, conversationType, groupId } = route.params;
  const { sendMessage, setActiveConversationId, markAsRead } = useAppContext();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    if (conversationType === 'group' && groupId) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={() => navigation.navigate('GroupSettings', { groupId, conversationId })}
            style={styles.headerRightBtn}>
            <IconOutline name="setting" size={22} color={Colors.textPrimary} />
          </Pressable>
        ),
      });
    }
  }, [navigation, conversationType, groupId, conversationId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.getMessages(conversationId);
      const mapped: Message[] = res.data.map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        content: m.content,
        type: m.type as 'text',
        createdAt: m.created_at,
      }));
      setMessages(mapped);
    } catch {
      // ignore
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    setActiveConversationId(conversationId);
    markAsRead(conversationId);
    return () => {
      setActiveConversationId(null);
    };
  }, [fetchMessages, conversationId, setActiveConversationId, markAsRead]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    const handler = (msg: any) => {
      if (msg.type === 'new_message' && msg.data && msg.data.conversation_id === conversationId) {
        const wsMsg = msg.data;
        const newMessage: Message = {
          id: wsMsg.id,
          conversationId: wsMsg.conversation_id,
          senderId: wsMsg.sender_id,
          content: wsMsg.content,
          type: wsMsg.type || 'text',
          createdAt: wsMsg.created_at,
        };
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    };
    addWSHandler(handler);
    return () => removeWSHandler(handler);
  }, [conversationId]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    await sendMessage(conversationId, text);
    fetchMessages();
  }, [inputText, conversationId, sendMessage, fetchMessages]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <ChatBubble
        message={item}
        conversationType={conversationType}
        groupId={groupId}
      />
    ),
    [conversationType, groupId],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <View style={styles.inputBar}>
        <Input
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入消息..."
          style={styles.input}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}>
          <IconOutline
            name="send"
            size={18}
            color={inputText.trim() ? Colors.white : Colors.textHint}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messageList: {
    paddingVertical: Spacing.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
  },
  sendButton: {
    marginLeft: Spacing.sm,
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  headerRightBtn: {
    marginRight: 12,
  },
});
