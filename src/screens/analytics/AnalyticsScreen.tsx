import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { apiFetch, ApiError } from '../../api/client'
import { colors, chartColors } from '../../theme/colors'
import type { StatsResponse } from '../../types/api'

const WINE_COLORS: Record<string, string> = {
  red: colors.wine.red,
  white: colors.wine.white,
  rose: colors.wine.rose,
  rosé: colors.wine.rose,
  sparkling: colors.wine.sparkling,
  dessert: colors.wine.dessert,
  fortified: colors.wine.fortified,
}

const getWineColor = (color: string): string =>
  WINE_COLORS[color.toLowerCase()] ?? colors.muted[400]

interface BarChartItem {
  label: string
  value: number
  color: string
}

const BarChart = ({ title, items }: { title: string; items: BarChartItem[] }) => {
  const maxValue = items.reduce((max, { value }) => Math.max(max, value), 0)
  if (items.length === 0) return null

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      {items.map(({ label, value, color }, index) => {
        const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
        const total = items.reduce((sum, i) => sum + i.value, 0)
        const share = total > 0 ? Math.round((value / total) * 100) : 0
        return (
          <View key={`${label}-${index}`} style={styles.barRow}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{label}</Text>
              <Text style={styles.barValue}>{value} ({share}%)</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
          </View>
        )
      })}
    </View>
  )
}

const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

type Tab = 'composition' | 'finance'

export const AnalyticsScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('composition')
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiFetch<StatsResponse>('/api/reports/stats')
      setStats(data)
      setError(null)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load stats'
      setError(msg)
    }
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    await fetchStats()
    setIsLoading(false)
  }, [fetchStats])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
  }, [fetchStats])

  useEffect(() => { 
    loadData() 
  }, [loadData])

  const buildColorChart = (data: StatsResponse['byColor']): BarChartItem[] =>
    data.map(({ color, bottles }) => ({
      label: color.charAt(0).toUpperCase() + color.slice(1),
      value: parseInt(bottles, 10),
      color: getWineColor(color),
    }))

  const buildCellarChart = (data: StatsResponse['byCellar']): BarChartItem[] =>
    data.map(({ cellarName, bottles }, i) => ({
      label: cellarName,
      value: parseInt(bottles, 10),
      color: chartColors.cellar[i % chartColors.cellar.length],
    }))

  const buildRegionChart = (data: StatsResponse['byRegion']): BarChartItem[] =>
    data.slice(0, 5).map(({ regionName, bottles }, i) => ({
      label: regionName,
      value: parseInt(bottles, 10),
      color: chartColors.region[i % chartColors.region.length],
    }))

  const buildVintageChart = (data: StatsResponse['byVintage']): BarChartItem[] =>
    data.slice(0, 5).map(({ vintage, bottles }, i) => ({
      label: String(vintage),
      value: parseInt(bottles, 10),
      color: chartColors.vintage[i % chartColors.vintage.length],
    }))

  // Consumption-related functions moved to InventoryScreen

  const renderTabPills = () => (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        {[
          { key: 'composition' as Tab, label: 'Composition' },
          { key: 'finance' as Tab, label: 'Finance' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabPill, activeTab === key && styles.tabPillActive]}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.tabPillText, activeTab === key && styles.tabPillTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  const renderCompositionTab = () => {
    if (!stats) return null

    return (
      <>
        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Bottles</Text>
            <Text style={styles.statValue}>{stats.totals.bottles}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Lots</Text>
            <Text style={styles.statValue}>{stats.totals.lots}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ready</Text>
            <Text style={[styles.statValue, { color: colors.primary[600] }]}>{stats.readyToDrink}</Text>
          </View>
        </View>

        <BarChart title="By Color" items={buildColorChart(stats.byColor)} />
        <BarChart title="By Cellar" items={buildCellarChart(stats.byCellar)} />
        <BarChart title="By Region (Top 5)" items={buildRegionChart(stats.byRegion)} />
        <BarChart title="By Vintage (Top 5)" items={buildVintageChart(stats.byVintage)} />
      </>
    )
  }

  const renderFinanceTab = () => {
    if (!stats) return null

    const avgPricePerBottle = stats.totals.bottles > 0 ? stats.totals.estimatedValue / stats.totals.bottles : 0

    return (
      <>
        {/* Finance stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={styles.statValue}>{formatPrice(stats.totals.estimatedValue)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg/Bottle</Text>
            <Text style={styles.statValue}>{formatPrice(avgPricePerBottle)}</Text>
          </View>
        </View>

        <BarChart title="Value by Cellar" items={buildCellarChart(stats.byCellar)} />
        <BarChart title="Composition by Color" items={buildColorChart(stats.byColor)} />
      </>
    )
  }

  // Consumption tab moved to InventoryScreen

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    )
  }

  if (error && !stats) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {renderTabPills()}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'composition' && renderCompositionTab()}
        {activeTab === 'finance' && renderFinanceTab()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.muted[50] 
  },
  scrollContainer: { 
    flex: 1 
  },
  content: { 
    padding: 16, 
    paddingBottom: 32 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.muted[50], 
    padding: 24 
  },
  errorText: { 
    color: colors.danger, 
    fontSize: 16, 
    textAlign: 'center' 
  },

  // Tab pills
  tabContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[200],
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.muted[100],
  },
  tabPillActive: {
    backgroundColor: colors.primary[600],
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[700],
  },
  tabPillTextActive: {
    color: colors.white,
  },

  // Stats cards
  statsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 16 
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: colors.muted[500], 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: colors.muted[900], 
    marginTop: 4 
  },

  // Charts
  chartCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chartTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: colors.muted[900], 
    marginBottom: 12 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 16,
  },
  barRow: { 
    marginBottom: 10 
  },
  barLabelRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4 
  },
  barLabel: { 
    fontSize: 13, 
    color: colors.muted[700], 
    fontWeight: '500', 
    flex: 1 
  },
  barValue: { 
    fontSize: 13, 
    color: colors.muted[500], 
    fontWeight: '600', 
    marginLeft: 8 
  },
  barTrack: { 
    height: 8, 
    backgroundColor: colors.muted[100], 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  barFill: { 
    height: 8, 
    borderRadius: 4 
  },

  // Consumption-related styles moved to InventoryScreen
})