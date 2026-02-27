import React, { useState } from 'react'
import { View, StyleSheet, FlatList, Alert } from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { Text, Card, IconButton, useTheme, FAB, Portal, Dialog, Button } from 'react-native-paper'
import { useBabyStore } from '@/stores'
import { Baby } from '@/types'
import { formatDate } from '@/utils/date'

export default function BabyListScreen() {
  const theme = useTheme()
  const router = useRouter()

  const babies = useBabyStore((state) => state.babies)
  const currentBabyId = useBabyStore((state) => state.currentBabyId)
  const setCurrentBaby = useBabyStore((state) => state.setCurrentBaby)
  const deleteBaby = useBabyStore((state) => state.deleteBaby)

  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean
    baby: Baby | null
  }>({ visible: false, baby: null })

  const handleAddBaby = () => {
    router.push('/baby/edit')
  }

  const handleEditBaby = (baby: Baby) => {
    router.push(`/baby/edit?id=${baby.id}`)
  }

  const handleDeleteBaby = (baby: Baby) => {
    setDeleteDialog({ visible: true, baby })
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.baby) {
      try {
        await deleteBaby(deleteDialog.baby.id)
        setDeleteDialog({ visible: false, baby: null })
      } catch (error) {
        Alert.alert('错误', '删除失败，请重试')
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ visible: false, baby: null })
  }

  const handleSelectBaby = (baby: Baby) => {
    setCurrentBaby(baby.id)
  }

  const renderBaby = ({ item }: { item: Baby }) => {
    const isSelected = item.id === currentBabyId

    return (
      <Card
        style={[
          styles.babyCard,
          isSelected && { borderColor: theme.colors.primary, borderWidth: 2 },
        ]}
        onPress={() => handleSelectBaby(item)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.babyInfo}>
            <Text variant="titleLarge">{item.name}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              出生日期: {formatDate(item.birthDate, 'yyyy年M月d日')}
            </Text>
            {item.gender && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {item.gender === 'male' ? '男宝宝' : '女宝宝'}
              </Text>
            )}
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => handleEditBaby(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteBaby(item)}
            />
          </View>
          {isSelected && (
            <IconButton
              icon="check-circle"
              iconColor={theme.colors.primary}
              size={24}
            />
          )}
        </Card.Content>
      </Card>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '宝宝管理' }} />

      {babies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodyMedium">还没有添加宝宝</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 8 }}>
            点击右下角按钮添加
          </Text>
        </View>
      ) : (
        <FlatList
          data={babies}
          renderItem={renderBaby}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddBaby}
        color={theme.colors.onPrimary}
      />

      <Portal>
        <Dialog visible={deleteDialog.visible} onDismiss={handleDeleteCancel}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              确定要删除 {deleteDialog.baby?.name} 的信息吗？相关的所有记录也会被删除。
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDeleteCancel}>取消</Button>
            <Button onPress={handleDeleteConfirm} textColor={theme.colors.error}>
              删除
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  babyCard: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  babyInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
})
