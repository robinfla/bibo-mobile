import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

type Priority = 'must_have' | 'nice_to_have' | 'someday'

interface WishlistCardProps {
  id: string
  wineName: string
  vintage?: number | null
  region?: string | null
  priority: Priority
  targetBudget?: number | null
  notes?: string | null
  onPress: () => void
}

const PRIORITY_CONFIG: Record<Priority, {
  label: string
  emoji: string
  gradient: readonly [string, string]
  textColor: string
}> = {
  must_have: {
    label: 'Must Have',
    emoji: '🔥',
    gradient: ['#ff6b6b', '#ee5a52'] as const,
    textColor: '#fff',
  },
  nice_to_have: {
    label: 'Nice',
    emoji: '⭐',
    gradient: ['#ffd93d', '#f5b731'] as const,
    textColor: '#8b4d00',
  },
  someday: {
    label: 'Someday',
    emoji: '💭',
    gradient: ['#e3f2fd', '#bbdefb'] as const,
    textColor: '#1565c0',
  },
}

export const WishlistCard: React.FC<WishlistCardProps> = ({
  wineName,
  vintage,
  region,
  priority,
  targetBudget,
  notes,
  onPress,
}) => {
  const config = PRIORITY_CONFIG[priority]
  
  const meta = [vintage, region].filter(Boolean).join(' • ')

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Wine Image */}
      <LinearGradient
        colors={['#8b4d5a', '#722F37']}
        style={styles.wineImage}
      >
        <Text style={styles.wineImageEmoji}>🍷</Text>
      </LinearGradient>

      {/* Wine Info */}
      <View style={styles.wineInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.wineName} numberOfLines={2}>
            {wineName}
          </Text>
          
          {/* Priority Badge */}
          <LinearGradient
            colors={config.gradient}
            style={styles.priorityBadge}
          >
            <Text style={[styles.priorityText, { color: config.textColor }]}>
              {config.emoji} {config.label}
            </Text>
          </LinearGradient>
        </View>

        {meta && (
          <Text style={styles.meta}>{meta}</Text>
        )}

        {targetBudget && (
          <Text style={styles.budget}>Budget: ${targetBudget}</Text>
        )}

        {notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  wineImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wineImageEmoji: {
    fontSize: 32,
  },
  wineInfo: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  wineName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 20.8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 0,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    color: '#666',
  },
  budget: {
    fontSize: 14,
    fontWeight: '700',
    color: '#722F37',
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#999',
    lineHeight: 16.8,
    maxHeight: 32,
  },
})
