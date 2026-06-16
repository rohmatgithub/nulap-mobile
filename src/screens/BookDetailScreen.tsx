import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  BookOpen,
  Clock,
  Highlighter,
  Calendar,
  Play,
  MoreVertical,
  Check,
  X,
  Trash2,
} from 'lucide-react-native';
import { colors, spacing, screenPadding } from '@/constants/theme';
import { Text, HeadingText, MetaText, Card, Button, Badge, ProgressBar } from '@/components/ui';
import { useBookProgress, useBookHighlights, useUpdateBookStatus } from '@/hooks';
import { bookService } from '@/services/book';
import type { RootStackScreenProps } from '@/types/navigation';
import type { BookStatus, Highlight } from '@/types/book';

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: 'rgba(196, 169, 81, 0.4)',
  green: 'rgba(74, 124, 89, 0.4)',
  blue: 'rgba(90, 143, 168, 0.4)',
  red: 'rgba(184, 74, 74, 0.4)',
};

function formatReadingTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
}) {
  return (
    <Card style={styles.statBox}>
      <Icon size={18} color={colors.textMuted} strokeWidth={2} />
      <Text variant="headingBold" size="base" color="primary">
        {value}
      </Text>
      <MetaText size="xs">{label}</MetaText>
    </Card>
  );
}

function HighlightCard({ highlight }: { highlight: Highlight }) {
  const bgColor = HIGHLIGHT_COLORS[highlight.color] || HIGHLIGHT_COLORS.yellow;

  return (
    <View style={[styles.highlightCard, { backgroundColor: bgColor }]}>
      <Text variant="bodyItalic" size="sm" color="primary" style={styles.highlightText}>
        "{highlight.text}"
      </Text>
      {highlight.note && (
        <MetaText size="xs" style={styles.highlightNote}>
          📝 {highlight.note}
        </MetaText>
      )}
      <MetaText size="xs" style={styles.highlightMeta}>
        {formatDate(highlight.created_at)}
      </MetaText>
    </View>
  );
}

export function BookDetailScreen({ navigation, route }: RootStackScreenProps<'BookDetail'>) {
  const bookId = Number(route.params.bookId);
  const [showMenu, setShowMenu] = useState(false);

  const { data: book, isLoading, error, refetch, isRefetching } = useBookProgress(bookId);
  const { data: highlights } = useBookHighlights(bookId);
  const updateStatus = useUpdateBookStatus();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = (status: BookStatus) => {
    setShowMenu(false);
    updateStatus.mutate(
      { bookId, status },
      {
        onError: () => Alert.alert('Error', 'Failed to update status'),
      }
    );
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert('Remove Book?', 'This will remove the book from your library.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await bookService.updateStatus(bookId, 'dropped');
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to remove book');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const handleStartReading = () => {
    navigation.navigate('BookReader', { bookId: String(bookId) });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <BookOpen size={48} color={colors.textMuted} strokeWidth={1.5} />
          <Text variant="headingBold" size="lg" color="primary" style={styles.errorTitle}>
            Book not found
          </Text>
          <MetaText style={styles.errorText}>
            This book may have been removed or doesn't exist.
          </MetaText>
          <Button variant="secondary" onPress={() => navigation.goBack()}>
            Back to Library
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const progress = Math.round(book.progress);
  const isChapterBased = book.content_type === 'chapters';
  const progressInfo = isChapterBased && book.total_chapters
    ? `${book.chapters_completed}/${book.total_chapters} chapters`
    : `${book.reading_time_minutes} min read`;

  const getStatusBadge = (status: BookStatus) => {
    switch (status) {
      case 'reading':
        return { label: 'Reading', variant: 'primary' as const };
      case 'finished':
        return { label: 'Finished', variant: 'success' as const };
      case 'dropped':
        return { label: 'Dropped', variant: 'default' as const };
    }
  };

  const statusBadge = getStatusBadge(book.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerSpacer} />
        <View style={styles.menuContainer}>
          <Pressable style={styles.menuButton} onPress={() => setShowMenu(!showMenu)} hitSlop={8}>
            <MoreVertical size={20} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>

          {showMenu && (
            <>
              <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)} />
              <View style={styles.menuDropdown}>
                {book.status !== 'finished' && (
                  <Pressable style={styles.menuItem} onPress={() => handleStatusChange('finished')}>
                    <Check size={16} color={colors.success} strokeWidth={2} />
                    <Text variant="body" size="sm">Mark as Finished</Text>
                  </Pressable>
                )}
                {book.status !== 'dropped' && (
                  <Pressable style={styles.menuItem} onPress={() => handleStatusChange('dropped')}>
                    <X size={16} color={colors.textMuted} strokeWidth={2} />
                    <Text variant="body" size="sm">Drop Book</Text>
                  </Pressable>
                )}
                {book.status !== 'reading' && (
                  <Pressable style={styles.menuItem} onPress={() => handleStatusChange('reading')}>
                    <BookOpen size={16} color={colors.accentPrimary} strokeWidth={2} />
                    <Text variant="body" size="sm">Resume Reading</Text>
                  </Pressable>
                )}
                <Pressable style={[styles.menuItem, styles.menuItemDanger]} onPress={handleDelete}>
                  <Trash2 size={16} color={colors.danger} strokeWidth={2} />
                  <Text variant="body" size="sm" style={{ color: colors.danger }}>
                    Remove Book
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accentPrimary}
          />
        }
      >
        {/* Book Info */}
        <View style={styles.bookHeader}>
          <View style={styles.coverContainer}>
            <View style={styles.cover}>
              {book.cover_url ? (
                <Image
                  source={{ uri: book.cover_url }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              ) : (
                <BookOpen size={40} color={colors.textMuted} strokeWidth={1.5} />
              )}
            </View>
          </View>

          <View style={styles.bookInfo}>
            <HeadingText numberOfLines={3}>{book.title}</HeadingText>
            <Text variant="body" color="secondary" style={styles.author}>
              {book.author}
            </Text>

            <View style={styles.badges}>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              {book.category && <Badge variant="default">{book.category}</Badge>}
            </View>
          </View>
        </View>

        {/* Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text variant="mono" size="xs" color="secondary" uppercase>
              Progress
            </Text>
            <Text variant="headingBold" size="lg" color="primary">
              {progress}%
            </Text>
          </View>
          <ProgressBar progress={progress} color={colors.accentSecondary} />
          <MetaText size="xs" style={styles.progressText}>
            {progressInfo}
          </MetaText>
        </Card>

        {/* CTA */}
        <Button variant="primary" onPress={handleStartReading} style={styles.ctaButton}>
          {progress > 0 ? 'Continue Reading' : 'Start Reading'}
        </Button>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatBox
            icon={Clock}
            label="Time Spent"
            value={formatReadingTime(book.reading_time)}
          />
          <StatBox
            icon={Highlighter}
            label="Highlights"
            value={highlights?.length ?? 0}
          />
          <StatBox
            icon={Calendar}
            label="Started"
            value={formatDate(book.started_at)}
          />
          <StatBox
            icon={BookOpen}
            label={isChapterBased ? 'Chapters' : 'Est. Time'}
            value={isChapterBased ? (book.total_chapters ?? 0) : `${book.reading_time_minutes}m`}
          />
        </View>

        {/* Highlights */}
        <Card style={styles.highlightsCard}>
          <View style={styles.highlightsHeader}>
            <Text variant="headingBold" size="base">Highlights & Notes</Text>
            <MetaText size="xs">{highlights?.length ?? 0} highlights</MetaText>
          </View>

          {!highlights || highlights.length === 0 ? (
            <View style={styles.emptyHighlights}>
              <Highlighter size={32} color={colors.textMuted} strokeWidth={1.5} />
              <MetaText style={styles.emptyText}>
                No highlights yet. Start reading and highlight important passages.
              </MetaText>
            </View>
          ) : (
            <View style={styles.highlightsList}>
              {highlights.slice(0, 5).map((highlight) => (
                <HighlightCard key={highlight.id} highlight={highlight} />
              ))}
              {highlights.length > 5 && (
                <MetaText style={styles.moreHighlights}>
                  +{highlights.length - 5} more highlights
                </MetaText>
              )}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: screenPadding,
    gap: spacing[3],
  },
  errorTitle: {
    marginTop: spacing[4],
  },
  errorText: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[3],
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerSpacer: {
    flex: 1,
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  menuOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 10,
  },
  menuDropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    minWidth: 180,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: screenPadding,
  },
  bookHeader: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  coverContainer: {
    flexShrink: 0,
  },
  cover: {
    width: 100,
    height: 150,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  bookInfo: {
    flex: 1,
    gap: spacing[2],
  },
  author: {
    marginTop: spacing[1],
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  progressCard: {
    marginBottom: spacing[4],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  progressText: {
    marginTop: spacing[2],
    textAlign: 'right',
  },
  ctaButton: {
    marginBottom: spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[3],
  },
  highlightsCard: {
    marginBottom: spacing[4],
  },
  highlightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyHighlights: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[3],
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 240,
  },
  highlightsList: {
    gap: spacing[3],
  },
  highlightCard: {
    padding: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.accentTertiary,
  },
  highlightText: {
    marginBottom: spacing[2],
  },
  highlightNote: {
    marginBottom: spacing[2],
  },
  highlightMeta: {
    opacity: 0.7,
  },
  moreHighlights: {
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
