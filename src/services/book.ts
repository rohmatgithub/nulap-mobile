import { apiClient } from './api';
import type {
  Book,
  UserBook,
  Highlight,
  Bookmark,
  UpdateProgressInput,
  CreateHighlightInput,
  CreateBookmarkInput,
} from '@/types/book';

export const bookService = {
  // Book library
  getAll: async (): Promise<Book[]> => {
    const { data } = await apiClient.get<Book[]>('/books');
    return data;
  },

  getById: async (id: number): Promise<Book> => {
    const { data } = await apiClient.get<Book>(`/books/${id}`);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
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

  createHighlight: async (input: CreateHighlightInput): Promise<Highlight> => {
    const { data } = await apiClient.post<Highlight>('/books/highlights', input);
    return data;
  },

  deleteHighlight: async (id: number): Promise<void> => {
    await apiClient.delete(`/books/highlights/${id}`);
  },

  // Bookmarks
  getBookmarks: async (bookId: number): Promise<Bookmark[]> => {
    const { data } = await apiClient.get<Bookmark[]>(`/books/${bookId}/bookmarks`);
    return data;
  },

  createBookmark: async (input: CreateBookmarkInput): Promise<Bookmark> => {
    const { data } = await apiClient.post<Bookmark>('/books/bookmarks', input);
    return data;
  },

  deleteBookmark: async (id: number): Promise<void> => {
    await apiClient.delete(`/books/bookmarks/${id}`);
  },
};
