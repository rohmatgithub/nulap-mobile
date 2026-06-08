import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { colors, spacing, shadows, borderRadius } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function Card({ children, onPress, style, noPadding }: CardProps) {
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    if (!onPress) return {};

    if (pressed.value) {
      return {
        transform: [{ translateX: 2 }, { translateY: 2 }],
        shadowOffset: { width: 2, height: 2 },
      };
    }
    return {
      transform: [{ translateX: 0 }, { translateY: 0 }],
      shadowOffset: { width: 4, height: 4 },
    };
  });

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => (pressed.value = true)}
        onPressOut={() => (pressed.value = false)}
        style={[
          styles.card,
          styles.interactive,
          !noPadding && styles.padding,
          animatedStyle,
          style,
        ]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[styles.card, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.none,
  },
  interactive: {
    ...shadows.card,
  },
  padding: {
    padding: spacing[5],
  },
});
