import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Text, Card, SegmentedButtons, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useBabyStore, useFeedingStore, useDiaperStore } from "@/stores";
import { BabySelector } from "@/components/baby";
import { BarChart } from "@/components/charts/BarChart";
import {
  getWeeklyFeedingData,
  getWeeklyDiaperData,
  getMonthlyFeedingData,
  getMonthlyDiaperData,
  calculateFeedingStats,
  calculateDiaperStats,
} from "@/utils/statistics";

const screenWidth = Dimensions.get("window").width;

type ViewType = "week" | "month";

export default function StatsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const babies = useBabyStore((state) => state.babies);
  const currentBabyId = useBabyStore((state) => state.currentBabyId);
  const setCurrentBaby = useBabyStore((state) => state.setCurrentBaby);

  // Subscribe to records directly to trigger re-renders
  const allFeedingRecords = useFeedingStore((state) => state.records);
  const allDiaperRecords = useDiaperStore((state) => state.records);

  const [viewType, setViewType] = useState<ViewType>("week");

  const currentBaby = babies.find((b) => b.id === currentBabyId);

  // Filter records by baby
  const feedingRecords = currentBabyId
    ? allFeedingRecords.filter((r) => r.babyId === currentBabyId)
    : [];
  const diaperRecords = currentBabyId
    ? allDiaperRecords.filter((r) => r.babyId === currentBabyId)
    : [];

  const feedingStats = useMemo(
    () => calculateFeedingStats(feedingRecords),
    [feedingRecords],
  );
  const diaperStats = useMemo(
    () => calculateDiaperStats(diaperRecords),
    [diaperRecords],
  );

  const weeklyFeedingData = useMemo(
    () => getWeeklyFeedingData(feedingRecords),
    [feedingRecords],
  );
  const weeklyDiaperData = useMemo(
    () => getWeeklyDiaperData(diaperRecords),
    [diaperRecords],
  );

  const monthlyFeedingData = useMemo(
    () => getMonthlyFeedingData(feedingRecords),
    [feedingRecords],
  );
  const monthlyDiaperData = useMemo(
    () => getMonthlyDiaperData(diaperRecords),
    [diaperRecords],
  );

  // Select data based on view type
  const feedingData = viewType === "week" ? weeklyFeedingData : monthlyFeedingData;
  const diaperData = viewType === "week" ? weeklyDiaperData : monthlyDiaperData;

  // Format chart data (both weekly and monthly have 'day' or 'date' property)
  const feedingChartData = feedingData.map((d) => ({
    label: "day" in d ? d.day : d.date,
    value: d.count,
  }));

  const diaperChartData = diaperData.map((d) => ({
    label: "day" in d ? d.day : d.date,
    value: d.count,
  }));

  const handleAddBaby = () => {
    router.push("/baby/edit");
  };

  if (!currentBaby) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text variant="bodyMedium">请先添加宝宝</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BabySelector
        babies={babies}
        currentBabyId={currentBabyId}
        onSelectBaby={setCurrentBaby}
        onAddBaby={handleAddBaby}
      />

      <SegmentedButtons
        value={viewType}
        onValueChange={(value) => setViewType(value as ViewType)}
        buttons={[
          { value: "week", label: "周视图" },
          { value: "month", label: "月视图" },
        ]}
        style={styles.viewButtons}
      />

      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            喂食统计
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                variant="displaySmall"
                style={{ color: theme.colors.primary }}
              >
                {feedingStats.totalFeeds}
              </Text>
              <Text variant="bodySmall">总次数</Text>
            </View>
            <View style={styles.statItem}>
              <Text
                variant="displaySmall"
                style={{ color: theme.colors.primary }}
              >
                {feedingStats.totalAmount}
              </Text>
              <Text variant="bodySmall">总量(ml)</Text>
            </View>
            <View style={styles.statItem}>
              <Text
                variant="displaySmall"
                style={{ color: theme.colors.primary }}
              >
                {Math.round(feedingStats.averageInterval)}
              </Text>
              <Text variant="bodySmall">平均间隔(分)</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.chartTitle}>
            每日喂食次数
          </Text>
          {feedingData.some((d) => d.count > 0) ? (
            <BarChart
              data={feedingChartData}
              width={screenWidth - 64}
              height={220}
              barColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
              axisColor={theme.colors.outlineVariant}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.outline }}
              >
                暂无数据
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            排便统计
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                variant="displaySmall"
                style={{ color: theme.colors.secondary }}
              >
                {diaperStats.totalChanges}
              </Text>
              <Text variant="bodySmall">总次数</Text>
            </View>
            <View style={styles.statItem}>
              <Text
                variant="displaySmall"
                style={{ color: theme.colors.secondary }}
              >
                {diaperStats.peeCount}
              </Text>
              <Text variant="bodySmall">小便</Text>
            </View>
            <View style={styles.statItem}>
              <Text
                variant="displaySmall"
                style={{ color: theme.colors.secondary }}
              >
                {diaperStats.poopCount}
              </Text>
              <Text variant="bodySmall">大便</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.chartTitle}>
            每日排便次数
          </Text>
          {diaperData.some((d) => d.count > 0) ? (
            <BarChart
              data={diaperChartData}
              width={screenWidth - 64}
              height={220}
              barColor={theme.colors.secondary}
              textColor={theme.colors.onSurface}
              axisColor={theme.colors.outlineVariant}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.outline }}
              >
                暂无数据
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  viewButtons: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  chartCard: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  chartTitle: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  emptyChart: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});
