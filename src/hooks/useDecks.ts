import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deckService } from '@/services/deck';
import type { CreateDeckInput, UpdateDeckInput, CreateCardInput, UpdateCardInput } from '@/types/deck';

export const DECK_KEYS = {
  all: ['decks'] as const,
  lists: () => [...DECK_KEYS.all, 'list'] as const,
  list: () => [...DECK_KEYS.lists()] as const,
  details: () => [...DECK_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...DECK_KEYS.details(), id] as const,
  cards: (deckId: number) => [...DECK_KEYS.all, 'cards', deckId] as const,
  card: (id: number) => [...DECK_KEYS.all, 'card', id] as const,
  dueCards: (deckId: number) => [...DECK_KEYS.all, 'due', deckId] as const,
};

export function useDecks() {
  return useQuery({
    queryKey: DECK_KEYS.list(),
    queryFn: () => deckService.getAll(),
  });
}

export function useDeck(id: number) {
  return useQuery({
    queryKey: DECK_KEYS.detail(id),
    queryFn: () => deckService.getById(id),
    enabled: !!id,
  });
}

export function useDeckCards(deckId: number) {
  return useQuery({
    queryKey: DECK_KEYS.cards(deckId),
    queryFn: () => deckService.getCards(deckId),
    enabled: !!deckId,
  });
}

export function useCard(id: number) {
  return useQuery({
    queryKey: DECK_KEYS.card(id),
    queryFn: () => deckService.getCard(id),
    enabled: !!id,
  });
}

export function useDueCards(deckId: number) {
  return useQuery({
    queryKey: DECK_KEYS.dueCards(deckId),
    queryFn: () => deckService.getDueCards(deckId),
    enabled: !!deckId,
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDeckInput) => deckService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.all });
    },
  });
}

export function useUpdateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateDeckInput }) =>
      deckService.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.detail(id) });
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deckService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.all });
    },
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) => deckService.createCard(input),
    onSuccess: (_, { deck_id }) => {
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.cards(deck_id) });
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.detail(deck_id) });
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.list() });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; deckId: number; input: UpdateCardInput }) =>
      deckService.updateCard(id, input),
    onSuccess: (_, { id, deckId }) => {
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.card(id) });
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.cards(deckId) });
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.detail(deckId) });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deckId }: { id: number; deckId: number }) =>
      deckService.deleteCard(id),
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.cards(deckId) });
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.detail(deckId) });
      queryClient.invalidateQueries({ queryKey: DECK_KEYS.list() });
    },
  });
}
