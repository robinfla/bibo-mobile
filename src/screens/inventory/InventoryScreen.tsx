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
  ScrollView,
  Modal,
} from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { apiFetch, ApiError } from '../../api/client'
import { colors } from '../../theme/colors'
import { WishlistTab } from './WishlistTab'
import { FiltersScreen, type FilterState, type SortOption } from './FiltersScreen'
import type {
  InventoryLot,
  InventoryResponse,
  InventoryFilters,
  InventoryQueryParams,
  InventoryEvent,
  EventsResponse,
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

const PAGE_SIZE = 500

interface FilterOption {
  id: number
  name: string
}

const WINE_COLOR_OPTIONS = ['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified']

type InventoryTab = 'mywines' | 'wishlist' | 'history'

interface EventsByMonth {
  [monthYear: string]: InventoryEvent[]
}

export const InventoryScreen = () => {
  const navigation = useNavigation<NavProp>()

  // Tab state
  const [activeTab, setActiveTab] = useState<InventoryTab>('mywines')

  // My Wines state
  const [lots, setLots] = useState<InventoryLot[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // History state
  const [events, setEvents] = useState<InventoryEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)

  // Tasting notes modal state
  const [editingEvent, setEditingEvent] = useState<InventoryEvent | null>(null)
  const [editScore, setEditScore] = useState('')
  const [editComment, setEditComment] = useState('')
  const [editPairing, setEditPairing] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

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

  // Full-screen filter modal
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>('date')
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(200)

  const currentFilterState: FilterState = {
    sort: sortOption,
    color: selectedColor,
    maturity: maturity || undefined,
    producerId: selectedProducer,
    regionId: selectedRegion,
    cellarId: selectedCellar,
    vintage: selectedVintage,
    priceMin,
    priceMax,
  }

  const hasAnyFilter = selectedProducer !== undefined ||
    selectedRegion !== undefined ||
    selectedColor !== undefined ||
    selectedVintage !== undefined ||
    selectedCellar !== undefined ||
    (maturity !== '') ||
    priceMin > 0 ||
    priceMax < 200

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fetchIdRef = useRef(0)
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

  // Core fetch — accepts explicit overrides so applyFilters can call directly
  const fetchInventoryWithParams = useCallback(async (params: {
    offset: number
    search?: string
    maturity?: string
    producerId?: number
    regionId?: number
    color?: string
    vintage?: number
    cellarId?: number
    priceMin: number
    priceMax: number
    sort: SortOption
  }) => {
    const fetchId = ++fetchIdRef.current
    try {
      const query: InventoryQueryParams = {
        limit: PAGE_SIZE,
        offset: params.offset,
      }
      if (params.search?.trim()) query.search = params.search.trim()
      if (params.maturity) query.maturity = params.maturity
      if (params.producerId) query.producerId = params.producerId
      if (params.regionId) query.regionId = params.regionId
      if (params.color) query.color = params.color
      if (params.vintage) query.vintage = params.vintage
      if (params.cellarId) query.cellarId = params.cellarId

      const data = await apiFetch<InventoryResponse>('/api/inventory', {
        query: query as Record<string, string | number | boolean | undefined>,
      })

      // Ignore stale responses
      if (fetchId !== fetchIdRef.current) return

      // Client-side price filter
      let filtered = data.lots
      if (params.priceMin > 0 || params.priceMax < 200) {
        filtered = filtered.filter(lot => {
          const price = lot.purchasePricePerBottle ? parseFloat(lot.purchasePricePerBottle) : 0
          return price >= params.priceMin && (params.priceMax >= 200 || price <= params.priceMax)
        })
      }

      // Client-side sorting
      if (params.sort === 'price') {
        filtered.sort((a, b) => {
          const pa = a.purchasePricePerBottle ? parseFloat(a.purchasePricePerBottle) : 0
          const pb = b.purchasePricePerBottle ? parseFloat(b.purchasePricePerBottle) : 0
          return pb - pa
        })
      } else if (params.sort === 'maturity') {
        const order: Record<string, number> = { past: 0, declining: 1, peak: 2, ready: 3, approaching: 4, too_early: 5, unknown: 6 }
        filtered.sort((a, b) => (order[a.maturity?.status ?? 'unknown'] ?? 6) - (order[b.maturity?.status ?? 'unknown'] ?? 6))
      }

      setLots(filtered)
      setTotal(filtered.length)
      setError(null)
    } catch (e) {
      if (fetchId !== fetchIdRef.current) return
      const msg = e instanceof ApiError ? e.message : 'Failed to load inventory'
      setError(msg)
    }
  }, [])

  // Convenience wrapper using current state (for loadData/onRefresh)
  const fetchInventory = useCallback(async (currentOffset: number) => {
    await fetchInventoryWithParams({
      offset: currentOffset,
      search: debouncedSearch,
      maturity: maturity || undefined,
      producerId: selectedProducer,
      regionId: selectedRegion,
      color: selectedColor,
      vintage: selectedVintage,
      cellarId: selectedCellar,
      priceMin,
      priceMax,
      sort: sortOption,
    })
  }, [fetchInventoryWithParams, debouncedSearch, maturity, selectedProducer, selectedRegion, selectedColor, selectedVintage, selectedCellar, priceMin, priceMax, sortOption])

  // Apply filters: set state AND directly fetch with the new params
  const applyFilters = (f: FilterState) => {
    setSortOption(f.sort)
    setSelectedColor(f.color)
    setMaturity(f.maturity || '')
    setSelectedProducer(f.producerId)
    setSelectedRegion(f.regionId)
    setSelectedCellar(f.cellarId)
    setSelectedVintage(f.vintage)
    setPriceMin(f.priceMin)
    setPriceMax(f.priceMax)
    setOffset(0)
    setShowFilterModal(false)

    // Directly fetch with the new filter params — don't wait for state propagation
    setIsLoading(true)
    fetchInventoryWithParams({
      offset: 0,
      search: debouncedSearch,
      maturity: f.maturity,
      producerId: f.producerId,
      regionId: f.regionId,
      color: f.color,
      vintage: f.vintage,
      cellarId: f.cellarId,
      priceMin: f.priceMin,
      priceMax: f.priceMax,
      sort: f.sort,
    }).finally(() => setIsLoading(false))
  }

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
    const promises = [fetchInventory(offset), fetchFilters()]
    if (activeTab === 'history') {
      promises.push(fetchEvents())
    }
    await Promise.all(promises)
    setRefreshing(false)
  }, [fetchInventory, fetchFilters, fetchEvents, offset, activeTab])

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

  // History functions
  const fetchEvents = useCallback(async () => {
    if (isLoadingEvents) return
    
    setIsLoadingEvents(true)
    try {
      const data = await apiFetch<EventsResponse>('/api/inventory/events?limit=200')
      setEvents(data.events)
    } catch (e) {
      console.error('Failed to load events:', e)
    } finally {
      setIsLoadingEvents(false)
    }
  }, [isLoadingEvents])

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getMonthYear = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const getEventsByMonth = (): EventsByMonth => {
    const grouped: EventsByMonth = {}
    events.forEach(event => {
      const monthYear = getMonthYear(event.eventDate)
      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push(event)
    })
    
    // Sort events within each month by date (newest first)
    Object.keys(grouped).forEach(monthYear => {
      grouped[monthYear].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    })
    
    return grouped
  }

  const getThisMonthEvents = (eventType: 'purchase' | 'consume'): number => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return events.filter(event => {
      const eventDate = new Date(event.eventDate)
      return event.eventType === eventType && 
             eventDate.getMonth() === currentMonth && 
             eventDate.getFullYear() === currentYear
    }).length
  }

  const openAddNote = (ev: InventoryEvent) => {
    setEditingEvent(ev)
    setEditScore(ev.rating ? String(ev.rating) : '')
    setEditComment(ev.tastingNotes || '')
    setEditPairing(ev.pairing || '')
  }

  const saveNote = async () => {
    if (!editingEvent) return
    setIsSavingNote(true)
    try {
      const scoreNum = parseInt(editScore, 10)
      await apiFetch(`/api/inventory/${editingEvent.lotId}/tasting-notes`, {
        method: 'POST',
        body: {
          score: !isNaN(scoreNum) ? scoreNum : null,
          comment: editComment.trim() || null,
          pairing: editPairing.trim() || null,
        },
      })
      setEditingEvent(null)
      await fetchEvents()
    } catch { /* */ }
    finally { setIsSavingNote(false) }
  }

  // Lazy load events when switching to History tab
  useEffect(() => {
    if (activeTab === 'history' && events.length === 0) {
      fetchEvents()
    }
  }, [activeTab, events.length, fetchEvents])

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

  const renderTabPills = () => (
    <View style={styles.tabRow}>
      {[
        { key: 'mywines' as InventoryTab, label: 'My Wines' },
        { key: 'wishlist' as InventoryTab, label: 'Wishlist' },
        { key: 'history' as InventoryTab, label: 'History' },
      ].map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[styles.tabPill, activeTab === key && styles.tabPillActive]}
          onPress={() => setActiveTab(key)}
        >
          <Text style={[styles.tabPillText, activeTab === key && styles.tabPillTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderWishlistTab = () => (
    <WishlistTab />
  )

  const renderHistoryTab = () => {
    const eventsByMonth = getEventsByMonth()
    const monthYears = Object.keys(eventsByMonth).sort((a, b) => new Date(b + ' 1').getTime() - new Date(a + ' 1').getTime())

    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.historyContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* This month stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Added This Month</Text>
            <Text style={[styles.statValue, { color: colors.primary[600] }]}>
              {getThisMonthEvents('purchase')}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Consumed This Month</Text>
            <Text style={[styles.statValue, { color: colors.muted[700] }]}>
              {getThisMonthEvents('consume')}
            </Text>
          </View>
        </View>

        {/* History */}
        {isLoadingEvents ? (
          <View style={styles.centeredLoading}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        ) : (
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>History</Text>
            {monthYears.length === 0 ? (
              <Text style={styles.emptyText}>No events yet</Text>
            ) : (
              monthYears.map(monthYear => (
                <View key={monthYear}>
                  <Text style={styles.monthHeader}>{monthYear}</Text>
                  {eventsByMonth[monthYear].map(event => {
                    const isExpanded = expandedEvent === event.id
                    const hasDetails = event.eventType === 'consume' && (event.rating || event.tastingNotes || event.pairing)
                    return (
                      <TouchableOpacity
                        key={event.id}
                        style={styles.eventRow}
                        onPress={() => setExpandedEvent(isExpanded ? null : event.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.eventMain}>
                          <View style={styles.eventHeader}>
                            <Text style={styles.eventWine} numberOfLines={1}>
                              {event.wineName} {event.vintage && `(${event.vintage})`}
                            </Text>
                            <View style={[
                              styles.eventBadge,
                              event.eventType === 'purchase' ? styles.eventBadgePurchase : styles.eventBadgeConsume
                            ]}>
                              <Text style={[
                                styles.eventBadgeText,
                                event.eventType === 'purchase' ? styles.eventBadgeTextPurchase : styles.eventBadgeTextConsume
                              ]}>
                                {event.eventType === 'purchase' ? 'Added' : 'Consumed'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.eventProducer}>{event.producerName}</Text>
                          <View style={styles.eventDetails}>
                            <Text style={styles.eventQuantity}>
                              {event.eventType === 'purchase' ? '+' : ''}{event.quantityChange}
                            </Text>
                            <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
                          </View>

                          {/* Collapsed: show rating hint */}
                          {!isExpanded && event.eventType === 'consume' && event.rating != null && event.rating > 0 && (
                            <Text style={styles.eventRating}>⭐ {event.rating}/100 — tap for details</Text>
                          )}
                          {!isExpanded && hasDetails && !(event.rating != null && event.rating > 0) && (
                            <Text style={styles.tapHint}>Tap for tasting notes</Text>
                          )}

                          {/* Expanded: full details */}
                          {isExpanded && event.eventType === 'consume' && (
                            <View style={styles.expandedDetails}>
                              {event.rating != null && event.rating > 0 && (
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Score</Text>
                                  <Text style={styles.detailValueBold}>⭐ {event.rating}/100</Text>
                                </View>
                              )}
                              {event.tastingNotes ? (
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Tasting Notes</Text>
                                  <Text style={styles.detailValue}>{event.tastingNotes}</Text>
                                </View>
                              ) : null}
                              {event.pairing ? (
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Food Pairing</Text>
                                  <Text style={styles.detailValue}>{event.pairing}</Text>
                                </View>
                              ) : null}
                              {!event.rating && !event.tastingNotes && !event.pairing && (
                                <TouchableOpacity style={styles.addNoteButton} onPress={() => openAddNote(event)}>
                                  <Text style={styles.addNoteButtonText}>+ Add tasting notes</Text>
                                </TouchableOpacity>
                              )}
                              {(event.rating || event.tastingNotes || event.pairing) && (
                                <TouchableOpacity style={styles.editNoteLink} onPress={() => openAddNote(event)}>
                                  <Text style={styles.editNoteLinkText}>Edit notes</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    )
  }

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
        <TouchableOpacity
          style={[styles.filterIconBtn, hasAnyFilter && styles.filterIconBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <View style={styles.funnelIcon}>
            <View style={styles.funnelTop} />
            <View style={styles.funnelStem} />
          </View>
          {hasAnyFilter && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

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
      {renderTabPills()}
      
      {activeTab === 'mywines' ? (
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
      ) : activeTab === 'wishlist' ? (
        renderWishlistTab()
      ) : (
        renderHistoryTab()
      )}

      {/* Filter Modal */}
      <FiltersScreen
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={applyFilters}
        currentFilters={currentFilterState}
      />

      {/* Add/Edit Tasting Notes Modal */}
      <Modal visible={!!editingEvent} transparent animationType="slide">
        <TouchableOpacity
          style={styles.noteModalOverlay}
          activeOpacity={1}
          onPress={() => setEditingEvent(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.noteModalContent}>
            <View style={styles.noteModalHeader}>
              <Text style={styles.noteModalTitle}>
                {editingEvent?.rating || editingEvent?.tastingNotes ? 'Edit' : 'Add'} Tasting Notes
              </Text>
              <TouchableOpacity onPress={() => setEditingEvent(null)}>
                <Text style={styles.noteModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {editingEvent && (
              <View style={styles.noteModalWine}>
                <Text style={styles.noteModalWineName}>{editingEvent.wineName}</Text>
                <Text style={styles.noteModalWineMeta}>
                  {editingEvent.producerName} · {editingEvent.vintage ?? 'NV'}
                </Text>
              </View>
            )}

            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.noteLabel}>Score (0-100)</Text>
              <TextInput
                style={styles.noteInput}
                value={editScore}
                onChangeText={setEditScore}
                placeholder="e.g. 88"
                placeholderTextColor={colors.muted[400]}
                keyboardType="number-pad"
                maxLength={3}
              />

              <Text style={styles.noteLabel}>Tasting Notes</Text>
              <TextInput
                style={[styles.noteInput, styles.noteTextArea]}
                value={editComment}
                onChangeText={setEditComment}
                placeholder="Describe the wine..."
                placeholderTextColor={colors.muted[400]}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.noteLabel}>Food Pairing</Text>
              <TextInput
                style={styles.noteInput}
                value={editPairing}
                onChangeText={setEditPairing}
                placeholder="What did you pair it with?"
                placeholderTextColor={colors.muted[400]}
              />
            </ScrollView>

            <View style={styles.noteButtons}>
              <TouchableOpacity style={styles.noteCancelBtn} onPress={() => setEditingEvent(null)}>
                <Text style={styles.noteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.noteSaveBtn, isSavingNote && { opacity: 0.5 }]}
                onPress={saveNote}
                disabled={isSavingNote}
              >
                {isSavingNote ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.noteSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.muted[900],
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.muted[300],
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconBtnActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  funnelIcon: {
    alignItems: 'center',
  },
  funnelTop: {
    width: 22,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.muted[700],
  },
  funnelStem: {
    width: 3,
    height: 8,
    backgroundColor: colors.muted[700],
    marginTop: -1,
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
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

  // Tab pills
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.muted[100],
  },
  tabPillActive: {
    backgroundColor: colors.primary[600],
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[700],
  },
  tabPillTextActive: {
    color: colors.white,
  },

  // Tab content
  tabContent: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.muted[500],
  },
  historyContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // History stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.muted[900],
    marginTop: 4,
  },

  // History content
  centeredLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted[500],
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted[700],
    paddingVertical: 8,
    marginTop: 8,
  },
  eventRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[100],
    paddingVertical: 12,
  },
  eventMain: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventWine: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.muted[900],
    flex: 1,
    marginRight: 8,
  },
  eventProducer: {
    fontSize: 13,
    color: colors.muted[600],
    marginBottom: 4,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventQuantity: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[700],
  },
  eventDate: {
    fontSize: 13,
    color: colors.muted[500],
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  eventBadgePurchase: {
    backgroundColor: '#dcfce7',
  },
  eventBadgeConsume: {
    backgroundColor: '#fee2e2',
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventBadgeTextPurchase: {
    color: '#15803d',
  },
  eventBadgeTextConsume: {
    color: '#dc2626',
  },
  eventRating: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary[600],
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 12,
    color: colors.primary[600],
    marginTop: 6,
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.muted[100],
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: colors.muted[800],
    lineHeight: 20,
  },
  detailValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
  },
  addNoteButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  addNoteButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  editNoteLink: {
    marginTop: 8,
  },
  editNoteLinkText: {
    color: colors.primary[600],
    fontSize: 13,
    fontWeight: '600',
  },

  // Tasting notes modal
  noteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  noteModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  noteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
  },
  noteModalClose: {
    fontSize: 20,
    color: colors.muted[400],
    padding: 4,
  },
  noteModalWine: {
    backgroundColor: colors.muted[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted[200],
    padding: 12,
    marginBottom: 16,
  },
  noteModalWineName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
  },
  noteModalWineMeta: {
    fontSize: 14,
    color: colors.muted[500],
    marginTop: 2,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[700],
    marginBottom: 6,
    marginTop: 12,
  },
  noteInput: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.muted[900],
  },
  noteTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  noteCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  noteCancelText: {
    color: colors.muted[700],
    fontSize: 16,
    fontWeight: '600',
  },
  noteSaveBtn: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  noteSaveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})
