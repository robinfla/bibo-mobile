import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import type { WineDetailResponse } from '../../types/api'

type WineStackParamList = {
  WineDetail: { wineId: number }
}

type Props = NativeStackScreenProps<WineStackParamList, 'WineDetail'>

const AGING_PHASES = {
  to_age: { emoji: '🍇', label: 'Youth', color: colors.primary[600] },
  approaching: { emoji: '😊', label: 'Maturity', color: colors.accent[600] },
  peak: { emoji: '😍', label: 'Peak', color: colors.secondary[600] },
  past_prime: { emoji: '📉', label: 'Past Prime', color: colors.accent[500] },
  declining: { emoji: '⚠️', label: 'Declining', color: colors.danger },
  unknown: { emoji: '❓', label: 'Unknown', color: colors.muted[400] },
}

export const WineDetailScreen = ({ route, navigation }: Props) => {
  const { wineId } = route.params
  const [wine, setWine] = useState<WineDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'vintages' | 'history'>('vintages')

  const fetchWine = async () => {
    try {
      setError(null)
      const data = await apiFetch<WineDetailResponse>(`/api/wines/${wineId}`)
      setWine(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load wine')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWine()
  }, [wineId])

  const onRefresh = () => {
    setRefreshing(true)
    fetchWine()
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    )
  }

  if (error || !wine) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Wine not found'}</Text>
        <TouchableOpacity onPress={fetchWine} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.wineName}>{wine.name}</Text>
        <Text style={styles.producer}>{wine.producer?.name}</Text>
        {wine.region && (
          <Text style={styles.region}>
            {wine.region.name}
            {wine.appellation && ` • ${wine.appellation.name}`}
          </Text>
        )}
        {wine.grapes.length > 0 && (
          <Text style={styles.grapes}>
            {wine.grapes.map((g) => g.name).join(', ')}
          </Text>
        )}
      </View>

      {/* Taste Profile */}
      {wine.tasteProfile && wine.tasteProfile.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taste Profile</Text>
          <View style={styles.badges}>
            {wine.tasteProfile.map((trait, idx) => (
              <View key={idx} style={styles.badge}>
                <Text style={styles.badgeText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Serving Guide */}
      {(wine.servingTempCelsius || wine.decantMinutes || wine.glassType) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serving Guide</Text>
          <View style={styles.servingGrid}>
            {wine.servingTempCelsius && (
              <View style={styles.servingItem}>
                <Text style={styles.servingIcon}>🌡️</Text>
                <Text style={styles.servingLabel}>Temperature</Text>
                <Text style={styles.servingValue}>{wine.servingTempCelsius}°C</Text>
              </View>
            )}
            {wine.decantMinutes && (
              <View style={styles.servingItem}>
                <Text style={styles.servingIcon}>⏱️</Text>
                <Text style={styles.servingLabel}>Decant</Text>
                <Text style={styles.servingValue}>{wine.decantMinutes} min</Text>
              </View>
            )}
            {wine.glassType && (
              <View style={styles.servingItem}>
                <Text style={styles.servingIcon}>🍷</Text>
                <Text style={styles.servingLabel}>Glass</Text>
                <Text style={styles.servingValue}>{wine.glassType}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Food Pairings */}
      {wine.foodPairings && wine.foodPairings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Pairings</Text>
          <View style={styles.pairingsList}>
            {wine.foodPairings.map((pairing, idx) => (
              <View key={idx} style={styles.pairingItem}>
                <Text style={styles.pairingBullet}>•</Text>
                <Text style={styles.pairingText}>{pairing}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'vintages' && styles.tabActive]}
          onPress={() => setSelectedTab('vintages')}
        >
          <Text
            style={[styles.tabText, selectedTab === 'vintages' && styles.tabTextActive]}
          >
            Vintages ({wine.vintages.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.tabActive]}
          onPress={() => setSelectedTab('history')}
        >
          <Text
            style={[styles.tabText, selectedTab === 'history' && styles.tabTextActive]}
          >
            History ({wine.history.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vintages Tab */}
      {selectedTab === 'vintages' && (
        <View style={styles.tabContent}>
          {wine.vintages.map((vintage) => (
            <View key={vintage.id} style={styles.vintageCard}>
              <View style={styles.vintageHeader}>
                <Text style={styles.vintageYear}>
                  {vintage.vintage || 'NV'}
                </Text>
                <Text style={styles.vintageQuantity}>
                  {vintage.quantity} bottle{vintage.quantity !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.vintageDetails}>
                <Text style={styles.vintageLabel}>
                  {vintage.format?.name} • {vintage.cellar?.name}
                </Text>
                {vintage.binLocation && (
                  <Text style={styles.vintageLocation}>📍 {vintage.binLocation}</Text>
                )}
                {vintage.valuation && vintage.valuation.priceEstimate && (
                  <View style={styles.valuation}>
                    <Text style={styles.valuationLabel}>Current Value:</Text>
                    <Text style={styles.valuationPrice}>
                      €{parseFloat(vintage.valuation.priceEstimate).toFixed(0)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
          {wine.vintages.length === 0 && (
            <Text style={styles.emptyText}>No vintages in cellar</Text>
          )}
        </View>
      )}

      {/* History Tab */}
      {selectedTab === 'history' && (
        <View style={styles.tabContent}>
          {wine.history.map((event) => (
            <View key={event.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyEvent}>
                  {event.eventType === 'consume' ? '🍷' : '📦'} {event.eventType}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(event.eventDate).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.historyVintage}>
                {event.vintage || 'NV'} • {event.cellarName}
              </Text>
              {event.rating && (
                <Text style={styles.historyRating}>
                  {'⭐'.repeat(event.rating)}
                </Text>
              )}
              {event.tastingNotes && (
                <Text style={styles.historyNotes}>{event.tastingNotes}</Text>
              )}
            </View>
          ))}
          {wine.history.length === 0 && (
            <Text style={styles.emptyText}>No consumption history</Text>
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.muted[50],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muted[50],
  },
  hero: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[200],
  },
  wineName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 4,
  },
  producer: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[700],
    marginBottom: 4,
  },
  region: {
    fontSize: 14,
    color: colors.muted[600],
    marginBottom: 4,
  },
  grapes: {
    fontSize: 13,
    color: colors.muted[500],
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: colors.white,
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary[700],
  },
  servingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  servingItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.muted[50],
    borderRadius: 8,
  },
  servingIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  servingLabel: {
    fontSize: 11,
    color: colors.muted[600],
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  servingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[900],
  },
  pairingsList: {
    gap: 8,
  },
  pairingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pairingBullet: {
    fontSize: 16,
    color: colors.muted[400],
    marginRight: 8,
  },
  pairingText: {
    flex: 1,
    fontSize: 14,
    color: colors.muted[700],
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.muted[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[500],
  },
  tabTextActive: {
    color: colors.primary[700],
  },
  tabContent: {
    padding: 16,
    gap: 12,
  },
  vintageCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  vintageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vintageYear: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted[900],
  },
  vintageQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[600],
  },
  vintageDetails: {
    gap: 6,
  },
  vintageLabel: {
    fontSize: 13,
    color: colors.muted[600],
  },
  vintageLocation: {
    fontSize: 13,
    color: colors.muted[500],
  },
  valuation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  valuationLabel: {
    fontSize: 13,
    color: colors.muted[600],
  },
  valuationPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary[700],
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyEvent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[900],
    textTransform: 'capitalize',
  },
  historyDate: {
    fontSize: 12,
    color: colors.muted[500],
  },
  historyVintage: {
    fontSize: 13,
    color: colors.muted[600],
    marginBottom: 6,
  },
  historyRating: {
    fontSize: 14,
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 13,
    color: colors.muted[700],
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.muted[500],
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
})
