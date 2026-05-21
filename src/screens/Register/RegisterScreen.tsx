import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button, Input, Toast } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { IconOutline } from '@ant-design/icons-react-native';
import { api } from '../../services/api';

export default function RegisterScreen() {
  const { login } = useAppContext();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      Toast.fail({ content: '两次输入的密码不一致', duration: 2 });
      return;
    }

    if (password.length < 6) {
      Toast.fail({ content: '密码长度不能少于6位', duration: 2 });
      return;
    }

    setLoading(true);
    try {
      await api.register(phone, password, name);
      await login(phone, password);
      Toast.success({ content: '注册成功', duration: 1 });
    } catch (e: any) {
      Toast.fail({ content: e.message || '请检查输入信息', duration: 2 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandArea}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <IconOutline name="user-add" size={32} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.brandTitle}>创建账号</Text>
          <Text style={styles.brandSubtitle}>开启全新的聊天体验</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>昵称</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="请输入昵称"
              maxLength={20}
              style={styles.input}
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>手机号</Text>
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder="请输入手机号"
              keyboardType="phone-pad"
              maxLength={11}
              style={styles.input}
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>密码</Text>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="至少 6 位"
              secureTextEntry
              style={styles.input}
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>确认密码</Text>
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="再次输入密码"
              secureTextEntry
              style={styles.input}
              clearButtonMode="while-editing"
            />
          </View>

          <Button
            type="primary"
            onPress={handleRegister}
            loading={loading}
            disabled={!name || !phone || !password || !confirmPassword}
            style={styles.registerButton}>
            注 册
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  brandArea: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.xl,
  },
  logoOuter: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  brandTitle: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  brandSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textHint,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    ...Shadows.sm,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  registerButton: {
    marginTop: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.round,
  },
});
