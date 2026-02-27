import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'

interface HistoryCardProps {
  wineName: string
  vintage?: number
  region?: string
  imageUrl?: string
  consumedDate: Date
  score?: number
  tastingNotes?: string
  onPress: () => void
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
  wineName,
  vintage,
  region,
  imageUrl,
  consumedDate,
  score,
  tastingNotes,
  onPress,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const hasScore = score !== undefined && score !== null
  const hasNotes = tastingNotes && tastingNotes.trim().length > 0
  const hasTastingSection = hasScore || hasNotes

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Wine Identity Section */}
      <View style={styles.wineHeader}>
        {/* Wine Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Icon name="bottle-wine" size={28} color="#8b3a3a" />
            </View>
          )}
        </View>

        {/* Wine Details */}
        <View style={styles.wineDetails}>
          <Text style={styles.wineName} numberOfLines={1}>
            {wineName}
          </Text>
          <Text style={styles.vintageRegion} numberOfLines={1}>
            {vintage ? `${vintage}` : 'NV'}
            {region && ` • ${region}`}
          </Text>
          <View style={styles.consumedDateRow}>
            <Text style={styles.calendarIcon}>📅</Text>
            <Text style={styles.consumedDate}>
              Enjoyed on {formatDate(consumedDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Tasting Section (conditional) */}
      {hasTastingSection && (
        <View style={styles.tastingSection}>
          {hasScore && (
            <LinearGradient
              colors={['#722F37', '#944654']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreBadge}
            >
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreDenominator}>/100</Text>
            </LinearGradient>
          )}

          {hasNotes && (
            <LinearGradient
              colors={['#f9f9f9', '#f5f5f5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.notesBox, !hasScore && styles.notesBoxFullWidth]}
            >
              <Text style={styles.notesText} numberOfLines={3}>
                {tastingNotes}
              </Text>
            </LinearGradient>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.2)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  wineHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    width: 56,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#4A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wineDetails: {
    flex: 1,
    gap: 4,
  },
  wineName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  vintageRegion: {
    fontSize: 13,
    color: '#888',
  },
  consumedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarIcon: {
    fontSize: 12,
  },
  consumedDate: {
    fontSize: 12,
    color: '#722F37',
    fontWeight: '500',
  },
  tastingSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 213, 203, 0.3)',
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  scoreDenominator: {
    fontSize: 9,
    color: '#fff',
    opacity: 0.8,
    marginTop: -2,
  },
  notesBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  notesBoxFullWidth: {
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#555',
  },
})
