import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ActionSheetIOS,
  Platform,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import { WineCardNew } from '../../components/WineCardNew'
import { WishlistTabNew } from './WishlistTabNew'
import { HistoryTab } from './HistoryTab'
import { FiltersScreen, type FilterState } from './FiltersScreen'
import type { WineCard, WineCardsResponse } from '../../types/api'

type InventoryTab = 'cellar' | 'wishlist' | 'history'

export const InventoryScreen = ({ route }: any) => {
  const navigation = useNavigation<any>()

  // UI state
  const [activeTab, setActiveTab] = useState<InventoryTab>(route?.params?.tab || 'cellar')
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Data state
  const [cards, setCards] = useState<WineCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    sort: 'date',
    priceMin: 0,
    priceMax: 200,
  })
  
  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.color ||
    filters.maturity ||
    filters.producerId ||
    filters.regionId ||
    filters.cellarId ||
    filters.vintage ||
    filters.priceMin > 0 ||
    filters.priceMax < 200
  )

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update active tab when route params change
  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab)
    }
  }, [route?.params?.tab])

  // Update filters when route params change
  useEffect(() => {
    if (route?.params?.filter) {
      setFilters((prev) => ({
        ...prev,
        ...route.params.filter,
      }))
    }
  }, [route?.params?.filter])

  // Fetch cards when search/filters change or tab changes
  useEffect(() => {
    if (activeTab === 'cellar') {
      fetchCards()
    }
  }, [debouncedSearch, filters, activeTab])

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }
      if (filters.color) {
        params.append('color', filters.color)
      }
      if (filters.cellarId) {
        params.append('cellarId', String(filters.cellarId))
      }
      if (filters.maturity) {
        params.append('maturity', filters.maturity)
      }

      const response = await apiFetch<WineCardsResponse>(`/api/inventory/cards?${params}`)
      setCards(response.cards)
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, filters])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchCards()
    setRefreshing(false)
  }, [fetchCards])

  const handleCardPress = (wineId: number) => {
    navigation.navigate('WineDetail', { wineId })
  }

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
    setShowFilterModal(false)
  }

  const handleFabPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Add Manually', 'Scan Bottle', 'Quick Log'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            navigation.navigate('AddWine')
          } else if (buttonIndex === 2) {
            navigation.navigate('ScanBottle')
          } else if (buttonIndex === 3) {
            // TODO: Implement quick log
          }
        },
      )
    } else {
      // Android: show custom modal
      // For now, just navigate to add wine
      navigation.navigate('AddWine')
    }
  }

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title with Back Button */}
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={28} color="#722F37" />
        </TouchableOpacity>
        <Text style={styles.title}>My Wines</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.muted[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search wines..."
          placeholderTextColor={colors.muted[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter-variant" size={20} color={colors.muted[600]} />
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cellar' && styles.tabActive]}
          onPress={() => setActiveTab('cellar')}
        >
          <Text style={[styles.tabText, activeTab === 'cellar' && styles.tabTextActive]}>
            Cellar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'wishlist' && styles.tabActive]}
          onPress={() => setActiveTab('wishlist')}
        >
          <Text style={[styles.tabText, activeTab === 'wishlist' && styles.tabTextActive]}>
            Wishlist
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderCellarTab = () => {
    if (isLoading && !refreshing) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Icon name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCards}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (cards.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Icon name="bottle-wine" size={64} color={colors.muted[300]} />
          <Text style={styles.emptyText}>No wines in your cellar yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first bottle</Text>
        </View>
      )
    }

    return (
      <FlatList
        data={cards}
        keyExtractor={(item) => `${item.wineId}`}
        renderItem={({ item }) => (
          <WineCardNew
            card={item}
            onPress={() => handleCardPress(item.wineId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {activeTab === 'cellar' && renderCellarTab()}
      {activeTab === 'wishlist' && <WishlistTabNew />}
      {activeTab === 'history' && <HistoryTab />}

      {/* FAB - Only show on cellar tab */}
      {activeTab === 'cellar' && (
        <TouchableOpacity style={styles.fabContainer} onPress={handleFabPress} activeOpacity={0.8}>
          <LinearGradient
            colors={['#8b4d5a', '#722F37']}
            style={styles.fab}
          >
            <Text style={styles.fabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <FiltersScreen
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5', // Warm gradient background (can be enhanced with LinearGradient)
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.3)',
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#722F37',
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(228, 213, 203, 0.3)',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginRight: 24,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#722F37',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#722F37',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.muted[600],
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#722F37',
    borderRadius: 14,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22.5,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  fab: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 26,
    fontWeight: '300',
    color: '#fff',
  },
})
