import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookService } from '@/services/book';
import type { UserBook, UpdateProgressInput, CreateHighlightInput, UpdateHighlightInput, CreateBookmarkInput } from '@/types/book';

export const BOOK_KEYS = {
  all: ['books'] as const,
  lists: () => [...BOOK_KEYS.all, 'list'] as const,
  list: () => [...BOOK_KEYS.lists()] as const,
  userBooks: () => [...BOOK_KEYS.all, 'user'] as const,
  userBooksByStatus: (status: string) => [...BOOK_KEYS.userBooks(), status] as const,
  details: () => [...BOOK_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...BOOK_KEYS.details(), id] as const,
  chapters: (bookId: number) => [...BOOK_KEYS.all, 'chapters', bookId] as const,
  chapter: (bookId: number, num: number) => [...BOOK_KEYS.chapters(bookId), num] as const,
  progress: (id: number) => [...BOOK_KEYS.all, 'progress', id] as const,
  highlights: (bookId: number) => [...BOOK_KEYS.all, 'highlights', bookId] as const,
  bookmarks: (bookId: number) => [...BOOK_KEYS.all, 'bookmarks', bookId] as const,
};

export function useBooks() {
  return useQuery({
    queryKey: BOOK_KEYS.list(),
    queryFn: () => bookService.getAll(),
  });
}

export function useUserBooks() {
  return useQuery({
    queryKey: BOOK_KEYS.userBooks(),
    queryFn: () => bookService.getUserBooks(),
  });
}

export function useAllBooksWithProgress() {
  const booksQuery = useQuery({
    queryKey: BOOK_KEYS.list(),
    queryFn: () => bookService.getAll(),
  });

  const userBooksQuery = useQuery({
    queryKey: BOOK_KEYS.userBooks(),
    queryFn: () => bookService.getUserBooks(),
  });

  const mergedBooks = useMemo(() => {
    const allBooks = booksQuery.data || [];
    const userProgress = userBooksQuery.data || [];

    const progressMap = new Map(userProgress.map((p) => [p.id, p]));

    return allBooks.map((book): UserBook => {
      const progress = progressMap.get(book.id);
      if (progress) {
        return progress;
      }
      return {
        ...book,
        current_chapter_number: 1,
        chapters_completed: 0,
        scroll_position: 0,
        progress: 0,
        status: 'reading' as const,
        started_at: book.created_at,
        last_read_at: book.created_at,
        reading_time: 0,
      };
    });
  }, [booksQuery.data, userBooksQuery.data]);

  return {
    data: mergedBooks,
    isLoading: booksQuery.isLoading || userBooksQuery.isLoading,
    error: booksQuery.error || userBooksQuery.error,
    refetch: () => {
      booksQuery.refetch();
      userBooksQuery.refetch();
    },
    isRefetching: booksQuery.isRefetching || userBooksQuery.isRefetching,
  };
}

export function useUserBooksByStatus(status: string) {
  return useQuery({
    queryKey: BOOK_KEYS.userBooksByStatus(status),
    queryFn: () => bookService.getUserBooksByStatus(status),
    enabled: !!status,
  });
}

export function useBook(id: number) {
  return useQuery({
    queryKey: BOOK_KEYS.detail(id),
    queryFn: () => bookService.getById(id),
    enabled: !!id,
  });
}

export function useBookChapters(bookId: number) {
  return useQuery({
    queryKey: BOOK_KEYS.chapters(bookId),
    queryFn: () => bookService.getChapters(bookId),
    enabled: !!bookId,
  });
}

export function useBookChapter(bookId: number, chapterNumber: number) {
  return useQuery({
    queryKey: BOOK_KEYS.chapter(bookId, chapterNumber),
    queryFn: () => bookService.getChapter(bookId, chapterNumber),
    enabled: !!bookId && !!chapterNumber,
  });
}

export function useBookProgress(bookId: number) {
  return useQuery({
    queryKey: BOOK_KEYS.progress(bookId),
    queryFn: () => bookService.getProgress(bookId),
    enabled: !!bookId,
  });
}

export function useBookHighlights(bookId: number) {
  return useQuery({
    queryKey: BOOK_KEYS.highlights(bookId),
    queryFn: () => bookService.getHighlights(bookId),
    enabled: !!bookId,
  });
}

export function useBookBookmarks(bookId: number) {
  return useQuery({
    queryKey: BOOK_KEYS.bookmarks(bookId),
    queryFn: () => bookService.getBookmarks(bookId),
    enabled: !!bookId,
  });
}

export function useUpdateBookProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, input }: { bookId: number; input: UpdateProgressInput }) =>
      bookService.updateProgress(bookId, input),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.progress(bookId) });
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.userBooks() });
    },
  });
}

export function useUpdateBookStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, status }: { bookId: number; status: string }) =>
      bookService.updateStatus(bookId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.userBooks() });
    },
  });
}

export function useCreateHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, input }: { bookId: number; input: CreateHighlightInput }) =>
      bookService.createHighlight(bookId, input),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.highlights(bookId) });
    },
  });
}

export function useUpdateHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, highlightId, input }: { bookId: number; highlightId: number; input: UpdateHighlightInput }) =>
      bookService.updateHighlight(bookId, highlightId, input),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.highlights(bookId) });
    },
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, highlightId }: { bookId: number; highlightId: number }) =>
      bookService.deleteHighlight(bookId, highlightId),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.highlights(bookId) });
    },
  });
}

export function useCreateCardFromHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, highlightId, deckId, front, back }: { bookId: number; highlightId: number; deckId: number; front: string; back: string }) =>
      bookService.createCardFromHighlight(bookId, highlightId, deckId, front, back),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.highlights(bookId) });
    },
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, input }: { bookId: number; input: CreateBookmarkInput }) =>
      bookService.createBookmark(bookId, input),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.bookmarks(bookId) });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, bookmarkId }: { bookId: number; bookmarkId: number }) =>
      bookService.deleteBookmark(bookId, bookmarkId),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.bookmarks(bookId) });
    },
  });
}
