import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import type { InventoryFilters, InventoryResponse } from '../../types/api'

export type SortOption = 'date' | 'maturity' | 'value' | 'price'

export interface FilterState {
  sort: SortOption
  color?: string
  maturity?: string
  producerId?: number
  regionId?: number
  cellarId?: number
  vintage?: number
  priceMin: number
  priceMax: number
}

interface FiltersScreenProps {
  visible: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  currentFilters: FilterState
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'date', label: 'Date added', icon: '📅' },
  { value: 'maturity', label: 'Aging phase', icon: '⏳' },
  { value: 'value', label: 'Market value', icon: '💰' },
  { value: 'price', label: 'Purchase price', icon: '🛒' },
]

const WINE_COLORS = [
  { value: 'red', label: 'Red' },
  { value: 'white', label: 'White' },
  { value: 'rose', label: 'Rosé' },
  { value: 'orange', label: 'Orange' },
  { value: 'sparkling', label: 'Sparkling' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'fortified', label: 'Fortified' },
]

const MATURITY_OPTIONS = [
  { value: 'young', label: 'Youth' },
  { value: 'peak', label: 'Peak' },
  { value: 'past_prime', label: 'Past Prime' },
]

const PRICE_MIN = 0
const PRICE_MAX = 200

export const FiltersScreen = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}: FiltersScreenProps) => {
  const [sort, setSort] = useState<SortOption>(currentFilters.sort)
  const [color, setColor] = useState<string | undefined>(currentFilters.color)
  const [maturity, setMaturity] = useState<string | undefined>(currentFilters.maturity)
  const [producerId, setProducerId] = useState<number | undefined>(currentFilters.producerId)
  const [regionId, setRegionId] = useState<number | undefined>(currentFilters.regionId)
  const [cellarId, setCellarId] = useState<number | undefined>(currentFilters.cellarId)
  const [vintage, setVintage] = useState<number | undefined>(currentFilters.vintage)
  const [priceMin, setPriceMin] = useState(currentFilters.priceMin)
  const [priceMax, setPriceMax] = useState(currentFilters.priceMax)

  const [filterOptions, setFilterOptions] = useState<InventoryFilters | null>(null)
  const [matchCount, setMatchCount] = useState<number | null>(null)
  const [counting, setCounting] = useState(false)

  // Expanded dropdowns
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      setSort(currentFilters.sort)
      setColor(currentFilters.color)
      setMaturity(currentFilters.maturity)
      setProducerId(currentFilters.producerId)
      setRegionId(currentFilters.regionId)
      setCellarId(currentFilters.cellarId)
      setVintage(currentFilters.vintage)
      setPriceMin(currentFilters.priceMin)
      setPriceMax(currentFilters.priceMax)
      setExpandedSection(null)
      fetchFilterOptions()
    }
  }, [visible])

  // Live count: fetch matching count when filters change
  useEffect(() => {
    if (!visible) return
    const timeout = setTimeout(() => fetchCount(), 300)
    return () => clearTimeout(timeout)
  }, [visible, color, maturity, producerId, regionId, cellarId, vintage, priceMin, priceMax])

  const fetchFilterOptions = useCallback(async () => {
    try {
      const data = await apiFetch<InventoryFilters>('/api/inventory/filters')
      setFilterOptions(data)
    } catch {}
  }, [])

  const fetchCount = useCallback(async () => {
    setCounting(true)
    try {
      const query: Record<string, string | number | boolean | undefined> = { limit: 500, offset: 0 }
      if (color) query.color = color
      if (maturity) query.maturity = maturity
      if (producerId) query.producerId = producerId
      if (regionId) query.regionId = regionId
      if (cellarId) query.cellarId = cellarId
      if (vintage) query.vintage = vintage

      const data = await apiFetch<InventoryResponse>('/api/inventory', { query })
      let count = data.total

      // Client-side price filter for count
      if (priceMin > 0 || priceMax < 200) {
        const filtered = data.lots.filter(lot => {
          const price = lot.purchasePricePerBottle ? parseFloat(lot.purchasePricePerBottle) : 0
          return price >= priceMin && (priceMax >= 200 || price <= priceMax)
        })
        count = filtered.length
      }

      setMatchCount(count)
    } catch {
      setMatchCount(null)
    } finally {
      setCounting(false)
    }
  }, [color, maturity, producerId, regionId, cellarId, vintage, priceMin, priceMax])

  const handleApply = () => {
    onApply({ sort, color, maturity, producerId, regionId, cellarId, vintage, priceMin, priceMax })
  }

  const handleReset = () => {
    setSort('date')
    setColor(undefined)
    setMaturity(undefined)
    setProducerId(undefined)
    setRegionId(undefined)
    setCellarId(undefined)
    setVintage(undefined)
    setPriceMin(PRICE_MIN)
    setPriceMax(PRICE_MAX)
  }

  const toggleChip = <T,>(current: T | undefined, value: T): T | undefined =>
    current === value ? undefined : value

  const toggleSection = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section)

  const getSelectedLabel = (
    options: { id: number; name: string }[],
    selectedId: number | undefined,
    placeholder: string,
  ) => {
    if (!selectedId) return placeholder
    return options.find(o => o.id === selectedId)?.name ?? placeholder
  }

  const renderChips = <T extends string | number>(
    options: { value: T; label: string }[],
    selected: T | undefined,
    onSelect: (v: T | undefined) => void,
  ) => (
    <View style={styles.chipRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={String(opt.value)}
          style={[styles.chip, selected === opt.value && styles.chipActive]}
          onPress={() => onSelect(toggleChip(selected, opt.value))}
        >
          <Text style={[styles.chipText, selected === opt.value && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderDropdown = (
    sectionKey: string,
    label: string,
    emoji: string,
    options: { id: number; name: string }[],
    selected: number | undefined,
    onSelect: (v: number | undefined) => void,
    placeholder: string,
  ) => {
    const isOpen = expandedSection === sectionKey
    const selectedLabel = getSelectedLabel(options, selected, placeholder)
    const isActive = selected !== undefined

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{emoji} {label}</Text>
        <TouchableOpacity
          style={[styles.dropdown, isActive && styles.dropdownActive]}
          onPress={() => toggleSection(sectionKey)}
        >
          <Text style={[styles.dropdownText, isActive && styles.dropdownTextActive]}>
            {selectedLabel}
          </Text>
          <Text style={styles.dropdownArrow}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.dropdownList}>
            {isActive && (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { onSelect(undefined); setExpandedSection(null) }}
              >
                <Text style={styles.dropdownItemClear}>✕ Clear</Text>
              </TouchableOpacity>
            )}
            {options.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.dropdownItem, selected === opt.id && styles.dropdownItemActive]}
                onPress={() => { onSelect(selected === opt.id ? undefined : opt.id); setExpandedSection(null) }}
              >
                <Text style={[styles.dropdownItemText, selected === opt.id && styles.dropdownItemTextActive]}>
                  {opt.name}
                </Text>
                {selected === opt.id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filters & Sort</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Sort by */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📁 Sort by</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sortRow, sort === opt.value && styles.sortRowActive]}
                onPress={() => setSort(opt.value)}
              >
                <Text style={styles.sortIcon}>{opt.icon}</Text>
                <Text style={[styles.sortLabel, sort === opt.value && styles.sortLabelActive]}>
                  {opt.label}
                </Text>
                {sort === opt.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Wine Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍷 Wine Type</Text>
            {renderChips(WINE_COLORS, color, setColor)}
          </View>

          {/* Aging Phase */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍾 Aging Phase</Text>
            {renderChips(MATURITY_OPTIONS, maturity, setMaturity)}
          </View>

          {/* Purchase Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💸 Purchase price (EUR)</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderValue}>€{priceMin}</Text>
                <Text style={styles.sliderValue}>€{priceMax}{priceMax >= PRICE_MAX ? '+' : ''}</Text>
              </View>
              <Text style={styles.sliderHint}>Min price</Text>
              <Slider
                minimumValue={PRICE_MIN}
                maximumValue={PRICE_MAX}
                step={5}
                value={priceMin}
                onValueChange={v => {
                  const rounded = Math.round(v / 5) * 5
                  if (rounded < priceMax) setPriceMin(rounded)
                }}
                minimumTrackTintColor={colors.primary[500]}
                maximumTrackTintColor={colors.muted[200]}
                thumbTintColor={colors.primary[600]}
              />
              <Text style={styles.sliderHint}>Max price</Text>
              <Slider
                minimumValue={PRICE_MIN}
                maximumValue={PRICE_MAX}
                step={5}
                value={priceMax}
                onValueChange={v => {
                  const rounded = Math.round(v / 5) * 5
                  if (rounded > priceMin) setPriceMax(rounded)
                }}
                minimumTrackTintColor={colors.primary[500]}
                maximumTrackTintColor={colors.muted[200]}
                thumbTintColor={colors.primary[600]}
              />
            </View>
          </View>

          {/* Region — dropdown */}
          {filterOptions && filterOptions.regions.length > 0 &&
            renderDropdown('region', 'Region', '🌍', filterOptions.regions, regionId, setRegionId, 'All regions')}

          {/* Cellar — dropdown */}
          {filterOptions && filterOptions.cellars.length > 0 &&
            renderDropdown('cellar', 'Cellar', '🔍', filterOptions.cellars, cellarId, setCellarId, 'All cellars')}

          {/* Producer — dropdown */}
          {filterOptions && filterOptions.producers.length > 0 &&
            renderDropdown('producer', 'Producer', '🏠', filterOptions.producers, producerId, setProducerId, 'All producers')}

          {/* Vintage — dropdown */}
          {filterOptions && filterOptions.vintages.length > 0 &&
            renderDropdown(
              'vintage', 'Vintage', '📆',
              filterOptions.vintages.map(v => ({ id: v, name: String(v) })),
              vintage, setVintage, 'All vintages',
            )}

          {/* Reset link */}
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>Reset all filters</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Sticky CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleApply}>
            {counting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.ctaText}>
                {matchCount !== null
                  ? `See the ${matchCount} bottle${matchCount !== 1 ? 's' : ''}`
                  : 'Apply filters'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.muted[100],
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.muted[900] },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: colors.muted[300],
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, color: colors.muted[600] },

  scroll: { flex: 1 },
  scrollContent: { padding: 20 },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.muted[900], marginBottom: 12 },

  // Sort options
  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 10, marginBottom: 4,
  },
  sortRowActive: { backgroundColor: '#fef3e2' },
  sortIcon: { fontSize: 16, marginRight: 10 },
  sortLabel: { fontSize: 15, color: colors.muted[500], flex: 1 },
  sortLabelActive: { color: colors.muted[900], fontWeight: '600' },
  checkmark: { fontSize: 16, color: colors.primary[600], fontWeight: '700' },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: colors.muted[300],
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary[50], borderColor: colors.primary[500],
  },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.muted[700] },
  chipTextActive: { color: colors.primary[700], fontWeight: '600' },

  // Slider
  sliderContainer: { marginTop: 4 },
  sliderLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4,
  },
  sliderValue: {
    fontSize: 15, fontWeight: '700', color: colors.primary[600],
  },
  sliderHint: {
    fontSize: 12, color: colors.muted[500], marginBottom: 2, marginTop: 8,
  },

  // Dropdown
  dropdown: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.muted[50], borderWidth: 1, borderColor: colors.muted[300],
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  dropdownActive: {
    borderColor: colors.primary[500], backgroundColor: colors.primary[50],
  },
  dropdownText: { fontSize: 15, color: colors.muted[500] },
  dropdownTextActive: { color: colors.primary[700], fontWeight: '600' },
  dropdownArrow: { fontSize: 12, color: colors.muted[400] },
  dropdownList: {
    marginTop: 6, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.muted[200], borderRadius: 10,
    maxHeight: 250, overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: colors.muted[50],
  },
  dropdownItemActive: { backgroundColor: colors.primary[50] },
  dropdownItemText: { fontSize: 14, color: colors.muted[700] },
  dropdownItemTextActive: { color: colors.primary[700], fontWeight: '600' },
  dropdownItemClear: { fontSize: 14, color: colors.muted[500], fontWeight: '600' },

  // Reset
  resetBtn: { alignSelf: 'center', paddingVertical: 12 },
  resetText: { fontSize: 14, fontWeight: '600', color: colors.muted[500] },

  // CTA
  ctaContainer: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.muted[100],
  },
  ctaButton: {
    backgroundColor: '#b4702a',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: colors.white, fontSize: 17, fontWeight: '700' },
})
