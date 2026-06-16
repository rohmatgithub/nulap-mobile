import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import {
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import * as SplashScreen from 'expo-splash-screen';

import { RootNavigator } from '@/navigation';
import { colors } from '@/constants/theme';
import { queryClient } from '@/services/queryClient';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
        <SafeAreaProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: colors.accentPrimary,
                background: colors.base,
                card: colors.surface,
                text: colors.textPrimary,
                border: colors.border,
                notification: colors.accentPrimary,
              },
              fonts: {
                regular: { fontFamily: 'SpaceMono_400Regular', fontWeight: '400' },
                medium: { fontFamily: 'SpaceMono_700Bold', fontWeight: '500' },
                bold: { fontFamily: 'SpaceMono_700Bold', fontWeight: '700' },
                heavy: { fontFamily: 'PlayfairDisplay_900Black', fontWeight: '900' },
              },
            }}
          >
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
});
