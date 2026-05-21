import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { Conversation } from '../../types';
import { formatTime } from '../../utils';
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

  const unread = conversation.unreadCount > 0;
  const unreadLabel =
    conversation.unreadCount > 99 ? '99+' : String(conversation.unreadCount);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
      <View style={styles.avatarWrap}>
        <Avatar uri={conversation.avatar} name={conversation.name} size={50} />
        {unread && (
          <View
            style={[
              styles.badge,
              conversation.unreadCount > 9 && styles.badgeWide,
            ]}>
            <Text style={styles.badgeText}>{unreadLabel}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            {conversation.type === 'group' && (
              <View style={styles.groupTag}>
                <IconOutline name="team" size={10} color={Colors.primary} />
              </View>
            )}
            <Text style={styles.name} numberOfLines={1}>
              {conversation.name}
            </Text>
          </View>
          <Text style={styles.time}>{formatTime(conversation.updatedAt)}</Text>
        </View>
        <Text
          style={[styles.lastMessage, unread && styles.lastMessageUnread]}
          numberOfLines={1}>
          {conversation.lastMessage || '暂无消息'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  avatarWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badgeWide: {
    minWidth: 22,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
    minHeight: 50,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  groupTag: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  name: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textHint,
  },
  lastMessage: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
  },
  lastMessageUnread: {
    color: Colors.textSecondary,
  },
});

export default memo(ConversationItem);
