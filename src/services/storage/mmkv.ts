import AsyncStorage from '@react-native-async-storage/async-storage'

// Storage keys
export const STORAGE_KEYS = {
  BABIES: 'babies',
  FEEDING_RECORDS: 'feeding_records',
  DIAPER_RECORDS: 'diaper_records',
  CURRENT_BABY_ID: 'current_baby_id',
  SETTINGS: 'settings',
} as const

// Helper functions for type-safe storage access
export async function getStoredData<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key)
    if (data) {
      return JSON.parse(data) as T
    }
    return null
  } catch (error) {
    return null
  }
}

export async function setStoredData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    throw new Error(`Failed to save ${key}`)
  }
}

export async function removeStoredData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key)
  } catch (error) {
    throw new Error(`Failed to remove ${key}`)
  }
}
