import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Sparkles, TrendingUp, Target } from 'lucide-react-native';
import { colors, spacing, screenPadding } from '@/constants/theme';
import { Text, HeadingText, Card, Button } from '@/components/ui';
import type { RootStackScreenProps } from '@/types/navigation';
import type { ReviewRating } from '@/types/deck';

function getRatingStats(ratings: ReviewRating[]) {
  const counts = { again: 0, hard: 0, good: 0, easy: 0 };
  ratings.forEach((r) => {
    if (r in counts) counts[r]++;
  });
  return counts;
}

function StatBox({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: 'danger' | 'warning' | 'success' | 'info';
}) {
  const colorMap = {
    danger: colors.danger,
    warning: colors.warning,
    success: colors.success,
    info: colors.info,
  };
  const bgColorMap = {
    danger: 'rgba(192, 57, 43, 0.15)',
    warning: 'rgba(212, 128, 58, 0.15)',
    success: 'rgba(74, 124, 89, 0.15)',
    info: 'rgba(44, 110, 171, 0.15)',
  };

  if (value === 0) return null;

  return (
    <View style={[styles.statBox, { backgroundColor: bgColorMap[color] }]}>
      <Text variant="headingBold" size="lg" style={{ color: colorMap[color] }}>
        {value}
      </Text>
      <Text variant="mono" size="xs" style={{ color: colorMap[color] }}>
        {label}
      </Text>
    </View>
  );
}

export function StudyDoneScreen({ navigation, route }: RootStackScreenProps<'StudyDone'>) {
  const { deckId, ratings: ratingsParam, xp, duration, levelUp, level, goalMet } = route.params;

  const ratings = ratingsParam.split(',').filter(Boolean) as ReviewRating[];
  const xpEarned = Number(xp) || 0;
  const leveledUp = levelUp === '1';
  const newLevel = Number(level) || 0;
  const dailyGoalMet = goalMet === '1';
  const durationSeconds = Number(duration) || 0;

  const stats = getRatingStats(ratings);
  const totalCards = ratings.length;
  const retention = totalCards > 0 ? Math.round(((stats.good + stats.easy) / totalCards) * 100) : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handleStudyAgain = () => {
    navigation.replace('Study', { deckId });
  };

  const handleStudyAhead = () => {
    navigation.replace('Study', { deckId, studyAhead: true });
  };

  const handleGoToDashboard = () => {
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  const handleAddCards = () => {
    navigation.navigate('CardCreate', { deckId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <CheckCircle size={48} color={colors.success} strokeWidth={2} />
        </View>

        {/* Title */}
        <HeadingText style={styles.title}>Session Complete!</HeadingText>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {totalCards > 0
            ? `Great job! You reviewed ${totalCards} card${totalCards > 1 ? 's' : ''}.`
            : 'Session finished.'}
        </Text>

        {/* XP & Achievements */}
        {(xpEarned > 0 || leveledUp || dailyGoalMet) && (
          <View style={styles.achievements}>
            {xpEarned > 0 && (
              <View style={[styles.achievementBadge, styles.xpBadge]}>
                <Sparkles size={18} color={colors.accentPrimary} strokeWidth={2} />
                <Text variant="headingBold" size="sm" color="accent">
                  +{xpEarned} XP
                </Text>
              </View>
            )}
            {leveledUp && (
              <View style={[styles.achievementBadge, styles.levelBadge]}>
                <TrendingUp size={18} color={colors.accentTertiary} strokeWidth={2} />
                <Text variant="headingBold" size="sm" style={{ color: colors.accentTertiary }}>
                  Level {newLevel}!
                </Text>
              </View>
            )}
            {dailyGoalMet && (
              <View style={[styles.achievementBadge, styles.goalBadge]}>
                <Target size={18} color={colors.accentSecondary} strokeWidth={2} />
                <Text variant="headingBold" size="sm" style={{ color: colors.accentSecondary }}>
                  Goal Met!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Stats Card */}
        {totalCards > 0 && (
          <Card style={styles.statsCard}>
            <Text variant="headingBold" size="sm" color="primary" style={styles.statsTitle}>
              Rating Breakdown
            </Text>

            <View style={styles.statsRow}>
              <StatBox value={stats.again} label="Again" color="danger" />
              <StatBox value={stats.hard} label="Hard" color="warning" />
              <StatBox value={stats.good} label="Good" color="success" />
              <StatBox value={stats.easy} label="Easy" color="info" />
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="mono" size="xs" color="muted">
                  Retention
                </Text>
                <Text
                  variant="headingBold"
                  size="base"
                  style={{
                    color: retention >= 80 ? colors.success : retention >= 60 ? colors.warning : colors.danger,
                  }}
                >
                  {retention}%
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="mono" size="xs" color="muted">
                  Duration
                </Text>
                <Text variant="headingBold" size="base" color="primary">
                  {formatDuration(durationSeconds)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="primary" onPress={handleStudyAgain} style={styles.primaryAction}>
            Study Again
          </Button>

          <Button variant="secondary" onPress={handleStudyAhead} style={styles.primaryAction}>
            Study Ahead
          </Button>

          <View style={styles.secondaryActions}>
            <Button variant="secondary" onPress={handleGoToDashboard} style={styles.secondaryAction}>
              Dashboard
            </Button>
            <Button variant="secondary" onPress={handleAddCards} style={styles.secondaryAction}>
              Add Cards
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  content: {
    flexGrow: 1,
    padding: screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSecondaryAlpha,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    marginBottom: spacing[4],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 2,
  },
  xpBadge: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimaryAlpha,
  },
  levelBadge: {
    borderColor: colors.accentTertiary,
    backgroundColor: colors.accentTertiaryAlpha,
  },
  goalBadge: {
    borderColor: colors.accentSecondary,
    backgroundColor: colors.accentSecondaryAlpha,
  },
  statsCard: {
    width: '100%',
    marginBottom: spacing[6],
  },
  statsTitle: {
    marginBottom: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[1],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: spacing[1],
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
  primaryAction: {
    width: '100%',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  secondaryAction: {
    flex: 1,
  },
});
