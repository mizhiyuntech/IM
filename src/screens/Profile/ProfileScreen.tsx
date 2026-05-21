import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { List, Modal, Toast, Button } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';
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
  }, [user?.name, updateCurrentUser, fetchConversations, fetchUsers]);

  const handleQRCode = useCallback(() => {
    navigation.navigate('QRCodeCard');
  }, [navigation]);

  const handleLogout = useCallback(() => {
    Modal.alert('退出登录', '确定要退出当前账号？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => logout() },
    ]);
  }, [logout]);

  const renderItemLabel = (icon: string, bg: string, color: string, label: string) => (
    <View style={styles.listItemRow}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <IconOutline name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.listItemText}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.heroCard}>
        <View style={styles.heroDecoration} />
        <View style={styles.heroContent}>
          <View style={styles.avatarRing}>
            <Avatar uri={user?.avatar} name={user?.name} size={64} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={1}>
              {user?.name || '未登录'}
            </Text>
            <Text style={styles.heroPhone} numberOfLines={1}>
              {user?.phone || ''}
            </Text>
          </View>
          <Pressable onPress={handleQRCode} style={styles.qrIconBtn}>
            <IconOutline name="qrcode" size={20} color={Colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <List>
          <List.Item
            extra={user?.name || ''}
            arrow="horizontal"
            onPress={handleEditName}>
            {renderItemLabel('user', Colors.primarySoft, Colors.primary, '昵称')}
          </List.Item>
          <List.Item extra={user?.phone || ''}>
            {renderItemLabel('phone', Colors.successSoft, Colors.success, '手机号')}
          </List.Item>
          <List.Item arrow="horizontal" onPress={handleQRCode}>
            {renderItemLabel('qrcode', Colors.warningSoft, Colors.warning, '二维码名片')}
          </List.Item>
        </List>
      </View>

      <View style={styles.section}>
        <List>
          <List.Item arrow="horizontal">
            {renderItemLabel('setting', Colors.primarySoft, Colors.primary, '设置')}
          </List.Item>
          <List.Item arrow="horizontal">
            {renderItemLabel('info-circle', Colors.successSoft, Colors.success, '关于')}
          </List.Item>
        </List>
      </View>

      <Button
        type="warning"
        onPress={handleLogout}
        style={styles.logoutButton}>
        退出登录
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  heroCard: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
    ...Shadows.md,
  },
  heroDecoration: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primaryDark,
    opacity: 0.45,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  avatarRing: {
    padding: 3,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  heroInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  heroName: {
    fontSize: FontSize.xxl,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  heroPhone: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.9,
  },
  qrIconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  listItemText: {
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
