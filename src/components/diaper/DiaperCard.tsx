import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Card, Chip, useTheme, IconButton } from 'react-native-paper'
import { DiaperRecord } from '@/types'
import { formatTime, formatRelativeDate } from '@/utils/date'

interface DiaperCardProps {
  record: DiaperRecord
  onPress?: () => void
  onDelete?: () => void
  compact?: boolean
}

const diaperTypeLabels: Record<string, string> = {
  pee: '小便',
  poop: '大便',
  both: '大小便',
}

const poopConsistencyLabels: Record<string, string> = {
  normal: '正常',
  loose: '稀',
  hard: '硬',
  mucus: '有粘液',
  bloody: '有血丝',
}

const diaperTypeColors: Record<string, string> = {
  pee: '#4FC3F7',
  poop: '#8D6E63',
  both: '#81C784',
}

export function DiaperCard({ record, onPress, onDelete, compact }: DiaperCardProps) {
  const theme = useTheme()

  const getTypeIcon = () => {
    switch (record.type) {
      case 'pee':
        return 'water-outline'
      case 'poop':
        return 'emoticon-poop'
      case 'both':
        return 'water-plus-outline'
      default:
        return 'baby-face-outline'
    }
  }

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.compactContainer}>
          <IconButton icon={getTypeIcon()} size={20} />
          <View style={styles.compactContent}>
            <Text variant="bodyMedium">{diaperTypeLabels[record.type]}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {formatTime(record.time)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <IconButton icon={getTypeIcon()} size={24} />
            <View style={styles.titleInfo}>
              <Text variant="titleMedium">{diaperTypeLabels[record.type]}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {formatRelativeDate(record.time)}
              </Text>
            </View>
          </View>
          {onDelete && (
            <IconButton icon="delete-outline" size={20} onPress={onDelete} />
          )}
        </View>

        <View style={styles.details}>
          <Chip
            compact
            style={[styles.chip, { backgroundColor: diaperTypeColors[record.type] + '20' }]}
          >
            {diaperTypeLabels[record.type]}
          </Chip>
          {record.poopConsistency && (
            <Chip compact style={styles.chip}>
              {poopConsistencyLabels[record.poopConsistency]}
            </Chip>
          )}
        </View>

        {record.note && (
          <Text variant="bodySmall" style={styles.note}>
            {record.note}
          </Text>
        )}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInfo: {
    marginLeft: -8,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 4,
  },
  note: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  compactContent: {
    flex: 1,
    marginLeft: -8,
  },
})
