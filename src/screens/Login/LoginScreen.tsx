import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Button, Input, WhiteSpace, Toast } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { IconOutline } from '@ant-design/icons-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const { login } = useAppContext();
  const navigation = useNavigation<LoginNavigationProp>();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) return;
    setLoading(true);
    try {
      await login(phone, password);
    } catch (e: any) {
      Toast.fail({
        content: e.message || '请检查手机号和密码',
        duration: 2,
      });
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
          <IconOutline name="message" size={36} color={Colors.white} />
        </View>
        <WhiteSpace size="lg" />
        <WhiteSpace size="sm" />
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
        <WhiteSpace size="lg" />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="请输入密码"
          secureTextEntry
          style={styles.input}
          clearButtonMode="while-editing"
        />
        <WhiteSpace size="xl" />
        <Button
          type="primary"
          onPress={handleLogin}
          loading={loading}
          disabled={!phone || !password}
          style={styles.loginButton}>
          登录
        </Button>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}>
          <Text style={styles.registerText}>没有账号？去注册</Text>
        </Pressable>
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
  form: {
    marginTop: Spacing.xl,
  },
  input: {
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.round,
  },
  registerLink: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  registerText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
});
