import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Home, Layers, BookOpen, CheckSquare } from 'lucide-react-native';
import { colors, fonts, fontSize, bottomNavHeight, spacing } from '@/constants/theme';
import { DashboardScreen, DecksScreen, BooksScreen, TodoScreen } from '@/screens';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const tabIcons = {
  Dashboard: Home,
  Decks: Layers,
  Books: BookOpen,
  Todo: CheckSquare,
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color }) => {
          const Icon = tabIcons[route.name];
          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Icon size={20} color={color} strokeWidth={2} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Beranda' }}
      />
      <Tab.Screen
        name="Decks"
        component={DecksScreen}
        options={{ tabBarLabel: 'Deck' }}
      />
      <Tab.Screen
        name="Books"
        component={BooksScreen}
        options={{ tabBarLabel: 'Buku' }}
      />
      <Tab.Screen
        name="Todo"
        component={TodoScreen}
        options={{ tabBarLabel: 'Tugas' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: bottomNavHeight,
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.borderStrong,
    paddingBottom: spacing[2],
    paddingTop: spacing[2],
  },
  tabBarLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  iconContainer: {
    padding: spacing[1],
  },
  iconContainerActive: {
    // Could add background highlight here if needed
  },
});
