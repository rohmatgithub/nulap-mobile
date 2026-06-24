import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, BookOpen, Search, X } from 'lucide-react-native';
import { colors, spacing, screenPadding, fonts, fontSize } from '@/constants/theme';
import { Text, HeadingText, MetaText, Card, Badge, ProgressBar, Button } from '@/components/ui';
import { useBookCategories, useInfiniteBooksWithProgress } from '@/hooks';
import type { UserBook } from '@/types/book';
import type { MainTabScreenProps } from '@/types/navigation';
import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 15;

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

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
  const readingTimeMinutes = userBook.reading_time_minutes;
  const chaptersInfo = userBook.content_type === 'chapters' && userBook.total_chapters
    ? `${userBook.chapters_completed}/${userBook.total_chapters} chapters`
    : `${readingTimeMinutes} min read`;

  return (
    <Card onPress={onPress} style={styles.bookCard}>
      <View style={styles.bookContent}>
        <View style={styles.bookCover}>
          {userBook.cover_url ? (
            <Image
              source={{ uri: userBook.cover_url }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <BookOpen size={32} color={colors.textSecondary} />
          )}
        </View>
        <View style={styles.bookInfo}>
          <Text variant="headingBold" size="base" numberOfLines={2} style={styles.bookTitle}>
            {userBook.title}
          </Text>
          <MetaText numberOfLines={1}>{userBook.author}</MetaText>
          <View style={styles.bookMeta}>
            <MetaText>{chaptersInfo}</MetaText>
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
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: selectedCategory,
    }),
    [debouncedSearch, selectedCategory]
  );

  const {
    data: userBooks,
    total,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBooksWithProgress(filters, PAGE_SIZE);
  const { data: categories } = useBookCategories();

  // If we have data, always show it (even during refetch)
  const hasData = userBooks && userBooks.length > 0;
  const hasActiveFilters = Boolean(search.trim()) || Boolean(selectedCategory);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Only show error if there's no data to display
  if (error && !hasData) {
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

  // Only show loading if we have NO data at all (true initial load)
  if (!hasData && isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <HeadingText>My Books</HeadingText>
          <MetaText>{total ? `${total} books` : 'Search your library'}</MetaText>
        </View>
        <Pressable style={styles.addButton} onPress={() => {
          Alert.alert('Coming Soon', 'Book upload will be available in a future update.');
        }}>
          <Plus size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {(categories?.length ?? 0) > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            <Pressable
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(undefined)}
            >
              <Text
                variant="mono"
                size="xs"
                style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}
              >
                All
              </Text>
            </Pressable>
            {categories?.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(isActive ? undefined : category)}
                >
                  <Text
                    variant="mono"
                    size="xs"
                    style={[styles.categoryText, isActive && styles.categoryTextActive]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={userBooks ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookCard
            userBook={item}
            onPress={() => navigation.navigate('BookDetail', { bookId: String(item.id) })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accentPrimary}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.accentPrimary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" color="secondary">
              {hasActiveFilters ? 'No books match your search' : 'No books yet'}
            </Text>
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
  filters: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  searchBox: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
  },
  categoryList: {
    gap: spacing[2],
    paddingRight: screenPadding,
  },
  categoryChip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.accentPrimary,
  },
  categoryText: {
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textPrimary,
  },
  footerLoader: {
    paddingVertical: spacing[6],
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
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
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
