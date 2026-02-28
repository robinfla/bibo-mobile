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
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import type { WineCard } from '../types/api'

interface WineCardNewProps {
  card: WineCard
  onPress: () => void
}

const MATURITY_CONFIG = {
  peak: {
    gradient: ['#e8f5e9', '#c8e6c9'] as const,
    color: '#2e7d32',
    label: 'Peak',
  },
  approaching: {
    gradient: ['#e8f5e9', '#c8e6c9'] as const,
    color: '#2e7d32',
    label: 'Ready',
  },
  past_prime: {
    gradient: ['#fff3e0', '#ffe0b2'] as const,
    color: '#ef6c00',
    label: 'Drink Now',
  },
  declining: {
    gradient: ['#fff3e0', '#ffe0b2'] as const,
    color: '#ef6c00',
    label: 'Drink Now',
  },
  to_age: {
    gradient: ['#e3f2fd', '#bbdefb'] as const,
    color: '#1565c0',
    label: 'Young',
  },
  unknown: {
    gradient: ['#f5f5f5', '#e0e0e0'] as const,
    color: '#757575',
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
            >
              <LinearGradient
                colors={['#6B2D3E', '#5A2535']}
                style={styles.vintageChipActive}
              >
                <Text style={styles.vintageChipTextActive}>
                  {vintage.vintage || 'NV'}
                </Text>
              </LinearGradient>
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
          backgroundColor: colors.muted[100], 
          iconColor: colors.muted[300],
          cardBg: '#fff',
          borderColor: 'rgba(228, 213, 203, 0.2)',
          shadowColor: '#722F37',
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
      {/* Wine Image */}
      <View style={styles.imageContainer}>
        {card.bottleImageUrl ? (
          <Image source={{ uri: card.bottleImageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: colorStyle.backgroundColor }]}>
            <Icon name="bottle-wine" size={36} color={colorStyle.iconColor} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Wine Name + Maturity Badge */}
        <View style={styles.header}>
          <Text style={styles.wineName} numberOfLines={2}>
            {card.wineName}
          </Text>
          <LinearGradient
            colors={maturityConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.maturityBadge}
          >
            <View style={[styles.maturityDot, { backgroundColor: maturityConfig.color }]} />
            <Text style={[styles.maturityLabel, { color: maturityConfig.color }]}>
              {maturityConfig.label}
            </Text>
          </LinearGradient>
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
          <Text style={styles.bottleEmoji}>🍷</Text>
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
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.2)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  imageContainer: {
    width: 72,
    height: 90,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
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
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    lineHeight: 23.4,
  },
  producer: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A3A35',
  },
  region: {
    fontSize: 13,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D9D0C8',
  },
  vintageChipActive: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    transform: [{ scale: 1.05 }],
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  vintageChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A4A42',
  },
  vintageChipTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  bottleCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  bottleEmoji: {
    fontSize: 16,
  },
  bottleCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A2A25',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
