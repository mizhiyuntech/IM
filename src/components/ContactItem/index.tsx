import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { User } from '../../types';

interface ContactItemProps {
  user: User;
  onPress: (user: User) => void;
}

function ContactItem({ user, onPress }: ContactItemProps) {
  const handlePress = useCallback(() => {
    onPress(user);
  }, [onPress, user]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
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
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.border,
  },
  info: {
    marginLeft: Spacing.md,
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
