import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { Button, Input, Toast } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandArea}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <IconOutline name="message" size={36} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.brandTitle}>欢迎回来</Text>
          <Text style={styles.brandSubtitle}>登录后开启你的沟通时刻</Text>
        </View>

        <View style={styles.card}>
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
              placeholder="请输入密码"
              secureTextEntry
              style={styles.input}
              clearButtonMode="while-editing"
            />
          </View>

          <Button
            type="primary"
            onPress={handleLogin}
            loading={loading}
            disabled={!phone || !password}
            style={styles.loginButton}>
            登 录
          </Button>

          <Pressable
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}>
            <Text style={styles.registerHint}>还没有账号？</Text>
            <Text style={styles.registerText}>立即注册</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>登录即代表同意《用户协议》与《隐私政策》</Text>
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
    paddingTop: 72,
    paddingBottom: Spacing.xxxl,
  },
  logoOuter: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoInner: {
    width: 72,
    height: 72,
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
    marginTop: Spacing.sm,
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
  loginButton: {
    marginTop: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.round,
  },
  registerLink: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  registerHint: {
    fontSize: FontSize.md,
    color: Colors.textHint,
  },
  registerText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  footer: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
});
