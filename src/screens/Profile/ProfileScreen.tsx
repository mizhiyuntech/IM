import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Modal, Toast } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { IconOutline } from '@ant-design/icons-react-native';
import Avatar from '../../components/Avatar';
import { api } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

interface RowProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  extra?: string;
  onPress?: () => void;
  showArrow?: boolean;
  isLast?: boolean;
}

function Row({ icon, iconBg, iconColor, label, extra, onPress, showArrow, isLast }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.rowPressed : null]}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <IconOutline name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowEnd}>
        {extra ? (
          <Text style={styles.rowExtra} numberOfLines={1}>
            {extra}
          </Text>
        ) : null}
        {showArrow && (
          <IconOutline name="right" size={14} color={Colors.textPlaceholder} style={styles.arrow} />
        )}
      </View>
      {!isLast && <View style={styles.rowDivider} />}
    </Pressable>
  );
}

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.heroCard}>
        <View style={styles.heroDecoration} />
        <View style={styles.heroContent}>
          <View style={styles.avatarRing}>
            <Avatar uri={user?.avatar} name={user?.name} size={68} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{user?.name || '未登录'}</Text>
            <View style={styles.phoneRow}>
              <IconOutline name="phone" size={12} color={Colors.white} />
              <Text style={styles.heroPhone}>{user?.phone || ''}</Text>
            </View>
          </View>
          <Pressable onPress={handleQRCode} style={styles.qrIconBtn}>
            <IconOutline name="qrcode" size={20} color={Colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Row
          icon="user"
          iconBg={Colors.primarySoft}
          iconColor={Colors.primary}
          label="昵称"
          extra={user?.name || ''}
          onPress={handleEditName}
          showArrow
        />
        <Row
          icon="phone"
          iconBg={Colors.successSoft}
          iconColor={Colors.success}
          label="手机号"
          extra={user?.phone || ''}
        />
        <Row
          icon="qrcode"
          iconBg={Colors.warningSoft}
          iconColor={Colors.warning}
          label="二维码名片"
          onPress={handleQRCode}
          showArrow
          isLast
        />
      </View>

      <View style={styles.card}>
        <Row
          icon="setting"
          iconBg={Colors.primarySoft}
          iconColor={Colors.primary}
          label="设置"
          showArrow
        />
        <Row
          icon="info-circle"
          iconBg={Colors.successSoft}
          iconColor={Colors.success}
          label="关于"
          showArrow
          isLast
        />
      </View>

      <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}>
        <Text style={styles.logoutText}>退出登录</Text>
      </Pressable>
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  heroPhone: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.9,
    marginLeft: Spacing.xs,
  },
  qrIconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
    position: 'relative',
  },
  rowPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  rowExtra: {
    fontSize: FontSize.md,
    color: Colors.textHint,
  },
  arrow: {
    marginLeft: Spacing.sm,
  },
  rowDivider: {
    position: 'absolute',
    left: Spacing.lg + 32 + Spacing.md,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
  },
  logoutBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  logoutPressed: {
    backgroundColor: Colors.dangerSoft,
  },
  logoutText: {
    fontSize: FontSize.lg,
    color: Colors.danger,
    fontWeight: '600',
  },
});
