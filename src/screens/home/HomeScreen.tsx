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
import { HandWaving, Wine, Cylinder, MagnifyingGlass, TrendUp } from 'phosphor-react-native'
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
        <ActivityIndicator size="large" color={colors.coral} />
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
              <HandWaving weight="fill" color={colors.honey} size={32} />
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

        {/* Stats Card — Coral to Honey gradient */}
        <View style={styles.statsCardContainer}>
          <LinearGradient
            colors={colors.gradient.statsCard}
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
                  <TrendUp size={16} weight="bold" color={colors.coralDark} />
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
              <View style={[styles.actionIconCircle, { backgroundColor: colors.coralLight }]}>
                <Wine size={28} weight="fill" color={colors.coralDark} />
              </View>
              <Text style={styles.actionTitle}>Add a Wine</Text>
            </TouchableOpacity>

            {/* Open a Bottle */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowConsumeModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: colors.honeyLight }]}>
                <Wine size={28} weight="fill" color={colors.honeyDark} />
              </View>
              <Text style={styles.actionTitle}>Open a Bottle</Text>
            </TouchableOpacity>

            {/* Ask Sommelier */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Sommelier' as never)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: colors.coralLight }]}>
                <Cylinder size={28} weight="fill" color={colors.coralDark} />
              </View>
              <Text style={styles.actionTitle}>Ask Sommelier</Text>
            </TouchableOpacity>

            {/* Search Wines */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('WineSearch' as never)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: colors.honeyLight }]}>
                <MagnifyingGlass size={28} weight="bold" color={colors.honeyDark} />
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
    backgroundColor: colors.linen,
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
    backgroundColor: colors.linen,
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
    fontSize: 38,
    fontFamily: 'NunitoSans_800ExtraBold',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
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
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  profileInitials: {
    fontSize: 20,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textInverse,
  },

  // Stats Card
  statsCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsCard: {
    borderRadius: 28,
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  statsColumnRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statsLabel: {
    fontSize: 11,
    fontFamily: 'NunitoSans_600SemiBold',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statsNumber: {
    fontSize: 64,
    fontFamily: 'NunitoSans_800ExtraBold',
    color: colors.textInverse,
    letterSpacing: -2,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    marginTop: 4,
  },
  statsPillText: {
    fontSize: 20,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textInverse,
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 16,
  },

  // Quick Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: '47%',
    flexGrow: 1,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
})
