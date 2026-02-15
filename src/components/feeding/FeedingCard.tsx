import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Card, Chip, useTheme, IconButton } from 'react-native-paper'
import { FeedingRecord } from '@/types'
import { formatTime, formatRelativeDate } from '@/utils/date'

interface FeedingCardProps {
  record: FeedingRecord
  onPress?: () => void
  onDelete?: () => void
  compact?: boolean
}

const feedingTypeLabels: Record<string, string> = {
  breast_direct: '母乳亲喂',
  breast_bottle: '母乳瓶喂',
  formula: '配方奶',
}

const breastSideLabels: Record<string, string> = {
  left: '左',
  right: '右',
  both: '双侧',
}

export function FeedingCard({ record, onPress, onDelete, compact }: FeedingCardProps) {
  const theme = useTheme()

  const getTypeIcon = () => {
    switch (record.type) {
      case 'breast_direct':
        return 'baby-face-outline'
      case 'breast_bottle':
        return 'baby-bottle-outline'
      case 'formula':
        return 'bottle-soda-outline'
      default:
        return 'food-apple-outline'
    }
  }

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.compactContainer}>
          <IconButton icon={getTypeIcon()} size={20} />
          <View style={styles.compactContent}>
            <Text variant="bodyMedium">{feedingTypeLabels[record.type]}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {formatTime(record.startTime)}
              {record.amount && ` · ${record.amount}ml`}
              {record.duration && ` · ${record.duration}分钟`}
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
              <Text variant="titleMedium">{feedingTypeLabels[record.type]}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {formatRelativeDate(record.startTime)}
              </Text>
            </View>
          </View>
          {onDelete && (
            <IconButton icon="delete-outline" size={20} onPress={onDelete} />
          )}
        </View>

        <View style={styles.details}>
          {record.type === 'breast_direct' && record.breastSide && (
            <Chip compact style={styles.chip}>
              {breastSideLabels[record.breastSide]}侧
            </Chip>
          )}
          {record.amount && (
            <Chip compact style={styles.chip}>
              {record.amount} ml
            </Chip>
          )}
          {record.duration && (
            <Chip compact style={styles.chip}>
              {record.duration} 分钟
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
