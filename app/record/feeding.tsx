import React, { useEffect, useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useTheme, Text } from 'react-native-paper'
import { FeedingForm } from '@/components/feeding'
import { useBabyStore, useFeedingStore } from '@/stores'
import { CreateFeedingInput, UpdateFeedingInput } from '@/types'

export default function FeedingRecordScreen() {
  const theme = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string }>()

  const currentBabyId = useBabyStore((state) => state.currentBabyId)
  const records = useFeedingStore((state) => state.records)
  const addRecord = useFeedingStore((state) => state.addRecord)
  const updateRecord = useFeedingStore((state) => state.updateRecord)

  const [isLoading, setIsLoading] = useState(false)

  const existingRecord = params.id ? records.find((r) => r.id === params.id) : undefined

  const handleSubmit = async (data: CreateFeedingInput | UpdateFeedingInput) => {
    setIsLoading(true)
    try {
      if (existingRecord) {
        updateRecord(existingRecord.id, data as UpdateFeedingInput)
      } else {
        if (!currentBabyId) {
          throw new Error('请先选择宝宝')
        }
        addRecord({ ...data, babyId: currentBabyId } as CreateFeedingInput)
      }
      router.back()
    } catch (error) {
      console.error('Failed to save feeding record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (!currentBabyId && !existingRecord) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '添加喂食记录' }} />
        <View style={styles.emptyContainer}>
          <Text variant="bodyMedium">请先选择宝宝</Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: existingRecord ? '编辑喂食记录' : '添加喂食记录',
        }}
      />
      <FeedingForm
        babyId={existingRecord?.babyId || currentBabyId!}
        record={existingRecord}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
