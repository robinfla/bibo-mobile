import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../../auth/AuthContext'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { ConsumeWineModal } from '../../components/ConsumeWineModal'

interface WineSuggestion {
  id: string
  wineId: number
  name: string
  vintage: number
  region: string
  imageUrl?: string
  maturityStatus: 'peak' | 'approaching' | 'ready' | 'young' | 'past_prime'
}

interface AnalyticsData {
  totalBottles: number
  collectionValue: number
  readyToDrink: number
  regions: number
  chartData: Array<{ label: string; value: number; maxValue: number }>
}

export const HomeScreen = () => {
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const [bottleCount, setBottleCount] = useState(0)
  const [readyWines, setReadyWines] = useState<WineSuggestion[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showConsumeModal, setShowConsumeModal] = useState(false)

  const userName = user?.name ?? user?.email?.split('@')[0] ?? 'Robin'

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch stats and ready wines
      const [statsData, winesData] = await Promise.all([
        apiFetch<any>('/api/reports/stats'),
        apiFetch<{ wines: WineSuggestion[] }>('/api/wines/ready?limit=5'),
      ])
      
      setBottleCount(statsData.totals.bottles)
      setReadyWines(winesData.wines)

      // Transform stats data for analytics widget
      const topRegions = statsData.byRegion.slice(0, 5)
      const maxBottles = Math.max(...topRegions.map((r: any) => r.bottles), 1)
      
      setAnalyticsData({
        totalBottles: statsData.totals.bottles,
        collectionValue: statsData.totals.estimatedValue,
        readyToDrink: statsData.readyToDrink,
        regions: statsData.byRegion.length,
        chartData: topRegions.map((r: any) => ({
          label: r.regionName,
          value: r.bottles,
          maxValue: maxBottles,
        })),
      })
    } catch (error) {
      console.error('Failed to load home data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getBadgeConfig = (status: string) => {
    const configs: Record<string, {
      label: string
      gradient: readonly [string, string]
      color: string
    }> = {
      peak: {
        label: 'At Peak',
        gradient: ['#e8f5e9', '#c8e6c9'] as const,
        color: '#2e7d32',
      },
      approaching: {
        label: 'Ready Now',
        gradient: ['#fff3e0', '#ffe0b2'] as const,
        color: '#ef6c00',
      },
      ready: {
        label: 'Ready Now',
        gradient: ['#fff3e0', '#ffe0b2'] as const,
        color: '#ef6c00',
      },
    }
    return configs[status] || configs.ready
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#722F37" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello {userName} 👋</Text>
            <Text style={styles.subtitle}>What's calling you tonight?</Text>
          </View>
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#722F37', '#944654']}
              style={styles.profileGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.profileInitials}>
                {userName.substring(0, 2).toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Cellar Stats Card */}
        <View style={styles.statsCardContainer}>
          <LinearGradient
            colors={['#722F37', '#8b3a45']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            {/* Watermark */}
            <Text style={styles.watermark}>🍷</Text>
            
            {/* Content */}
            <Text style={styles.statsLabel}>YOUR COLLECTION</Text>
            <Text style={styles.statsNumber}>{bottleCount}</Text>
            <Text style={styles.statsSubtitle}>bottles in your cellar</Text>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {/* Add a Wine */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddWineStep1')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconEmoji}>🍷</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add a Wine</Text>
              <Text style={styles.actionSubtitle}>Scan label or enter details</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          {/* Open a Bottle */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowConsumeModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconEmoji}>🍾</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Open a Bottle</Text>
              <Text style={styles.actionSubtitle}>Mark one as consumed</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          {/* Ask the Sommelier */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Sommelier' as never)}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconEmoji}>🎩</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ask the Sommelier</Text>
              <Text style={styles.actionSubtitle}>Get personalized recommendations</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Analytics Widget */}
        {analyticsData && (
          <View style={styles.section}>
            <View style={styles.analyticsWidget}>
              {/* Header */}
              <View style={styles.analyticsHeader}>
                <View style={styles.analyticsHeaderLeft}>
                  <Text style={styles.analyticsEmoji}>📊</Text>
                  <Text style={styles.analyticsTitle}>Cellar Insights</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Analytics' as never)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.analyticsLink}>View Full Analytics ›</Text>
                </TouchableOpacity>
              </View>

              {/* Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsData.totalBottles}</Text>
                  <Text style={styles.metricLabel}>Bottles</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {analyticsData.collectionValue > 0 
                      ? `€${analyticsData.collectionValue.toLocaleString()}` 
                      : '—'}
                  </Text>
                  <Text style={styles.metricLabel}>Value</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsData.readyToDrink}</Text>
                  <Text style={styles.metricLabel}>Ready</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsData.regions}</Text>
                  <Text style={styles.metricLabel}>Regions</Text>
                </View>
              </View>

              {/* Mini Bar Chart */}
              <View style={styles.miniChart}>
                {analyticsData.chartData.map((item, index) => (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={styles.chartBarWrapper}>
                      <LinearGradient
                        colors={['rgba(114, 47, 55, 0.15)', 'rgba(114, 47, 55, 0.25)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[
                          styles.chartBar,
                          { height: `${(item.value / item.maxValue) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Wine Suggestions */}
        {readyWines.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ready Tonight</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('InventoryTab' as never, {
                  screen: 'InventoryList',
                  params: { tab: 'cellar', filter: { maturity: 'ready' } }
                } as never)}
              >
                <Text style={styles.seeAllLink}>See all ›</Text>
              </TouchableOpacity>
            </View>

            {readyWines.map((wine) => {
              const badgeConfig = getBadgeConfig(wine.maturityStatus)
              
              return (
                <TouchableOpacity
                  key={wine.id}
                  style={styles.wineCard}
                  onPress={() => {
                    // @ts-ignore - Navigate to nested WineDetail screen
                    navigation.navigate('InventoryTab', {
                      screen: 'WineDetail',
                      params: { wineId: wine.wineId },
                    })
                  }}
                  activeOpacity={0.7}
                >
                  {/* Wine Image */}
                  <LinearGradient
                    colors={['#722F37', '#944654']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.wineImage}
                  >
                    <Text style={styles.wineImageEmoji}>🍷</Text>
                  </LinearGradient>

                  {/* Wine Info */}
                  <View style={styles.wineInfo}>
                    <Text style={styles.wineName} numberOfLines={1}>
                      {wine.name}
                    </Text>
                    <Text style={styles.wineMeta}>
                      {wine.vintage} • {wine.region}
                    </Text>
                    <LinearGradient
                      colors={badgeConfig.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.maturityBadge}
                    >
                      <View style={[styles.badgeDot, { backgroundColor: badgeConfig.color }]} />
                      <Text style={[styles.badgeText, { color: badgeConfig.color }]}>
                        {badgeConfig.label}
                      </Text>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ConsumeWineModal
        visible={showConsumeModal}
        onClose={() => setShowConsumeModal(false)}
        onSuccess={() => {
          setShowConsumeModal(false)
          handleRefresh()
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef9f5',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  profileGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  greeting: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: '#888',
    fontWeight: '400',
    marginTop: 4,
  },

  // Cellar Stats Card
  statsCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  watermark: {
    position: 'absolute',
    top: -20,
    right: -20,
    fontSize: 120,
    opacity: 0.08,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -2,
    marginTop: 4,
  },
  statsSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  seeAllLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#722F37',
  },

  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f8f4f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconEmoji: {
    fontSize: 28,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },

  // Wine Cards
  wineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  wineImage: {
    width: 52,
    height: 68,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  wineImageEmoji: {
    fontSize: 26,
  },
  wineInfo: {
    flex: 1,
    gap: 6,
  },
  wineName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  wineMeta: {
    fontSize: 14,
    color: '#999',
  },
  maturityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Analytics Widget
  analyticsWidget: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  analyticsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  analyticsEmoji: {
    fontSize: 22,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  analyticsLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#722F37',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f4f0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#722F37',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a7568',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    gap: 8,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBarWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#8a7568',
    textAlign: 'center',
    width: '100%',
  },
})
