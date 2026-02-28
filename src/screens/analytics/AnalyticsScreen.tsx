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
import Svg, { Circle, G } from 'react-native-svg'
import { apiFetch } from '../../api/client'

interface ColorData {
  red: number
  white: number
  rose: number
}

interface GrapeData {
  id: string
  name: string
  count: number
  percentage: number
}

interface RegionData {
  id: string
  name: string
  flag: string
  count: number
  percentage: number
}

export const AnalyticsScreen = () => {
  const navigation = useNavigation<any>()
  const [activeTab, setActiveTab] = useState<'composition' | 'finance'>('composition')
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Mock data
  const [stats, setStats] = useState({ bottles: 882, lots: 329, ready: 768 })
  const [colors, setColors] = useState<ColorData>({ red: 458, white: 423, rose: 1 })
  const [grapes, setGrapes] = useState<GrapeData[]>([
    { id: 'cabernet-sauvignon', name: 'Cabernet Sauvignon', count: 156, percentage: 18 },
    { id: 'chardonnay', name: 'Chardonnay', count: 142, percentage: 16 },
    { id: 'pinot-noir', name: 'Pinot Noir', count: 98, percentage: 11 },
  ])
  const [regions, setRegions] = useState<RegionData[]>([
    { id: 'france', name: 'France', flag: '🇫🇷', count: 345, percentage: 39 },
    { id: 'italy', name: 'Italy', flag: '🇮🇹', count: 289, percentage: 33 },
    { id: 'spain', name: 'Spain', flag: '🇪🇸', count: 127, percentage: 14 },
  ])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const statsData = await apiFetch<any>('/api/reports/stats')
      
      // Set stats
      setStats({
        bottles: statsData.totals.bottles,
        lots: statsData.totals.lots,
        ready: statsData.readyToDrink,
      })
      
      // Set colors
      const colorMap: Record<string, number> = {}
      statsData.byColor.forEach((item: any) => {
        if (item.color === 'red') colorMap.red = item.bottles
        if (item.color === 'white') colorMap.white = item.bottles
        if (item.color === 'rose') colorMap.rose = item.bottles
      })
      setColors({
        red: colorMap.red || 0,
        white: colorMap.white || 0,
        rose: colorMap.rose || 0,
      })
      
      // Set top 3 grapes
      const topGrapes = statsData.byGrape.slice(0, 3).map((item: any) => ({
        id: String(item.grapeId),
        name: item.grapeName,
        count: item.bottles,
        percentage: Math.round((item.bottles / statsData.totals.bottles) * 100),
      }))
      setGrapes(topGrapes)
      
      // Set top 3 regions
      const regionFlags: Record<string, string> = {
        'France': '🇫🇷',
        'Italy': '🇮🇹',
        'Spain': '🇪🇸',
        'United States': '🇺🇸',
        'Australia': '🇦🇺',
        'Germany': '🇩🇪',
        'Portugal': '🇵🇹',
        'Argentina': '🇦🇷',
        'Chile': '🇨🇱',
        'South Africa': '🇿🇦',
        'New Zealand': '🇳🇿',
      }
      
      const topRegions = statsData.byRegion.slice(0, 3).map((item: any) => ({
        id: String(item.regionId),
        name: item.regionName,
        flag: regionFlags[item.regionName] || '🌍',
        count: item.bottles,
        percentage: Math.round((item.bottles / statsData.totals.bottles) * 100),
      }))
      setRegions(topRegions)
      
    } catch (error) {
      console.error('Failed to load analytics:', error)
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

  const handleColorPress = (color: 'red' | 'white' | 'rose') => {
    // Navigate to the Inventory tab, then to the InventoryList screen with filter
    navigation.navigate('InventoryTab' as never, {
      screen: 'InventoryList',
      params: { tab: 'cellar', filter: { color } }
    } as never)
  }

  const handleGrapePress = (grapeId: string) => {
    navigation.navigate('InventoryTab' as never, {
      screen: 'InventoryList',
      params: { tab: 'cellar', filter: { grape: grapeId } }
    } as never)
  }

  const handleRegionPress = (regionId: string) => {
    navigation.navigate('InventoryTab' as never, {
      screen: 'InventoryList',
      params: { tab: 'cellar', filter: { region: regionId } }
    } as never)
  }

  // Calculate pie chart segments
  const total = colors.red + colors.white + colors.rose
  const redPercent = (colors.red / total) * 100
  const whitePercent = (colors.white / total) * 100
  const rosePercent = (colors.rose / total) * 100

  const PieChart = () => {
    const size = 130
    const strokeWidth = 22
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    // Calculate segment lengths
    const redLength = (redPercent / 100) * circumference
    const whiteLength = (whitePercent / 100) * circumference
    const roseLength = (rosePercent / 100) * circumference

    return (
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Red segment */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ef9a9a"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${redLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* White segment */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#fff59d"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${whiteLength} ${circumference}`}
            strokeDashoffset={-redLength}
            strokeLinecap="round"
          />
          {/* Rosé segment (if visible) */}
          {rosePercent > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f8bbd0"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${roseLength} ${circumference}`}
              strokeDashoffset={-(redLength + whiteLength)}
              strokeLinecap="round"
            />
          )}
        </G>
      </Svg>
    )
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
          <Text style={styles.title}>Analytics</Text>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'composition' && styles.tabActive]}
              onPress={() => setActiveTab('composition')}
            >
              {activeTab === 'composition' ? (
                <LinearGradient
                  colors={['#722F37', '#944654']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabGradient}
                >
                  <Text style={styles.tabTextActive}>Composition</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>Composition</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'finance' && styles.tabActive]}
              onPress={() => setActiveTab('finance')}
            >
              {activeTab === 'finance' ? (
                <LinearGradient
                  colors={['#722F37', '#944654']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabGradient}
                >
                  <Text style={styles.tabTextActive}>Finance</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>Finance</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'composition' ? (
          <>
            {/* Stats Overview */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>BOTTLES</Text>
                <Text style={styles.statValue}>{stats.bottles}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>LOTS</Text>
                <Text style={styles.statValue}>{stats.lots}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>READY</Text>
                <LinearGradient
                  colors={['#722F37', '#944654']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.statValueGradient}
                >
                  <Text style={styles.statValueReady}>{stats.ready}</Text>
                </LinearGradient>
              </View>
            </View>

            {/* By Color - Pie Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>By Color</Text>
              
              <View style={styles.colorCard}>
                {/* Pie Chart */}
                <View style={styles.pieChartContainer}>
                  <PieChart />
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                  <TouchableOpacity
                    style={styles.legendItem}
                    onPress={() => handleColorPress('red')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: '#ef9a9a' }]} />
                      <Text style={styles.legendLabel}>Red</Text>
                    </View>
                    <View style={styles.legendRight}>
                      <Text style={styles.legendValue}>{colors.red}</Text>
                      <Text style={styles.legendArrow}>›</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.legendItem}
                    onPress={() => handleColorPress('white')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: '#fff59d' }]} />
                      <Text style={styles.legendLabel}>White</Text>
                    </View>
                    <View style={styles.legendRight}>
                      <Text style={styles.legendValue}>{colors.white}</Text>
                      <Text style={styles.legendArrow}>›</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.legendItem}
                    onPress={() => handleColorPress('rose')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: '#f8bbd0' }]} />
                      <Text style={styles.legendLabel}>Rosé</Text>
                    </View>
                    <View style={styles.legendRight}>
                      <Text style={styles.legendValue}>{colors.rose}</Text>
                      <Text style={styles.legendArrow}>›</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* By Grape */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>By Grape</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AnalyticsDetail', { type: 'grapes', title: 'By Grape' })}
                >
                  <Text style={styles.seeAllLink}>See all ›</Text>
                </TouchableOpacity>
              </View>

              {grapes.map((grape) => {
                const maxCount = Math.max(...grapes.map(g => g.count))
                const barWidth = (grape.count / maxCount) * 100

                return (
                  <TouchableOpacity
                    key={grape.id}
                    style={styles.listCard}
                    onPress={() => handleGrapePress(grape.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.listIcon}>
                      <Text style={styles.listIconEmoji}>🍇</Text>
                    </View>
                    
                    <View style={styles.listContent}>
                      <Text style={styles.listTitle} numberOfLines={1}>{grape.name}</Text>
                      <Text style={styles.listSubtitle}>
                        {grape.count} bottles ({grape.percentage}%)
                      </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarTrack}>
                        <LinearGradient
                          colors={['#722F37', '#944654']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressBarFill, { width: `${barWidth}%` }]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* By Region */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>By Region</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AnalyticsDetail', { type: 'regions', title: 'By Region' })}
                >
                  <Text style={styles.seeAllLink}>See all ›</Text>
                </TouchableOpacity>
              </View>

              {regions.map((region) => {
                const maxCount = Math.max(...regions.map(r => r.count))
                const barWidth = (region.count / maxCount) * 100

                return (
                  <TouchableOpacity
                    key={region.id}
                    style={styles.listCard}
                    onPress={() => handleRegionPress(region.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.listIcon}>
                      <Text style={styles.listIconEmoji}>{region.flag}</Text>
                    </View>
                    
                    <View style={styles.listContent}>
                      <Text style={styles.listTitle} numberOfLines={1}>{region.name}</Text>
                      <Text style={styles.listSubtitle}>
                        {region.count} bottles ({region.percentage}%)
                      </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarTrack}>
                        <LinearGradient
                          colors={['#722F37', '#944654']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressBarFill, { width: `${barWidth}%` }]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </>
        ) : (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonEmoji}>💰</Text>
            <Text style={styles.comingSoonTitle}>Finance Coming Soon</Text>
            <Text style={styles.comingSoonText}>
              Track your cellar's value and investment performance
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  tab: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabActive: {},
  tabGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabTextActive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Stats Overview
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  statValueGradient: {
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  statValueReady: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#722F37',
  },

  // Color Pie Chart
  colorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  legendArrow: {
    fontSize: 14,
    color: '#999',
  },

  // List Cards
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  listIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f4f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIconEmoji: {
    fontSize: 24,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  listSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  progressBarContainer: {
    width: 60,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Coming Soon
  comingSoon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  comingSoonEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22.5,
  },
})
