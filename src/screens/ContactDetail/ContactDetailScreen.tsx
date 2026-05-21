import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Toast, Button, List } from '@ant-design/react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import Avatar from '../../components/Avatar';
import { IconOutline } from '@ant-design/icons-react-native';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

type ContactDetailNavProp = NativeStackNavigationProp<RootStackParamList>;

interface ContactDetailProps {
  route: {
    params: {
      userId: string;
      userName: string;
      userAvatar: string;
      userPhone: string;
    };
  };
}

export default function ContactDetailScreen({ route }: ContactDetailProps) {
  const { userId, userName, userAvatar, userPhone } = route.params;
  const { fetchConversations } = useAppContext();
  const navigation = useNavigation<ContactDetailNavProp>();
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    setSending(true);
    try {
      const conv = await api.createOrGetConversation('private', userId);
      await fetchConversations();
      navigation.navigate('Chat', {
        conversationId: conv.id,
        conversationName: conv.name || userName,
      });
    } catch (e: any) {
      Toast.fail({ content: e.message || '创建会话失败', duration: 2 });
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Avatar uri={userAvatar} name={userName} size={72} />
        <Text style={styles.name}>{userName}</Text>
        {userPhone ? (
          <View style={styles.phoneRow}>
            <IconOutline name="phone" size={14} color={Colors.textHint} />
            <Text style={styles.phone}>{userPhone}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          type="primary"
          onPress={handleSendMessage}
          loading={sending}
          style={styles.sendButton}>
          <IconOutline name="message" size={18} color={Colors.white} />
          发消息
        </Button>
      </View>

      <List>
        <List.Item thumb={<IconOutline name="phone" size={18} color={Colors.primary} />} extra={userPhone}>
          手机号
        </List.Item>
      </List>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileCard: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  phone: {
    fontSize: FontSize.md,
    color: Colors.textHint,
    marginLeft: Spacing.xs,
  },
  actions: {
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  sendButton: {
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.round,
  },
});
