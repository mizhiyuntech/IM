import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { List, Button, Modal, Toast } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { IconOutline } from '@ant-design/icons-react-native';
import Avatar from '../../components/Avatar';
import { api } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { state, logout, updateCurrentUser, fetchConversations, fetchUsers } = useAppContext();
  const navigation = useNavigation<ProfileNavProp>();
  const user = state.currentUser;

  const handleEditName = useCallback(() => {
    Modal.prompt(
      '修改昵称',
      '请输入新昵称',
      async (value: string) => {
        const name = (value || '').trim();
        if (!name) {
          Toast.fail({ content: '昵称不能为空', duration: 2 });
          return;
        }
        try {
              const res = await api.updateProfile(name);
              updateCurrentUser({
                id: res.id,
                name: res.name,
                avatar: res.avatar,
                phone: res.phone,
              });
              fetchConversations();
              fetchUsers();
              Toast.success({ content: '昵称修改成功', duration: 1 });
        } catch (e: any) {
          Toast.fail({ content: e.message || '修改失败', duration: 2 });
        }
      },
      'default',
      user?.name || '',
    );
  }, [user?.name, updateCurrentUser]);

  const handleQRCode = useCallback(() => {
    navigation.navigate('QRCodeCard');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar uri={user?.avatar} name={user?.name} size={64} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name || '未登录'}</Text>
          <Text style={styles.phone}>{user?.phone || ''}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <List>
          <List.Item
            extra={user?.name || ''}
            arrow="horizontal"
            onPress={handleEditName}>
            <View style={styles.listItemRow}>
              <IconOutline name="user" size={18} color={Colors.primary} />
              <Text style={styles.listItemText}>昵称</Text>
            </View>
          </List.Item>
          <List.Item extra={user?.phone || ''}>
            <View style={styles.listItemRow}>
              <IconOutline name="phone" size={18} color={Colors.primary} />
              <Text style={styles.listItemText}>手机号</Text>
            </View>
          </List.Item>
          <List.Item arrow="horizontal" onPress={handleQRCode}>
            <View style={styles.listItemRow}>
              <IconOutline name="qrcode" size={18} color={Colors.primary} />
              <Text style={styles.listItemText}>二维码名片</Text>
            </View>
          </List.Item>
        </List>
      </View>

      <View style={styles.section}>
        <List>
          <List.Item arrow="horizontal">
            <View style={styles.listItemRow}>
              <IconOutline name="setting" size={18} color={Colors.primary} />
              <Text style={styles.listItemText}>设置</Text>
            </View>
          </List.Item>
          <List.Item arrow="horizontal">
            <View style={styles.listItemRow}>
              <IconOutline name="info-circle" size={18} color={Colors.primary} />
              <Text style={styles.listItemText}>关于</Text>
            </View>
          </List.Item>
        </List>
      </View>

      <Button
        type="warning"
        onPress={logout}
        style={styles.logoutButton}>
        退出登录
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  profileInfo: {
    marginLeft: Spacing.lg,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  phone: {
    fontSize: FontSize.md,
    color: Colors.textHint,
  },
  section: {
    marginBottom: Spacing.md,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemText: {
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.round,
  },
});
