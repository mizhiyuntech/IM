import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { Message, GroupRole } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import Avatar from '../Avatar';

interface ChatBubbleProps {
  message: Message;
  conversationType?: 'private' | 'group';
  groupId?: string;
}

function ChatBubble({ message, conversationType, groupId }: ChatBubbleProps) {
  const { state, getUserById } = useAppContext();
  const isSelf = message.senderId === state.currentUser?.id;
  const sender = getUserById(message.senderId);
  const [memberRoles, setMemberRoles] = useState<Record<string, GroupRole>>({});

  useEffect(() => {
    if (conversationType !== 'group' || !groupId) return;

    let mounted = true;
    api.getGroupMembers(groupId).then(members => {
      if (!mounted) return;
      const roles: Record<string, GroupRole> = {};
      members.forEach(m => {
        roles[m.user_id] = m.role as GroupRole;
      });
      setMemberRoles(roles);
    }).catch(() => {});

    return () => { mounted = false; };
  }, [conversationType, groupId]);

  const senderRole: GroupRole | undefined = memberRoles[message.senderId];

  const renderRoleTag = () => {
    if (!senderRole || senderRole === 'member') return null;
    if (senderRole === 'owner') {
      return (
        <View style={[styles.roleTag, { backgroundColor: Colors.groupOwnerBg }]}>
          <Text style={[styles.roleTagText, { color: Colors.groupOwner }]}>群主</Text>
        </View>
      );
    }
    if (senderRole === 'admin') {
      return (
        <View style={[styles.roleTag, { backgroundColor: Colors.groupAdminBg }]}>
          <Text style={[styles.roleTagText, { color: Colors.groupAdmin }]}>管理员</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={[
        styles.container,
        isSelf ? styles.containerSelf : styles.containerOther,
      ]}>
      {!isSelf && (
        <Avatar uri={sender?.avatar} name={sender?.name} size={36} />
      )}
      <View
        style={[
          styles.bubble,
          isSelf ? styles.bubbleSelf : styles.bubbleOther,
        ]}>
        {!isSelf && (
          <View style={styles.senderRow}>
            <Text style={styles.senderName}>{sender?.name || ''}</Text>
            {renderRoleTag()}
          </View>
        )}
        <Text style={[styles.text, isSelf ? styles.textSelf : styles.textOther]}>
          {message.content}
        </Text>
      </View>
      {isSelf && (
        <Avatar uri={state.currentUser?.avatar} name={state.currentUser?.name} size={36} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  containerSelf: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '70%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  bubbleSelf: {
    backgroundColor: Colors.bubbleSelf,
    marginRight: Spacing.sm,
    borderTopRightRadius: Spacing.xs,
  },
  bubbleOther: {
    backgroundColor: Colors.bubbleOther,
    marginLeft: Spacing.sm,
    borderTopLeftRadius: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  senderName: {
    fontSize: FontSize.xs,
    color: Colors.textHint,
    marginRight: Spacing.xs,
  },
  roleTag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  text: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  textSelf: {
    color: Colors.bubbleSelfText,
  },
  textOther: {
    color: Colors.bubbleOtherText,
  },
});

export default memo(ChatBubble);
