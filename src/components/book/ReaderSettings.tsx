import { View, StyleSheet, Pressable } from 'react-native';
import { X, Minus, Plus } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { Text, MetaText, Modal } from '@/components/ui';

export interface ReaderSettingsData {
  fontSize: number;
  lineHeight: number;
  fontFamily: 'system' | 'serif' | 'mono';
  theme: 'dark' | 'sepia' | 'light';
}

interface ReaderSettingsProps {
  visible: boolean;
  settings: ReaderSettingsData;
  onClose: () => void;
  onChange: (settings: ReaderSettingsData) => void;
}

const FONT_FAMILIES = [
  { key: 'system', label: 'System' },
  { key: 'serif', label: 'Serif' },
  { key: 'mono', label: 'Mono' },
] as const;

const THEMES = [
  { key: 'dark', label: 'Dark', bg: colors.base, text: colors.textPrimary },
  { key: 'sepia', label: 'Sepia', bg: '#2A2318', text: '#E8DFC9' },
  { key: 'light', label: 'Light', bg: '#F5F3ED', text: '#1A1A18' },
] as const;

export function ReaderSettings({ visible, settings, onClose, onChange }: ReaderSettingsProps) {
  const updateSetting = <K extends keyof ReaderSettingsData>(
    key: K,
    value: ReaderSettingsData[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const decreaseFontSize = () => {
    if (settings.fontSize > 14) {
      updateSetting('fontSize', settings.fontSize - 2);
    }
  };

  const increaseFontSize = () => {
    if (settings.fontSize < 28) {
      updateSetting('fontSize', settings.fontSize + 2);
    }
  };

  const decreaseLineHeight = () => {
    if (settings.lineHeight > 1.4) {
      updateSetting('lineHeight', Math.round((settings.lineHeight - 0.2) * 10) / 10);
    }
  };

  const increaseLineHeight = () => {
    if (settings.lineHeight < 2.2) {
      updateSetting('lineHeight', Math.round((settings.lineHeight + 0.2) * 10) / 10);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Reader Settings">
      {/* Font Size */}
      <View style={styles.settingRow}>
        <MetaText>Font Size</MetaText>
        <View style={styles.stepperContainer}>
          <Pressable
            style={[styles.stepperButton, settings.fontSize <= 14 && styles.stepperDisabled]}
            onPress={decreaseFontSize}
            disabled={settings.fontSize <= 14}
          >
            <Minus size={16} color={settings.fontSize <= 14 ? colors.textMuted : colors.textPrimary} />
          </Pressable>
          <Text variant="mono" size="sm" style={styles.stepperValue}>
            {settings.fontSize}
          </Text>
          <Pressable
            style={[styles.stepperButton, settings.fontSize >= 28 && styles.stepperDisabled]}
            onPress={increaseFontSize}
            disabled={settings.fontSize >= 28}
          >
            <Plus size={16} color={settings.fontSize >= 28 ? colors.textMuted : colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Line Height */}
      <View style={styles.settingRow}>
        <MetaText>Line Height</MetaText>
        <View style={styles.stepperContainer}>
          <Pressable
            style={[styles.stepperButton, settings.lineHeight <= 1.4 && styles.stepperDisabled]}
            onPress={decreaseLineHeight}
            disabled={settings.lineHeight <= 1.4}
          >
            <Minus size={16} color={settings.lineHeight <= 1.4 ? colors.textMuted : colors.textPrimary} />
          </Pressable>
          <Text variant="mono" size="sm" style={styles.stepperValue}>
            {settings.lineHeight.toFixed(1)}
          </Text>
          <Pressable
            style={[styles.stepperButton, settings.lineHeight >= 2.2 && styles.stepperDisabled]}
            onPress={increaseLineHeight}
            disabled={settings.lineHeight >= 2.2}
          >
            <Plus size={16} color={settings.lineHeight >= 2.2 ? colors.textMuted : colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Font Family */}
      <View style={styles.settingSection}>
        <MetaText style={styles.sectionLabel}>Font</MetaText>
        <View style={styles.optionsRow}>
          {FONT_FAMILIES.map((font) => (
            <Pressable
              key={font.key}
              style={[
                styles.optionButton,
                settings.fontFamily === font.key && styles.optionButtonActive,
              ]}
              onPress={() => updateSetting('fontFamily', font.key)}
            >
              <Text
                variant={font.key === 'mono' ? 'mono' : 'body'}
                size="sm"
                style={settings.fontFamily === font.key ? styles.optionTextActive : undefined}
              >
                {font.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Theme */}
      <View style={styles.settingSection}>
        <MetaText style={styles.sectionLabel}>Theme</MetaText>
        <View style={styles.optionsRow}>
          {THEMES.map((theme) => (
            <Pressable
              key={theme.key}
              style={[
                styles.themeButton,
                { backgroundColor: theme.bg },
                settings.theme === theme.key && styles.themeButtonActive,
              ]}
              onPress={() => updateSetting('theme', theme.key)}
            >
              <Text variant="mono" size="xs" style={{ color: theme.text }}>
                {theme.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  stepperButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stepperDisabled: {
    opacity: 0.5,
  },
  stepperValue: {
    minWidth: 40,
    textAlign: 'center',
  },
  settingSection: {
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    marginBottom: spacing[3],
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimaryAlpha,
  },
  optionTextActive: {
    color: colors.accentPrimary,
  },
  themeButton: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  themeButtonActive: {
    borderColor: colors.accentPrimary,
  },
});
