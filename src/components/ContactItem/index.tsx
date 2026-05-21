import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, FontSize } from '../../theme';
import { User } from '../../types';
import { List } from '@ant-design/react-native';
import Avatar from '../Avatar';

interface ContactItemProps {
  user: User;
  onPress: (user: User) => void;
}

function ContactItem({ user, onPress }: ContactItemProps) {
  const handlePress = useCallback(() => {
    onPress(user);
  }, [onPress, user]);

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
      <List.Item
        thumb={<Avatar uri={user.avatar} name={user.name} size={44} />}
        arrow="">
        <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
        <Text style={styles.phone} numberOfLines={1}>{user.phone}</Text>
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
  name: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  phone: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
    marginTop: Spacing.xs,
  },
});

export default memo(ContactItem);
