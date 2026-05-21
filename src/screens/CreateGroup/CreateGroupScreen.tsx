import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { Toast, Button, Input, List, Checkbox, Tag } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import Avatar from '../../components/Avatar';
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
      const res = await api.createGroup(groupName.trim(), Array.from(selectedIds));
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
        <List.Item
          thumb={<Avatar uri={item.avatar} name={item.name} size={40} />}
          arrow=""
          extra={<Checkbox checked={isSelected} onChange={() => toggleSelect(item.id)} />}
          onPress={() => toggleSelect(item.id)}>
          <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
        </List.Item>
      );
    },
    [selectedIds, toggleSelect],
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <Text style={styles.label}>群名称</Text>
        <Input
          value={groupName}
          onChangeText={setGroupName}
          placeholder="请输入群名称"
          maxLength={20}
          style={styles.nameInput}
        />
      </View>

      <View style={styles.selectedSection}>
        <Text style={styles.label}>已选择 {selectedIds.size} 人</Text>
        {selectedIds.size > 0 && (
          <View style={styles.selectedList}>
            {Array.from(selectedIds).map(uid => {
              const user = contacts.find(u => u.id === uid);
              if (!user) return null;
              return (
                <Tag
                  key={uid}
                  closable
                  onClose={() => toggleSelect(uid)}
                  style={styles.selectedTag}>
                  {user.name}
                </Tag>
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
    borderWidth: 0,
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
    gap: Spacing.xs,
  },
  selectedTag: {
    marginBottom: Spacing.xs,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  contactName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
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
