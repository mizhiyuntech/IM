import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { List } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import IconOutline from '@ant-design/icons-react-native/lib/outline';

export default function ProfileScreen() {
  const { state, logout } = useAppContext();
  const user = state.currentUser;

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user?.avatar }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name || '未登录'}</Text>
          <Text style={styles.phone}>{user?.phone || ''}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <List>
          <List.Item extra="张三" arrow="horizontal">
            <View style={styles.listItemRow}>
              <IconOutline name="user" size={18} color={Colors.primary} />
              <Text style={styles.listItemText}>昵称</Text>
            </View>
          </List.Item>
          <List.Item extra="13800138000" arrow="horizontal">
            <View style={styles.listItemRow}>
              <IconOutline name="phone" size={18} color={Colors.primary} />
              <Text style={styles.listItemText}>手机号</Text>
            </View>
          </List.Item>
          <List.Item arrow="horizontal">
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
          <List.Item arrow="horizontal">
            <View style={styles.listItemRow}>
              <IconOutline name="question-circle" size={18} color={Colors.primary} />
              <Text style={styles.listItemText}>帮助与反馈</Text>
            </View>
          </List.Item>
        </List>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={logout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </Pressable>
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: FontSize.lg,
    color: Colors.danger,
  },
});
