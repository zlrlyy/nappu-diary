import React, { useState, useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Text,
  Card,
  SegmentedButtons,
  useTheme,
  Divider,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useBabyStore, useFeedingStore, useDiaperStore } from "@/stores";
import { BabySelector } from "@/components/baby";
import { FeedingCard, DiaperCard } from "@/components";
import { formatDate, toISODateString } from "@/utils/date";
import { parseISO } from "date-fns";

type FilterType = "all" | "feeding" | "diaper";

interface GroupedRecords {
  date: string;
  records: Array<{
    id: string;
    recordType: "feeding" | "diaper";
    data: any;
  }>;
}

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();

  const babies = useBabyStore((state) => state.babies);
  const currentBabyId = useBabyStore((state) => state.currentBabyId);
  const setCurrentBaby = useBabyStore((state) => state.setCurrentBaby);

  // Subscribe to records directly
  const feedingRecords = useFeedingStore((state) => state.records);
  const diaperRecords = useDiaperStore((state) => state.records);

  const [filter, setFilter] = useState<FilterType>("all");

  const currentBaby = babies.find((b) => b.id === currentBabyId);

  const groupedRecords = useMemo((): GroupedRecords[] => {
    if (!currentBabyId) return [];

    const babyFeedingRecords = feedingRecords.filter(
      (r) => r.babyId === currentBabyId,
    );
    const babyDiaperRecords = diaperRecords.filter(
      (r) => r.babyId === currentBabyId,
    );

    const feedingRecordsWithType = babyFeedingRecords.map((r) => ({
      id: r.id,
      recordType: "feeding" as const,
      time: r.startTime,
      data: r,
    }));

    const diaperRecordsWithType = babyDiaperRecords.map((r) => ({
      id: r.id,
      recordType: "diaper" as const,
      time: r.time,
      data: r,
    }));

    let allRecords = [...feedingRecordsWithType, ...diaperRecordsWithType];

    if (filter === "feeding") {
      allRecords = feedingRecordsWithType;
    } else if (filter === "diaper") {
      allRecords = diaperRecordsWithType;
    }

    allRecords.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );

    const groups: Map<string, GroupedRecords> = new Map();

    allRecords.forEach((record) => {
      const dateKey = toISODateString(parseISO(record.time));
      const existing = groups.get(dateKey);

      if (existing) {
        existing.records.push(record);
      } else {
        groups.set(dateKey, {
          date: dateKey,
          records: [record],
        });
      }
    });

    return Array.from(groups.values());
  }, [currentBabyId, filter, feedingRecords, diaperRecords]);

  const handleAddBaby = () => {
    router.push("/baby/edit");
  };

  const renderRecord = (record: {
    id: string;
    recordType: "feeding" | "diaper";
    data: any;
  }) => {
    if (record.recordType === "feeding") {
      return (
        <FeedingCard
          record={record.data}
          onPress={() => router.push(`/record/feeding?id=${record.id}`)}
        />
      );
    }
    return (
      <DiaperCard
        record={record.data}
        onPress={() => router.push(`/record/diaper?id=${record.id}`)}
      />
    );
  };

  const renderGroup = ({ item }: { item: GroupedRecords }) => (
    <View style={styles.groupContainer}>
      <Text variant="titleMedium" style={styles.dateHeader}>
        {formatDate(item.date, "yyyy年M月d日")}
      </Text>
      {item.records.map((record) => (
        <View key={record.id}>{renderRecord(record)}</View>
      ))}
    </View>
  );

  if (!currentBaby) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text variant="bodyMedium">请先添加宝宝</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BabySelector
          babies={babies}
          currentBabyId={currentBabyId}
          onSelectBaby={setCurrentBaby}
          onAddBaby={handleAddBaby}
        />

        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as FilterType)}
          buttons={[
            { value: "all", label: "全部" },
            { value: "feeding", label: "喂食" },
            { value: "diaper", label: "排便" },
          ]}
        />
      </View>

      <FlatList
        data={groupedRecords}
        renderItem={renderGroup}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium">暂无记录</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  groupContainer: {
    marginBottom: 16,
  },
  dateHeader: {
    marginBottom: 8,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
});
