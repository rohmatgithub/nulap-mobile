import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, Settings, Bookmark, Highlighter } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { Text, MetaText } from '@/components/ui';

interface ReaderHeaderProps {
  title: string;
  author: string;
  progress: number;
  highlightsCount?: number;
  onBack: () => void;
  onSettings: () => void;
  onBookmark: () => void;
  onHighlights?: () => void;
  isBookmarked?: boolean;
}

export function ReaderHeader({
  title,
  author,
  progress,
  highlightsCount = 0,
  onBack,
  onSettings,
  onBookmark,
  onHighlights,
  isBookmarked = false,
}: ReaderHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.iconButton} onPress={onBack} hitSlop={8}>
        <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
      </Pressable>

      <View style={styles.titleContainer}>
        <Text variant="headingBold" size="sm" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <MetaText size="xs" numberOfLines={1}>
          {author} · {Math.round(progress)}%
        </MetaText>
      </View>

      <View style={styles.actions}>
        {onHighlights && (
          <Pressable
            style={styles.iconButton}
            onPress={onHighlights}
            hitSlop={8}
          >
            <View style={styles.highlightButton}>
              <Highlighter
                size={18}
                color={highlightsCount > 0 ? colors.accentTertiary : colors.textSecondary}
                strokeWidth={2}
              />
              {highlightsCount > 0 && (
                <View style={styles.badge}>
                  <Text variant="mono" size="xs" style={styles.badgeText}>
                    {highlightsCount > 99 ? '99+' : highlightsCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
        <Pressable
          style={styles.iconButton}
          onPress={onBookmark}
          hitSlop={8}
        >
          <Bookmark
            size={20}
            color={isBookmarked ? colors.accentPrimary : colors.textSecondary}
            fill={isBookmarked ? colors.accentPrimary : 'transparent'}
            strokeWidth={2}
          />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onSettings} hitSlop={8}>
          <Settings size={20} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[2],
  },
  title: {
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.accentTertiary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.base,
    fontSize: 9,
  },
});
