import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors, Spacing, FontSize } from '../../theme';
import { Conversation } from '../../types';
import { formatTime } from '../../utils';
import { Badge, List } from '@ant-design/react-native';
import Avatar from '../Avatar';
import { IconOutline } from '@ant-design/icons-react-native';

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
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
      <List.Item
        thumb={<Avatar uri={conversation.avatar} name={conversation.name} size={48} />}
        extra={
          <View style={styles.extra}>
            <Text style={styles.time}>{formatTime(conversation.updatedAt)}</Text>
            {conversation.unreadCount > 0 && (
              <Badge text={String(conversation.unreadCount)} />
            )}
          </View>
        }
        multipleLine
        arrow="">
        <View style={styles.nameRow}>
          {conversation.type === 'group' && (
            <IconOutline name="team" size={14} color={Colors.textSecondary} style={styles.groupIcon} />
          )}
          <Text style={styles.name} numberOfLines={1}>
            {conversation.name}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
      </List.Item>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
  },
  pressed: {
    backgroundColor: Colors.background,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    marginRight: Spacing.xs,
  },
  name: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: FontSize.md,
    color: Colors.textHint,
    marginTop: Spacing.xs,
  },
  extra: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: Spacing.xs,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
  },
});

export default memo(ConversationItem);
