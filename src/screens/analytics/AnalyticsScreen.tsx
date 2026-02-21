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
import type { StatsResponse, InventoryEvent, InventoryEventsResponse } from '../../types/api'

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

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getMonthYear = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

interface EventsByMonth {
  [monthYear: string]: InventoryEvent[]
}

type Tab = 'composition' | 'finance' | 'consumption'

export const AnalyticsScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('composition')
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [events, setEvents] = useState<InventoryEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
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

  const fetchEvents = useCallback(async () => {
    if (isLoadingEvents) return
    
    setIsLoadingEvents(true)
    try {
      const data = await apiFetch<InventoryEventsResponse>('/api/inventory/events?limit=100')
      setEvents(data.events)
    } catch (e) {
      console.error('Failed to load events:', e)
    } finally {
      setIsLoadingEvents(false)
    }
  }, [isLoadingEvents])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    await fetchStats()
    setIsLoading(false)
  }, [fetchStats])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchStats()
    if (activeTab === 'consumption') {
      await fetchEvents()
    }
    setRefreshing(false)
  }, [fetchStats, fetchEvents, activeTab])

  useEffect(() => { 
    loadData() 
  }, [loadData])

  useEffect(() => {
    if (activeTab === 'consumption' && events.length === 0) {
      fetchEvents()
    }
  }, [activeTab, events.length, fetchEvents])

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

  const getEventsByMonth = (): EventsByMonth => {
    const grouped: EventsByMonth = {}
    events.forEach(event => {
      const monthYear = getMonthYear(event.eventDate)
      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push(event)
    })
    
    // Sort events within each month by date (newest first)
    Object.keys(grouped).forEach(monthYear => {
      grouped[monthYear].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    })
    
    return grouped
  }

  const getThisMonthEvents = (eventType: 'purchase' | 'consume'): number => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return events.filter(event => {
      const eventDate = new Date(event.eventDate)
      return event.eventType === eventType && 
             eventDate.getMonth() === currentMonth && 
             eventDate.getFullYear() === currentYear
    }).length
  }

  const renderTabPills = () => (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        {[
          { key: 'composition' as Tab, label: 'Composition' },
          { key: 'finance' as Tab, label: 'Finance' },
          { key: 'consumption' as Tab, label: 'Consumption' },
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

  const renderConsumptionTab = () => {
    const eventsByMonth = getEventsByMonth()
    const monthYears = Object.keys(eventsByMonth).sort((a, b) => new Date(b + ' 1').getTime() - new Date(a + ' 1').getTime())

    return (
      <>
        {/* This month stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Added This Month</Text>
            <Text style={[styles.statValue, { color: colors.secondary[600] }]}>
              {getThisMonthEvents('purchase')}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Consumed This Month</Text>
            <Text style={[styles.statValue, { color: colors.danger }]}>
              {getThisMonthEvents('consume')}
            </Text>
          </View>
        </View>

        {/* History */}
        {isLoadingEvents ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        ) : (
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>History</Text>
            {monthYears.length === 0 ? (
              <Text style={styles.emptyText}>No events yet</Text>
            ) : (
              monthYears.map(monthYear => (
                <View key={monthYear}>
                  <Text style={styles.monthHeader}>{monthYear}</Text>
                  {eventsByMonth[monthYear].map(event => (
                    <View key={event.id} style={styles.eventRow}>
                      <View style={styles.eventMain}>
                        <View style={styles.eventHeader}>
                          <Text style={styles.eventWine} numberOfLines={1}>
                            {event.wineName} {event.vintage && `(${event.vintage})`}
                          </Text>
                          <View style={[
                            styles.eventBadge,
                            event.eventType === 'purchase' ? styles.eventBadgePurchase : styles.eventBadgeConsume
                          ]}>
                            <Text style={[
                              styles.eventBadgeText,
                              event.eventType === 'purchase' ? styles.eventBadgeTextPurchase : styles.eventBadgeTextConsume
                            ]}>
                              {event.eventType === 'purchase' ? 'Added' : 'Consumed'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.eventProducer}>{event.producerName}</Text>
                        <View style={styles.eventDetails}>
                          <Text style={styles.eventQuantity}>
                            {event.eventType === 'purchase' ? '+' : ''}{event.quantityChange}
                          </Text>
                          <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
                        </View>
                        {event.eventType === 'consume' && (event.rating || event.tastingNotes) && (
                          <View style={styles.eventTasting}>
                            {event.rating && (
                              <Text style={styles.eventRating}>★ {event.rating}/100</Text>
                            )}
                            {event.tastingNotes && (
                              <Text style={styles.eventNotes} numberOfLines={2}>{event.tastingNotes}</Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        )}
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
        {activeTab === 'consumption' && renderConsumptionTab()}
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

  // Events
  emptyText: {
    fontSize: 14,
    color: colors.muted[500],
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted[700],
    paddingVertical: 8,
    marginTop: 8,
  },
  eventRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[100],
    paddingVertical: 12,
  },
  eventMain: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventWine: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.muted[900],
    flex: 1,
    marginRight: 8,
  },
  eventProducer: {
    fontSize: 13,
    color: colors.muted[600],
    marginBottom: 4,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventQuantity: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[700],
  },
  eventDate: {
    fontSize: 13,
    color: colors.muted[500],
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  eventBadgePurchase: {
    backgroundColor: '#dcfce7',
  },
  eventBadgeConsume: {
    backgroundColor: '#fee2e2',
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventBadgeTextPurchase: {
    color: '#15803d',
  },
  eventBadgeTextConsume: {
    color: '#dc2626',
  },
  eventTasting: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.muted[100],
  },
  eventRating: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent[600],
    marginBottom: 4,
  },
  eventNotes: {
    fontSize: 13,
    color: colors.muted[600],
    lineHeight: 18,
  },
})