import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../theme/colors'

interface Meal {
  name: string
  score: number
  illustrationUrl?: string
}

interface MealSuggestionsGridProps {
  meals?: Meal[]
}

const DEFAULT_MEALS: Meal[] = [
  { name: 'Grilled Ribeye', score: 95 },
  { name: 'Aged Cheese', score: 90 },
  { name: 'Lamb Ragù', score: 88 },
  { name: 'Duck Confit', score: 85 },
]

export const MealSuggestionsGrid: React.FC<MealSuggestionsGridProps> = ({
  meals = DEFAULT_MEALS,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {meals.slice(0, 4).map((meal, index) => (
          <View key={index} style={styles.card}>
            {/* Illustration placeholder */}
            <View style={styles.illustration}>
              <LinearGradient
                colors={['#d4a574', '#b8935a']}
                style={styles.illustrationGradient}
              />
              {/* Score badge */}
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{meal.score}%</Text>
              </View>
            </View>
            {/* Meal name */}
            <Text style={styles.mealName}>{meal.name}</Text>
          </View>
        ))}
      </View>
      
      {/* Placeholder note */}
      <View style={styles.note}>
        <View style={styles.noteAccent} />
        <Text style={styles.noteText}>
          💡 <Text style={styles.noteTextItalic}>Placeholder for custom hand-drawn food illustrations with warm colors and organic textures</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#fefdfb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0ede5',
    overflow: 'hidden',
  },
  illustration: {
    width: '100%',
    height: 90,
    position: 'relative',
  },
  illustrationGradient: {
    width: '100%',
    height: '100%',
  },
  scoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4a6b3c',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    paddingVertical: 12,
  },
  note: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: '#fffbf0',
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
    borderRadius: 4,
    padding: 12,
  },
  noteAccent: {
    width: 3,
    backgroundColor: '#fbbf24',
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: colors.muted[600],
  },
  noteTextItalic: {
    fontStyle: 'italic',
  },
})
