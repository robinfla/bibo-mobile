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
  SafeAreaView,
} from 'react-native'
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
    filters.priceMax < 200 ||
    filters.lotIds
  )

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update active tab and filters when route params change
  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab)
    }

    if (route?.params?.filter) {
      console.log('Applying route filter:', route.params.filter)
      setFilters((prev) => {
        const newFilters = {
          ...prev,
          ...route.params.filter,
        }
        console.log('New filters state:', newFilters)
        return newFilters
      })
    }
  }, [route?.params])

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
      if (filters.lotIds && filters.lotIds.length > 0) {
        params.append('lotIds', filters.lotIds.join(','))
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

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title */}
      <View style={styles.headerTop}>
        <Text style={styles.title}>My Cellar</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search wines..."
          placeholderTextColor={colors.textTertiary}
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

      {/* Active Filter Indicators */}
      {(filters.maturity || filters.label) && (
        <View style={styles.filterChipContainer}>
          {filters.maturity && (
            <View style={styles.filterChip}>
              <Icon name="filter-check" size={16} color={colors.coral} />
              <Text style={styles.filterChipText}>Ready to drink</Text>
              <TouchableOpacity
                onPress={() => setFilters((prev) => ({ ...prev, maturity: undefined }))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close-circle" size={18} color={colors.coral} />
              </TouchableOpacity>
            </View>
          )}
          {filters.label && (
            <View style={styles.filterChip}>
              <Icon name="filter-check" size={16} color={colors.coral} />
              <Text style={styles.filterChipText}>{filters.label}</Text>
              <TouchableOpacity
                onPress={() => setFilters((prev) => ({ ...prev, lotIds: undefined, label: undefined }))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close-circle" size={18} color={colors.coral} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

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
          <ActivityIndicator size="large" color={colors.coral} />
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
    backgroundColor: colors.linen,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.3)',
    paddingTop: 8,
  },
  headerTop: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.muted[200],
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.coral,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 32,
  },
  tab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.coral,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'NunitoSans_500Medium',
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.coral,
    fontFamily: 'NunitoSans_600SemiBold',
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
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.coral,
    borderRadius: 16,
    shadowColor: colors.coralShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22.5,
  },
  filterChipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.coral,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.coral,
  },
})
