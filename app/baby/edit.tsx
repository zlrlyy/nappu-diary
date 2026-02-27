import React, { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { BabyForm } from '@/components/baby'
import { useBabyStore } from '@/stores'
import { CreateBabyInput, UpdateBabyInput } from '@/types'

export default function BabyEditScreen() {
  const theme = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string }>()

  const babies = useBabyStore((state) => state.babies)
  const addBaby = useBabyStore((state) => state.addBaby)
  const updateBaby = useBabyStore((state) => state.updateBaby)

  const [isLoading, setIsLoading] = useState(false)

  const existingBaby = params.id ? babies.find((b) => b.id === params.id) : undefined

  const handleSubmit = async (data: CreateBabyInput | UpdateBabyInput) => {
    setIsLoading(true)
    try {
      if (existingBaby) {
        await updateBaby(existingBaby.id, data)
      } else {
        await addBaby(data as CreateBabyInput)
      }
      router.back()
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: existingBaby ? '编辑宝宝' : '添加宝宝',
        }}
      />
      <BabyForm
        baby={existingBaby}
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
})
