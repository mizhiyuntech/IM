import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { Input } from '@ant-design/react-native';
import { IconOutline } from '@ant-design/icons-react-native';
import { api } from '../../services/api';
import { setWSHandler } from '../../services/websocket';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const { conversationId } = route.params;
  const { sendMessage, onWSMessage } = useAppContext();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

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
  }, [fetchMessages]);

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
    setWSHandler(handler);
    return () => setWSHandler(onWSMessage);
  }, [conversationId, onWSMessage]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    await sendMessage(conversationId, text);
    fetchMessages();
  }, [inputText, conversationId, sendMessage, fetchMessages]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    [],
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
});
