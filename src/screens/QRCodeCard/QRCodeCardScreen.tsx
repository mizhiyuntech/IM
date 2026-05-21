import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'qrcode';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import Avatar from '../../components/Avatar';

const QR_SIZE = 200;
const CELL_MARGIN = 0;

export default function QRCodeCardScreen() {
  const { state } = useAppContext();
  const user = state.currentUser;

  const qrMatrix = useMemo(() => {
    try {
      const qrData = JSON.stringify({
        type: 'im_user',
        id: user?.id || '',
        name: user?.name || '',
        phone: user?.phone || '',
      });
      const qr = QRCode.create(qrData, { errorCorrectionLevel: 'M' });
      return qr.modules;
    } catch {
      return null;
    }
  }, [user?.id, user?.name, user?.phone]);

  const cellSize = useMemo(() => {
    if (!qrMatrix) return 0;
    return (QR_SIZE - CELL_MARGIN * 2) / qrMatrix.size;
  }, [qrMatrix]);

  const renderQRCode = () => {
    if (!qrMatrix || cellSize <= 0) {
      return (
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrPlaceholderText}>生成中...</Text>
        </View>
      );
    }

    const rows = [];
    for (let row = 0; row < qrMatrix.size; row++) {
      const cells = [];
      for (let col = 0; col < qrMatrix.size; col++) {
        const isDark = qrMatrix.data[row * qrMatrix.size + col] === 1;
        cells.push(
          <View
            key={`${row}-${col}`}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: isDark ? Colors.textPrimary : Colors.white,
            }}
          />,
        );
      }
      rows.push(
        <View key={row} style={{ flexDirection: 'row' }}>
          {cells}
        </View>,
      );
    }

    return (
      <View style={styles.qrWrapper}>
        <View style={styles.qrGrid}>{rows}</View>
      </View>
    );
  };

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
          {renderQRCode()}
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
  qrGrid: {
    width: QR_SIZE,
    height: QR_SIZE,
  },
  qrPlaceholder: {
    width: QR_SIZE,
    height: QR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  qrPlaceholderText: {
    fontSize: FontSize.md,
    color: Colors.textHint,
  },
  qrHint: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
  },
});
