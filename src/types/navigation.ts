import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Study: { deckId: string; studyAhead?: boolean };
  StudyDone: {
    deckId: string;
    ratings: string;
    xp: string;
    duration: string;
    levelUp: string;
    level: string;
    goalMet: string;
  };
  DeckDetail: { deckId: string };
  CardCreate: { deckId?: string };
  CardEdit: { cardId: string };
  BookDetail: { bookId: string };
  BookReader: { bookId: string };
  Settings: undefined;
};

// Bottom Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Decks: undefined;
  Books: undefined;
  Todo: undefined;
};

// Screen props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
