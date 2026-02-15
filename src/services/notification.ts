import { Platform } from 'react-native'
import Constants from 'expo-constants'

// Check if running in Expo Go (notifications not supported in SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo'

// Lazy load expo-notifications to avoid crash in Expo Go
let Notifications: typeof import('expo-notifications') | null = null

async function loadNotifications(): Promise<typeof import('expo-notifications') | null> {
  if (isExpoGo) {
    console.log('expo-notifications: Not available in Expo Go. Use a development build.')
    return null
  }

  if (Notifications) {
    return Notifications
  }

  try {
    Notifications = await import('expo-notifications')
    // Configure notification behavior after loading
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })
    return Notifications
  } catch (error) {
    console.log('Failed to load expo-notifications:', error)
    return null
  }
}

export interface ReminderSettings {
  feedingIntervalEnabled: boolean
  feedingIntervalMinutes: number
}

const FEEDING_REMINDER_ID = 'feeding-reminder'

// Check if notifications are available (not in Expo Go)
let notificationsAvailable = false

export async function initNotifications(): Promise<boolean> {
  const notifications = await loadNotifications()
  if (!notifications) {
    return false
  }

  try {
    const { status: existingStatus } = await notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      notificationsAvailable = false
      return false
    }

    if (Platform.OS === 'android') {
      await notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: notifications.AndroidImportance.HIGH,
      })
    }

    notificationsAvailable = true
    return true
  } catch (error) {
    console.log('Notifications not available:', error)
    notificationsAvailable = false
    return false
  }
}

export function isNotificationsAvailable(): boolean {
  return notificationsAvailable
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!notificationsAvailable) {
    console.log('Notifications not available in Expo Go')
    return false
  }
  return initNotifications()
}

export async function scheduleFeedingReminder(
  minutes: number,
  lastFeedTime: Date
): Promise<string | null> {
  const notifications = await loadNotifications()
  if (!notifications) {
    console.log('Notifications not available, skipping reminder scheduling')
    return null
  }

  try {
    // Cancel existing reminder
    await cancelFeedingReminder()

    // Calculate when to trigger
    const triggerDate = new Date(lastFeedTime.getTime() + minutes * 60 * 1000)

    // Don't schedule if the time has already passed
    if (triggerDate <= new Date()) {
      return null
    }

    const identifier = await notifications.scheduleNotificationAsync({
      content: {
        title: '喂食提醒',
        body: `距离上次喂食已经过去 ${minutes} 分钟了，该给宝宝喂食了`,
        sound: true,
        priority: notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    })

    return identifier
  } catch (error) {
    console.error('Failed to schedule feeding reminder:', error)
    return null
  }
}

export async function cancelFeedingReminder(): Promise<void> {
  const notifications = await loadNotifications()
  if (!notifications) return

  try {
    await notifications.cancelAllScheduledNotificationsAsync()
  } catch (error) {
    console.error('Failed to cancel feeding reminder:', error)
  }
}

export async function getScheduledNotifications(): Promise<import('expo-notifications').NotificationRequest[]> {
  const notifications = await loadNotifications()
  if (!notifications) return []
  return await notifications.getAllScheduledNotificationsAsync()
}

export async function sendTestNotification(): Promise<void> {
  const notifications = await loadNotifications()
  if (!notifications) {
    console.log('Notifications not available')
    return
  }

  await notifications.scheduleNotificationAsync({
    content: {
      title: '测试通知',
      body: '这是一条测试通知',
      sound: true,
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  })
}
