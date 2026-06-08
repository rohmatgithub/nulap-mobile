import { View, StyleSheet, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Flame, Target, BookOpen, CheckSquare, Zap } from 'lucide-react-native';
import { colors, spacing, screenPadding } from '@/constants/theme';
import { Text, DisplayText, MetaText, Card, Button, Badge, ProgressBar } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth';
import { useGamificationOverview, useDecks, useTodayStats } from '@/hooks';
import type { MainTabScreenProps } from '@/types/navigation';

function StatCard({
  icon: Icon,
  label,
  value,
  color = colors.textPrimary,
}: {
  icon: typeof Flame;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Card style={styles.statCard}>
      <Icon size={20} color={color} strokeWidth={2} />
      <Text variant="headingBold" size="lg" style={{ color }}>
        {value}
      </Text>
      <MetaText size="xs">{label}</MetaText>
    </Card>
  );
}

export function DashboardScreen({ navigation }: MainTabScreenProps<'Dashboard'>) {
  const { user, accessToken, clearAuth } = useAuthStore();

  const {
    data: gamification,
    isLoading: gamificationLoading,
    refetch: refetchGamification,
  } = useGamificationOverview();

  const { data: decks, refetch: refetchDecks } = useDecks();
  const { data: taskStats, refetch: refetchTasks } = useTodayStats();

  const isRefreshing = gamificationLoading;

  const handleRefresh = () => {
    refetchGamification();
    refetchDecks();
    refetchTasks();
  };

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          if (accessToken) {
            await authService.logout(accessToken);
          }
          await clearAuth();
        },
      },
    ]);
  };

  const totalDueCards = decks?.reduce((sum, deck) => sum + deck.due_count, 0) ?? 0;
  const levelProgress = gamification
    ? Math.round(
        ((gamification.total_xp % gamification.xp_to_next_level) /
          gamification.xp_to_next_level) *
          100
      )
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <DisplayText>Hari Ini</DisplayText>
            <MetaText>{today}</MetaText>
            {user && (
              <MetaText style={styles.welcomeText}>
                Welcome, {user.username}
              </MetaText>
            )}
          </View>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Level & XP Card */}
        {gamification && (
          <Card style={styles.card}>
            <View style={styles.levelHeader}>
              <View>
                <Text variant="mono" size="xs" color="secondary" uppercase>
                  Level
                </Text>
                <Text variant="headingBold" size="xl">
                  {gamification.level}
                </Text>
              </View>
              <View style={styles.xpBadge}>
                <Zap size={14} color={colors.accentTertiary} fill={colors.accentTertiary} />
                <Text variant="mono" size="sm" style={{ color: colors.accentTertiary }}>
                  {gamification.total_xp} XP
                </Text>
              </View>
            </View>
            <View style={styles.progressSection}>
              <ProgressBar progress={levelProgress} color={colors.accentTertiary} />
              <MetaText size="xs" style={styles.progressText}>
                {gamification.xp_to_next_level - (gamification.total_xp % gamification.xp_to_next_level)} XP to level {gamification.level + 1}
              </MetaText>
            </View>
          </Card>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={Flame}
            label="Streak"
            value={gamification?.current_streak ?? 0}
            color={colors.accentPrimary}
          />
          <StatCard
            icon={Target}
            label="Goal"
            value={`${gamification?.daily_progress ?? 0}%`}
            color={colors.accentSecondary}
          />
          <StatCard
            icon={BookOpen}
            label="Due Cards"
            value={totalDueCards}
            color={colors.accentTertiary}
          />
          <StatCard
            icon={CheckSquare}
            label="Tasks Done"
            value={taskStats?.completed ?? 0}
            color={colors.textPrimary}
          />
        </View>

        {/* Daily Progress */}
        {gamification && gamification.daily_goal > 0 && (
          <Card style={styles.card}>
            <View style={styles.dailyHeader}>
              <Text variant="headingBold" size="base">Daily Progress</Text>
              <Badge variant={gamification.daily_progress >= 100 ? 'primary' : 'secondary'}>
                {gamification.daily_progress >= 100 ? 'Complete!' : `${gamification.daily_progress}%`}
              </Badge>
            </View>
            <ProgressBar
              progress={Math.min(gamification.daily_progress, 100)}
              color={gamification.daily_progress >= 100 ? colors.accentSecondary : colors.accentPrimary}
            />
            <View style={styles.dailyStats}>
              <View style={styles.dailyStat}>
                <MetaText>{gamification.cards_reviewed_today}</MetaText>
                <MetaText size="xs">cards reviewed</MetaText>
              </View>
              <View style={styles.dailyStat}>
                <MetaText>{gamification.tasks_completed_today}</MetaText>
                <MetaText size="xs">tasks done</MetaText>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Text variant="headingBold" size="base">Quick Actions</Text>
          <View style={styles.buttonRow}>
            <Button
              variant="primary"
              onPress={() => navigation.navigate('Decks')}
              style={styles.actionButton}
            >
              Study Cards
            </Button>
            <Button
              variant="secondary"
              onPress={() => navigation.navigate('Todo')}
              style={styles.actionButton}
            >
              View Tasks
            </Button>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: screenPadding,
    paddingBottom: spacing[16],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[6],
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    marginTop: spacing[1],
  },
  logoutButton: {
    padding: spacing[2],
  },
  card: {
    marginBottom: spacing[4],
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressSection: {
    gap: spacing[2],
  },
  progressText: {
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: spacing[1],
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  dailyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing[3],
  },
  dailyStat: {
    alignItems: 'center',
    gap: spacing[1],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[3],
  },
  actionButton: {
    flex: 1,
  },
});
