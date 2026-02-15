import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  useTheme,
  HelperText,
} from 'react-native-paper'
import { CreateFeedingInput, UpdateFeedingInput, FeedingRecord, FeedingType, BreastSide } from '@/types'
import { formatTime, toISOString } from '@/utils/date'

interface FeedingFormProps {
  babyId: string
  record?: FeedingRecord
  onSubmit: (data: CreateFeedingInput | UpdateFeedingInput) => void
  onCancel: () => void
  isLoading?: boolean
}

interface FormData {
  type: FeedingType
  amount: string
  duration: string
  breastSide: BreastSide | undefined
  startTime: string
  endTime: string
  note: string
}

interface FormErrors {
  amount?: string
  duration?: string
  startTime?: string
}

export function FeedingForm({ babyId, record, onSubmit, onCancel, isLoading }: FeedingFormProps) {
  const theme = useTheme()
  const [formData, setFormData] = useState<FormData>({
    type: record?.type || 'breast_direct',
    amount: record?.amount?.toString() || '',
    duration: record?.duration?.toString() || '',
    breastSide: record?.breastSide,
    startTime: record?.startTime || toISOString(new Date()),
    endTime: record?.endTime || '',
    note: record?.note || '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const isBreastDirect = formData.type === 'breast_direct'

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!isBreastDirect) {
      const amount = parseFloat(formData.amount)
      if (!formData.amount || isNaN(amount) || amount <= 0) {
        newErrors.amount = '请输入有效的食量'
      }
    }

    if (isBreastDirect) {
      const duration = parseInt(formData.duration, 10)
      if (!formData.duration || isNaN(duration) || duration <= 0) {
        newErrors.duration = '请输入有效的时长'
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = '请选择开始时间'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const submitData: CreateFeedingInput | UpdateFeedingInput = {
      babyId,
      type: formData.type,
      startTime: formData.startTime,
      endTime: formData.endTime || undefined,
      note: formData.note || undefined,
    }

    if (!isBreastDirect && formData.amount) {
      submitData.amount = parseFloat(formData.amount)
    }

    if (isBreastDirect) {
      if (formData.duration) {
        submitData.duration = parseInt(formData.duration, 10)
      }
      if (formData.breastSide) {
        submitData.breastSide = formData.breastSide
      }
    }

    onSubmit(submitData)
  }

  const getStartTimeDisplay = () => {
    try {
      return formatTime(formData.startTime)
    } catch {
      return '选择时间'
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="titleSmall" style={styles.label}>
        喂食类型
      </Text>
      <SegmentedButtons
        value={formData.type}
        onValueChange={(value) =>
          setFormData({ ...formData, type: value as FeedingType })
        }
        buttons={[
          { value: 'breast_direct', label: '母乳亲喂' },
          { value: 'breast_bottle', label: '母乳瓶喂' },
          { value: 'formula', label: '配方奶' },
        ]}
        style={styles.segmentedButtons}
      />

      {isBreastDirect ? (
        <>
          <Text variant="titleSmall" style={styles.label}>
            喂奶侧
          </Text>
          <SegmentedButtons
            value={formData.breastSide || ''}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                breastSide: value ? (value as BreastSide) : undefined,
              })
            }
            buttons={[
              { value: 'left', label: '左侧' },
              { value: 'right', label: '右侧' },
              { value: 'both', label: '两侧' },
            ]}
            style={styles.segmentedButtons}
          />

          <TextInput
            label="时长（分钟）"
            value={formData.duration}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
            error={!!errors.duration}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          {errors.duration && <HelperText type="error">{errors.duration}</HelperText>}
        </>
      ) : (
        <>
          <TextInput
            label="食量（ml）"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            error={!!errors.amount}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}
        </>
      )}

      <TextInput
        label="开始时间"
        value={getStartTimeDisplay()}
        mode="outlined"
        style={styles.input}
        editable={false}
        right={<TextInput.Icon icon="clock" />}
      />

      <TextInput
        label="备注（可选）"
        value={formData.note}
        onChangeText={(text) => setFormData({ ...formData, note: text })}
        mode="outlined"
        multiline
        numberOfLines={2}
        style={styles.input}
      />

      <View style={styles.buttonGroup}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={styles.button}
          disabled={isLoading}
        >
          取消
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        >
          {record ? '保存' : '添加'}
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
})
