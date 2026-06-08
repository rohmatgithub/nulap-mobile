import { apiClient } from './api';
import type {
  Deck,
  DeckListItem,
  CreateDeckInput,
  UpdateDeckInput,
  Card,
  CreateCardInput,
  ReviewCardInput,
} from '@/types/deck';

export const deckService = {
  getAll: async (): Promise<DeckListItem[]> => {
    const { data } = await apiClient.get<DeckListItem[]>('/decks');
    return data;
  },

  getById: async (id: number): Promise<Deck> => {
    const { data } = await apiClient.get<Deck>(`/decks/${id}`);
    return data;
  },

  create: async (input: CreateDeckInput): Promise<Deck> => {
    const { data } = await apiClient.post<Deck>('/decks', input);
    return data;
  },

  update: async (id: number, input: UpdateDeckInput): Promise<void> => {
    await apiClient.put(`/decks/${id}`, input);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/decks/${id}`);
  },

  // Card operations
  getCards: async (deckId: number): Promise<Card[]> => {
    const { data } = await apiClient.get<Card[]>(`/decks/${deckId}/cards`);
    return data;
  },

  getDueCards: async (deckId: number): Promise<Card[]> => {
    const { data } = await apiClient.get<Card[]>(`/decks/${deckId}/cards/due`);
    return data;
  },

  createCard: async (input: CreateCardInput): Promise<Card> => {
    const { data } = await apiClient.post<Card>('/cards', input);
    return data;
  },

  updateCard: async (id: number, input: Partial<CreateCardInput>): Promise<void> => {
    await apiClient.put(`/cards/${id}`, input);
  },

  deleteCard: async (id: number): Promise<void> => {
    await apiClient.delete(`/cards/${id}`);
  },

  reviewCard: async (input: ReviewCardInput): Promise<void> => {
    await apiClient.post('/cards/review', input);
  },
};
