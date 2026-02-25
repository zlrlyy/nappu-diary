import React, { useState } from 'react'
import { Platform, Modal, View, StyleSheet } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { formatTime, formatDateTime } from '@/utils/date'

interface DateTimePickerInputProps {
  label: string
  value: string // ISO 8601 string
  onChange: (isoString: string) => void
  mode?: 'date' | 'time' | 'datetime'
  error?: boolean
  style?: any
}

export function DateTimePickerInput({
  label,
  value,
  onChange,
  mode = 'datetime',
  error = false,
  style,
}: DateTimePickerInputProps) {
  const [show, setShow] = useState(false)
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>('date')
  const [tempDate, setTempDate] = useState<Date | null>(null)

  const date = value ? new Date(value) : new Date()

  // Web platform: handle HTML5 input change
  const handleWebChange = (event: any) => {
    const inputValue = event.target.value
    if (!inputValue) return

    try {
      let newDate: Date

      if (mode === 'date') {
        // HTML date input returns YYYY-MM-DD
        // Create date at local midnight to avoid timezone issues
        const [year, month, day] = inputValue.split('-').map(Number)
        newDate = new Date(year, month - 1, day, 0, 0, 0, 0)
      } else if (mode === 'time') {
        // HTML time input returns HH:MM
        const [hours, minutes] = inputValue.split(':')
        newDate = new Date(date)
        newDate.setHours(parseInt(hours, 10))
        newDate.setMinutes(parseInt(minutes, 10))
        newDate.setSeconds(0)
        newDate.setMilliseconds(0)
      } else {
        // datetime-local returns YYYY-MM-DDTHH:MM
        // Parse without timezone to use local time
        const dateTimeMatch = inputValue.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
        if (dateTimeMatch) {
          const [, year, month, day, hours, minutes] = dateTimeMatch.map(Number)
          newDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
        } else {
          newDate = new Date(inputValue)
        }
      }

      onChange(newDate.toISOString())
    } catch (error) {
      console.error('Invalid date input:', error)
    }
  }

  // Native platform: handle DateTimePicker change
  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false)
    }

    if (event.type === 'dismissed') {
      setShow(false)
      setTempDate(null)
      return
    }

    if (selectedDate) {
      if (Platform.OS === 'android') {
        if (mode === 'datetime' && currentMode === 'date') {
          // On Android, after date selection, show time picker
          setTempDate(selectedDate)
          setCurrentMode('time')
          setShow(true)
        } else {
          // Combine date and time if datetime mode
          if (mode === 'datetime' && currentMode === 'time' && tempDate) {
            const combined = new Date(tempDate)
            combined.setHours(selectedDate.getHours())
            combined.setMinutes(selectedDate.getMinutes())
            onChange(combined.toISOString())
            setTempDate(null)
          } else {
            onChange(selectedDate.toISOString())
          }
        }
      } else {
        // iOS
        setTempDate(selectedDate)
      }
    }
  }

  const showPicker = () => {
    if (Platform.OS === 'web') return // Web uses native input
    if (mode === 'datetime' && Platform.OS === 'android') {
      setCurrentMode('date')
    }
    setTempDate(date)
    setShow(true)
  }

  const handleIOSConfirm = () => {
    if (tempDate) {
      onChange(tempDate.toISOString())
    }
    setShow(false)
    setTempDate(null)
  }

  const handleIOSCancel = () => {
    setShow(false)
    setTempDate(null)
  }

  const getDisplayValue = () => {
    if (!value) return ''

    try {
      if (mode === 'time') {
        return formatTime(value)
      } else if (mode === 'datetime') {
        return formatDateTime(value)
      } else {
        return new Date(value).toLocaleDateString('zh-CN')
      }
    } catch {
      return ''
    }
  }

  const getWebInputType = () => {
    if (mode === 'time') return 'time'
    if (mode === 'datetime') return 'datetime-local'
    return 'date'
  }

  const getWebInputValue = () => {
    if (!value) return ''

    try {
      const d = new Date(value)
      if (mode === 'date') {
        // Format: YYYY-MM-DD
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      } else if (mode === 'time') {
        // Format: HH:MM
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      } else {
        // Format: YYYY-MM-DDTHH:MM
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }
    } catch {
      return ''
    }
  }

  const getPickerMode = (): 'date' | 'time' => {
    if (mode === 'datetime') {
      return currentMode
    }
    return mode === 'date' ? 'date' : 'time'
  }

  const getIconName = () => {
    if (mode === 'time') return 'clock-outline'
    if (mode === 'date') return 'calendar'
    return 'calendar-clock'
  }

  // Web platform rendering
  if (Platform.OS === 'web') {
    return (
      <View style={style}>
        <TextInput
          label={label}
          value={getDisplayValue()}
          mode="outlined"
          error={error}
          editable={false}
          right={<TextInput.Icon icon={getIconName()} />}
        />
        <input
          type={getWebInputType()}
          value={getWebInputValue()}
          onChange={handleWebChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
            cursor: 'pointer',
            width: '100%',
            height: '100%',
          }}
        />
      </View>
    )
  }

  // Native platform rendering
  return (
    <>
      <TextInput
        label={label}
        value={getDisplayValue()}
        mode="outlined"
        style={style}
        editable={false}
        onPressIn={showPicker}
        error={error}
        right={<TextInput.Icon icon={getIconName()} onPress={showPicker} />}
      />
      {Platform.OS === 'ios' && show && (
        <Modal
          transparent
          animationType="slide"
          visible={show}
          onRequestClose={handleIOSCancel}
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <View style={styles.buttonRow}>
                <Button onPress={handleIOSCancel}>取消</Button>
                <Button onPress={handleIOSConfirm}>确定</Button>
              </View>
              <DateTimePicker
                value={tempDate || date}
                mode={getPickerMode()}
                is24Hour={true}
                display="spinner"
                onChange={handleChange}
                locale="zh-CN"
              />
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={tempDate || date}
          mode={getPickerMode()}
          is24Hour={true}
          display="default"
          onChange={handleChange}
          locale="zh-CN"
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
})
