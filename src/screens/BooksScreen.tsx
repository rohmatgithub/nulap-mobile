import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, BookOpen } from 'lucide-react-native';
import { colors, spacing, screenPadding } from '@/constants/theme';
import { Text, HeadingText, MetaText, Card, Badge, ProgressBar, Button } from '@/components/ui';
import { useUserBooks } from '@/hooks';
import type { UserBook } from '@/types/book';
import type { MainTabScreenProps } from '@/types/navigation';

function formatLastRead(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return `${Math.floor(diffDays / 30)} bulan lalu`;
}

function BookCard({ userBook, onPress }: { userBook: UserBook; onPress: () => void }) {
  const progress = Math.round(userBook.progress);
  const isComplete = userBook.status === 'finished';
  const totalPages = userBook.total_pages ?? Math.round(userBook.total_locations / 10);
  const currentPage = userBook.current_page ?? Math.round(userBook.current_location / 10);

  return (
    <Card onPress={onPress} style={styles.bookCard}>
      <View style={styles.bookContent}>
        <View style={styles.bookCover}>
          <BookOpen size={32} color={colors.textSecondary} />
        </View>
        <View style={styles.bookInfo}>
          <Text variant="headingBold" size="base" numberOfLines={2} style={styles.bookTitle}>
            {userBook.title}
          </Text>
          <MetaText numberOfLines={1}>{userBook.author}</MetaText>
          <View style={styles.bookMeta}>
            <MetaText>
              {currentPage}/{totalPages} pages
            </MetaText>
            {userBook.last_read_at && (
              <>
                <MetaText>·</MetaText>
                <MetaText>{formatLastRead(userBook.last_read_at)}</MetaText>
              </>
            )}
          </View>
          <View style={styles.progressRow}>
            <ProgressBar progress={progress} style={styles.bookProgress} />
            {isComplete ? (
              <Badge variant="secondary">Done</Badge>
            ) : (
              <Text variant="mono" size="xs" color="secondary">{progress}%</Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

export function BooksScreen({ navigation }: MainTabScreenProps<'Books'>) {
  const { data: userBooks, isLoading, error, refetch, isRefetching } = useUserBooks();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text variant="body" color="secondary">Failed to load books</Text>
          <Button variant="secondary" onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <HeadingText>My Books</HeadingText>
          <MetaText>{userBooks?.length ?? 0} books</MetaText>
        </View>
        <Pressable style={styles.addButton} onPress={() => {
          Alert.alert('Coming Soon', 'Book upload will be available in a future update.');
        }}>
          <Plus size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>

      <FlatList
        data={userBooks ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookCard userBook={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accentPrimary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" color="secondary">No books yet</Text>
          </View>
        }
      />
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
  },
  retryButton: {
    marginTop: spacing[4],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[4],
  },
  headerContent: {
    flex: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.accentPrimary,
  },
  list: {
    padding: screenPadding,
    paddingTop: 0,
    gap: spacing[4],
  },
  bookCard: {
    marginBottom: spacing[1],
  },
  bookContent: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  bookCover: {
    width: 60,
    height: 80,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    flex: 1,
    gap: spacing[1],
  },
  bookTitle: {
    marginBottom: spacing[1],
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  bookProgress: {
    flex: 1,
  },
});
