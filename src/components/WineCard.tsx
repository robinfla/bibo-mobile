import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { WineCard as WineCardType } from '../types/api'
import { colors } from '../theme/colors'

interface WineCardProps {
  card: WineCardType
  onPress: () => void
}

const MATURITY_BADGES = {
  to_age: { emoji: '🍇', label: 'To Age', bg: '#dbeafe', fg: '#1e40af' },
  approaching: { emoji: '🍷', label: 'Approaching', bg: '#fef3c7', fg: '#92400e' },
  peak: { emoji: '✨', label: 'Peak', bg: '#fef9c3', fg: '#854d0e' },
  past_prime: { emoji: '📉', label: 'Past Prime', bg: '#fecaca', fg: '#991b1b' },
  declining: { emoji: '⚠️', label: 'Declining', bg: '#fed7aa', fg: '#9a3412' },
  unknown: { emoji: '', label: '', bg: 'transparent', fg: 'transparent' },
}

export const WineCard: React.FC<WineCardProps> = ({ card, onPress }) => {
  const badge = MATURITY_BADGES[card.maturity.status]
  const hasBottleImage = !!card.bottleImageUrl

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image Section */}
      <LinearGradient
        colors={['#8B4049', '#722F37']}
        style={styles.imageSection}
      >
        {/* Vintage Badge */}
        <View style={styles.vintageBadge}>
          <Text style={styles.vintageBadgeText}>
            {card.vintage ?? 'NV'} {card.totalQuantity > 1 ? `(x${card.totalQuantity})` : ''}
          </Text>
        </View>

        {/* Bottle Image or Fallback Icon */}
        {hasBottleImage ? (
          <Image
            source={{ uri: card.bottleImageUrl! }}
            style={styles.bottleImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.fallbackIcon}>🍷</Text>
        )}
      </LinearGradient>

      {/* Wine Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.wineName} numberOfLines={1}>
            {card.wineName}
          </Text>
          {badge.label && (
            <View style={[styles.maturityBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.maturityBadgeText, { color: badge.fg }]}>
                {badge.emoji} {badge.label}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.producer} numberOfLines={1}>
          {card.producerName}
          {card.regionName && ` · ${card.regionName}`}
        </Text>
      </View>

      {/* Value Row */}
      {(card.avgPurchasePrice != null || card.valueChangePercent != null) && (
        <View style={styles.valueRow}>
          {card.avgPurchasePrice != null && (
            <Text style={styles.purchasePrice}>
              Purchase: {card.purchaseCurrency || '€'}
              {card.avgPurchasePrice.toFixed(2)}
            </Text>
          )}
          {card.valueChangePercent != null && (
            <View style={styles.valueChange}>
              <Text
                style={[
                  styles.valueChangeText,
                  { color: card.valueChangePercent >= 0 ? '#16a34a' : '#dc2626' },
                ]}
              >
                {card.valueChangePercent >= 0 ? '+' : ''}
                {card.valueChangePercent}%
              </Text>
              <Text style={styles.valueChangeIcon}>
                {card.valueChangePercent >= 0 ? '📈' : '📉'}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  imageSection: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  vintageBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vintageBadgeText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  bottleImage: {
    width: 80,
    height: 110,
  },
  fallbackIcon: {
    fontSize: 64,
    opacity: 0.6,
  },
  infoSection: {
    padding: 16,
    paddingBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  wineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  maturityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  maturityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  producer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  purchasePrice: {
    fontSize: 13,
    color: '#666',
  },
  valueChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueChangeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  valueChangeIcon: {
    fontSize: 14,
  },
})
