import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Wine } from 'phosphor-react-native'
import { colors } from '../theme/colors'

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
          backgroundColor: 'rgba(242, 132, 130, 0.15)',
          iconColor: colors.coralDark,
          cardBg: colors.surface,
          borderColor: 'rgba(242, 132, 130, 0.15)',
          shadowColor: colors.wine.red,
        }
      case 'white':
        return {
          backgroundColor: 'rgba(246, 189, 96, 0.15)',
          iconColor: colors.honeyDark,
          cardBg: colors.surface,
          borderColor: 'rgba(246, 189, 96, 0.15)',
          shadowColor: colors.wine.white,
        }
      case 'rose':
        return {
          backgroundColor: 'rgba(245, 202, 195, 0.15)',
          iconColor: colors.coralDark,
          cardBg: colors.surface,
          borderColor: 'rgba(245, 202, 195, 0.15)',
          shadowColor: colors.wine.rose,
        }
      case 'sparkling':
        return {
          backgroundColor: 'rgba(246, 189, 96, 0.15)',
          iconColor: colors.honeyDark,
          cardBg: colors.surface,
          borderColor: 'rgba(246, 189, 96, 0.15)',
          shadowColor: colors.wine.sparkling,
        }
      case 'dessert':
        return {
          backgroundColor: 'rgba(212, 140, 0, 0.15)',
          iconColor: colors.honeyDark,
          cardBg: colors.surface,
          borderColor: 'rgba(212, 140, 0, 0.15)',
          shadowColor: colors.wine.dessert,
        }
      case 'fortified':
        return {
          backgroundColor: 'rgba(132, 165, 157, 0.15)',
          iconColor: colors.teal,
          cardBg: colors.surface,
          borderColor: 'rgba(132, 165, 157, 0.15)',
          shadowColor: colors.wine.fortified,
        }
      default:
        return {
          backgroundColor: colors.muted[100],
          iconColor: colors.textTertiary,
          cardBg: colors.surface,
          borderColor: 'rgba(228, 213, 203, 0.2)',
          shadowColor: colors.coral,
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
              colors={[colors.coral, colors.coralDark]}
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
              colors={[colors.muted[50], colors.muted[100]]}
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
              colors={[colors.muted[50], colors.muted[100]]}
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
              colors={[colors.coral, colors.coralDark]}
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
              <Wine size={32} weight="fill" color={colorStyle.iconColor} />
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
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.2)',
    shadowColor: colors.coral,
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
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  vintageRegion: {
    fontSize: 13,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textTertiary,
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
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.coral,
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
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreNumber: {
    fontSize: 18,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textInverse,
  },
  scoreDenominator: {
    fontSize: 9,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textInverse,
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
    fontFamily: 'NunitoSans_400Regular',
    lineHeight: 21,
    color: colors.textSecondary,
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
    fontFamily: 'NunitoSans_500Medium',
    fontWeight: '500',
    color: colors.textTertiary,
    textDecorationLine: 'underline',
    textDecorationColor: '#ddd',
    textDecorationStyle: 'solid',
  },
})
