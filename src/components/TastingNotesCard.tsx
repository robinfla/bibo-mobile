import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../theme/colors'

interface TastingNotesCardProps {
  score?: number
  notes?: string
}

export const TastingNotesCard: React.FC<TastingNotesCardProps> = ({
  score,
  notes,
}) => {
  if (!score && !notes) return null
  
  return (
    <View style={styles.container}>
      {/* Score circle */}
      {score && (
        <View style={styles.scoreContainer}>
          <LinearGradient
            colors={[colors.coral, colors.coralDark]}
            style={styles.scoreCircle}
          >
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </LinearGradient>
          <Text style={styles.scoreLabel}>Rating</Text>
        </View>
      )}
      
      {/* Notes text */}
      {notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textInverse,
  },
  scoreMax: {
    fontSize: 14,
    color: colors.textInverse,
    marginTop: -4,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.muted[500],
  },
  notesContainer: {
    flex: 1,
    backgroundColor: colors.muted[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[200],
    padding: 12,
    minHeight: 80,
    justifyContent: 'center',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
})
