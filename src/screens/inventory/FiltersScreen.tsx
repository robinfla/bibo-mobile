import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import type { InventoryFilters } from '../../types/api'

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
  matchCount: number
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
  { value: 'ready', label: 'Ready' },
  { value: 'past', label: 'Past Prime' },
]

const PRICE_MIN = 0
const PRICE_MAX = 200

export const FiltersScreen = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  matchCount,
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

  const [filters, setFilters] = useState<InventoryFilters | null>(null)

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
      fetchFilters()
    }
  }, [visible])

  const fetchFilters = useCallback(async () => {
    try {
      const data = await apiFetch<InventoryFilters>('/api/inventory/filters')
      setFilters(data)
    } catch {}
  }, [])

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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filters and sorts</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
            <View style={styles.sliderRow}>
              <Text style={styles.sliderValue}>{priceMin}</Text>
              <View style={styles.sliderTrack}>
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
                <Slider
                  minimumValue={PRICE_MIN}
                  maximumValue={PRICE_MAX}
                  step={5}
                  value={priceMax}
                  onValueChange={v => {
                    const rounded = Math.round(v / 5) * 5
                    if (rounded > priceMin) setPriceMax(rounded)
                  }}
                  minimumTrackTintColor={colors.muted[200]}
                  maximumTrackTintColor={colors.muted[200]}
                  thumbTintColor={colors.primary[600]}
                />
              </View>
              <Text style={styles.sliderValue}>{priceMax}{priceMax >= PRICE_MAX ? '+' : ''}</Text>
            </View>
          </View>

          {/* Region */}
          {filters && filters.regions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌍 Region</Text>
              {renderChips(
                filters.regions.map(r => ({ value: r.id, label: r.name })),
                regionId,
                setRegionId,
              )}
            </View>
          )}

          {/* Cellar */}
          {filters && filters.cellars.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Cellar</Text>
              {renderChips(
                filters.cellars.map(c => ({ value: c.id, label: c.name })),
                cellarId,
                setCellarId,
              )}
            </View>
          )}

          {/* Producer */}
          {filters && filters.producers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏠 Producer</Text>
              {renderChips(
                filters.producers.slice(0, 20).map(p => ({ value: p.id, label: p.name })),
                producerId,
                setProducerId,
              )}
            </View>
          )}

          {/* Vintage */}
          {filters && filters.vintages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📆 Vintage</Text>
              {renderChips(
                filters.vintages.slice(0, 15).map(v => ({ value: v, label: String(v) })),
                vintage,
                setVintage,
              )}
            </View>
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
            <Text style={styles.ctaText}>
              See the {matchCount} bottle{matchCount !== 1 ? 's' : ''}
            </Text>
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
  sliderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  sliderTrack: { flex: 1 },
  sliderValue: {
    fontSize: 14, fontWeight: '700', color: colors.primary[600],
    minWidth: 32, textAlign: 'center',
  },

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
