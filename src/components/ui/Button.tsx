import { Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, fonts, fontSize, spacing, shadows, borderRadius } from '@/constants/theme';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'default' | 'large';

interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: colors.accentPrimary,
      borderWidth: 2,
      borderColor: colors.borderStrong,
    },
    text: { color: colors.textPrimary },
  },
  secondary: {
    container: {
      // Must be opaque: with a transparent background, iOS applies the
      // box shadow to the rendered content (text ghosting) instead of the box
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.borderStrong,
    },
    text: { color: colors.accentPrimary },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: { color: colors.textPrimary },
  },
  danger: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.danger,
    },
    text: { color: colors.danger },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  default: {
    container: { paddingVertical: 10, paddingHorizontal: 20 },
    text: { fontSize: fontSize.sm },
  },
  large: {
    container: { paddingVertical: 14, paddingHorizontal: 28 },
    text: { fontSize: fontSize.base },
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  onPress,
  style,
}: ButtonProps) {
  const pressed = useSharedValue(false);
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const hasShadow = variant === 'primary' || variant === 'secondary';

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    if (!hasShadow) return {};

    if (pressed.value) {
      return {
        transform: [{ translateX: 4 }, { translateY: 4 }],
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      };
    }
    return {
      transform: [{ translateX: 0 }, { translateY: 0 }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => (pressed.value = true)}
      onPressOut={() => (pressed.value = false)}
      style={[
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        hasShadow && shadows.card,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <Text
        variant="mono"
        style={[
          styles.text,
          variantStyle.text,
          sizeStyle.text,
          disabled && styles.disabledText,
        ]}
      >
        {children}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.mono,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
