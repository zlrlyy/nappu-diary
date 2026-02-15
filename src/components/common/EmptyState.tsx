import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, useTheme, Card } from 'react-native-paper'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {description && (
        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.outline }]}>
          {description}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
  },
  action: {
    marginTop: 8,
  },
})
