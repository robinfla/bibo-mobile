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
import type { StatsResponse, InventoryEvent, EventsResponse } from '../../types/api'

type TabKey = 'composition' | 'finance' | 'consumption'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'composition', label: 'Composition' },
  { key: 'finance', label: 'Finance' },
  { key: 'consumption', label: 'Consumption' },
]

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

// ── Bar Chart ──
interface BarChartItem { label: string; value: number; color: string }

const BarChart = ({ title, items }: { title: string; items: BarChartItem[] }) => {
  const maxValue = items.reduce((max, { value }) => Math.max(max, value), 0)
  if (items.length === 0) return null
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      {items.map(({ label, value, color }, i) => {
        const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
        const total = items.reduce((s, x) => s + x.value, 0)
        const share = total > 0 ? Math.round((value / total) * 100) : 0
        return (
          <View key={`${label}-${i}`} style={styles.barRow}>
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

// ── Helpers ──
const formatEUR = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

const getMonthKey = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const formatMonthLabel = (key: string) => {
  const [y, m] = key.split('-')
  const date = new Date(parseInt(y), parseInt(m) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

const isCurrentMonth = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

// ── Main Screen ──
export const AnalyticsScreen = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('composition')
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [events, setEvents] = useState<InventoryEvent[]>([])
  const [eventsLoaded, setEventsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiFetch<StatsResponse>('/api/reports/stats')
      setStats(data)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load stats')
    }
  }, [])

  const fetchEvents = useCallback(async () => {
    try {
      const data = await apiFetch<EventsResponse>('/api/inventory/events', { query: { limit: 200 } })
      setEvents(data.events)
      setEventsLoaded(true)
    } catch { /* silently fail */ }
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    await fetchStats()
    setIsLoading(false)
  }, [fetchStats])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([fetchStats(), fetchEvents()])
    setRefreshing(false)
  }, [fetchStats, fetchEvents])

  useEffect(() => { loadData() }, [loadData])

  // Lazy-load events when Consumption tab is first opened
  useEffect(() => {
    if (activeTab === 'consumption' && !eventsLoaded) {
      fetchEvents()
    }
  }, [activeTab, eventsLoaded, fetchEvents])

  // ── Chart builders ──
  const buildColorChart = (d: StatsResponse['byColor']): BarChartItem[] =>
    d.map(({ color, bottles }) => ({ label: color.charAt(0).toUpperCase() + color.slice(1), value: parseInt(String(bottles), 10), color: getWineColor(color) }))

  const buildCellarChart = (d: StatsResponse['byCellar']): BarChartItem[] =>
    d.map(({ cellarName, bottles }, i) => ({ label: cellarName, value: parseInt(String(bottles), 10), color: chartColors.cellar[i % chartColors.cellar.length] }))

  const buildRegionChart = (d: StatsResponse['byRegion']): BarChartItem[] =>
    d.slice(0, 5).map(({ regionName, bottles }, i) => ({ label: regionName, value: parseInt(String(bottles), 10), color: chartColors.region[i % chartColors.region.length] }))

  const buildVintageChart = (d: StatsResponse['byVintage']): BarChartItem[] =>
    d.slice(0, 5).map(({ vintage, bottles }, i) => ({ label: String(vintage), value: parseInt(String(bottles), 10), color: chartColors.vintage[i % chartColors.vintage.length] }))

  // ── Consumption helpers ──
  const addedThisMonth = events.filter(e => e.eventType === 'purchase' && isCurrentMonth(e.eventDate)).reduce((s, e) => s + Math.abs(e.quantityChange), 0)
  const consumedThisMonth = events.filter(e => e.eventType === 'consume' && isCurrentMonth(e.eventDate)).reduce((s, e) => s + Math.abs(e.quantityChange), 0)

  const groupedEvents = events.reduce<Record<string, InventoryEvent[]>>((acc, ev) => {
    const key = getMonthKey(ev.eventDate)
    if (!acc[key]) acc[key] = []
    acc[key].push(ev)
    return acc
  }, {})
  const sortedMonths = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a))

  // ── Render ──
  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary[600]} /></View>
  }

  if (error && !stats) {
    return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Tab pills */}
      <View style={styles.tabRow}>
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabPill, activeTab === key && styles.tabPillActive]}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.tabPillText, activeTab === key && styles.tabPillTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Composition ── */}
      {activeTab === 'composition' && stats && (
        <>
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
      )}

      {/* ── Finance ── */}
      {activeTab === 'finance' && stats && (
        <>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { flex: 1 }]}>
              <Text style={styles.statLabel}>Total Value</Text>
              <Text style={styles.statValue}>{formatEUR(stats.totals.estimatedValue)}</Text>
            </View>
            <View style={[styles.statCard, { flex: 1 }]}>
              <Text style={styles.statLabel}>Avg / Bottle</Text>
              <Text style={styles.statValue}>
                {stats.totals.bottles > 0 ? formatEUR(stats.totals.estimatedValue / stats.totals.bottles) : '—'}
              </Text>
            </View>
          </View>
          <BarChart title="Bottles by Cellar" items={buildCellarChart(stats.byCellar)} />
          <BarChart title="Bottles by Color" items={buildColorChart(stats.byColor)} />
        </>
      )}

      {/* ── Consumption ── */}
      {activeTab === 'consumption' && (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Added this month</Text>
              <Text style={[styles.statValue, { color: '#15803d' }]}>+{addedThisMonth}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Consumed this month</Text>
              <Text style={[styles.statValue, { color: '#dc2626' }]}>-{consumedThisMonth}</Text>
            </View>
          </View>

          {!eventsLoaded ? (
            <ActivityIndicator size="small" color={colors.primary[600]} style={{ marginTop: 20 }} />
          ) : events.length === 0 ? (
            <Text style={styles.emptyText}>No activity yet</Text>
          ) : (
            sortedMonths.map(monthKey => (
              <View key={monthKey}>
                <Text style={styles.monthHeader}>{formatMonthLabel(monthKey)}</Text>
                {groupedEvents[monthKey].map(ev => (
                  <View key={ev.id} style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <View style={[styles.colorDot, { backgroundColor: getWineColor(ev.wineColor) }]} />
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventWineName} numberOfLines={1}>{ev.wineName}</Text>
                        <Text style={styles.eventMeta}>{ev.producerName} · {ev.vintage ?? 'NV'}</Text>
                      </View>
                      <View style={[styles.eventBadge, ev.eventType === 'purchase' ? styles.badgePurchase : styles.badgeConsume]}>
                        <Text style={[styles.eventBadgeText, ev.eventType === 'purchase' ? styles.badgePurchaseText : styles.badgeConsumeText]}>
                          {ev.eventType === 'purchase' ? `+${ev.quantityChange}` : `${ev.quantityChange}`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.eventFooter}>
                      <Text style={styles.eventDate}>{formatDate(ev.eventDate)}</Text>
                      {ev.eventType === 'consume' && ev.rating != null && ev.rating > 0 && (
                        <Text style={styles.eventRating}>⭐ {ev.rating}/100</Text>
                      )}
                    </View>
                    {ev.eventType === 'consume' && ev.tastingNotes && (
                      <Text style={styles.eventNotes} numberOfLines={2}>"{ev.tastingNotes}"</Text>
                    )}
                  </View>
                ))}
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.muted[50] },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.muted[50], padding: 24 },
  errorText: { color: colors.danger, fontSize: 16, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: colors.muted[500], fontSize: 15, marginTop: 24 },

  // Tabs
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.muted[100] },
  tabPillActive: { backgroundColor: colors.primary[600] },
  tabPillText: { fontSize: 14, fontWeight: '600', color: colors.muted[700] },
  tabPillTextActive: { color: colors.white },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.muted[500], textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.muted[900], marginTop: 4 },

  // Charts
  chartCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.muted[200], borderRadius: 12, padding: 16, marginBottom: 12 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.muted[900], marginBottom: 12 },
  barRow: { marginBottom: 10 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 13, color: colors.muted[700], fontWeight: '500', flex: 1 },
  barValue: { fontSize: 13, color: colors.muted[500], fontWeight: '600', marginLeft: 8 },
  barTrack: { height: 8, backgroundColor: colors.muted[100], borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },

  // Events
  monthHeader: { fontSize: 16, fontWeight: '600', color: colors.muted[700], paddingVertical: 8, marginTop: 8 },
  eventCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  eventHeader: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  eventInfo: { flex: 1 },
  eventWineName: { fontSize: 15, fontWeight: '600', color: colors.muted[900] },
  eventMeta: { fontSize: 13, color: colors.muted[500], marginTop: 1 },
  eventBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgePurchase: { backgroundColor: '#dcfce7' },
  badgeConsume: { backgroundColor: '#fee2e2' },
  eventBadgeText: { fontSize: 13, fontWeight: '700' },
  badgePurchaseText: { color: '#15803d' },
  badgeConsumeText: { color: '#dc2626' },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  eventDate: { fontSize: 12, color: colors.muted[400] },
  eventRating: { fontSize: 12, color: colors.muted[600], fontWeight: '600' },
  eventNotes: { fontSize: 13, color: colors.muted[600], fontStyle: 'italic', marginTop: 6 },
})
