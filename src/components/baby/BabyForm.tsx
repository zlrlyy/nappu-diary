import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  useTheme,
  HelperText,
} from 'react-native-paper'
import { CreateBabyInput, UpdateBabyInput, Baby } from '@/types'

interface BabyFormProps {
  baby?: Baby
  onSubmit: (data: CreateBabyInput | UpdateBabyInput) => void
  onCancel: () => void
  isLoading?: boolean
}

interface FormData {
  name: string
  birthDate: string
  gender: 'male' | 'female' | undefined
}

interface FormErrors {
  name?: string
  birthDate?: string
}

export function BabyForm({ baby, onSubmit, onCancel, isLoading }: BabyFormProps) {
  const theme = useTheme()
  const [formData, setFormData] = useState<FormData>({
    name: baby?.name || '',
    birthDate: baby?.birthDate?.split('T')[0] || '',
    gender: baby?.gender,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入宝宝名字'
    }

    if (!formData.birthDate) {
      newErrors.birthDate = '请选择出生日期'
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(formData.birthDate)) {
        newErrors.birthDate = '日期格式应为 YYYY-MM-DD'
      } else {
        const date = new Date(formData.birthDate)
        if (isNaN(date.getTime()) || date > new Date()) {
          newErrors.birthDate = '请输入有效的出生日期'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const submitData: CreateBabyInput | UpdateBabyInput = {
      name: formData.name.trim(),
      birthDate: new Date(formData.birthDate).toISOString(),
      gender: formData.gender,
    }

    onSubmit(submitData)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TextInput
        label="宝宝名字"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={!!errors.name}
        mode="outlined"
        style={styles.input}
      />
      {errors.name && <HelperText type="error">{errors.name}</HelperText>}

      <TextInput
        label="出生日期 (YYYY-MM-DD)"
        value={formData.birthDate}
        onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
        error={!!errors.birthDate}
        mode="outlined"
        placeholder="例如: 2024-01-15"
        style={styles.input}
      />
      {errors.birthDate && <HelperText type="error">{errors.birthDate}</HelperText>}

      <Text variant="titleSmall" style={styles.label}>
        性别（可选）
      </Text>
      <RadioButton.Group
        onValueChange={(value) =>
          setFormData({
            ...formData,
            gender: value === '' ? undefined : (value as 'male' | 'female'),
          })
        }
        value={formData.gender || ''}
      >
        <View style={styles.radioGroup}>
          <RadioButton.Item label="未选择" value="" />
          <RadioButton.Item label="男宝宝" value="male" />
          <RadioButton.Item label="女宝宝" value="female" />
        </View>
      </RadioButton.Group>

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
          {baby ? '保存' : '添加'}
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
  input: {
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
