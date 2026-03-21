import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Wine } from 'phosphor-react-native'
import { colors } from '../theme/colors'
import type { WineCard } from '../types/api'

interface WineCardNewProps {
  card: WineCard
  onPress: () => void
}

const MATURITY_CONFIG = {
  peak: {
    bg: colors.status.peakBg,
    fg: colors.status.peak,
    label: 'Peak',
  },
  approaching: {
    bg: colors.status.approachingBg,
    fg: colors.status.approaching,
    label: 'Approaching',
  },
  past_prime: {
    bg: colors.status.pastPrimeBg,
    fg: colors.status.pastPrime,
    label: 'Drink Now',
  },
  declining: {
    bg: colors.status.pastPrimeBg,
    fg: colors.status.pastPrime,
    label: 'Drink Now',
  },
  to_age: {
    bg: colors.status.youngBg,
    fg: colors.status.young,
    label: 'Young',
  },
  unknown: {
    bg: colors.muted[100],
    fg: colors.muted[400],
    label: 'Unknown',
  },
}

export const WineCardNew: React.FC<WineCardNewProps> = ({ card, onPress }) => {
  const [selectedVintageIndex, setSelectedVintageIndex] = useState(0)

  const selectedVintage = card.vintages[selectedVintageIndex]
  const maturityConfig = MATURITY_CONFIG[selectedVintage?.maturityStatus || 'unknown']

  const renderVintageChips = () => {
    if (card.vintages.length <= 1) return null

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.vintageChipsContainer}
        contentContainerStyle={styles.vintageChipsContent}
      >
        {card.vintages.map((vintage, index) => {
          const isSelected = index === selectedVintageIndex
          
          return isSelected ? (
            <TouchableOpacity
              key={`${vintage.vintage}-${index}`}
              onPress={() => setSelectedVintageIndex(index)}
              activeOpacity={0.8}
              style={styles.vintageChipActive}
            >
              <Text style={styles.vintageChipTextActive}>
                {vintage.vintage || 'NV'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={`${vintage.vintage}-${index}`}
              style={styles.vintageChip}
              onPress={() => setSelectedVintageIndex(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.vintageChipText}>
                {vintage.vintage || 'NV'}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    )
  }

  // Get color-specific styling for wine type
  const getWineColorStyle = () => {
    switch (card.wineColor) {
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
          iconColor: colors.muted[300],
          cardBg: colors.surface,
          borderColor: 'rgba(228, 213, 203, 0.2)',
          shadowColor: colors.coral,
        }
    }
  }

  const colorStyle = getWineColorStyle()

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colorStyle.cardBg,
          borderColor: colorStyle.borderColor,
          shadowColor: colorStyle.shadowColor,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Decorative blur blob */}
      <View style={styles.blurBlob} />

      {/* Wine Image */}
      <View style={styles.imageContainer}>
        {card.bottleImageUrl ? (
          <>
            <Image source={{ uri: card.bottleImageUrl }} style={styles.image} />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.4)']}
              style={styles.imageOverlay}
            />
          </>
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: colorStyle.backgroundColor }]}>
            <Wine size={36} weight="fill" color={colorStyle.iconColor} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Wine Name + Maturity Badge */}
        <View style={styles.header}>
          <Text style={styles.wineName} numberOfLines={2}>
            {card.wineName}
          </Text>
          <View style={[styles.maturityBadge, { backgroundColor: maturityConfig.bg }]}>
            <View style={[styles.maturityDot, { backgroundColor: maturityConfig.fg }]} />
            <Text style={[styles.maturityLabel, { color: maturityConfig.fg }]}>
              {maturityConfig.label}
            </Text>
          </View>
        </View>

        {/* Producer */}
        <Text style={styles.producer} numberOfLines={1}>
          {card.producerName}
        </Text>

        {/* Region + Vintage Count */}
        <Text style={styles.region} numberOfLines={1}>
          {card.regionName || 'Unknown Region'} • {card.vintages.length} {card.vintages.length === 1 ? 'vintage' : 'vintages'}
        </Text>

        {/* Vintage Chips */}
        {renderVintageChips()}

        {/* Bottle Count */}
        <View style={styles.bottleCount}>
          <Wine size={14} weight="fill" color={colors.wine.red} />
          <Text style={styles.bottleCountText}>
            {selectedVintage?.bottleCount || card.totalBottles} {(selectedVintage?.bottleCount || card.totalBottles) === 1 ? 'bottle' : 'bottles'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.2)',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  blurBlob: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(242, 132, 130, 0.05)',
  },
  imageContainer: {
    width: 100,
    height: 140,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  wineName: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 23.4,
  },
  producer: {
    fontSize: 10,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 2.4,
  },
  region: {
    fontSize: 13,
    fontFamily: 'NunitoSans_400Regular',
    color: '#8A7E78',
  },
  maturityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
    flexShrink: 0,
  },
  maturityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  maturityLabel: {
    fontSize: 12,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
  },
  vintageChipsContainer: {
    marginTop: 4,
  },
  vintageChipsContent: {
    gap: 8,
  },
  vintageChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.linen,
  },
  vintageChipActive: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.coral,
    transform: [{ scale: 1.05 }],
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  vintageChipText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: '#5A4A42',
  },
  vintageChipTextActive: {
    fontSize: 14,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textInverse,
  },
  bottleCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    backgroundColor: colors.linen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.muted[100],
    alignSelf: 'flex-start',
  },
  bottleCountText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
