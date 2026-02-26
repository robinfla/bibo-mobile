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
  Modal,
  ActionSheetIOS,
  Platform,
} from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import { WineCardNew } from '../../components/WineCardNew'
import { WishlistTab } from './WishlistTab'
import { HistoryTab } from './HistoryTab'
import type { WineCard, WineCardsResponse } from '../../types/api'

type InventoryTab = 'cellar' | 'wishlist' | 'history'
type ViewMode = 'grid' | 'list'

interface InventoryStackParamList {
  InventoryList: undefined
  WineDetail: { wineId: number }
  AddWine: undefined
  ScanBottle: undefined
}

type NavProp = NativeStackNavigationProp<InventoryStackParamList, 'InventoryList'>

export const InventoryScreen = () => {
  const navigation = useNavigation<NavProp>()

  // UI state
  const [activeTab, setActiveTab] = useState<InventoryTab>('cellar')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Data state
  const [cards, setCards] = useState<WineCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch cards when search changes or tab changes
  useEffect(() => {
    if (activeTab === 'cellar') {
      fetchCards()
    }
  }, [debouncedSearch, activeTab])

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }

      const response = await apiFetch<WineCardsResponse>(`/api/inventory/cards?${params}`)
      setCards(response.cards)
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchCards()
    setRefreshing(false)
  }, [fetchCards])

  const handleCardPress = (wineId: number) => {
    navigation.navigate('WineDetail', { wineId })
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
      {/* Title & View Toggle */}
      <View style={styles.headerTop}>
        <Text style={styles.title}>Inventory</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
          >
            <Icon name="view-grid" size={20} color={viewMode === 'grid' ? colors.primary[600] : colors.neutral[400]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
          >
            <Icon name="view-list" size={20} color={viewMode === 'list' ? colors.primary[600] : colors.neutral[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search wines..."
          placeholderTextColor={colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter-variant" size={20} color={colors.neutral[600]} />
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
          <Icon name="alert-circle" size={48} color={colors.red[500]} />
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
          <Icon name="bottle-wine" size={64} color={colors.neutral[300]} />
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
            viewMode={viewMode}
          />
        )}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render on view mode change
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    )
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      {activeTab === 'cellar' && renderCellarTab()}
      {activeTab === 'wishlist' && <WishlistTab />}
      {activeTab === 'history' && <HistoryTab />}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Filter Modal (placeholder) */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 4,
  },
  viewButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
  },
  viewButtonActive: {
    backgroundColor: colors.primary[50],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[900],
  },
  filterButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red[500],
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary[600],
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral[500],
  },
  tabTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.primary[600],
  },
})
