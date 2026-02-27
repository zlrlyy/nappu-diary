import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import {
  Text,
  Card,
  Switch,
  Button,
  TextInput,
  useTheme,
  Divider,
  List,
} from "react-native-paper";
import {
  requestNotificationPermissions,
  scheduleFeedingReminder,
  cancelFeedingReminder,
  ReminderSettings,
} from "@/services/notification";
import { exportAndShare } from "@/services/export";
import { useBabyStore, useFeedingStore, useDiaperStore } from "@/stores";

const DEFAULT_SETTINGS: ReminderSettings = {
  feedingIntervalEnabled: false,
  feedingIntervalMinutes: 120,
};

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const babies = useBabyStore((state) => state.babies);
  const feedingRecords = useFeedingStore((state) => state.records);
  const diaperRecords = useDiaperStore((state) => state.records);

  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load settings from storage
    // For now, using default settings
  }, []);

  const handleToggleFeedingReminder = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert("权限不足", "请在系统设置中允许应用发送通知", [
          { text: "确定" },
        ]);
        return;
      }
    } else {
      await cancelFeedingReminder();
    }

    setSettings((prev) => ({
      ...prev,
      feedingIntervalEnabled: enabled,
    }));
  };

  const handleIntervalChange = (text: string) => {
    const minutes = parseInt(text, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setSettings((prev) => ({
        ...prev,
        feedingIntervalMinutes: minutes,
      }));
    }
  };

  const handleExportJson = async () => {
    setIsLoading(true);
    try {
      await exportAndShare(babies, feedingRecords, diaperRecords, "json");
    } catch (error) {
      Alert.alert("导出失败", "导出数据时发生错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setIsLoading(true);
    try {
      await exportAndShare(babies, feedingRecords, diaperRecords, "csv");
    } catch (error) {
      Alert.alert("导出失败", "导出数据时发生错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "设置" }} />

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            喂食提醒
          </Text>

          <View style={styles.settingRow}>
            <Text variant="bodyMedium">启用喂食间隔提醒</Text>
            <Switch
              value={settings.feedingIntervalEnabled}
              onValueChange={handleToggleFeedingReminder}
            />
          </View>

          {settings.feedingIntervalEnabled && (
            <View style={styles.intervalSetting}>
              <Text variant="bodyMedium" style={styles.intervalLabel}>
                提醒间隔（分钟）
              </Text>
              <TextInput
                value={settings.feedingIntervalMinutes.toString()}
                onChangeText={handleIntervalChange}
                keyboardType="numeric"
                mode="outlined"
                style={styles.intervalInput}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            数据导出
          </Text>

          <Text variant="bodySmall" style={styles.exportDescription}>
            导出所有宝宝信息和记录数据
          </Text>

          <View style={styles.exportButtons}>
            <Button
              mode="outlined"
              onPress={handleExportJson}
              style={styles.exportButton}
              loading={isLoading}
              disabled={isLoading}
            >
              导出 JSON
            </Button>
            <Button
              mode="outlined"
              onPress={handleExportCsv}
              style={styles.exportButton}
              loading={isLoading}
              disabled={isLoading}
            >
              导出 CSV
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            宝宝管理
          </Text>

          <List.Item
            title="管理宝宝信息"
            description="编辑或删除宝宝信息"
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/baby/list")}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            关于
          </Text>

          <List.Item
            title="Nappu Diary"
            description="版本 1.0.3"
            left={(props) => <List.Icon {...props} icon="baby-face" />}
          />

          <Text variant="bodySmall" style={styles.aboutText}>
            一款简单的婴幼儿日常记录应用，帮助您追踪宝宝的喂食和排便情况。
          </Text>
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
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  intervalSetting: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  intervalLabel: {
    marginRight: 12,
  },
  intervalInput: {
    flex: 1,
    maxWidth: 100,
  },
  exportDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  exportButtons: {
    flexDirection: "row",
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
  aboutText: {
    opacity: 0.7,
    marginTop: 8,
  },
  listItem: {
    paddingHorizontal: 0,
  },
});
