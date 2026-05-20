import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { Message } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface ChatBubbleProps {
  message: Message;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const { state, getUserById } = useAppContext();
  const isSelf = message.senderId === state.currentUser?.id;
  const sender = getUserById(message.senderId);

  return (
    <View
      style={[
        styles.container,
        isSelf ? styles.containerSelf : styles.containerOther,
      ]}>
      {!isSelf && (
        <Image source={{ uri: sender?.avatar }} style={styles.avatar} />
      )}
      <View
        style={[
          styles.bubble,
          isSelf ? styles.bubbleSelf : styles.bubbleOther,
        ]}>
        {!isSelf && (
          <Text style={styles.senderName}>{sender?.name || ''}</Text>
        )}
        <Text style={[styles.text, isSelf ? styles.textSelf : styles.textOther]}>
          {message.content}
        </Text>
      </View>
      {isSelf && (
        <Image source={{ uri: state.currentUser?.avatar }} style={styles.avatar} />
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.border,
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
  senderName: {
    fontSize: FontSize.xs,
    color: Colors.textHint,
    marginBottom: Spacing.xs,
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
