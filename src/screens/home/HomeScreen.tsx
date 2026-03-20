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
import { HandWaving, Wine, Confetti, Cylinder, MagnifyingGlass, TrendUp } from 'phosphor-react-native'
import { ConsumeWineModal } from '../../components/ConsumeWineModal'

export const HomeScreen = () => {
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const [bottleCount, setBottleCount] = useState(0)
  const [lastMonthAdded, setLastMonthAdded] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showConsumeModal, setShowConsumeModal] = useState(false)

  const userName = user?.name ?? user?.email?.split('@')[0] ?? 'Robin'

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const statsData = await apiFetch<any>('/api/reports/stats')
      setBottleCount(statsData.totals.bottles)
      setLastMonthAdded(statsData.lastMonthAdded ?? 0)
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.wine} />
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
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>Hello {userName} </Text>
              <HandWaving weight="fill" color={colors.brand.waveYellow} size={32} />
            </View>
            <Text style={styles.subtitle}>What's calling you tonight?</Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
            activeOpacity={0.8}
          >
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitials}>
                {userName.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCardContainer}>
          <LinearGradient
            colors={['#fbc8d4', '#fde59a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            {/* Wine glass watermark */}
            <View style={styles.watermarkContainer}>
              <Wine size={220} weight="fill" color="white" />
            </View>

            {/* Two-column layout */}
            <View style={styles.statsColumns}>
              {/* Left: Total Bottles */}
              <View style={styles.statsColumnLeft}>
                <Text style={styles.statsLabel}>Total Bottles</Text>
                <Text style={styles.statsNumber}>{bottleCount}</Text>
              </View>

              {/* Vertical divider */}
              <View style={styles.statsDivider} />

              {/* Right: Last Month */}
              <View style={styles.statsColumnRight}>
                <Text style={styles.statsLabel}>Last Month</Text>
                <View style={styles.statsPill}>
                  <TrendUp size={16} weight="bold" color={colors.brand.wine} />
                  <Text style={styles.statsPillText}>+{lastMonthAdded}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions — 2x2 grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            {/* Add a Wine */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AddWineStep1')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: colors.brand.iconPinkBg }]}>
                <Wine size={28} weight="fill" color={colors.brand.iconPinkFg} />
              </View>
              <Text style={styles.actionTitle}>Add a Wine</Text>
            </TouchableOpacity>

            {/* Open a Bottle */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowConsumeModal(true)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(253, 229, 154, 0.3)', 'rgba(253, 229, 154, 0.1)']}
                style={styles.actionCardGradientBg}
              />
              <View style={[styles.actionIconCircle, { backgroundColor: colors.brand.iconYellowBg }]}>
                <Confetti size={28} weight="fill" color={colors.brand.iconYellowFg} />
              </View>
              <Text style={styles.actionTitle}>Open a Bottle</Text>
            </TouchableOpacity>

            {/* Ask Sommelier */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Sommelier' as never)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: colors.brand.iconPinkBg }]}>
                <Cylinder size={28} weight="fill" color={colors.brand.iconPinkFg} />
              </View>
              <Text style={styles.actionTitle}>Ask Sommelier</Text>
            </TouchableOpacity>

            {/* Search Wines */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('WineSearch' as never)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: colors.brand.iconYellowBg }]}>
                <MagnifyingGlass size={28} weight="bold" color={colors.brand.iconYellowFg} />
              </View>
              <Text style={styles.actionTitle}>Search Wines</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: colors.brand.background,
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
    backgroundColor: colors.brand.background,
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profileButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  profileCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brand.pinkLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.brand.wine,
  },

  // Stats Card
  statsCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#d4a0aa',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  watermarkContainer: {
    position: 'absolute',
    top: -30,
    right: -30,
    opacity: 0.2,
  },
  statsColumns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsColumnLeft: {
    flex: 1,
  },
  statsDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(138, 59, 70, 0.2)',
    marginHorizontal: 20,
  },
  statsColumnRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand.wine,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statsNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.brand.wine,
    letterSpacing: -2,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    marginTop: 4,
  },
  statsPillText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand.wine,
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 16,
  },

  // Quick Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  actionCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  actionCardGradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
})
