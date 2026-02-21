import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { apiFetch, ApiError } from '../../api/client'
import { colors, chartColors } from '../../theme/colors'
import type { StatsResponse } from '../../types/api'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

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

const GRAPE_COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981',
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16',
]

// Collapsible chart component
const CollapsibleChart = ({ title, emoji, items }: { title: string; emoji: string; items: BarChartItem[] }) => {
  const [expanded, setExpanded] = useState(false)
  const maxValue = items.reduce((max, { value }) => Math.max(max, value), 0)
  const total = items.reduce((sum, i) => sum + i.value, 0)

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }

  return (
    <TouchableOpacity style={styles.chartCard} onPress={toggle} activeOpacity={0.7}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartEmoji}>{emoji}</Text>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.chartCount}>{total} btl</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {expanded && (
        <View style={styles.chartBody}>
          {items.length === 0 ? (
            <Text style={{ color: '#999', fontSize: 13, textAlign: 'center', paddingVertical: 8 }}>No data</Text>
          ) : items.map(({ label, value, color }, index) => {
            const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
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
      )}
    </TouchableOpacity>
  )
}

const formatPrice = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

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
    data.slice(0, 10).map(({ regionName, bottles }, i) => ({
      label: regionName,
      value: parseInt(bottles, 10),
      color: chartColors.region[i % chartColors.region.length],
    }))

  const buildVintageChart = (data: StatsResponse['byVintage']): BarChartItem[] =>
    data.slice(0, 10).map(({ vintage, bottles }, i) => ({
      label: String(vintage),
      value: parseInt(bottles, 10),
      color: chartColors.vintage[i % chartColors.vintage.length],
    }))

  const buildGrapeChart = (data: StatsResponse['byGrape']): BarChartItem[] =>
    (data ?? []).slice(0, 10).map(({ grapeName, bottles }, i) => ({
      label: grapeName,
      value: typeof bottles === 'string' ? parseInt(bottles, 10) : Number(bottles),
      color: GRAPE_COLORS[i % GRAPE_COLORS.length],
    }))

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

        <CollapsibleChart title="By Color" emoji="🍷" items={buildColorChart(stats.byColor)} />
        <CollapsibleChart title="By Grape" emoji="🍇" items={buildGrapeChart(stats.byGrape)} />
        <CollapsibleChart title="By Region" emoji="🌍" items={buildRegionChart(stats.byRegion)} />
        <CollapsibleChart title="By Cellar" emoji="📦" items={buildCellarChart(stats.byCellar)} />
        <CollapsibleChart title="By Vintage" emoji="📆" items={buildVintageChart(stats.byVintage)} />
      </>
    )
  }

  const renderFinanceTab = () => {
    if (!stats) return null

    const avgPricePerBottle = stats.totals.bottles > 0 ? stats.totals.estimatedValue / stats.totals.bottles : 0

    return (
      <>
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

        <CollapsibleChart title="Value by Cellar" emoji="📦" items={buildCellarChart(stats.byCellar)} />
        <CollapsibleChart title="By Color" emoji="🍷" items={buildColorChart(stats.byColor)} />
      </>
    )
  }

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
  container: { flex: 1, backgroundColor: colors.muted[50] },
  scrollContainer: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.muted[50], padding: 24 },
  errorText: { color: colors.danger, fontSize: 16, textAlign: 'center' },

  // Tab pills
  tabContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[200],
  },
  tabScrollContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.muted[100] },
  tabPillActive: { backgroundColor: colors.primary[600] },
  tabPillText: { fontSize: 14, fontWeight: '600', color: colors.muted[700] },
  tabPillTextActive: { color: colors.white },

  // Stats cards
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.muted[200],
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  statLabel: { fontSize: 12, fontWeight: '600', color: colors.muted[500], textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.muted[900], marginTop: 4 },

  // Collapsible charts
  chartCard: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.muted[200],
    borderRadius: 12, marginBottom: 10, overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8,
  },
  chartEmoji: { fontSize: 18 },
  chartTitle: { fontSize: 15, fontWeight: '700', color: colors.muted[900], flex: 1 },
  chartCount: { fontSize: 13, fontWeight: '600', color: colors.muted[500] },
  chevron: { fontSize: 12, color: colors.muted[400], marginLeft: 4 },
  chartBody: { paddingHorizontal: 14, paddingBottom: 14 },

  // Bars
  barRow: { marginBottom: 10 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 13, color: colors.muted[700], fontWeight: '500', flex: 1 },
  barValue: { fontSize: 13, color: colors.muted[500], fontWeight: '600', marginLeft: 8 },
  barTrack: { height: 8, backgroundColor: colors.muted[100], borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
})
