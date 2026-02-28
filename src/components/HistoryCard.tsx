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
  wineColor?: string
  consumedDate: Date
  score?: number
  tastingNotes?: string
  onEditScore: () => void
  onEditNotes: () => void
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
  wineName,
  vintage,
  region,
  imageUrl,
  wineColor,
  consumedDate,
  score,
  tastingNotes,
  onEditScore,
  onEditNotes,
}) => {
  // Get color-specific styling for wine type
  const getWineColorStyle = () => {
    switch (wineColor) {
      case 'red':
        return { 
          backgroundColor: '#6B2D3E', 
          iconColor: '#8b3a3a',
          cardBg: '#fff',
          borderColor: 'rgba(107, 45, 62, 0.15)',
          shadowColor: '#6B2D3E',
        }
      case 'white':
        return { 
          backgroundColor: '#fef9e7', 
          iconColor: '#d4af37',
          cardBg: '#fffef9',
          borderColor: 'rgba(212, 175, 55, 0.15)',
          shadowColor: '#d4af37',
        }
      case 'rose':
        return { 
          backgroundColor: '#ffe0e6', 
          iconColor: '#ff69b4',
          cardBg: '#fff9fa',
          borderColor: 'rgba(255, 105, 180, 0.15)',
          shadowColor: '#ff69b4',
        }
      case 'sparkling':
        return { 
          backgroundColor: '#fffacd', 
          iconColor: '#ffd700',
          cardBg: '#fffef8',
          borderColor: 'rgba(255, 215, 0, 0.15)',
          shadowColor: '#ffd700',
        }
      case 'dessert':
      case 'fortified':
        return { 
          backgroundColor: '#3d2314', 
          iconColor: '#8b4513',
          cardBg: '#faf7f5',
          borderColor: 'rgba(139, 69, 19, 0.15)',
          shadowColor: '#8b4513',
        }
      default:
        return { 
          backgroundColor: '#e0e0e0', 
          iconColor: '#999',
          cardBg: '#fff',
          borderColor: 'rgba(228, 213, 203, 0.2)',
          shadowColor: '#722F37',
        }
    }
  }

  const colorStyle = getWineColorStyle()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const hasScore = score !== null && score !== undefined
  const hasNotes = tastingNotes && tastingNotes.trim().length > 0

  // Render CTAs for Rate and/or Add notes
  const renderCTA = (type: 'rate' | 'notes') => {
    const config = {
      rate: {
        emoji: '⭐',
        text: 'Rate',
        onPress: onEditScore,
      },
      notes: {
        emoji: '📝',
        text: 'Add notes',
        onPress: onEditNotes,
      },
    }

    const { emoji, text, onPress } = config[type]

    return (
      <TouchableOpacity
        style={styles.cta}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.ctaEmoji}>{emoji}</Text>
        <Text style={styles.ctaText}>{text}</Text>
      </TouchableOpacity>
    )
  }

  // Render the tasting section based on state
  const renderTastingSection = () => {
    // State 1: Score + Notes (both present)
    if (hasScore && hasNotes) {
      return (
        <View style={styles.tastingSection}>
          <TouchableOpacity onPress={onEditScore} activeOpacity={0.7}>
            <LinearGradient
              colors={['#722F37', '#944654']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreBadge}
            >
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreDenominator}>/100</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notesBoxTouchable}
            onPress={onEditNotes}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#f9f9f9', '#f5f5f5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.notesBox}
            >
              <Text style={styles.notesText} numberOfLines={3}>
                {tastingNotes}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )
    }

    // State 2: No score, no notes (both CTAs)
    if (!hasScore && !hasNotes) {
      return (
        <View style={styles.tastingSection}>
          {renderCTA('rate')}
          {renderCTA('notes')}
        </View>
      )
    }

    // State 3: Notes only (no score)
    if (hasNotes && !hasScore) {
      return (
        <View style={styles.tastingSection}>
          <TouchableOpacity
            style={styles.notesBoxTouchableFullWidth}
            onPress={onEditNotes}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#f9f9f9', '#f5f5f5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.notesBoxFullWidth}
            >
              <Text style={styles.notesText} numberOfLines={3}>
                {tastingNotes}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )
    }

    // State 4: Score only (no notes) - Rate CTA + notes box placeholder?
    // Actually based on spec: if hasScore && !hasNotes, we should show score badge + Add notes CTA
    // But the mockup description suggests State 4 is score badge + notes box (with notes present)
    // Re-reading spec: State 4 is "Score Present, Notes Empty" with "Rate CTA + Notes Box"
    // This seems contradictory. Let me check the spec again...
    // 
    // From spec:
    // "State 4: Score Present, Notes Empty
    // Display: [⭐ Rate] [Notes Text Box]
    // When: User has NOT rated but HAS added notes"
    //
    // Wait, that's wrong. State 4 says "Score Present" but then "User has NOT rated"
    // That's a contradiction. Let me interpret based on the logic matrix:
    //
    // State 1: hasScore && hasNotes
    // State 2: !hasScore && !hasNotes  
    // State 3: hasNotes && !hasScore
    // State 4: hasScore && !hasNotes
    //
    // So State 4 should be: score badge + "Add notes" CTA
    if (hasScore && !hasNotes) {
      return (
        <View style={styles.tastingSection}>
          <TouchableOpacity onPress={onEditScore} activeOpacity={0.7}>
            <LinearGradient
              colors={['#722F37', '#944654']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreBadge}
            >
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreDenominator}>/100</Text>
            </LinearGradient>
          </TouchableOpacity>

          {renderCTA('notes')}
        </View>
      )
    }

    return null
  }

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: colorStyle.cardBg,
        borderColor: colorStyle.borderColor,
        shadowColor: colorStyle.shadowColor,
      }
    ]}>
      {/* Wine Identity Section */}
      <View style={styles.wineHeader}>
        {/* Wine Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[
              styles.image, 
              styles.placeholderImage,
              { backgroundColor: colorStyle.backgroundColor }
            ]}>
              <Icon name="bottle-wine" size={32} color={colorStyle.iconColor} />
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
      {renderTastingSection()}
    </View>
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
    color: '#999',
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
    fontSize: 13,
    color: '#722F37',
    fontWeight: '600',
  },
  tastingSection: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 213, 203, 0.3)',
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
  notesBoxTouchable: {
    flex: 1,
  },
  notesBox: {
    padding: 10,
    borderRadius: 10,
  },
  notesBoxTouchableFullWidth: {
    flex: 1,
  },
  notesBoxFullWidth: {
    padding: 10,
    borderRadius: 10,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#555',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  ctaEmoji: {
    fontSize: 18,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    textDecorationLine: 'underline',
    textDecorationColor: '#ddd',
    textDecorationStyle: 'solid',
  },
})
