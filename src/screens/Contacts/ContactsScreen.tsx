import React, { useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import ContactItem from '../../components/ContactItem';
import { IconOutline } from '@ant-design/icons-react-native';
import { RootStackParamList } from '../../navigation';

interface SectionData {
  title: string;
  data: User[];
}

export default function ContactsScreen() {
  const { state, fetchUsers } = useAppContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const sections = useMemo(() => {
    const grouped: Record<string, User[]> = {};
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    state.users.forEach(user => {
      const firstChar = user.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(user);
    });

    const result: SectionData[] = [];

    letters.forEach(letter => {
      if (grouped[letter] && grouped[letter].length > 0) {
        result.push({ title: letter, data: grouped[letter] });
      }
    });

    if (grouped['#'] && grouped['#'].length > 0) {
      result.push({ title: '#', data: grouped['#'] });
    }

    return result;
  }, [state.users]);

  const handleContactPress = useCallback(
    (user: User) => {
      navigation.navigate('ContactDetail', {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userPhone: user.phone,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <ContactItem user={item} onPress={handleContactPress} />
    ),
    [handleContactPress],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => {
      if (!section.title) return null;
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
      );
    },
    [],
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <Pressable
          style={styles.actionItem}
          onPress={() => navigation.navigate('AddFriend')}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
            <IconOutline name="user-add" size={20} color={Colors.white} />
          </View>
          <Text style={styles.actionLabel}>新的朋友</Text>
        </Pressable>
        <Pressable style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.success }]}>
            <IconOutline name="team" size={20} color={Colors.white} />
          </View>
          <Text style={styles.actionLabel}>群聊</Text>
        </Pressable>
      </View>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
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
  topActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xxl,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.background,
  },
  sectionHeaderText: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Spacing.sm,
  },
});
