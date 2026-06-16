import { View, StyleSheet } from 'react-native';
import { BarChart3 } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { Text, MetaText, Card } from '@/components/ui';
import type { ActivityDay } from '@/hooks';

interface ActivityChartWidgetProps {
  data: ActivityDay[];
}

function getBarHeight(count: number, maxCount: number): number {
  if (maxCount === 0) return 8;
  return Math.max(8, Math.round((count / maxCount) * 80));
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function getIntensityColor(count: number, maxCount: number): string {
  if (count === 0) return colors.surfaceRaised;
  const ratio = count / maxCount;
  if (ratio < 0.25) return `${colors.success}40`;
  if (ratio < 0.5) return `${colors.success}70`;
  if (ratio < 0.75) return `${colors.success}A0`;
  return colors.success;
}

export function ActivityChartWidget({ data }: ActivityChartWidgetProps) {
  const last7Days: ActivityDay[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const existing = data.find((d) => d.date === dateStr);
    last7Days.push({
      date: dateStr,
      count: existing?.count || 0,
    });
  }

  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);
  const totalCards = last7Days.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BarChart3 size={18} color={colors.success} strokeWidth={2} />
          <Text variant="headingBold" size="base">Weekly Activity</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text variant="mono" size="xs" style={{ color: colors.success }}>
            {totalCards} cards
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {last7Days.map((day, index) => {
          const isToday = index === 6;
          return (
            <View key={day.date} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: getBarHeight(day.count, maxCount),
                      backgroundColor: getIntensityColor(day.count, maxCount),
                      borderColor: isToday ? colors.accentPrimary : colors.border,
                    },
                  ]}
                />
              </View>
              <MetaText
                size="xs"
                style={[styles.dayLabel, isToday && styles.todayLabel]}
              >
                {getDayLabel(day.date)}
              </MetaText>
              <MetaText size="xs" style={styles.countLabel}>
                {day.count}
              </MetaText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  totalBadge: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: spacing[2],
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: spacing[1],
  },
  bar: {
    width: '100%',
    minHeight: 8,
    borderWidth: 2,
  },
  dayLabel: {
    marginTop: spacing[2],
  },
  todayLabel: {
    color: colors.accentPrimary,
  },
  countLabel: {
    marginTop: spacing[1],
  },
});
