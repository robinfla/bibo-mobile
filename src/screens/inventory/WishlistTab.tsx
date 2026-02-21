import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import type { WishlistItem, CreateWishlistItem, Region } from '../../types/api'

type ItemTypeFilter = '' | 'wine' | 'producer'
type Currency = 'EUR' | 'USD' | 'GBP' | 'ZAR' | 'CHF'

export const WishlistTab = () => {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilter>('')

  // Add modal
  const [showModal, setShowModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [itemType, setItemType] = useState<'wine' | 'producer'>('wine')
  const [name, setName] = useState('')
  const [vintage, setVintage] = useState('')
  const [notes, setNotes] = useState('')
  const [priceTarget, setPriceTarget] = useState('')
  const [priceCurrency, setPriceCurrency] = useState<Currency>('EUR')
  const [url, setUrl] = useState('')
  const [winesOfInterest, setWinesOfInterest] = useState('')
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      const query: Record<string, string> = {}
      if (typeFilter) query.itemType = typeFilter
      const data = await apiFetch<WishlistItem[]>('/api/wishlist', { query })
      setItems(data)
    } catch (e) {
      console.error('Failed to load wishlist:', e)
    }
  }, [typeFilter])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    await fetchItems()
    setIsLoading(false)
  }, [fetchItems])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchItems()
    setRefreshing(false)
  }, [fetchItems])

  useEffect(() => {
    loadData()
  }, [loadData])

  const fetchRegions = useCallback(async () => {
    try {
      const data = await apiFetch<Region[]>('/api/regions')
      setRegions(data)
    } catch {}
  }, [])

  const openModal = () => {
    const defaultType = typeFilter === 'wine' || typeFilter === 'producer' ? typeFilter : 'wine'
    setItemType(defaultType)
    setName('')
    setVintage('')
    setNotes('')
    setPriceTarget('')
    setPriceCurrency('EUR')
    setUrl('')
    setWinesOfInterest('')
    setSelectedRegionId(null)
    fetchRegions()
    setShowModal(true)
  }

  const addItem = async () => {
    if (!name.trim()) return
    setIsAdding(true)
    try {
      const body: CreateWishlistItem = {
        itemType,
        name: name.trim(),
      }
      if (itemType === 'wine') {
        if (vintage) body.vintage = parseInt(vintage, 10) || null
        if (priceTarget) body.priceTarget = priceTarget
        body.priceCurrency = priceCurrency
        if (url.trim()) body.url = url.trim()
      } else {
        if (selectedRegionId) body.regionId = selectedRegionId
        if (winesOfInterest.trim()) body.winesOfInterest = winesOfInterest.trim()
      }
      if (notes.trim()) body.notes = notes.trim()

      await apiFetch('/api/wishlist', { method: 'POST', body: body as unknown as Record<string, unknown> })
      setShowModal(false)
      await fetchItems()
    } catch (e) {
      console.error('Failed to add wishlist item:', e)
    } finally {
      setIsAdding(false)
    }
  }

  const deleteItem = (item: WishlistItem) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/api/wishlist/${item.id}`, { method: 'DELETE' })
              await fetchItems()
            } catch (e) {
              console.error('Failed to delete:', e)
            }
          },
        },
      ],
    )
  }

  const formatCurrency = (value: string | null, currency: string | null) => {
    if (!value) return null
    const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'ZAR' ? 'R' : currency === 'CHF' ? 'CHF ' : '€'
    return `${sym}${Number(value).toLocaleString()}`
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const filtered = items // already filtered server-side by typeFilter

  const TABS: { label: string; value: ItemTypeFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Wines', value: 'wine' },
    { label: 'Producers', value: 'producer' },
  ]

  const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'ZAR', 'CHF']

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.filterTab, typeFilter === tab.value && styles.filterTabActive]}
              onPress={() => setTypeFilter(tab.value)}
            >
              <Text style={[styles.filterTabText, typeFilter === tab.value && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyTitle}>Nothing on your wishlist</Text>
            <Text style={styles.emptySubtitle}>
              {typeFilter ? 'No items match this filter' : 'Add wines or producers you want to try'}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openModal}>
              <Text style={styles.emptyButtonText}>+ Add to Wishlist</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Wishlist cards */
          filtered.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onLongPress={() => deleteItem(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[
                    styles.typeBadge,
                    item.itemType === 'wine' ? styles.typeBadgeWine : styles.typeBadgeProducer,
                  ]}>
                    <Text style={[
                      styles.typeBadgeText,
                      item.itemType === 'wine' ? styles.typeBadgeTextWine : styles.typeBadgeTextProducer,
                    ]}>
                      {item.itemType === 'wine' ? 'Wine' : 'Producer'}
                    </Text>
                  </View>
                  {item.vintage && <Text style={styles.vintageText}>{item.vintage}</Text>}
                  {item.regionName && <Text style={styles.regionText}>{item.regionName}</Text>}
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem(item)}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardName}>{item.name}</Text>

              {item.winesOfInterest && (
                <Text style={styles.cardDetail} numberOfLines={2}>
                  <Text style={styles.cardDetailLabel}>Wines: </Text>
                  {item.winesOfInterest}
                </Text>
              )}

              {item.notes && (
                <Text style={styles.cardDetail} numberOfLines={2}>{item.notes}</Text>
              )}

              <View style={styles.cardFooter}>
                {item.priceTarget && (
                  <Text style={styles.priceText}>
                    {formatCurrency(item.priceTarget, item.priceCurrency)}
                  </Text>
                )}
                {item.url && (
                  <TouchableOpacity onPress={() => Linking.openURL(item.url!)}>
                    <Text style={styles.linkText}>Link ↗</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {filtered.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={openModal}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Wishlist</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Type selector */}
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeRow}>
                {(['wine', 'producer'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, itemType === t && styles.typeBtnActive]}
                    onPress={() => setItemType(t)}
                  >
                    <Text style={[styles.typeBtnText, itemType === t && styles.typeBtnTextActive]}>
                      {t === 'wine' ? '🍷 Wine' : '🏠 Producer'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={itemType === 'wine' ? 'e.g. Châteauneuf-du-Pape' : 'e.g. Domaine de la Romanée-Conti'}
                placeholderTextColor={colors.muted[400]}
              />

              {itemType === 'wine' ? (
                <>
                  <Text style={styles.label}>Vintage (optional)</Text>
                  <TextInput
                    style={[styles.input, { width: 120 }]}
                    value={vintage}
                    onChangeText={setVintage}
                    placeholder="e.g. 2020"
                    placeholderTextColor={colors.muted[400]}
                    keyboardType="number-pad"
                    maxLength={4}
                  />

                  <Text style={styles.label}>Price Target (optional)</Text>
                  <View style={styles.priceRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={priceTarget}
                      onChangeText={setPriceTarget}
                      placeholder="e.g. 50"
                      placeholderTextColor={colors.muted[400]}
                      keyboardType="numeric"
                    />
                    <View style={styles.currencyPicker}>
                      {CURRENCIES.map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[styles.currencyBtn, priceCurrency === c && styles.currencyBtnActive]}
                          onPress={() => setPriceCurrency(c)}
                        >
                          <Text style={[styles.currencyText, priceCurrency === c && styles.currencyTextActive]}>
                            {c}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <Text style={styles.label}>Link (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://..."
                    placeholderTextColor={colors.muted[400]}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Region (optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll}>
                    <View style={styles.regionChips}>
                      {regions.map(r => (
                        <TouchableOpacity
                          key={r.id}
                          style={[styles.regionChip, selectedRegionId === r.id && styles.regionChipActive]}
                          onPress={() => setSelectedRegionId(selectedRegionId === r.id ? null : r.id)}
                        >
                          <Text style={[styles.regionChipText, selectedRegionId === r.id && styles.regionChipTextActive]}>
                            {r.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <Text style={styles.label}>Wines of Interest (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={winesOfInterest}
                    onChangeText={setWinesOfInterest}
                    placeholder="e.g. Grand Cru, Les Suchots"
                    placeholderTextColor={colors.muted[400]}
                  />
                </>
              )}

              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                placeholder={itemType === 'wine' ? 'Why do you want this wine?' : 'What interests you about this producer?'}
                placeholderTextColor={colors.muted[400]}
                multiline
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!name.trim() || isAdding) && { opacity: 0.5 }]}
                onPress={addItem}
                disabled={!name.trim() || isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.saveText}>Add</Text>
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
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 80 },

  // Filter tabs
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.muted[100],
  },
  filterTabActive: { backgroundColor: colors.primary[600] },
  filterTabText: { fontSize: 14, fontWeight: '600', color: colors.muted[700] },
  filterTabTextActive: { color: colors.white },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, color: colors.muted[300], marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.muted[700], marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: colors.muted[500], textAlign: 'center', marginBottom: 16 },
  emptyButton: {
    backgroundColor: colors.primary[600], borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  emptyButtonText: { color: colors.white, fontSize: 15, fontWeight: '600' },

  // Cards
  card: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.muted[200],
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  typeBadgeWine: { backgroundColor: '#fef3c7' },
  typeBadgeProducer: { backgroundColor: '#f3e8ff' },
  typeBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  typeBadgeTextWine: { color: '#92400e' },
  typeBadgeTextProducer: { color: '#7c3aed' },
  vintageText: { fontSize: 13, color: colors.muted[500] },
  regionText: { fontSize: 13, color: colors.muted[500] },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 16, color: colors.muted[400] },
  cardName: { fontSize: 16, fontWeight: '700', color: colors.muted[900], marginBottom: 4 },
  cardDetail: { fontSize: 13, color: colors.muted[600], marginBottom: 4 },
  cardDetailLabel: { fontWeight: '600', color: colors.muted[500] },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.muted[100],
  },
  priceText: { fontSize: 14, fontWeight: '700', color: colors.muted[700] },
  linkText: { fontSize: 13, fontWeight: '600', color: colors.primary[600] },
  dateText: { fontSize: 12, color: colors.muted[400], marginLeft: 'auto' },

  // FAB
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary[600],
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  fabText: { fontSize: 28, color: colors.white, lineHeight: 30 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.muted[900] },
  modalClose: { fontSize: 20, color: colors.muted[400], padding: 4 },

  label: { fontSize: 13, fontWeight: '600', color: colors.muted[700], marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.muted[50], borderWidth: 1, borderColor: colors.muted[300],
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: colors.muted[900],
  },

  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: colors.muted[300], alignItems: 'center',
  },
  typeBtnActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: colors.muted[600] },
  typeBtnTextActive: { color: colors.primary[700] },

  priceRow: { gap: 8 },
  currencyPicker: { flexDirection: 'row', gap: 6, marginTop: 6 },
  currencyBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: colors.muted[300],
  },
  currencyBtnActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  currencyText: { fontSize: 12, fontWeight: '600', color: colors.muted[600] },
  currencyTextActive: { color: colors.primary[700] },

  regionScroll: { maxHeight: 44, marginBottom: 4 },
  regionChips: { flexDirection: 'row', gap: 6 },
  regionChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: colors.muted[300], backgroundColor: colors.muted[50],
  },
  regionChipActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  regionChipText: { fontSize: 12, fontWeight: '500', color: colors.muted[600] },
  regionChipTextActive: { color: colors.primary[700] },

  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: colors.muted[300],
    borderRadius: 8, paddingVertical: 14, alignItems: 'center',
  },
  cancelText: { color: colors.muted[700], fontSize: 16, fontWeight: '600' },
  saveBtn: {
    flex: 1, backgroundColor: colors.primary[600],
    borderRadius: 8, paddingVertical: 14, alignItems: 'center',
  },
  saveText: { color: colors.white, fontSize: 16, fontWeight: '600' },
})
