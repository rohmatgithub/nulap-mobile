import { Image, Pressable, StyleSheet, View } from 'react-native';
import { BookOpen, ChevronRight, Users } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { Card, MetaText, ProgressBar, Text } from '@/components/ui';
import type { PopularBook, UserBook } from '@/types/book';

interface SuggestedBooksWidgetProps {
  lastReadBook?: UserBook;
  popularBooks: PopularBook[];
  onOpenBook: (bookId: number) => void;
  onReadBook: (bookId: number) => void;
  onViewLibrary: () => void;
}

function BookCover({ uri, size = 'md' }: { uri?: string; size?: 'sm' | 'md' }) {
  return (
    <View style={[styles.cover, size === 'sm' && styles.coverSmall]}>
      {uri ? (
        <Image source={{ uri }} style={styles.coverImage} resizeMode="cover" />
      ) : (
        <BookOpen size={size === 'sm' ? 20 : 28} color={colors.textSecondary} />
      )}
    </View>
  );
}

function formatLastRead(dateString?: string): string {
  if (!dateString) return 'Not started';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('id-ID');
}

export function SuggestedBooksWidget({
  lastReadBook,
  popularBooks,
  onOpenBook,
  onReadBook,
  onViewLibrary,
}: SuggestedBooksWidgetProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <BookOpen size={18} color={colors.accentPrimary} />
          <Text variant="headingBold" size="base">
            Suggested Books
          </Text>
        </View>
        <Pressable onPress={onViewLibrary} style={styles.libraryLink}>
          <MetaText size="xs">Library</MetaText>
          <ChevronRight size={14} color={colors.textSecondary} />
        </Pressable>
      </View>

      {lastReadBook ? (
        <Pressable style={styles.lastRead} onPress={() => onReadBook(lastReadBook.id)}>
          <BookCover uri={lastReadBook.cover_url} />
          <View style={styles.lastReadInfo}>
            <Text variant="mono" size="xs" color="secondary" uppercase>
              Last Read
            </Text>
            <Text variant="headingBold" size="base" numberOfLines={2} style={styles.bookTitle}>
              {lastReadBook.title}
            </Text>
            <MetaText numberOfLines={1}>{lastReadBook.author}</MetaText>
            <View style={styles.progressMeta}>
              <MetaText size="xs">{Math.round(lastReadBook.progress)}% complete</MetaText>
              <MetaText size="xs">{formatLastRead(lastReadBook.last_read_at)}</MetaText>
            </View>
            <ProgressBar progress={lastReadBook.progress} height={5} />
          </View>
        </Pressable>
      ) : (
        <View style={styles.emptyLastRead}>
          <BookOpen size={28} color={colors.textMuted} />
          <View style={styles.emptyText}>
            <Text variant="headingBold" size="sm">No recent reading</Text>
            <MetaText size="xs">Pick a book from the library to start.</MetaText>
          </View>
        </View>
      )}

      <View style={styles.popularHeader}>
        <Users size={15} color={colors.accentPrimary} />
        <Text variant="mono" size="xs" color="secondary" uppercase>
          Popular Reading
        </Text>
      </View>

      {popularBooks.length > 0 ? (
        <View style={styles.popularList}>
          {popularBooks.slice(0, 3).map((item, index) => (
            <Pressable
              key={item.book.id}
              style={styles.popularItem}
              onPress={() => onOpenBook(item.book.id)}
            >
              <View style={styles.rank}>
                <Text variant="mono" size="xs">{index + 1}</Text>
              </View>
              <BookCover uri={item.book.cover_url} size="sm" />
              <View style={styles.popularInfo}>
                <Text variant="headingBold" size="sm" numberOfLines={1}>
                  {item.book.title}
                </Text>
                <MetaText size="xs" numberOfLines={1}>
                  {item.book.author}
                </MetaText>
                <View style={styles.popularMeta}>
                  <MetaText size="xs">{item.reader_count} readers</MetaText>
                  <MetaText size="xs">{Math.round(item.average_progress)}% avg</MetaText>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyPopular}>
          <MetaText size="xs">No shared reading activity yet.</MetaText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[6],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  libraryLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastRead: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cover: {
    width: 72,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  coverSmall: {
    width: 42,
    height: 58,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  lastReadInfo: {
    flex: 1,
    minWidth: 0,
  },
  bookTitle: {
    marginTop: spacing[1],
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  emptyLastRead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptyText: {
    flex: 1,
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  popularList: {
    gap: spacing[3],
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  rank: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  popularInfo: {
    flex: 1,
    minWidth: 0,
  },
  popularMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  emptyPopular: {
    paddingVertical: spacing[2],
  },
});
