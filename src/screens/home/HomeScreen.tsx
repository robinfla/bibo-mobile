import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native'
// LinearGradient removed — using solid bg for now
import { useAuth } from '../../auth/AuthContext'
import { apiFetch, ApiError } from '../../api/client'
import { colors, chartColors } from '../../theme/colors'
import AddWineModal from './AddWineModal'
import PairingChatModal from './PairingChatModal'
import ScanWineModal from './ScanWineModal'
import type {
  StatsResponse,
  InventoryLot,
  InventoryResponse,
  ConsumePayload,
} from '../../types/api'

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

export const HomeScreen = () => {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Consume search
  const [showConsumeModal, setShowConsumeModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<InventoryLot[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // New modals
  const [showAddWineModal, setShowAddWineModal] = useState(false)
  const [showPairingModal, setShowPairingModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)

  // Consume form
  const [consumeLot, setConsumeLot] = useState<InventoryLot | null>(null)
  const [consumeQty, setConsumeQty] = useState(1)
  const [consumeScore, setConsumeScore] = useState('')
  const [consumeComment, setConsumeComment] = useState('')
  const [consumePairing, setConsumePairing] = useState('')
  const [isConsuming, setIsConsuming] = useState(false)
  const [consumeError, setConsumeError] = useState<string | null>(null)

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

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    if (text.trim().length < 2) {
      setSearchResults([])
      return
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await apiFetch<InventoryResponse>('/api/inventory', {
          query: { search: text.trim(), inStock: 'true', limit: 10 },
        })
        setSearchResults(data.lots)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [])

  const openConsumeForm = useCallback((lot: InventoryLot) => {
    setConsumeLot(lot)
    setConsumeQty(1)
    setConsumeScore('')
    setConsumeComment('')
    setConsumePairing('')
    setConsumeError(null)
    setShowConsumeModal(false)
    setSearchQuery('')
    setSearchResults([])
  }, [])

  const handleConsume = useCallback(async () => {
    if (!consumeLot) return
    setIsConsuming(true)
    setConsumeError(null)

    const payload: ConsumePayload = { quantity: consumeQty }
    const scoreNum = parseInt(consumeScore, 10)
    if (consumeComment.trim() || consumePairing.trim() || (!isNaN(scoreNum) && scoreNum >= 0)) {
      payload.tastingNote = {
        score: !isNaN(scoreNum) ? scoreNum : 0,
        comment: consumeComment.trim(),
        pairing: consumePairing.trim(),
      }
    }

    try {
      await apiFetch(`/api/inventory/${consumeLot.id}/consume`, {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      })
      setConsumeLot(null)
      await fetchStats()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to consume bottle'
      setConsumeError(msg)
    } finally {
      setIsConsuming(false)
    }
  }, [consumeLot, consumeQty, consumeScore, consumeComment, consumePairing, fetchStats])

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

  const userName = user?.name ?? user?.email?.split('@')[0] ?? 'User'

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
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroGreeting}>Hello {userName} 👋</Text>
              <Text style={styles.heroSubtitle}>Welcome back to your cellar</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Bottle count */}
          <View style={styles.bottleCountCard}>
            <Text style={styles.bottleCountLabel}>Number of bottles</Text>
            <Text style={styles.bottleCountValue}>{stats?.totals.bottles ?? 0}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowConsumeModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[100] }]}>
              <Text style={[styles.quickActionEmoji]}>🍷</Text>
            </View>
            <Text style={styles.quickActionLabel}>Open a{'\n'}bottle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowAddWineModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary?.[100] ?? '#dcfce7' }]}>
              <Text style={styles.quickActionEmoji}>➕</Text>
            </View>
            <Text style={styles.quickActionLabel}>Add a{'\n'}bottle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowScanModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#e0e7ff' }]}>
              <Text style={styles.quickActionEmoji}>📷</Text>
            </View>
            <Text style={styles.quickActionLabel}>Scan a{'\n'}label</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowPairingModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
              <Text style={styles.quickActionEmoji}>💡</Text>
            </View>
            <Text style={styles.quickActionLabel}>Get{'\n'}inspiration</Text>
          </TouchableOpacity>
        </View>

        {/* Charts moved to Analytics tab */}
      </ScrollView>

      {/* Consume Search Modal */}
      <Modal visible={showConsumeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContent}>
            <View style={styles.searchModalHeader}>
              <Text style={styles.modalTitle}>Open a Bottle</Text>
              <TouchableOpacity onPress={() => { setShowConsumeModal(false); setSearchQuery(''); setSearchResults([]) }}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search your wines..."
              placeholderTextColor={colors.muted[400]}
              autoFocus
            />

            {isSearching && (
              <ActivityIndicator size="small" color={colors.primary[600]} style={{ marginTop: 16 }} />
            )}

            {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
              <Text style={styles.noResults}>No wines found</Text>
            )}

            <ScrollView style={styles.searchResultsList} keyboardShouldPersistTaps="handled">
              {searchResults.map((lot) => (
                <TouchableOpacity
                  key={lot.id}
                  style={styles.searchResultItem}
                  onPress={() => openConsumeForm(lot)}
                >
                  <View style={[styles.colorDot, { backgroundColor: getWineColor(lot.wineColor) }]} />
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultName} numberOfLines={1}>{lot.wineName}</Text>
                    <Text style={styles.searchResultMeta}>
                      {lot.producerName} · {lot.vintage ?? 'NV'} · {lot.quantity} btl
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Consume Form Modal */}
      <Modal visible={!!consumeLot} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Open a Bottle</Text>

            {consumeLot && (
              <>
                <View style={styles.modalWineInfo}>
                  <View style={[styles.colorDot, { backgroundColor: getWineColor(consumeLot.wineColor) }]} />
                  <View style={styles.modalWineText}>
                    <Text style={styles.modalWineName}>{consumeLot.wineName}</Text>
                    <Text style={styles.modalWineMeta}>
                      {consumeLot.producerName} · {consumeLot.vintage ?? 'NV'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Quantity ({consumeLot.quantity} available)</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => setConsumeQty((q) => Math.max(1, q - 1))}
                  >
                    <Text style={styles.qtyButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{consumeQty}</Text>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => setConsumeQty((q) => Math.min(consumeLot.quantity, q + 1))}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Score (0-100, optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={consumeScore}
                  onChangeText={setConsumeScore}
                  placeholder="e.g. 88"
                  placeholderTextColor={colors.muted[400]}
                  keyboardType="number-pad"
                  maxLength={3}
                />

                <Text style={styles.fieldLabel}>Tasting Notes (optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={consumeComment}
                  onChangeText={setConsumeComment}
                  placeholder="Describe the wine..."
                  placeholderTextColor={colors.muted[400]}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.fieldLabel}>Food Pairing (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={consumePairing}
                  onChangeText={setConsumePairing}
                  placeholder="What did you pair it with?"
                  placeholderTextColor={colors.muted[400]}
                />

                {consumeError && (
                  <Text style={styles.consumeErrorText}>{consumeError}</Text>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setConsumeLot(null)}
                    disabled={isConsuming}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, isConsuming && styles.buttonDisabled]}
                    onPress={handleConsume}
                    disabled={isConsuming}
                  >
                    {isConsuming ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.confirmBtnText}>Confirm</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Wine Modal */}
      <AddWineModal
        visible={showAddWineModal}
        onClose={() => setShowAddWineModal(false)}
        onSuccess={() => {
          setShowAddWineModal(false)
          fetchStats() // Refresh stats
        }}
      />

      {/* Pairing Chat Modal */}
      <PairingChatModal
        visible={showPairingModal}
        onClose={() => setShowPairingModal(false)}
      />

      {/* Scan Wine Modal */}
      <ScanWineModal
        visible={showScanModal}
        onClose={() => setShowScanModal(false)}
        onSuccess={() => {
          setShowScanModal(false)
          fetchStats() // Refresh stats
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.muted[50],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muted[50],
    padding: 24,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    backgroundColor: colors.muted[50],
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.muted[900],
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.muted[500],
    marginTop: 4,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: {
    color: colors.muted[600],
    fontSize: 13,
    fontWeight: '600',
  },
  bottleCountCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    alignSelf: 'flex-start',
    minWidth: 160,
  },
  bottleCountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted[500],
  },
  bottleCountValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.muted[900],
    marginTop: 4,
  },

  // Quick Actions
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted[900],
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  quickActionsGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.muted[200],
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted[700],
    textAlign: 'center',
    lineHeight: 16,
  },

  // Charts
  chartCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 12,
  },
  barRow: {
    marginBottom: 10,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 13,
    color: colors.muted[700],
    fontWeight: '500',
    flex: 1,
  },
  barValue: {
    fontSize: 13,
    color: colors.muted[500],
    fontWeight: '600',
    marginLeft: 8,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.muted[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },

  // Search Modal
  searchModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    fontSize: 20,
    color: colors.muted[400],
    padding: 4,
  },
  searchInput: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.muted[900],
  },
  searchResultsList: {
    marginTop: 8,
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[100],
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.muted[900],
  },
  searchResultMeta: {
    fontSize: 13,
    color: colors.muted[500],
    marginTop: 2,
  },
  noResults: {
    padding: 16,
    textAlign: 'center',
    color: colors.muted[500],
    fontSize: 14,
  },

  // Consume Form Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 16,
  },
  modalWineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.muted[50],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  modalWineText: {
    flex: 1,
  },
  modalWineName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
  },
  modalWineMeta: {
    fontSize: 14,
    color: colors.muted[500],
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[700],
    marginBottom: 6,
    marginTop: 12,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muted[50],
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.muted[700],
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
    minWidth: 30,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.muted[900],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  consumeErrorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.muted[700],
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})
