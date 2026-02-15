import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Card, Avatar, useTheme, IconButton } from 'react-native-paper'
import { Baby } from '@/types'
import { formatDate } from '@/utils/date'

interface BabySelectorProps {
  babies: Baby[]
  currentBabyId: string | null
  onSelectBaby: (id: string) => void
  onAddBaby: () => void
}

export function BabySelector({
  babies,
  currentBabyId,
  onSelectBaby,
  onAddBaby,
}: BabySelectorProps) {
  const theme = useTheme()

  if (babies.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <Text variant="bodyMedium">还没有添加宝宝</Text>
          <IconButton
            icon="plus"
            mode="contained"
            onPress={onAddBaby}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            iconColor={theme.colors.onPrimary}
          />
        </Card.Content>
      </Card>
    )
  }

  const currentBaby = babies.find((b) => b.id === currentBabyId)

  return (
    <View style={styles.container}>
      {babies.map((baby) => (
        <Card
          key={baby.id}
          style={[
            styles.babyCard,
            baby.id === currentBabyId && {
              borderColor: theme.colors.primary,
              borderWidth: 2,
            },
          ]}
          onPress={() => onSelectBaby(baby.id)}
        >
          <Card.Content style={styles.cardContent}>
            <Avatar.Text
              size={40}
              label={baby.name.charAt(0)}
              style={{
                backgroundColor:
                  baby.id === currentBabyId ? theme.colors.primary : theme.colors.surfaceVariant,
              }}
              labelStyle={{
                color: baby.id === currentBabyId ? theme.colors.onPrimary : theme.colors.onSurface,
              }}
            />
            <View style={styles.babyInfo}>
              <Text variant="titleMedium">{baby.name}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {formatDate(baby.birthDate, 'yyyy年M月d日')}
              </Text>
            </View>
          </Card.Content>
        </Card>
      ))}
      <IconButton
        icon="plus"
        mode="outlined"
        onPress={onAddBaby}
        style={styles.addButtonSmall}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  babyCard: {
    flex: 0,
    minWidth: 140,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  babyInfo: {
    flex: 1,
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    margin: 0,
  },
  addButtonSmall: {
    margin: 0,
  },
})
