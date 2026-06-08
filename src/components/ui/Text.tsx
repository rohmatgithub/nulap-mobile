import { Text as RNText, StyleSheet, TextProps as RNTextProps, TextStyle } from 'react-native';
import { colors, fonts, fontSize, lineHeight } from '@/constants/theme';

type TextVariant = 'display' | 'displayBlack' | 'heading' | 'headingBold' | 'body' | 'bodyItalic' | 'mono';
type TextSize = keyof typeof fontSize;
type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'danger' | 'warning';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  size?: TextSize;
  color?: TextColor;
  uppercase?: boolean;
  letterSpacing?: number;
}

const colorMap: Record<TextColor, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  accent: colors.accentPrimary,
  success: colors.accentSecondary,
  danger: colors.danger,
  warning: colors.warning,
};

export function Text({
  variant = 'body',
  size = 'base',
  color = 'primary',
  uppercase = false,
  letterSpacing,
  style,
  ...props
}: TextProps) {
  const textStyle: TextStyle = {
    fontFamily: fonts[variant],
    fontSize: fontSize[size],
    lineHeight: lineHeight[size],
    color: colorMap[color],
    ...(uppercase && { textTransform: 'uppercase', letterSpacing: letterSpacing ?? 0.8 }),
    ...(letterSpacing !== undefined && { letterSpacing }),
  };

  return <RNText style={[textStyle, style]} {...props} />;
}

export function DisplayText({ style, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="display" size="xl" {...props} style={style} />;
}

export function HeadingText({ style, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="headingBold" size="lg" {...props} style={style} />;
}

export function BodyText({ style, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="body" size="base" {...props} style={style} />;
}

export function LabelText({ style, ...props }: Omit<TextProps, 'variant' | 'uppercase'>) {
  return <Text variant="mono" size="xs" uppercase {...props} style={style} />;
}

export function MetaText({ style, ...props }: Omit<TextProps, 'variant' | 'color'>) {
  return <Text variant="mono" size="sm" color="secondary" {...props} style={style} />;
}
