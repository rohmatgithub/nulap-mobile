import { apiClient } from './api';
import type {
  Deck,
  DeckListItem,
  CreateDeckInput,
  UpdateDeckInput,
  Card,
  CardListItem,
  DueCardsResponse,
  CreateCardInput,
  UpdateCardInput,
  ReviewCardInput,
  ReviewResult,
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
  getCards: async (deckId: number): Promise<CardListItem[]> => {
    const { data } = await apiClient.get<CardListItem[]>(`/cards/deck/${deckId}`);
    return data;
  },

  getDueCards: async (deckId: number, limit = 20, studyAhead = false): Promise<DueCardsResponse> => {
    const { data } = await apiClient.get<DueCardsResponse>(
      `/cards/deck/${deckId}/due?limit=${limit}&study_ahead=${studyAhead}`
    );
    return data;
  },

  getCard: async (id: number): Promise<Card> => {
    const { data } = await apiClient.get<Card>(`/cards/${id}`);
    return data;
  },

  createCard: async (input: CreateCardInput): Promise<Card> => {
    const { data } = await apiClient.post<Card>('/cards', input);
    return data;
  },

  updateCard: async (id: number, input: UpdateCardInput): Promise<void> => {
    await apiClient.put(`/cards/${id}`, input);
  },

  deleteCard: async (id: number): Promise<void> => {
    await apiClient.delete(`/cards/${id}`);
  },

  reviewCard: async ({ card_id, ...body }: ReviewCardInput): Promise<ReviewResult> => {
    const { data } = await apiClient.post<ReviewResult>(`/cards/${card_id}/review`, body);
    return data;
  },
};
