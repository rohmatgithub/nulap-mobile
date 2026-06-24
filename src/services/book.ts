import { apiClient } from './api';
import type {
  Book,
  Chapter,
  UserBook,
  BookFilters,
  PaginatedUserBooksResponse,
  Highlight,
  Bookmark,
  UpdateProgressInput,
  CreateHighlightInput,
  UpdateHighlightInput,
  CreateBookmarkInput,
} from '@/types/book';

export const bookService = {
  // Book library (published books)
  getAll: async (): Promise<Book[]> => {
    const { data } = await apiClient.get<Book[]>('/books');
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>('/books/categories');
    return data;
  },

  getPaged: async (params: BookFilters & { page: number; limit: number }): Promise<PaginatedUserBooksResponse> => {
    const { data } = await apiClient.get<PaginatedUserBooksResponse>('/books', {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        category: params.category || undefined,
      },
    });
    return data;
  },

  getById: async (id: number): Promise<Book> => {
    const { data } = await apiClient.get<Book>(`/books/${id}`);
    return data;
  },

  // Chapters (for chapters content type)
  getChapters: async (bookId: number): Promise<Chapter[]> => {
    const { data } = await apiClient.get<Chapter[]>(`/books/${bookId}/chapters`);
    return data;
  },

  getChapter: async (bookId: number, chapterNumber: number): Promise<Chapter> => {
    const { data } = await apiClient.get<Chapter>(`/books/${bookId}/chapters/${chapterNumber}`);
    return data;
  },

  // User's books (library with progress)
  getUserBooks: async (): Promise<UserBook[]> => {
    const { data } = await apiClient.get<UserBook[]>('/books/my/library');
    return data;
  },

  getUserBooksByStatus: async (status: string): Promise<UserBook[]> => {
    const { data } = await apiClient.get<UserBook[]>(`/books/my/status/${status}`);
    return data;
  },

  getProgress: async (bookId: number): Promise<UserBook> => {
    const { data } = await apiClient.get<UserBook>(`/books/${bookId}/progress`);
    return data;
  },

  updateProgress: async (bookId: number, input: UpdateProgressInput): Promise<void> => {
    await apiClient.put(`/books/${bookId}/progress`, input);
  },

  updateStatus: async (bookId: number, status: string): Promise<void> => {
    await apiClient.put(`/books/${bookId}/status`, { status });
  },

  // Highlights
  getHighlights: async (bookId: number): Promise<Highlight[]> => {
    const { data } = await apiClient.get<Highlight[]>(`/books/${bookId}/highlights`);
    return data;
  },

  createHighlight: async (_bookId: number, input: CreateHighlightInput): Promise<Highlight> => {
    const { data } = await apiClient.post<Highlight>('/books/highlights', input);
    return data;
  },

  updateHighlight: async (_bookId: number, highlightId: number, input: UpdateHighlightInput): Promise<Highlight> => {
    const { data } = await apiClient.put<Highlight>(`/books/highlights/${highlightId}`, input);
    return data;
  },

  deleteHighlight: async (_bookId: number, highlightId: number): Promise<void> => {
    await apiClient.delete(`/books/highlights/${highlightId}`);
  },

  createCardFromHighlight: async (
    _bookId: number,
    highlightId: number,
    deckId: number,
    front: string,
    back: string
  ): Promise<void> => {
    await apiClient.post(`/books/highlights/${highlightId}/card`, {
      deck_id: deckId,
      front,
      back,
    });
  },

  // Bookmarks
  getBookmarks: async (bookId: number): Promise<Bookmark[]> => {
    const { data } = await apiClient.get<Bookmark[]>(`/books/${bookId}/bookmarks`);
    return data;
  },

  createBookmark: async (bookId: number, input: CreateBookmarkInput): Promise<Bookmark> => {
    const { data } = await apiClient.post<Bookmark>(`/books/${bookId}/bookmarks`, input);
    return data;
  },

  deleteBookmark: async (bookId: number, bookmarkId: number): Promise<void> => {
    await apiClient.delete(`/books/${bookId}/bookmarks/${bookmarkId}`);
  },
};
