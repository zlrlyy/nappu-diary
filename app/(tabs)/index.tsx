import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Text,
  Card,
  Button,
  useTheme,
  FAB,
  Divider,
  IconButton,
  Portal,
  Dialog,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useBabyStore, useFeedingStore, useDiaperStore } from "@/stores";
import { BabySelector } from "@/components/baby";
import { FeedingCard, DiaperCard } from "@/components";
import { getTimeAgo, getMinutesAgo } from "@/utils/date";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const babies = useBabyStore((state) => state.babies);
  const currentBabyId = useBabyStore((state) => state.currentBabyId);
  const setCurrentBaby = useBabyStore((state) => state.setCurrentBaby);

  // Subscribe to records array directly to trigger re-renders
  const feedingRecords = useFeedingStore((state) => state.records);
  const diaperRecords = useDiaperStore((state) => state.records);
  const deleteFeedingRecord = useFeedingStore((state) => state.deleteRecord);
  const deleteDiaperRecord = useDiaperStore((state) => state.deleteRecord);

  const [refreshing, setRefreshing] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    visible: boolean;
    recordId: string;
    recordType: "feeding" | "diaper";
  }>({
    visible: false,
    recordId: "",
    recordType: "feeding",
  });

  const currentBaby = babies.find((b) => b.id === currentBabyId);

  // Filter today's records
  const today = new Date().toDateString();
  const todayFeedings = feedingRecords
    .filter(
      (r) =>
        r.babyId === currentBabyId &&
        new Date(r.startTime).toDateString() === today,
    )
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );

  const todayDiapers = diaperRecords
    .filter(
      (r) =>
        r.babyId === currentBabyId && new Date(r.time).toDateString() === today,
    )
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const lastFeeding = feedingRecords
    .filter((r) => r.babyId === currentBabyId)
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )[0];

  const lastDiaper = diaperRecords
    .filter((r) => r.babyId === currentBabyId)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())[0];

  const recentRecords = React.useMemo(() => {
    if (!currentBabyId) return [];

    const feedingRecordsWithtype = todayFeedings.map((r) => ({
      ...r,
      recordType: "feeding" as const,
    }));
    const diaperRecordsWithType = todayDiapers.map((r) => ({
      ...r,
      recordType: "diaper" as const,
    }));

    return [...feedingRecordsWithtype, ...diaperRecordsWithType]
      .sort((a, b) => {
        const timeA = a.recordType === "feeding" ? a.startTime : a.time;
        const timeB = b.recordType === "feeding" ? b.startTime : b.time;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      })
      .slice(0, 3);
  }, [currentBabyId, todayFeedings, todayDiapers]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleAddFeeding = () => {
    router.push("/record/feeding");
  };

  const handleAddDiaper = () => {
    router.push("/record/diaper");
  };

  const handleAddBaby = () => {
    router.push("/baby/edit");
  };

  const handleDeleteRequest = (
    recordId: string,
    recordType: "feeding" | "diaper"
  ) => {
    setDeleteDialog({
      visible: true,
      recordId,
      recordType,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.recordType === "feeding") {
      deleteFeedingRecord(deleteDialog.recordId);
    } else {
      deleteDiaperRecord(deleteDialog.recordId);
    }
    setDeleteDialog({ visible: false, recordId: "", recordType: "feeding" });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ visible: false, recordId: "", recordType: "feeding" });
  };

  if (!currentBaby) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text variant="headlineSmall" style={styles.emptyText}>
          欢迎使用 Nappu Diary
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          添加宝宝开始记录
        </Text>
        <Button
          mode="contained"
          onPress={handleAddBaby}
          style={styles.addButton}
        >
          添加宝宝
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <BabySelector
          babies={babies}
          currentBabyId={currentBabyId}
          onSelectBaby={setCurrentBaby}
          onAddBaby={handleAddBaby}
        />

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              今日摘要 - {currentBaby.name}
            </Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text
                  variant="displaySmall"
                  style={{ color: theme.colors.primary }}
                >
                  {todayFeedings.length}
                </Text>
                <Text variant="bodyMedium">次喂食</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text
                  variant="displaySmall"
                  style={{ color: theme.colors.secondary }}
                >
                  {todayDiapers.length}
                </Text>
                <Text variant="bodyMedium">次排便</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.quickActions}>
          <Button
            mode="contained"
            onPress={handleAddFeeding}
            style={styles.actionButton}
            icon="baby-face-outline"
          >
            添加喂食
          </Button>
          <Button
            mode="contained"
            onPress={handleAddDiaper}
            style={styles.actionButton}
            icon="water-outline"
          >
            添加排便
          </Button>
        </View>

        {(lastFeeding || lastDiaper) && (
          <Card style={styles.lastRecordCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                上次记录
              </Text>
              {lastFeeding && (
                <View style={styles.lastRecordItem}>
                  <IconButton icon="food-apple" size={20} />
                  <Text variant="bodyMedium">
                    喂食 · {getTimeAgo(lastFeeding.startTime)}
                  </Text>
                </View>
              )}
              {lastDiaper && (
                <View style={styles.lastRecordItem}>
                  <IconButton icon="water" size={20} />
                  <Text variant="bodyMedium">
                    排便 · {getTimeAgo(lastDiaper.time)}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {recentRecords.length > 0 && (
          <View style={styles.recentSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              最近记录
            </Text>
            {recentRecords.map((record) => (
              <View key={record.id}>
                {record.recordType === "feeding" ? (
                  <FeedingCard
                    record={record as any}
                    compact
                    onDelete={() => handleDeleteRequest(record.id, "feeding")}
                  />
                ) : (
                  <DiaperCard
                    record={record as any}
                    compact
                    onDelete={() => handleDeleteRequest(record.id, "diaper")}
                  />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialog.visible} onDismiss={handleDeleteCancel}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">确定要删除这条记录吗？此操作无法撤销。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDeleteCancel}>取消</Button>
            <Button onPress={handleDeleteConfirm} textColor={theme.colors.error}>
              删除
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddFeeding}
        color={theme.colors.onPrimary}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  addButton: {
    paddingHorizontal: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  lastRecordCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  lastRecordItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -8,
  },
  recentSection: {
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
