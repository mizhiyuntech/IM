import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { Toast, Modal, Button } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { GroupMemberInfo, GroupRole } from '../../types';
import { api } from '../../services/api';
import Avatar from '../../components/Avatar';
import { IconOutline } from '@ant-design/icons-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

type GroupSettingsNavProp = NativeStackNavigationProp<RootStackParamList>;

interface GroupSettingsProps {
  route: {
    params: {
      groupId: string;
      conversationId: string;
    };
  };
}

export default function GroupSettingsScreen({ route }: GroupSettingsProps) {
  const { groupId, conversationId } = route.params;
  const { state, fetchConversations, deleteConversation } = useAppContext();
  const navigation = useNavigation<GroupSettingsNavProp>();
  const [groupInfo, setGroupInfo] = useState<{ name: string; owner_id: string; member_count: number } | null>(null);
  const [members, setMembers] = useState<GroupMemberInfo[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwner = groupInfo?.owner_id === state.currentUser?.id;
  const isAdmin = members.find(
    m => m.user_id === state.currentUser?.id && m.role === 'admin',
  ) !== undefined;

  const loadData = useCallback(async () => {
    try {
      const info = await api.getGroupInfo(groupId);
      setGroupInfo(info as any);
      setNewName(info.name);
      const memberList = await api.getGroupMembers(groupId);
      setMembers(memberList as GroupMemberInfo[]);
    } catch {
      Toast.fail({ content: '加载群信息失败', duration: 2 });
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateName = useCallback(async () => {
    if (!newName.trim()) {
      Toast.fail({ content: '群名称不能为空', duration: 2 });
      return;
    }
    setLoading(true);
    try {
      await api.updateGroup(groupId, newName.trim());
      setGroupInfo(prev => prev ? { ...prev, name: newName.trim() } : prev);
      setEditingName(false);
      await fetchConversations();
      Toast.success({ content: '群名称修改成功', duration: 1 });
    } catch (e: any) {
      Toast.fail({ content: e.message || '修改失败', duration: 2 });
    } finally {
      setLoading(false);
    }
  }, [groupId, newName, fetchConversations]);

  const handleSetRole = useCallback(
    (userId: string, userName: string, currentRole: GroupRole) => {
      if (!isOwner) return;

      const newRole: GroupRole = currentRole === 'admin' ? 'member' : 'admin';
      const label = newRole === 'admin' ? '设为管理员' : '取消管理员';

      Modal.alert(label, `确定将 ${userName} ${label}？`, [
        { text: '取消', onPress: () => {} },
        {
          text: '确定',
          onPress: async () => {
            try {
              await api.setMemberRole(groupId, userId, newRole);
              await loadData();
              Toast.success({ content: '操作成功', duration: 1 });
            } catch (e: any) {
              Toast.fail({ content: e.message || '操作失败', duration: 2 });
            }
          },
        },
      ]);
    },
    [isOwner, groupId, loadData],
  );

  const handleDissolve = useCallback(() => {
    Modal.alert('解散群聊', '解散后所有成员将被移除，群聊记录将被删除，确定解散？', [
      { text: '取消', onPress: () => {} },
      {
        text: '确定解散',
        onPress: async () => {
          try {
            await api.dissolveGroup(groupId);
            await deleteConversation(conversationId);
            await fetchConversations();
            navigation.navigate('MainTabs');
            Toast.success({ content: '群聊已解散', duration: 1 });
          } catch (e: any) {
            Toast.fail({ content: e.message || '解散失败', duration: 2 });
          }
        },
      },
    ]);
  }, [groupId, conversationId, deleteConversation, fetchConversations, navigation]);

  const handleLeave = useCallback(() => {
    Modal.alert('退出群聊', '确定退出该群聊？', [
      { text: '取消', onPress: () => {} },
      {
        text: '确定退出',
        onPress: async () => {
          try {
            await api.leaveGroup(groupId);
            await deleteConversation(conversationId);
            await fetchConversations();
            navigation.navigate('MainTabs');
            Toast.success({ content: '已退出群聊', duration: 1 });
          } catch (e: any) {
            Toast.fail({ content: e.message || '退出失败', duration: 2 });
          }
        },
      },
    ]);
  }, [groupId, conversationId, deleteConversation, fetchConversations, navigation]);

  const getRoleLabel = (role: GroupRole) => {
    if (role === 'owner') return '群主';
    if (role === 'admin') return '管理员';
    return '';
  };

  const getRoleColor = (role: GroupRole) => {
    if (role === 'owner') return Colors.groupOwner;
    if (role === 'admin') return Colors.groupAdmin;
    return Colors.textHint;
  };

  const getRoleBgColor = (role: GroupRole) => {
    if (role === 'owner') return Colors.groupOwnerBg;
    if (role === 'admin') return Colors.groupAdminBg;
    return Colors.background;
  };

  const renderMember = useCallback(
    ({ item }: { item: GroupMemberInfo }) => {
      const isSelf = item.user_id === state.currentUser?.id;
      const roleLabel = getRoleLabel(item.role as GroupRole);
      const canManage = isOwner && !isSelf && item.role !== 'owner';

      return (
        <View style={styles.memberItem}>
          <Avatar uri={item.avatar} name={item.name} size={40} />
          <View style={styles.memberInfo}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName} numberOfLines={1}>
                {item.name}
                {isSelf ? ' (我)' : ''}
              </Text>
              {roleLabel ? (
                <View style={[styles.roleBadge, { backgroundColor: getRoleBgColor(item.role as GroupRole) }]}>
                  <Text style={[styles.roleBadgeText, { color: getRoleColor(item.role as GroupRole) }]}>
                    {roleLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          {canManage && (
            <Pressable
              style={styles.manageBtn}
              onPress={() => handleSetRole(item.user_id, item.name, item.role as GroupRole)}>
              <Text style={styles.manageBtnText}>
                {item.role === 'admin' ? '取消管理' : '设为管理'}
              </Text>
            </Pressable>
          )}
        </View>
      );
    },
    [state.currentUser, isOwner, handleSetRole],
  );

  const keyExtractor = useCallback((item: GroupMemberInfo) => String(item.id), []);

  return (
    <View style={styles.container}>
      <View style={styles.nameSection}>
        <View style={styles.nameRow}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={newName}
                onChangeText={setNewName}
                maxLength={20}
                autoFocus
              />
              <Pressable
                style={styles.nameEditBtn}
                onPress={handleUpdateName}
                disabled={loading}>
                <Text style={styles.nameEditBtnText}>保存</Text>
              </Pressable>
              <Pressable
                style={styles.nameEditBtn}
                onPress={() => {
                  setEditingName(false);
                  setNewName(groupInfo?.name || '');
                }}>
                <Text style={styles.nameEditBtnText}>取消</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.nameDisplayRow}>
              <Text style={styles.groupName}>{groupInfo?.name || ''}</Text>
              {(isOwner || isAdmin) && (
                <Pressable onPress={() => setEditingName(true)}>
                  <IconOutline name="edit" size={18} color={Colors.primary} />
                </Pressable>
              )}
            </View>
          )}
        </View>
        <Text style={styles.memberCount}>
          共 {groupInfo?.member_count || members.length} 人
        </Text>
      </View>

      <View style={styles.memberSection}>
        <Text style={styles.sectionTitle}>群成员</Text>
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.memberList}
        />
      </View>

      <View style={styles.bottomSection}>
        {!isOwner && (
          <Button
            style={styles.leaveButton}
            onPress={handleLeave}>
            <Text style={styles.dangerText}>退出群聊</Text>
          </Button>
        )}
        {isOwner && (
          <Button
            style={styles.leaveButton}
            onPress={handleDissolve}>
            <Text style={styles.dangerText}>解散群聊</Text>
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  nameSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  nameRow: {
    marginBottom: Spacing.xs,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  nameEditBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  nameEditBtnText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  memberCount: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
  },
  memberSection: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  memberList: {
    paddingBottom: Spacing.lg,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  memberInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  roleBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  manageBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
  },
  manageBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  bottomSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  leaveButton: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    borderColor: Colors.danger,
  },
  dangerText: {
    color: Colors.danger,
    fontSize: FontSize.md,
  },
});
