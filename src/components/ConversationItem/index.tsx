import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { Conversation } from '../../types';
import { formatTime } from '../../utils';
import { Badge } from '@ant-design/react-native';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
  onLongPress?: (conversation: Conversation) => void;
}

function ConversationItem({
  conversation,
  onPress,
  onLongPress,
}: ConversationItemProps) {
  const handlePress = useCallback(() => {
    onPress(conversation);
  }, [onPress, conversation]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(conversation);
  }, [onLongPress, conversation]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={styles.time}>{formatTime(conversation.updatedAt)}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          {conversation.unreadCount > 0 && (
            <Badge text={String(conversation.unreadCount)} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  pressed: {
    backgroundColor: Colors.background,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  lastMessage: {
    fontSize: FontSize.md,
    color: Colors.textHint,
    flex: 1,
    marginRight: Spacing.sm,
  },
});

export default memo(ConversationItem);
