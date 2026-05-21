import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Input } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { IconOutline } from '@ant-design/icons-react-native';

export default function LoginScreen() {
  const { login } = useAppContext();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!phone || !password) return;
    setLoading(true);
    setTimeout(() => {
      login(phone, password);
      setLoading(false);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <IconOutline name="message" size={36} color={Colors.white} />
        </View>
        <Text style={styles.title}>即时通讯</Text>
        <Text style={styles.subtitle}>登录以开始聊天</Text>
      </View>

      <View style={styles.form}>
        <Input
          value={phone}
          onChangeText={setPhone}
          placeholder="请输入手机号"
          keyboardType="phone-pad"
          maxLength={11}
          style={styles.input}
          clearButtonMode="while-editing"
        />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="请输入密码"
          secureTextEntry
          style={styles.input}
          clearButtonMode="while-editing"
        />
        <Button
          type="primary"
          onPress={handleLogin}
          loading={loading}
          disabled={!phone || !password}
          style={styles.loginButton}>
          登录
        </Button>
        <View style={styles.footer}>
          <Text style={styles.footerText}>还没有账号？</Text>
          <Text style={styles.registerLink}>注册</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textHint,
  },
  form: {
    marginTop: Spacing.xl,
  },
  input: {
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.md,
    color: Colors.textHint,
  },
  registerLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
});
