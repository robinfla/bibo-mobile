import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import type { InventoryResponse } from '../../types/api'

interface Cellar {
  id: number
  name: string
  countryCode: string | null
  bottleCount: number
}

interface MaturityCounts {
  to_age: number
  approaching: number
  peak: number
  past_prime: number
  declining: number
}

const COUNTRY_FLAGS: Record<string, string> = {
  ZA: '🇿🇦', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸', US: '🇺🇸', AR: '🇦🇷', CL: '🇨🇱', 
  PT: '🇵🇹', DE: '🇩🇪', AT: '🇦🇹', AU: '🇦🇺', NZ: '🇳🇿', CH: '🇨🇭',
}

const COUNTRY_NAMES: Record<string, string> = {
  ZA: 'South Africa', FR: 'France', IT: 'Italy', ES: 'Spain', US: 'United States',
  AR: 'Argentina', CL: 'Chile', PT: 'Portugal', DE: 'Germany', AT: 'Austria',
  AU: 'Australia', NZ: 'New Zealand', CH: 'Switzerland',
}

const HERO_GRADIENTS: [string, string][] = [
  ['#1a1a2e', '#16213e'],
  ['#722F37', '#4a1a1f'],
  ['#1e3a2f', '#0f2620'],
  ['#2d1b4e', '#1a0f30'],
]

const MATURITY_COLORS = {
  to_age: '#3b82f6',
  approaching: '#f59e0b',
  peak: '#22c55e',
  past_prime: '#f97316',
  declining: '#ef4444',
}

const MATURITY_LABELS = {
  to_age: 'to age',
  approaching: 'approaching',
  peak: 'peak',
  past_prime: 'past prime',
  declining: 'declining',
}

export const CellarsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const [cellars, setCellars] = useState<Cellar[]>([])
  const [maturityByCellar, setMaturityByCellar] = useState<Record<number, MaturityCounts>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCellars = useCallback(async () => {
    try {
      const data = await apiFetch<Cellar[]>('/api/cellars')
      setCellars(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    }
  }, [])

  const fetchMaturity = useCallback(async (cellarList: Cellar[]) => {
    const result: Record<number, MaturityCounts> = {}
    for (const cellar of cellarList) {
      try {
        const data = await apiFetch<InventoryResponse>('/api/inventory', {
          query: { inStock: 'true', limit: '2000', cellarId: String(cellar.id) },
        })
        const counts: MaturityCounts = { to_age: 0, approaching: 0, peak: 0, past_prime: 0, declining: 0 }
        data.lots.forEach((lot) => {
          const status = lot.maturity?.status as keyof MaturityCounts
          if (status && status in counts) {
            counts[status] += lot.quantity
          }
        })
        result[cellar.id] = counts
      } catch {
        // ignore
      }
    }
    setMaturityByCellar(result)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const data = await apiFetch<Cellar[]>('/api/cellars').catch(() => [])
    const list = Array.isArray(data) ? data : []
    setCellars(list)
    await fetchMaturity(list)
    setLoading(false)
  }, [fetchMaturity])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchCellars()
    setRefreshing(false)
  }, [fetchCellars])

  useEffect(() => { load() }, [load])

  const totalBottles = cellars.reduce((sum, c) => sum + (c.bottleCount ?? 0), 0)

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Cellars</Text>
        <Text style={styles.subtitle}>{cellars.length} cellars · {totalBottles} bottles</Text>
      </View>

      {cellars.map((cellar, index) => {
        const counts = maturityByCellar[cellar.id]
        const flag = COUNTRY_FLAGS[cellar.countryCode ?? ''] ?? '🍷'
        const country = COUNTRY_NAMES[cellar.countryCode ?? ''] ?? ''
        const gradient = HERO_GRADIENTS[index % HERO_GRADIENTS.length]
        const total = counts ? Object.values(counts).reduce((s, v) => s + v, 0) : 0

        return (
          <TouchableOpacity
            key={cellar.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SpacesList', { cellarId: cellar.id, cellarName: cellar.name })}
          >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroFlag}>{flag}</Text>

            <View style={styles.heroRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{cellar.name}</Text>
                {country ? <Text style={styles.heroLocation}>{country}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.heroCount}>{cellar.bottleCount ?? 0}</Text>
                <Text style={styles.heroCountLabel}>bottles</Text>
              </View>
            </View>

            {/* Maturity bar */}
            {counts && total > 0 && (
              <>
                <View style={styles.maturityBar}>
                  {(Object.keys(MATURITY_COLORS) as (keyof MaturityCounts)[]).map((key) => {
                    const val = counts[key]
                    if (val === 0) return null
                    return (
                      <View
                        key={key}
                        style={[
                          styles.maturitySegment,
                          { flex: val, backgroundColor: MATURITY_COLORS[key] },
                        ]}
                      />
                    )
                  })}
                </View>

                <View style={styles.maturityStats}>
                  {(Object.keys(MATURITY_COLORS) as (keyof MaturityCounts)[]).map((key) => {
                    const val = counts[key]
                    if (val === 0) return null
                    return (
                      <Text key={key} style={styles.maturityStat}>
                        <Text style={styles.maturityStatBold}>{val}</Text> {MATURITY_LABELS[key]}
                      </Text>
                    )
                  })}
                </View>
              </>
            )}
          </LinearGradient>
          </TouchableOpacity>
        )
      })}

      {cellars.length === 0 && (
        <Text style={styles.empty}>No cellars yet</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.muted[50] },
  content: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.muted[50] },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.muted[900] },
  subtitle: { fontSize: 14, color: colors.muted[500], marginTop: 4 },

  // Hero cards
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 24,
    padding: 24,
  },
  heroFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  heroLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  heroCount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 48,
  },
  heroCountLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },

  // Maturity bar
  maturityBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 16,
    gap: 2,
  },
  maturitySegment: {
    height: 4,
    borderRadius: 2,
  },
  maturityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  maturityStat: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  maturityStatBold: {
    fontWeight: '700',
    color: '#fff',
  },

  empty: { textAlign: 'center', color: colors.muted[400], marginTop: 32, fontSize: 15 },
})
