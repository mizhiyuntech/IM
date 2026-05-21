import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import Avatar from '../../components/Avatar';

export default function QRCodeCardScreen() {
  const { state } = useAppContext();
  const user = state.currentUser;

  const qrData = JSON.stringify({
    type: 'im_user',
    id: user?.id || '',
    name: user?.name || '',
    phone: user?.phone || '',
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Avatar uri={user?.avatar} name={user?.name} size={56} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{user?.name || ''}</Text>
            <Text style={styles.cardPhone}>{user?.phone || ''}</Text>
          </View>
        </View>

        <View style={styles.qrSection}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrData}
              size={200}
              color={Colors.textPrimary}
              backgroundColor={Colors.white}
            />
          </View>
          <Text style={styles.qrHint}>扫一扫上面的二维码，添加我为好友</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  card: {
    width: '85%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  cardInfo: {
    marginLeft: Spacing.md,
  },
  cardName: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardPhone: {
    fontSize: FontSize.md,
    color: Colors.textHint,
  },
  qrSection: {
    alignItems: 'center',
  },
  qrWrapper: {
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  qrHint: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
  },
});
