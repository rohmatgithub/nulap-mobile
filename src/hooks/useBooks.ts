import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookService } from '@/services/book';
import type { UpdateProgressInput, CreateHighlightInput, CreateBookmarkInput } from '@/types/book';

export const BOOK_KEYS = {
  all: ['books'] as const,
  lists: () => [...BOOK_KEYS.all, 'list'] as const,
  list: () => [...BOOK_KEYS.lists()] as const,
  userBooks: () => [...BOOK_KEYS.all, 'user'] as const,
  userBooksByStatus: (status: string) => [...BOOK_KEYS.userBooks(), status] as const,
  details: () => [...BOOK_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...BOOK_KEYS.details(), id] as const,
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
    mutationFn: (input: CreateHighlightInput) => bookService.createHighlight(input),
    onSuccess: (_, { book_id }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.highlights(book_id) });
    },
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bookId }: { id: number; bookId: number }) =>
      bookService.deleteHighlight(id),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.highlights(bookId) });
    },
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookmarkInput) => bookService.createBookmark(input),
    onSuccess: (_, { book_id }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.bookmarks(book_id) });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bookId }: { id: number; bookId: number }) =>
      bookService.deleteBookmark(id),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.bookmarks(bookId) });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOK_KEYS.all });
    },
  });
}
