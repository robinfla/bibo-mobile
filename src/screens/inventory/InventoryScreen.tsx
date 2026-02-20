import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { apiFetch, ApiError } from '../../api/client'
import { colors } from '../../theme/colors'
import type {
  InventoryLot,
  InventoryResponse,
  InventoryFilters,
  InventoryQueryParams,
} from '../../types/api'

type InventoryStackParamList = {
  InventoryList: undefined
  InventoryDetail: { lot: InventoryLot }
}

type NavProp = NativeStackNavigationProp<InventoryStackParamList, 'InventoryList'>

const WINE_COLORS: Record<string, string> = {
  red: '#ef4444',
  white: '#fcd34d',
  rose: '#f472b6',
  rosé: '#f472b6',
  sparkling: '#facc15',
  dessert: '#fb923c',
  fortified: '#a855f7',
}

const getWineColor = (color: string): string =>
  WINE_COLORS[color.toLowerCase()] ?? colors.muted[400]

const MATURITY_TABS = [
  { label: 'All', value: '' },
  { label: 'Ready', value: 'ready' },
  { label: 'Past Prime', value: 'past' },
  { label: 'To Age', value: 'young' },
] as const

const PAGE_SIZE = 50

interface FilterOption {
  id: number
  name: string
}

const WINE_COLOR_OPTIONS = ['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified']

export const InventoryScreen = () => {
  const navigation = useNavigation<NavProp>()

  const [lots, setLots] = useState<InventoryLot[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')
  const [maturity, setMaturity] = useState('')
  const [offset, setOffset] = useState(0)

  const [filters, setFilters] = useState<InventoryFilters | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProducer, setSelectedProducer] = useState<number | undefined>(undefined)
  const [selectedRegion, setSelectedRegion] = useState<number | undefined>(undefined)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)
  const [selectedVintage, setSelectedVintage] = useState<number | undefined>(undefined)
  const [selectedCellar, setSelectedCellar] = useState<number | undefined>(undefined)

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0)
    }, 300)
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [search])

  const fetchInventory = useCallback(async (currentOffset: number) => {
    try {
      const query: InventoryQueryParams = {
        limit: PAGE_SIZE,
        offset: currentOffset,
      }
      if (debouncedSearch.trim()) query.search = debouncedSearch.trim()
      if (maturity) query.maturity = maturity
      if (selectedProducer) query.producerId = selectedProducer
      if (selectedRegion) query.regionId = selectedRegion
      if (selectedColor) query.color = selectedColor
      if (selectedVintage) query.vintage = selectedVintage
      if (selectedCellar) query.cellarId = selectedCellar

      const data = await apiFetch<InventoryResponse>('/api/inventory', {
        query: query as Record<string, string | number | boolean | undefined>,
      })
      setLots(data.lots)
      setTotal(data.total)
      setError(null)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load inventory'
      setError(msg)
    }
  }, [debouncedSearch, maturity, selectedProducer, selectedRegion, selectedColor, selectedVintage, selectedCellar])

  const fetchFilters = useCallback(async () => {
    try {
      const data = await apiFetch<InventoryFilters>('/api/inventory/filters')
      setFilters(data)
    } catch {
    }
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchInventory(offset), fetchFilters()])
    setIsLoading(false)
  }, [fetchInventory, fetchFilters, offset])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([fetchInventory(offset), fetchFilters()])
    setRefreshing(false)
  }, [fetchInventory, fetchFilters, offset])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMaturityChange = useCallback((value: string) => {
    setMaturity(value)
    setOffset(0)
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedProducer(undefined)
    setSelectedRegion(undefined)
    setSelectedColor(undefined)
    setSelectedVintage(undefined)
    setSelectedCellar(undefined)
    setOffset(0)
  }, [])

  const hasActiveFilters = selectedProducer !== undefined ||
    selectedRegion !== undefined ||
    selectedColor !== undefined ||
    selectedVintage !== undefined ||
    selectedCellar !== undefined

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  const goNext = useCallback(() => {
    const newOffset = offset + PAGE_SIZE
    if (newOffset < total) setOffset(newOffset)
  }, [offset, total])

  const goPrev = useCallback(() => {
    const newOffset = Math.max(0, offset - PAGE_SIZE)
    setOffset(newOffset)
  }, [offset])

  const renderFilterDropdown = (
    label: string,
    options: FilterOption[],
    selected: number | undefined,
    onSelect: (id: number | undefined) => void,
  ) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterChips}>
        {selected !== undefined && (
          <TouchableOpacity
            style={styles.clearChip}
            onPress={() => { onSelect(undefined); setOffset(0) }}
          >
            <Text style={styles.clearChipText}>✕ Clear</Text>
          </TouchableOpacity>
        )}
        {options.map(({ id, name }) => (
          <TouchableOpacity
            key={id}
            style={[styles.filterChip, selected === id && styles.filterChipActive]}
            onPress={() => { onSelect(selected === id ? undefined : id); setOffset(0) }}
          >
            <Text style={[styles.filterChipText, selected === id && styles.filterChipTextActive]}>
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderLot = useCallback(({ item }: { item: InventoryLot }) => (
    <TouchableOpacity
      style={styles.lotCard}
      onPress={() => navigation.navigate('InventoryDetail', { lot: item })}
      activeOpacity={0.7}
    >
      <View style={[styles.colorDot, { backgroundColor: getWineColor(item.wineColor) }]} />
      <View style={styles.lotInfo}>
        <Text style={styles.lotName} numberOfLines={1}>{item.wineName}</Text>
        <Text style={styles.lotMeta}>
          {item.producerName} · {item.vintage ?? 'NV'}
        </Text>
      </View>
      <View style={styles.lotRight}>
        <Text style={styles.lotQty}>{item.quantity}</Text>
        <Text style={styles.lotQtyLabel}>btl</Text>
      </View>
    </TouchableOpacity>
  ), [navigation])

  const keyExtractor = useCallback((item: InventoryLot) => String(item.id), [])

  const ListHeader = (
    <>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search wines..."
          placeholderTextColor={colors.muted[400]}
        />
      </View>

      <View style={styles.maturityTabs}>
        {MATURITY_TABS.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[styles.maturityTab, maturity === value && styles.maturityTabActive]}
            onPress={() => handleMaturityChange(value)}
          >
            <Text style={[styles.maturityTabText, maturity === value && styles.maturityTabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters((v) => !v)}
      >
        <Text style={styles.filterToggleText}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters ? ' (active)' : ''}
        </Text>
      </TouchableOpacity>

      {showFilters && filters && (
        <View style={styles.filtersContainer}>
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
              <Text style={styles.clearAllText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}

          {renderFilterDropdown('Producer', filters.producers, selectedProducer, setSelectedProducer)}
          {renderFilterDropdown('Region', filters.regions, selectedRegion, setSelectedRegion)}

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Color</Text>
            <View style={styles.filterChips}>
              {selectedColor !== undefined && (
                <TouchableOpacity
                  style={styles.clearChip}
                  onPress={() => { setSelectedColor(undefined); setOffset(0) }}
                >
                  <Text style={styles.clearChipText}>✕ Clear</Text>
                </TouchableOpacity>
              )}
              {WINE_COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.filterChip, selectedColor === c && styles.filterChipActive]}
                  onPress={() => { setSelectedColor(selectedColor === c ? undefined : c); setOffset(0) }}
                >
                  <View style={[styles.miniDot, { backgroundColor: getWineColor(c) }]} />
                  <Text style={[styles.filterChipText, selectedColor === c && styles.filterChipTextActive]}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Vintage</Text>
            <View style={styles.filterChips}>
              {selectedVintage !== undefined && (
                <TouchableOpacity
                  style={styles.clearChip}
                  onPress={() => { setSelectedVintage(undefined); setOffset(0) }}
                >
                  <Text style={styles.clearChipText}>✕ Clear</Text>
                </TouchableOpacity>
              )}
              {filters.vintages.slice(0, 10).map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.filterChip, selectedVintage === v && styles.filterChipActive]}
                  onPress={() => { setSelectedVintage(selectedVintage === v ? undefined : v); setOffset(0) }}
                >
                  <Text style={[styles.filterChipText, selectedVintage === v && styles.filterChipTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {renderFilterDropdown('Cellar', filters.cellars, selectedCellar, setSelectedCellar)}
        </View>
      )}

      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>{total} lot{total !== 1 ? 's' : ''} found</Text>
      </View>
    </>
  )

  const ListFooter = totalPages > 1 ? (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageButton, currentPage <= 1 && styles.pageButtonDisabled]}
        onPress={goPrev}
        disabled={currentPage <= 1}
      >
        <Text style={[styles.pageButtonText, currentPage <= 1 && styles.pageButtonTextDisabled]}>
          ← Prev
        </Text>
      </TouchableOpacity>
      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity
        style={[styles.pageButton, currentPage >= totalPages && styles.pageButtonDisabled]}
        onPress={goNext}
        disabled={currentPage >= totalPages}
      >
        <Text style={[styles.pageButtonText, currentPage >= totalPages && styles.pageButtonTextDisabled]}>
          Next →
        </Text>
      </TouchableOpacity>
    </View>
  ) : null

  const ListEmpty = !isLoading ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No wines found</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
    </View>
  ) : null

  if (isLoading && lots.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    )
  }

  if (error && lots.length === 0) {
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
      <FlatList
        data={lots}
        renderItem={renderLot}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.muted[50],
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchRow: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.muted[900],
  },
  maturityTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  maturityTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[300],
    backgroundColor: colors.white,
  },
  maturityTabActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  maturityTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[600],
  },
  maturityTabTextActive: {
    color: colors.white,
  },
  filterToggle: {
    marginBottom: 12,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  clearAllButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  clearAllText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[700],
    marginBottom: 6,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.muted[300],
    backgroundColor: colors.muted[50],
  },
  filterChipActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  filterChipText: {
    fontSize: 12,
    color: colors.muted[600],
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary[700],
  },
  clearChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.muted[100],
  },
  clearChipText: {
    fontSize: 12,
    color: colors.muted[500],
    fontWeight: '500',
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  resultCount: {
    marginBottom: 8,
  },
  resultCountText: {
    fontSize: 13,
    color: colors.muted[500],
    fontWeight: '500',
  },
  lotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  lotInfo: {
    flex: 1,
  },
  lotName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.muted[900],
  },
  lotMeta: {
    fontSize: 13,
    color: colors.muted[500],
    marginTop: 2,
  },
  lotRight: {
    alignItems: 'center',
    marginLeft: 12,
  },
  lotQty: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted[900],
  },
  lotQtyLabel: {
    fontSize: 11,
    color: colors.muted[400],
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.muted[200],
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[300],
    backgroundColor: colors.white,
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[700],
  },
  pageButtonTextDisabled: {
    color: colors.muted[400],
  },
  pageInfo: {
    fontSize: 13,
    color: colors.muted[500],
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted[700],
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.muted[500],
  },
})
