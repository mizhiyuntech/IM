export const Colors = {
  primary: '#1677FF',
  primaryDark: '#0958D9',
  primaryLight: '#E6F0FF',
  primarySoft: '#F0F7FF',
  accent: '#36CFC9',
  white: '#FFFFFF',
  background: '#F2F4F7',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFBFC',
  border: '#E8EAEF',
  borderLight: '#F0F1F4',
  textPrimary: '#1F2329',
  textSecondary: '#4E5969',
  textHint: '#86909C',
  textPlaceholder: '#C9CDD4',
  bubbleSelf: '#1677FF',
  bubbleOther: '#FFFFFF',
  bubbleSelfText: '#FFFFFF',
  bubbleOtherText: '#1F2329',
  divider: '#F0F1F4',
  danger: '#F53F3F',
  dangerSoft: '#FFECE8',
  success: '#00B42A',
  successSoft: '#E8FFEA',
  warning: '#FF7D00',
  warningSoft: '#FFF7E8',
  tabActive: '#1677FF',
  tabInactive: '#86909C',
  groupOwner: '#FAAD14',
  groupOwnerBg: '#FFFBE6',
  groupAdmin: '#52C41A',
  groupAdminBg: '#F6FFED',
  overlay: 'rgba(31, 35, 41, 0.45)',
  shadow: '#0B1B33',
};

export const Gradients = {
  brand: ['#1677FF', '#36CFC9'] as const,
  brandSoft: ['#E6F0FF', '#F0FFFE'] as const,
  hero: ['#1677FF', '#0958D9'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  title: 28,
  display: 32,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
};
