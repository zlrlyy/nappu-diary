import 'react-native-get-random-values'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider, MD3LightTheme, MD3DarkTheme, useTheme } from 'react-native-paper'
import { useColorScheme } from 'react-native'
import { useBabyStore, useFeedingStore, useDiaperStore } from '@/stores'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const loadBabies = useBabyStore((state) => state.loadBabies)
  const loadFeedingRecords = useFeedingStore((state) => state.loadRecords)
  const loadDiaperRecords = useDiaperStore((state) => state.loadRecords)

  useEffect(() => {
    loadBabies()
    loadFeedingRecords()
    loadDiaperRecords()
  }, [loadBabies, loadFeedingRecords, loadDiaperRecords])

  const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="record/feeding"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: '喂食记录',
          }}
        />
        <Stack.Screen
          name="record/diaper"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: '排便记录',
          }}
        />
        <Stack.Screen
          name="baby/list"
          options={{
            headerShown: true,
            title: '宝宝管理',
          }}
        />
        <Stack.Screen
          name="baby/edit"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: '添加宝宝',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: '设置',
          }}
        />
      </Stack>
    </PaperProvider>
  )
}
