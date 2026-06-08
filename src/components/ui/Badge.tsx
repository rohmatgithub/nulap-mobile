import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { Text } from './Text';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  default: {
    bg: 'transparent',
    border: colors.border,
    text: colors.textSecondary,
  },
  primary: {
    bg: colors.accentPrimaryAlpha,
    border: colors.accentPrimary,
    text: colors.accentPrimary,
  },
  secondary: {
    bg: colors.accentSecondaryAlpha,
    border: colors.accentSecondary,
    text: colors.accentSecondary,
  },
  tertiary: {
    bg: colors.accentTertiaryAlpha,
    border: colors.accentTertiary,
    text: colors.accentTertiary,
  },
  success: {
    bg: colors.accentSecondaryAlpha,
    border: colors.success,
    text: colors.success,
  },
  warning: {
    bg: 'rgba(212, 128, 58, 0.15)',
    border: colors.warning,
    text: colors.warning,
  },
  danger: {
    bg: 'rgba(192, 57, 43, 0.15)',
    border: colors.danger,
    text: colors.danger,
  },
};

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
        },
        style,
      ]}
    >
      <Text variant="mono" size="xs" uppercase style={{ color: variantStyle.text }}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: borderRadius.none,
    alignSelf: 'flex-start',
  },
});
