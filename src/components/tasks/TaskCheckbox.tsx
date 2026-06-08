import { Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '@/constants/theme';

interface TaskCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  borderColor?: string;
  size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TaskCheckbox({
  checked,
  onToggle,
  borderColor = colors.borderStrong,
  size = 20,
}: TaskCheckboxProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(0.8, {}, () => {
      scale.value = withSpring(1);
    });
    onToggle();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.checkbox,
        {
          width: size,
          height: size,
          borderColor: checked ? colors.accentSecondary : borderColor,
          backgroundColor: checked ? colors.accentSecondary : 'transparent',
        },
        animatedStyle,
      ]}
    >
      {checked && <Check size={size - 6} color={colors.base} strokeWidth={3} />}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
