import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/constants/theme';
import { MainTabNavigator } from './MainTabNavigator';
import {
  LoginScreen,
  DeckDetailScreen,
  CardCreateScreen,
  CardEditScreen,
  StudyScreen,
  StudyDoneScreen,
  BookDetailScreen,
  BookReaderScreen,
} from '@/screens';
import { useAuthStore } from '@/stores/authStore';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.accentPrimary} />
    </View>
  );
}

export function RootNavigator() {
  const { isLoading, isAuthenticated, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.base },
        animation: 'fade',
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="DeckDetail"
            component={DeckDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="CardCreate"
            component={CardCreateScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="CardEdit"
            component={CardEditScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Study"
            component={StudyScreen}
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen
            name="StudyDone"
            component={StudyDoneScreen}
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen
            name="BookDetail"
            component={BookDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="BookReader"
            component={BookReaderScreen}
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.base,
  },
});
