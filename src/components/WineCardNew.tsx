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
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import type { WineCard } from '../types/api'

interface WineCardNewProps {
  card: WineCard
  onPress: () => void
}

const MATURITY_CONFIG = {
  peak: {
    bg: '#e8f5e9',
    color: '#2e7d32',
    label: 'Peak',
  },
  approaching: {
    bg: '#e8f5e9',
    color: '#2e7d32',
    label: 'Ready',
  },
  past_prime: {
    bg: '#fff3e0',
    color: '#ef6c00',
    label: 'Drink Now',
  },
  declining: {
    bg: '#fff3e0',
    color: '#ef6c00',
    label: 'Drink Now',
  },
  to_age: {
    bg: '#e3f2fd',
    color: '#1565c0',
    label: 'Young',
  },
  unknown: {
    bg: '#f5f5f5',
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
        {card.vintages.map((vintage, index) => (
          <TouchableOpacity
            key={`${vintage.vintage}-${index}`}
            style={[
              styles.vintageChip,
              index === selectedVintageIndex && styles.vintageChipActive,
            ]}
            onPress={() => setSelectedVintageIndex(index)}
          >
            <Text
              style={[
                styles.vintageChipText,
                index === selectedVintageIndex && styles.vintageChipTextActive,
              ]}
            >
              {vintage.vintage || 'NV'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Wine Image */}
      <View style={styles.imageContainer}>
        {card.bottleImageUrl ? (
          <Image source={{ uri: card.bottleImageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Icon name="bottle-wine-outline" size={28} color={colors.muted[300]} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Wine Name + Maturity Badge */}
        <View style={styles.header}>
          <Text style={styles.wineName} numberOfLines={1}>
            {card.wineName}
          </Text>
          <View style={[styles.maturityBadge, { backgroundColor: maturityConfig.bg }]}>
            <View style={[styles.maturityDot, { backgroundColor: maturityConfig.color }]} />
            <Text style={[styles.maturityLabel, { color: maturityConfig.color }]}>
              {maturityConfig.label}
            </Text>
          </View>
        </View>

        {/* Producer + Region */}
        <Text style={styles.producer} numberOfLines={1}>
          {card.producerName}
        </Text>
        <Text style={styles.region} numberOfLines={1}>
          {card.regionName || 'Unknown Region'} • {card.vintages.length > 1 ? `${card.vintages.length} vintages` : selectedVintage?.vintage || 'NV'}
        </Text>

        {/* Vintage Chips */}
        {renderVintageChips()}

        {/* Bottle Count */}
        <View style={styles.bottleCount}>
          <Icon name="bottle-wine" size={16} color={colors.muted[500]} />
          <Text style={styles.bottleCountText}>
            {selectedVintage?.bottleCount || card.totalBottles}
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
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: 60,
    height: 80,
    backgroundColor: colors.muted[100],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  wineName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C1810',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  producer: {
    fontSize: 14,
    color: colors.muted[600],
    marginBottom: 2,
  },
  region: {
    fontSize: 13,
    color: colors.muted[500],
    marginBottom: 8,
  },
  maturityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  maturityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  maturityLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  vintageChipsContainer: {
    marginBottom: 8,
  },
  vintageChipsContent: {
    gap: 6,
  },
  vintageChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.muted[100],
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  vintageChipActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  vintageChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted[600],
  },
  vintageChipTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  bottleCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottleCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#722F37', // Maroon accent for emphasis
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
