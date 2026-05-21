import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { Toast, Button } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import Avatar from '../../components/Avatar';
import { IconOutline } from '@ant-design/icons-react-native';
import { api } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

type CreateGroupNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateGroupScreen() {
  const { state, fetchConversations } = useAppContext();
  const navigation = useNavigation<CreateGroupNavProp>();
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  const contacts = useMemo(() => {
    return state.users.filter(u => u.id !== state.currentUser?.id);
  }, [state.users, state.currentUser]);

  const toggleSelect = useCallback((userId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!groupName.trim()) {
      Toast.fail({ content: '请输入群名称', duration: 2 });
      return;
    }
    if (selectedIds.size === 0) {
      Toast.fail({ content: '请至少选择一位群成员', duration: 2 });
      return;
    }

    setCreating(true);
    try {
      const res = await api.createGroup(
        groupName.trim(),
        Array.from(selectedIds),
      );
      await fetchConversations();
      navigation.navigate('Chat', {
        conversationId: res.conversation.id,
        conversationName: res.conversation.name || groupName.trim(),
      });
      Toast.success({ content: '群聊创建成功', duration: 1 });
    } catch (e: any) {
      Toast.fail({ content: e.message || '创建群聊失败', duration: 2 });
    } finally {
      setCreating(false);
    }
  }, [groupName, selectedIds, fetchConversations, navigation]);

  const renderItem = useCallback(
    ({ item }: { item: User }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <Pressable
          style={styles.contactItem}
          onPress={() => toggleSelect(item.id)}>
          <Avatar uri={item.avatar} name={item.name} size={40} />
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name}
          </Text>
          <View
            style={[
              styles.checkBox,
              isSelected && styles.checkBoxSelected,
            ]}>
            {isSelected && (
              <IconOutline name="check" size={14} color={Colors.white} />
            )}
          </View>
        </Pressable>
      );
    },
    [selectedIds, toggleSelect],
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <Text style={styles.label}>群名称</Text>
        <TextInput
          style={styles.nameInput}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="请输入群名称"
          placeholderTextColor={Colors.textHint}
          maxLength={20}
        />
      </View>

      <View style={styles.selectedSection}>
        <Text style={styles.label}>
          已选择 {selectedIds.size} 人
        </Text>
        {selectedIds.size > 0 && (
          <View style={styles.selectedList}>
            {Array.from(selectedIds).map(uid => {
              const user = contacts.find(u => u.id === uid);
              if (!user) return null;
              return (
                <View key={uid} style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>{user.name}</Text>
                  <Pressable onPress={() => toggleSelect(uid)}>
                    <IconOutline name="close" size={12} color={Colors.textHint} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.label}>选择联系人</Text>
        <FlatList
          data={contacts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <View style={styles.bottomBar}>
        <Button
          type="primary"
          onPress={handleCreate}
          loading={creating}
          disabled={!groupName.trim() || selectedIds.size === 0}
          style={styles.createButton}>
          创建群聊
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inputSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  nameInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  selectedSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  selectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  selectedChipText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  contactName: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  createButton: {
    width: '100%',
  },
});
