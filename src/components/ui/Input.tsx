import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, containerStyle, multiline, style, ...props }: InputProps) {
  return (
    <View style={containerStyle}>
      {label && (
        <Text variant="mono" size="xs" color="secondary" uppercase style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, multiline && styles.multiline, style]}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing[2],
  },
  input: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    fontFamily: fonts.mono,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  multiline: {
    height: undefined,
    minHeight: 88,
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    textAlignVertical: 'top',
  },
});
