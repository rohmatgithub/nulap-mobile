import { View, StyleSheet, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { Text } from '@/components/ui';
import type { HighlightColor } from '@/types/book';

interface HighlightPopupProps {
  visible: boolean;
  selectedText: string;
  position: { x: number; y: number };
  onHighlight: (color: HighlightColor) => void;
  onClose: () => void;
}

const HIGHLIGHT_COLORS: { key: HighlightColor; color: string; label: string }[] = [
  { key: 'yellow', color: '#C4A951', label: 'Yellow' },
  { key: 'green', color: '#4A7C59', label: 'Green' },
  { key: 'blue', color: '#5A8FA8', label: 'Blue' },
  { key: 'red', color: '#B84A4A', label: 'Red' },
];

export function HighlightPopup({
  visible,
  selectedText,
  position,
  onHighlight,
  onClose,
}: HighlightPopupProps) {
  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View
        style={[
          styles.popup,
          {
            top: Math.max(60, position.y - 80),
            left: Math.max(16, Math.min(position.x - 100, 200)),
          },
        ]}
      >
        <View style={styles.header}>
          <Text variant="mono" size="xs" color="secondary">
            Highlight
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={16} color={colors.textMuted} />
          </Pressable>
        </View>

        <Text variant="bodyItalic" size="xs" numberOfLines={2} style={styles.preview}>
          "{selectedText}"
        </Text>

        <View style={styles.colorsRow}>
          {HIGHLIGHT_COLORS.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.colorButton, { backgroundColor: item.color }]}
              onPress={() => onHighlight(item.key)}
            />
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  popup: {
    position: 'absolute',
    zIndex: 101,
    width: 200,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    padding: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  preview: {
    marginBottom: spacing[3],
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  colorButton: {
    flex: 1,
    height: 32,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
});
