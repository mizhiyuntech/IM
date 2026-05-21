import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Input, WhiteSpace, Toast } from '@ant-design/react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
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
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <IconOutline name="user-add" size={36} color={Colors.white} />
        </View>
        <WhiteSpace size="lg" />
      </View>

      <View style={styles.form}>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="请输入昵称"
          maxLength={20}
          style={styles.input}
          clearButtonMode="while-editing"
        />
        <WhiteSpace size="lg" />
        <Input
          value={phone}
          onChangeText={setPhone}
          placeholder="请输入手机号"
          keyboardType="phone-pad"
          maxLength={11}
          style={styles.input}
          clearButtonMode="while-editing"
        />
        <WhiteSpace size="lg" />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="请输入密码（至少6位）"
          secureTextEntry
          style={styles.input}
          clearButtonMode="while-editing"
        />
        <WhiteSpace size="lg" />
        <Input
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="请确认密码"
          secureTextEntry
          style={styles.input}
          clearButtonMode="while-editing"
        />
        <WhiteSpace size="xl" />
        <Button
          type="primary"
          onPress={handleRegister}
          loading={loading}
          disabled={!name || !phone || !password || !confirmPassword}
          style={styles.registerButton}>
          注册
        </Button>
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
    paddingTop: 60,
    paddingBottom: Spacing.xl,
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
  form: {
    marginTop: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.lg,
  },
  registerButton: {
    marginTop: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.round,
  },
});
