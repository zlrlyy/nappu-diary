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
import { CreateDiaperInput, UpdateDiaperInput, DiaperRecord, DiaperType, PoopConsistency } from '@/types'
import { toISOString } from '@/utils/date'
import { DateTimePickerInput } from '@/components/common/DateTimePicker'

interface DiaperFormProps {
  babyId: string
  record?: DiaperRecord
  onSubmit: (data: CreateDiaperInput | UpdateDiaperInput) => void
  onCancel: () => void
  isLoading?: boolean
}

interface FormData {
  type: DiaperType
  poopConsistency: PoopConsistency | undefined
  time: string
  note: string
}

interface FormErrors {
  time?: string
}

export function DiaperForm({ babyId, record, onSubmit, onCancel, isLoading }: DiaperFormProps) {
  const theme = useTheme()
  const [formData, setFormData] = useState<FormData>({
    type: record?.type || 'both',
    poopConsistency: record?.poopConsistency,
    time: record?.time || toISOString(new Date()),
    note: record?.note || '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const hasPoop = formData.type === 'poop' || formData.type === 'both'

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.time) {
      newErrors.time = '请选择时间'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const submitData: CreateDiaperInput | UpdateDiaperInput = {
      babyId,
      type: formData.type,
      time: formData.time,
      note: formData.note || undefined,
    }

    if (hasPoop && formData.poopConsistency) {
      submitData.poopConsistency = formData.poopConsistency
    }

    onSubmit(submitData)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="titleSmall" style={styles.label}>
        类型
      </Text>
      <SegmentedButtons
        value={formData.type}
        onValueChange={(value) =>
          setFormData({ ...formData, type: value as DiaperType })
        }
        buttons={[
          { value: 'pee', label: '小便' },
          { value: 'poop', label: '大便' },
          { value: 'both', label: '都有' },
        ]}
        style={styles.segmentedButtons}
      />

      {hasPoop && (
        <>
          <Text variant="titleSmall" style={styles.label}>
            大便性状（可选）
          </Text>
          <SegmentedButtons
            value={formData.poopConsistency || ''}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                poopConsistency: value ? (value as PoopConsistency) : undefined,
              })
            }
            buttons={[
              { value: 'normal', label: '正常' },
              { value: 'loose', label: '稀' },
              { value: 'hard', label: '硬' },
            ]}
            style={styles.segmentedButtons}
          />
          <SegmentedButtons
            value={formData.poopConsistency || ''}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                poopConsistency: value ? (value as PoopConsistency) : undefined,
              })
            }
            buttons={[
              { value: 'mucus', label: '粘液' },
              { value: 'bloody', label: '血丝' },
            ]}
            style={styles.segmentedButtons}
          />
        </>
      )}

      <DateTimePickerInput
        label="时间"
        value={formData.time}
        onChange={(isoString) => setFormData({ ...formData, time: isoString })}
        mode="datetime"
        error={!!errors.time}
        style={styles.input}
      />
      {errors.time && <HelperText type="error">{errors.time}</HelperText>}

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
