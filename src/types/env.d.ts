import { ExpoConfig } from 'expo/config'

interface Env {
  EXPO_PUBLIC_STORAGE_KEY?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

declare module 'expo-router'
