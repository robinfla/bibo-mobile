import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

interface Slot {
  id: number; row: number; column: number; depthPosition: number
  inventoryLotId: number | null; wineColor: string | null; wineName: string | null; vintage: number | null
}

interface BinBottle {
  id: number; binRow: number; binColumn: number
  inventoryLotId: number | null; wineColor: string | null; wineName: string | null
  producerName: string | null; vintage: number | null
}

interface Rack {
  id: number; wallId: number | null; name: string | null; type: string
  columns: number; rows: number; depth: number; capacity: number | null; binLabels: string | null
  sortOrder: number; slots: Slot[]; bottles: BinBottle[]
}

interface SpaceData {
  space: { id: number; name: string; type: string }
  walls: { id: number; position: string }[]
  racks: Rack[]
}

interface InventoryLot {
  id: number; wineName: string; producerName: string; vintage: number | null; color: string; quantity: number
}

const WINE_COLORS: Record<string, string> = {
  red: '#DC2626', white: '#FBBF24', rose: '#F472B6',
  sparkling: '#FDE047', dessert: '#FB923C', fortified: '#A855F7',
}

const WALL_LABELS: Record<string, string> = {
  left: 'Left Wall', right: 'Right Wall', back: 'Back Wall', front: 'Front Wall', floor: 'Floor',
}

const SCREEN_WIDTH = Dimensions.get('window').width

export const RackViewScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { rackId, spaceId, cellarId } = route.params

  const [rack, setRack] = useState<Rack | null>(null)
  const [spaceName, setSpaceName] = useState('')
  const [wallPosition, setWallPosition] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Grid state
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedEmptySlot, setSelectedEmptySlot] = useState<{ row: number; column: number } | null>(null)

  // Bin state
  const [selectedBin, setSelectedBin] = useState<{ row: number; col: number } | null>(null)

  // Search / add state
  const [searchResults, setSearchResults] = useState<InventoryLot[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [placingSlot, setPlacingSlot] = useState<{ row: number; column: number } | null>(null)

  // Rack name
  const [editingName, setEditingName] = useState(false)
  const [nameText, setNameText] = useState('')

  // Bin labels
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelText, setLabelText] = useState('')

  // Multi-select for bins
  const [selections, setSelections] = useState<Record<number, number>>({}) // lotId → qty

  const fetchRack = useCallback(async () => {
    try {
      const data = await apiFetch<SpaceData>(`/api/spaces/${spaceId}/racks`)
      const foundRack = data.racks.find(r => r.id === rackId)
      if (foundRack) {
        setRack(foundRack)
        setSpaceName(data.space.name)
        if (foundRack.wallId) {
          const wall = data.walls.find(w => w.id === foundRack.wallId)
          setWallPosition(wall?.position ?? null)
        }
      }
    } catch (err) {
      console.error('Failed to fetch rack:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [spaceId, rackId])

  useFocusEffect(useCallback(() => { fetchRack() }, [fetchRack]))

  const fetchUnplacedBottles = async () => {
    try {
      const data = await apiFetch<any>(`/api/inventory`, { query: { cellarId, limit: '500' } })
      const lots = (data.lots || data).map((l: any) => ({
        id: l.id,
        wineName: l.wineName || l.wine?.name || 'Unknown',
        producerName: l.producerName || l.producer?.name || '',
        vintage: l.vintage,
        color: l.color || l.wine?.color || 'red',
        quantity: l.quantity ?? l.qty ?? 1,
      }))
      setSearchResults(lots)
      setShowSearch(true)
      setSearchQuery('')
      setSelections({})
    } catch (err) {
      Alert.alert('Error', 'Failed to load inventory')
    }
  }

  // Filtered results based on search + already-in-bin bottles
  const filteredResults = useMemo(() => {
    let results = searchResults
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      results = results.filter(l =>
        l.wineName.toLowerCase().includes(q) ||
        l.producerName.toLowerCase().includes(q) ||
        (l.vintage && String(l.vintage).includes(q))
      )
    }
    return results
  }, [searchResults, searchQuery])

  // Available qty = lot qty minus how many already placed in this bin
  const getAvailableQty = (lot: InventoryLot): number => {
    if (!rack) return lot.quantity
    // Count bottles already placed in this rack (bins or grid slots)
    const placedInBins = (rack.bottles || []).filter(b => b.inventoryLotId === lot.id).length
    const placedInSlots = (rack.slots || []).filter(s => s.inventoryLotId === lot.id).length
    const alreadyPlaced = placedInBins + placedInSlots
    const selected = selections[lot.id] || 0
    return Math.max(0, lot.quantity - alreadyPlaced - selected)
  }

  // === BIN MULTI-SELECT HANDLERS ===
  const toggleSelection = (lotId: number, maxQty: number) => {
    setSelections(prev => {
      const current = prev[lotId] || 0
      if (current > 0) {
        const next = { ...prev }
        delete next[lotId]
        return next
      }
      return { ...prev, [lotId]: 1 }
    })
  }

  const adjustQty = (lotId: number, delta: number, maxQty: number) => {
    setSelections(prev => {
      const current = prev[lotId] || 0
      const next = Math.max(0, Math.min(current + delta, maxQty))
      if (next === 0) {
        const copy = { ...prev }
        delete copy[lotId]
        return copy
      }
      return { ...prev, [lotId]: next }
    })
  }

  const totalSelected = Object.values(selections).reduce((a, b) => a + b, 0)

  const handleConfirmBinAdd = async () => {
    if (!rack || !selectedBin || totalSelected === 0) return
    try {
      // Add each selected lot × qty
      for (const [lotIdStr, qty] of Object.entries(selections)) {
        const lotId = Number(lotIdStr)
        for (let i = 0; i < qty; i++) {
          await apiFetch(`/api/racks/${rack.id}/bins/add`, {
            method: 'POST',
            body: { binRow: selectedBin.row, binColumn: selectedBin.col, inventoryLotId: lotId },
          })
        }
      }
      setShowSearch(false)
      setSelections({})
      fetchRack()
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add bottles')
    }
  }

  // === GRID HANDLERS ===
  const handleSlotPress = (slot: Slot) => {
    if (slot.inventoryLotId) {
      setSelectedSlot(slot)
      setSelectedEmptySlot(null)
    } else {
      setSelectedSlot(null)
      setSelectedEmptySlot({ row: slot.row, column: slot.column })
    }
  }

  const handleAddWineToSlot = () => {
    if (!selectedEmptySlot) return
    setPlacingSlot(selectedEmptySlot)
    setSelectedEmptySlot(null)
    fetchUnplacedBottles()
  }

  const handlePlaceBottle = async (lotId: number) => {
    if (!rack || !placingSlot) return
    try {
      await apiFetch(`/api/racks/${rack.id}/slots/place`, {
        method: 'POST',
        body: { row: placingSlot.row, column: placingSlot.column, depthPosition: 1, inventoryLotId: lotId },
      })
      setShowSearch(false)
      setPlacingSlot(null)
      fetchRack()
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to place bottle')
    }
  }

  const handleRemoveBottle = async (slot: Slot) => {
    if (!rack) return
    try {
      await apiFetch(`/api/racks/${rack.id}/slots/remove`, {
        method: 'POST',
        body: { row: slot.row, column: slot.column, depthPosition: slot.depthPosition },
      })
      setSelectedSlot(null)
      fetchRack()
    } catch (err) {
      Alert.alert('Error', 'Failed to remove bottle')
    }
  }

  const handleRemoveBinBottle = async (binBottleId: number) => {
    if (!rack) return
    try {
      await apiFetch(`/api/racks/${rack.id}/bins/remove`, {
        method: 'POST',
        body: { binBottleId },
      })
      fetchRack()
    } catch (err) {
      Alert.alert('Error', 'Failed to remove bottle from bin')
    }
  }

  const handleDeleteRack = () => {
    if (!rack) return
    Alert.alert(
      'Delete this rack?',
      'All placed bottles will be unassigned. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/api/racks/${rack.id}`, { method: 'DELETE' })
              navigation.goBack()
            } catch (err) {
              Alert.alert('Error', 'Failed to delete rack')
            }
          },
        },
      ]
    )
  }

  // Parse bin labels
  const binLabels: Record<string, string> = rack ? (() => {
    try { return JSON.parse(rack.binLabels || '{}') } catch { return {} }
  })() : {}

  const getBinLabel = (row: number, col: number) => binLabels[`${row}-${col}`] || ''

  const saveBinLabel = async (row: number, col: number, label: string) => {
    if (!rack) return
    const updated = { ...binLabels }
    if (label.trim()) {
      updated[`${row}-${col}`] = label.trim()
    } else {
      delete updated[`${row}-${col}`]
    }
    try {
      await apiFetch(`/api/racks/${rack.id}/labels`, {
        method: 'PATCH',
        body: { binLabels: updated },
      })
      fetchRack()
    } catch (err) {
      Alert.alert('Error', 'Failed to save label')
    }
  }

  const saveRackName = async (name: string) => {
    if (!rack) return
    try {
      await apiFetch(`/api/racks/${rack.id}/labels`, {
        method: 'PATCH',
        body: { binLabels: binLabels, name: name.trim() || null },
      })
      fetchRack()
    } catch (err) {
      Alert.alert('Error', 'Failed to save name')
    }
  }

  if (loading || !rack) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#722F37" style={{ marginTop: 100 }} />
      </View>
    )
  }

  const isBin = rack.type === 'bin'
  const capacity = rack.capacity ?? 10
  const filled = isBin ? (rack.bottles || []).length : rack.slots.filter(s => s.inventoryLotId).length
  const total = isBin ? rack.columns * rack.rows * capacity : rack.slots.length

  const gridPadding = 20
  const gap = isBin ? 10 : 4
  const slotSize = isBin
    ? Math.min(Math.floor((SCREEN_WIDTH - gridPadding * 2 - gap * (rack.columns - 1) - 24) / rack.columns), 80)
    : Math.min(Math.floor((SCREEN_WIDTH - gridPadding * 2 - 4 * (rack.columns - 1)) / rack.columns), 44)

  // Group bin bottles by position
  const binBottlesByPos = (rack.bottles || []).reduce<Record<string, BinBottle[]>>((acc, b) => {
    const key = `${b.binRow}-${b.binColumn}`
    if (!acc[key]) acc[key] = []
    acc[key].push(b)
    return acc
  }, {})

  const selectedBinBottles = selectedBin ? binBottlesByPos[`${selectedBin.row}-${selectedBin.col}`] || [] : []
  const selectedBinFull = selectedBinBottles.length >= capacity

  // Collect all lot IDs in this rack for "See wine list" filter
  const rackLotIds = isBin
    ? [...new Set((rack.bottles || []).map(b => b.inventoryLotId).filter(Boolean))]
    : [...new Set(rack.slots.filter(s => s.inventoryLotId).map(s => s.inventoryLotId))]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteRack} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>🗑</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.breadcrumb}>
          {spaceName}{wallPosition ? ` › ${WALL_LABELS[wallPosition] || wallPosition}` : ''}
        </Text>
        {editingName ? (
          <TextInput
            style={[styles.title, { borderBottomWidth: 1.5, borderBottomColor: '#722F37', paddingVertical: 2 }]}
            value={nameText}
            onChangeText={setNameText}
            placeholder="Name this rack..."
            placeholderTextColor={colors.muted[400]}
            autoFocus
            onSubmitEditing={() => { saveRackName(nameText); setEditingName(false) }}
            onBlur={() => { saveRackName(nameText); setEditingName(false) }}
          />
        ) : (
          <TouchableOpacity onPress={() => { setNameText(rack.name || ''); setEditingName(true) }}>
            <Text style={styles.title}>
              {rack.name || `${rack.columns}×${rack.rows} ${isBin ? 'Casier' : 'Rack'}`}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.subtitle}>{filled}/{total} bottles · tap title to rename</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRack() }} />}
      >
        {isBin ? (
          /* ═══ BIN VIEW ═══ */
          <View style={[styles.gridContainer, { padding: 12 }]}>
            {Array.from({ length: rack.rows }, (_, r) => (
              <View key={r} style={[styles.gridRow, { gap, marginBottom: gap }]}>
                {Array.from({ length: rack.columns }, (_, c) => {
                  const row = r + 1, col = c + 1
                  const bottles = binBottlesByPos[`${row}-${col}`] || []
                  const count = bottles.length
                  const fillPct = count / capacity
                  const isSelected = selectedBin?.row === row && selectedBin?.col === col

                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.binCell, { width: slotSize, height: slotSize * 0.75 }, isSelected && styles.binCellSelected]}
                      onPress={() => setSelectedBin({ row, col })}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.binFill, {
                        height: `${Math.max(fillPct * 100, 0)}%` as any,
                        backgroundColor: fillPct > 0.8 ? '#722F37' : fillPct > 0.4 ? '#d4a574' : colors.muted[200],
                      }]} />
                      {getBinLabel(row, col) ? (
                        <Text style={[styles.binLabel, count > 0 && fillPct > 0.8 && { color: '#fff' }]} numberOfLines={1}>
                          {getBinLabel(row, col)}
                        </Text>
                      ) : null}
                      <Text style={[styles.binCount, count > 0 && fillPct > 0.8 && { color: '#fff' }]}>
                        {count}/{capacity}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </View>
        ) : (
          /* ═══ GRID VIEW ═══ */
          <View style={[styles.gridContainer, { padding: 12 }]}>
            {Array.from({ length: rack.rows }, (_, r) => (
              <View key={r} style={[styles.gridRow, { gap: 4 }]}>
                {Array.from({ length: rack.columns }, (_, c) => {
                  const slot = rack.slots.find(s => s.row === r + 1 && s.column === c + 1 && s.depthPosition === 1)
                  if (!slot) return <View key={c} style={{ width: slotSize, height: slotSize }} />
                  const isFilled = !!slot.inventoryLotId
                  const wineColor = slot.wineColor ? WINE_COLORS[slot.wineColor] || colors.muted[400] : undefined
                  const isSelected = selectedSlot?.id === slot.id
                  const isEmptySelected = !isFilled && selectedEmptySlot?.row === slot.row && selectedEmptySlot?.column === slot.column
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.slot, { width: slotSize, height: slotSize, borderRadius: slotSize / 2 },
                        isFilled ? { backgroundColor: wineColor } : styles.slotEmpty,
                        isSelected && styles.slotSelected,
                        isEmptySelected && styles.slotEmptySelected,
                      ]}
                      onPress={() => handleSlotPress(slot)}
                      activeOpacity={0.6}
                    >
                      {isEmptySelected && <Text style={{ fontSize: 14, color: '#722F37' }}>+</Text>}
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </View>
        )}

        {/* See wine list */}
        {filled > 0 && (
          <TouchableOpacity style={styles.wineListLink} onPress={() => {
            navigation.navigate('InventoryTab', {
              screen: 'InventoryList',
              params: { filterLotIds: rackLotIds, filterLabel: rack.name || `${rack.columns}×${rack.rows} ${isBin ? 'Casier' : 'Rack'}` },
            })
          }}>
            <Text style={styles.wineListLinkText}>See wine list ({filled} bottles) →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ═══ BIN DETAIL PANEL ═══ */}
      {isBin && selectedBin && !showSearch && (
        <View style={[styles.binPanel, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.binPanelHeader}>
            <View style={{ flex: 1 }}>
              {editingLabel ? (
                <TextInput
                  style={styles.binLabelInput}
                  value={labelText}
                  onChangeText={setLabelText}
                  placeholder="Name this bin (e.g. Loire)"
                  placeholderTextColor={colors.muted[400]}
                  autoFocus
                  onSubmitEditing={() => {
                    saveBinLabel(selectedBin.row, selectedBin.col, labelText)
                    setEditingLabel(false)
                  }}
                  onBlur={() => {
                    saveBinLabel(selectedBin.row, selectedBin.col, labelText)
                    setEditingLabel(false)
                  }}
                />
              ) : (
                <TouchableOpacity onPress={() => {
                  setLabelText(getBinLabel(selectedBin.row, selectedBin.col))
                  setEditingLabel(true)
                }}>
                  <Text style={styles.binPanelTitle}>
                    {getBinLabel(selectedBin.row, selectedBin.col) || `Bin ${(selectedBin.row - 1) * rack.columns + selectedBin.col}`}
                  </Text>
                  <Text style={styles.binPanelSub}>
                    {selectedBinBottles.length}/{capacity} bottles · tap to rename
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => { setSelectedBin(null); setEditingLabel(false) }} style={styles.peekClose}>
              <Text style={styles.peekCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.binPanelBar}>
            <View style={[styles.binPanelBarFill, { width: `${(selectedBinBottles.length / capacity) * 100}%` as any }]} />
          </View>

          {selectedBinBottles.length > 0 ? (
            <ScrollView style={styles.binPanelList} nestedScrollEnabled>
              {selectedBinBottles.map((b) => (
                <View key={b.id} style={styles.binPanelItem}>
                  <View style={[styles.colorDot, { backgroundColor: WINE_COLORS[b.wineColor || ''] || colors.muted[400] }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.binPanelItemName}>{b.wineName || 'Unknown'}</Text>
                    <Text style={styles.binPanelItemSub}>{b.producerName || ''}{b.vintage ? ` · ${b.vintage}` : ''}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Remove', 'Remove this bottle?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => handleRemoveBinBottle(b.id) },
                    ])}
                    style={styles.binRemoveBtn}
                  >
                    <Text style={styles.binRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.binPanelEmpty}>No bottles in this bin</Text>
          )}

          {!selectedBinFull && (
            <TouchableOpacity style={styles.binAddBtn} onPress={() => fetchUnplacedBottles()}>
              <Text style={styles.binAddBtnText}>+ Add Bottles</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ═══ EMPTY SLOT ACTION ═══ */}
      {!isBin && selectedEmptySlot && !showSearch && (
        <View style={[styles.peekCard, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.peekHeader}>
            <View style={[styles.peekDot, { backgroundColor: colors.muted[300], borderWidth: 1.5, borderColor: colors.muted[400], borderStyle: 'dashed' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.peekName}>Empty slot</Text>
              <Text style={styles.peekVintage}>Row {selectedEmptySlot.row}, Column {selectedEmptySlot.column}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedEmptySlot(null)} style={styles.peekClose}>
              <Text style={styles.peekCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.binAddBtn, { marginTop: 16 }]} onPress={handleAddWineToSlot}>
            <Text style={styles.binAddBtnText}>+ Add Wine</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ═══ GRID PEEK CARD ═══ */}
      {!isBin && selectedSlot && selectedSlot.inventoryLotId && (
        <View style={[styles.peekCard, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.peekHeader}>
            <View style={[styles.peekDot, { backgroundColor: WINE_COLORS[selectedSlot.wineColor || ''] || colors.muted[400] }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.peekName}>{selectedSlot.wineName || 'Unknown Wine'}</Text>
              <Text style={styles.peekVintage}>{selectedSlot.vintage || 'NV'}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedSlot(null)} style={styles.peekClose}>
              <Text style={styles.peekCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.peekActions}>
            <TouchableOpacity style={styles.peekBtn} onPress={() => Alert.alert('Move', 'Coming soon')}>
              <Text style={styles.peekBtnText}>Move</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.peekBtn, styles.peekBtnDanger]} onPress={() => handleRemoveBottle(selectedSlot)}>
              <Text style={[styles.peekBtnText, styles.peekBtnDangerText]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ═══ SEARCH / ADD OVERLAY ═══ */}
      {showSearch && (
        <View style={[styles.searchOverlay, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>
              {isBin
                ? `Add to Bin ${selectedBin ? (selectedBin.row - 1) * rack.columns + selectedBin.col : ''}`
                : `Place at (${placingSlot?.row}, ${placingSlot?.column})`}
            </Text>
            <TouchableOpacity onPress={() => { setShowSearch(false); setPlacingSlot(null); setSelections({}) }}>
              <Text style={styles.searchCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search wines..."
              placeholderTextColor={colors.muted[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>

          <ScrollView style={styles.searchList} keyboardShouldPersistTaps="handled">
            {filteredResults.length === 0 ? (
              <Text style={styles.searchEmpty}>
                {searchQuery ? 'No matches' : 'No bottles in this cellar'}
              </Text>
            ) : (
              filteredResults.map(lot => {
                const available = getAvailableQty(lot)
                const selected = selections[lot.id] || 0
                if (available <= 0 && selected <= 0) return null // fully placed

                return (
                  <View key={lot.id} style={styles.searchItem}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                      onPress={() => {
                        if (isBin) {
                          if (selected > 0) {
                            adjustQty(lot.id, -selected, available + selected) // deselect
                          } else if (available > 0) {
                            toggleSelection(lot.id, available)
                          }
                        } else {
                          handlePlaceBottle(lot.id)
                        }
                      }}
                    >
                      <View style={[styles.colorDot, { backgroundColor: WINE_COLORS[lot.color] || colors.muted[400] }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.searchItemName}>{lot.wineName}</Text>
                        <Text style={styles.searchItemSub}>
                          {lot.producerName} · {lot.vintage || 'NV'} · {available + selected} available
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Qty stepper for bin multi-select */}
                    {isBin && selected > 0 && (
                      <View style={styles.qtyStepper}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => adjustQty(lot.id, -1, available + selected)}>
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{selected}</Text>
                        <TouchableOpacity
                          style={[styles.qtyBtn, available <= 0 && { opacity: 0.3 }]}
                          onPress={() => available > 0 && adjustQty(lot.id, 1, available + selected)}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {isBin && selected === 0 && available > 0 && (
                      <TouchableOpacity style={styles.addChip} onPress={() => toggleSelection(lot.id, available)}>
                        <Text style={styles.addChipText}>+</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              })
            )}
          </ScrollView>

          {/* Confirm button for bin multi-select */}
          {isBin && totalSelected > 0 && (
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBinAdd}>
              <Text style={styles.confirmBtnText}>Add {totalSelected} bottle{totalSelected > 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.muted[50] },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 16, color: '#722F37', fontWeight: '600' },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 20 },
  breadcrumb: { fontSize: 13, color: colors.muted[400], marginTop: 4 },
  title: { fontSize: 24, fontWeight: '800', color: colors.muted[900], marginTop: 2 },
  subtitle: { fontSize: 13, color: colors.muted[500], marginTop: 2 },
  content: { padding: 20, paddingTop: 8 },

  // Grid
  gridContainer: { backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.muted[200] },
  gridRow: { flexDirection: 'row', marginBottom: 4 },
  slot: { justifyContent: 'center', alignItems: 'center' },
  slotEmpty: { backgroundColor: colors.muted[100], borderWidth: 1.5, borderColor: colors.muted[300], borderStyle: 'dashed' },
  slotSelected: { borderWidth: 3, borderColor: '#722F37', borderStyle: 'solid' },
  slotEmptySelected: { borderWidth: 2.5, borderColor: '#722F37', borderStyle: 'solid', backgroundColor: '#fdf2f3' },

  // Bin cells
  binCell: {
    borderRadius: 12, backgroundColor: colors.muted[100], borderWidth: 1.5,
    borderColor: colors.muted[300], justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  binCellSelected: { borderColor: '#722F37', borderWidth: 2.5 },
  binFill: { position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: 10 },
  binLabel: { fontSize: 9, fontWeight: '600', color: colors.muted[600], zIndex: 1, marginBottom: 1 },
  binCount: { fontSize: 12, fontWeight: '700', color: colors.muted[400], zIndex: 1 },

  // Bin panel
  binPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
  },
  binPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  binLabelInput: {
    fontSize: 18, fontWeight: '700', color: colors.muted[900], borderBottomWidth: 1.5,
    borderBottomColor: '#722F37', paddingVertical: 4, marginBottom: 4,
  },
  binPanelTitle: { fontSize: 18, fontWeight: '700', color: colors.muted[900] },
  binPanelSub: { fontSize: 13, color: colors.muted[500], marginTop: 2 },
  binPanelBar: { height: 6, backgroundColor: colors.muted[200], borderRadius: 3, marginTop: 12, marginBottom: 12 },
  binPanelBarFill: { height: 6, backgroundColor: '#722F37', borderRadius: 3 },
  binPanelList: { maxHeight: 200 },
  binPanelItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.muted[100] },
  binPanelItemName: { fontSize: 14, fontWeight: '600', color: colors.muted[900] },
  binPanelItemSub: { fontSize: 11, color: colors.muted[500], marginTop: 1 },
  binPanelEmpty: { fontSize: 13, color: colors.muted[400], textAlign: 'center', paddingVertical: 20 },
  binRemoveBtn: { padding: 8 },
  binRemoveText: { fontSize: 14, color: colors.muted[400] },
  binAddBtn: { backgroundColor: '#722F37', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  binAddBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Wine list link
  wineListLink: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  wineListLinkText: { fontSize: 14, color: '#722F37', fontWeight: '600' },

  // Peek card (grid)
  peekCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20,
  },
  peekHeader: { flexDirection: 'row', alignItems: 'center' },
  peekDot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  peekName: { fontSize: 17, fontWeight: '700', color: colors.muted[900] },
  peekVintage: { fontSize: 13, color: colors.muted[500], marginTop: 2 },
  peekClose: { padding: 8 },
  peekCloseText: { fontSize: 18, color: colors.muted[400] },
  peekActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  peekBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.muted[100], alignItems: 'center' },
  peekBtnText: { fontSize: 15, fontWeight: '600', color: colors.muted[700] },
  peekBtnDanger: { backgroundColor: '#fef2f2' },
  peekBtnDangerText: { color: '#DC2626' },

  // Search overlay
  searchOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', padding: 20,
  },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  searchTitle: { fontSize: 18, fontWeight: '700', color: colors.muted[900] },
  searchCancel: { fontSize: 16, color: '#722F37', fontWeight: '600' },
  searchBarContainer: { marginBottom: 12 },
  searchBar: {
    backgroundColor: colors.muted[100], borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 15, color: colors.muted[900],
    borderWidth: 1, borderColor: colors.muted[200],
  },
  searchList: { flex: 1 },
  searchEmpty: { fontSize: 14, color: colors.muted[500], textAlign: 'center', marginTop: 40 },
  searchItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.muted[100],
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  searchItemName: { fontSize: 15, fontWeight: '600', color: colors.muted[900] },
  searchItemSub: { fontSize: 12, color: colors.muted[500], marginTop: 2 },

  // Qty stepper
  qtyStepper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.muted[100],
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.muted[300],
  },
  qtyBtnText: { fontSize: 16, fontWeight: '600', color: colors.muted[700] },
  qtyValue: { fontSize: 16, fontWeight: '700', color: '#722F37', minWidth: 20, textAlign: 'center' },
  addChip: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#fdf2f3',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#722F37', marginLeft: 8,
  },
  addChipText: { fontSize: 16, fontWeight: '600', color: '#722F37' },

  // Confirm button
  confirmBtn: {
    backgroundColor: '#722F37', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 12,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
