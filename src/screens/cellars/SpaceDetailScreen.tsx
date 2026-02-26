import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

interface Slot {
  id: number
  row: number
  column: number
  depthPosition: number
  inventoryLotId: number | null
  wineColor: string | null
  wineName: string | null
  vintage: number | null
}

interface BinBottle {
  id: number
  binRow: number
  binColumn: number
  inventoryLotId: number | null
  wineColor: string | null
}

interface Rack {
  id: number
  wallId: number | null
  name: string | null
  type: string
  columns: number
  rows: number
  depth: number
  capacity: number | null
  sortOrder: number
  slots: Slot[]
  bottles: BinBottle[]
}

interface Wall {
  id: number
  spaceId: number
  position: string
}

interface SpaceData {
  space: { id: number; name: string; type: string }
  walls: Wall[]
  racks: Rack[]
}

const WALL_LABELS: Record<string, string> = {
  left: 'Left Wall',
  right: 'Right Wall',
  back: 'Back Wall',
  front: 'Front Wall',
  floor: 'Floor / Island',
}

const WINE_COLORS: Record<string, string> = {
  red: '#DC2626',
  white: '#FBBF24',
  rose: '#F472B6',
  sparkling: '#FDE047',
  dessert: '#FB923C',
  fortified: '#A855F7',
}

export const SpaceDetailScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { spaceId, spaceName, spaceType, cellarId } = route.params

  const [data, setData] = useState<SpaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedWallPos, setSelectedWallPos] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await apiFetch<SpaceData>(`/api/spaces/${spaceId}/racks`)
      setData(result)
    } catch (err) {
      console.error('Failed to fetch space:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [spaceId])

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [fetchData])
  )

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#722F37" style={{ marginTop: 100 }} />
      </View>
    )
  }

  if (!data) return null

  // Group racks by wall for room type
  const racksByWall: Record<string, Rack[]> = {}
  const unassignedRacks: Rack[] = []

  if (spaceType === 'room') {
    for (const wall of data.walls) {
      racksByWall[wall.position] = []
    }
    for (const rack of data.racks) {
      const wall = data.walls.find(w => w.id === rack.wallId)
      if (wall) {
        racksByWall[wall.position].push(rack)
      } else {
        unassignedRacks.push(rack)
      }
    }
  }

  const totalSlots = data.racks.reduce((sum, r) => {
    if (r.type === 'bin') return sum + r.columns * r.rows * (r.capacity ?? 10)
    return sum + r.slots.length
  }, 0)
  const filledSlots = data.racks.reduce((sum, r) => {
    if (r.type === 'bin') return sum + (r.bottles || []).length
    return sum + r.slots.filter(s => s.inventoryLotId).length
  }, 0)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{spaceName}</Text>
            <Text style={styles.subtitle}>
              {spaceType === 'room' ? '🏠 Room' : '❄️ Fridge'} · {filledSlots}/{totalSlots} slots filled
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addRackChip}
            onPress={() => navigation.navigate('CreateRack', {
              spaceId,
              spaceType,
              walls: data.walls,
            })}
          >
            <Text style={styles.addRackChipText}>+ Storage</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData() }} />}
      >
        {data.racks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📐</Text>
            <Text style={styles.emptyTitle}>No storage yet</Text>
            <Text style={styles.emptyDesc}>Add a rack or casier to start placing bottles.</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('CreateRack', {
                spaceId,
                spaceType,
                walls: data.walls,
              })}
            >
              <Text style={styles.createBtnText}>+ Add Storage</Text>
            </TouchableOpacity>
          </View>
        ) : spaceType === 'room' ? (
          /* Room view: interactive floor plan */
          <>
            {/* Floor plan */}
            <View style={styles.roomViz}>
              {/* Wall strips */}
              {data.walls.map(wall => {
                const wallRacks = racksByWall[wall.position] || []
                const wallFilled = wallRacks.reduce((s, r) => r.type === 'bin' ? s + (r.bottles || []).length : s + r.slots.filter(sl => sl.inventoryLotId).length, 0)
                const wallTotal = wallRacks.reduce((s, r) => r.type === 'bin' ? s + r.columns * r.rows * (r.capacity ?? 10) : s + r.slots.length, 0)
                const hasRacks = wallRacks.length > 0
                const isSelected = selectedWallPos === wall.position
                const isVertical = wall.position === 'left' || wall.position === 'right'

                const fillPct = wallTotal > 0 ? wallFilled / wallTotal : 0
                // If wall has exactly 1 rack, tap goes directly to rack view
                const handleWallPress = () => {
                  if (wallRacks.length === 1) {
                    navigation.navigate('RackView', { rackId: wallRacks[0].id, spaceId, cellarId })
                  } else {
                    setSelectedWallPos(isSelected ? null : wall.position)
                  }
                }

                // Color intensity based on fill %
                const wallBg = !hasRacks
                  ? colors.muted[300]
                  : fillPct > 0.7 ? '#722F37'
                  : fillPct > 0.3 ? '#9b4a52'
                  : fillPct > 0 ? '#b86b72'
                  : '#d4a0a5'

                return (
                  <TouchableOpacity
                    key={wall.id}
                    style={[
                      styles.wallStrip,
                      getWallStyle(wall.position),
                      { backgroundColor: wallBg },
                      isSelected && styles.wallStripSelected,
                    ]}
                    onPress={handleWallPress}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.wallStripName, isVertical && styles.wallStripNameVertical]}>
                      {(WALL_LABELS[wall.position] || wall.position).replace(' Wall', '')}
                    </Text>
                  </TouchableOpacity>
                )
              })}

              {/* Center info */}
              <View style={styles.roomCenter}>
                <Text style={styles.roomCenterName}>{spaceName}</Text>
                <Text style={styles.roomCenterSub}>{data.walls.length} walls · {data.racks.length} storage</Text>
                <Text style={styles.roomCenterTotal}>{filledSlots}</Text>
                <Text style={styles.roomCenterTotalLabel}>/ {totalSlots} bottles</Text>
              </View>
            </View>

            <Text style={styles.roomHint}>
              {selectedWallPos ? `Showing ${WALL_LABELS[selectedWallPos] || selectedWallPos}` : 'Tap a wall to see its storage'}
            </Text>

            {/* Racks for selected wall (or all if none selected) */}
            {selectedWallPos ? (
              <View style={styles.wallSection}>
                {(racksByWall[selectedWallPos] || []).length > 0 ? (
                  (racksByWall[selectedWallPos] || []).map(rack => (
                    <RackMiniCard key={rack.id} rack={rack} navigation={navigation} spaceId={spaceId} cellarId={cellarId} />
                  ))
                ) : (
                  <Text style={styles.wallEmptyText}>No storage on this wall yet</Text>
                )}
              </View>
            ) : (
              // Show all walls when nothing selected
              <>
                {data.walls.map(wall => {
                  const wallRacks = racksByWall[wall.position] || []
                  if (wallRacks.length === 0) return null
                  return (
                    <View key={wall.id} style={styles.wallSection}>
                      <Text style={styles.wallSectionTitle}>{WALL_LABELS[wall.position] || wall.position}</Text>
                      {wallRacks.map(rack => (
                        <RackMiniCard key={rack.id} rack={rack} navigation={navigation} spaceId={spaceId} cellarId={cellarId} />
                      ))}
                    </View>
                  )
                })}
                {unassignedRacks.length > 0 && (
                  <View style={styles.wallSection}>
                    <Text style={styles.wallSectionTitle}>Unassigned</Text>
                    {unassignedRacks.map(rack => (
                      <RackMiniCard key={rack.id} rack={rack} navigation={navigation} spaceId={spaceId} cellarId={cellarId} />
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          /* Fridge view: all racks as shelves */
          data.racks.map(rack => (
            <RackMiniCard key={rack.id} rack={rack} navigation={navigation} spaceId={spaceId} cellarId={cellarId} />
          ))
        )}
      </ScrollView>
    </View>
  )
}

const RackMiniCard = ({ rack, navigation, spaceId, cellarId }: { rack: Rack; navigation: any; spaceId: number; cellarId: number }) => {
  const isBin = rack.type === 'bin'
  const filled = isBin ? (rack.bottles || []).length : rack.slots.filter(s => s.inventoryLotId).length
  const total = isBin ? rack.columns * rack.rows * (rack.capacity ?? 10) : rack.slots.length
  const label = rack.name || `${rack.columns}×${rack.rows} ${isBin ? 'casier' : 'rack'}`

  return (
    <TouchableOpacity
      style={styles.rackCard}
      onPress={() => navigation.navigate('RackView', { rackId: rack.id, spaceId, cellarId })}
      activeOpacity={0.7}
    >
      {/* Mini preview */}
      <View style={styles.miniGrid}>
        {isBin ? (
          // Bin preview: small rectangles with fill indicator
          Array.from({ length: Math.min(rack.rows, 3) }, (_, r) => (
            <View key={r} style={styles.miniRow}>
              {Array.from({ length: Math.min(rack.columns, 4) }, (_, c) => {
                const binBottles = (rack.bottles || []).filter(b => b.binRow === r + 1 && b.binColumn === c + 1)
                const fillPct = binBottles.length / (rack.capacity ?? 10)
                return (
                  <View key={c} style={[styles.miniBin, fillPct > 0 && { backgroundColor: fillPct > 0.5 ? '#722F37' : '#d4a574' }]} />
                )
              })}
            </View>
          ))
        ) : (
          // Grid preview: dot circles
          Array.from({ length: Math.min(rack.rows, 4) }, (_, r) => (
            <View key={r} style={styles.miniRow}>
              {Array.from({ length: Math.min(rack.columns, 6) }, (_, c) => {
                const slot = rack.slots.find(s => s.row === r + 1 && s.column === c + 1 && s.depthPosition === 1)
                const color = slot?.wineColor ? WINE_COLORS[slot.wineColor] || colors.muted[400] : undefined
                return (
                  <View key={c} style={[styles.miniSlot, color ? { backgroundColor: color } : styles.miniSlotEmpty]} />
                )
              })}
            </View>
          ))
        )}
      </View>

      <View style={styles.rackInfo}>
        <Text style={styles.rackName}>{label}</Text>
        <Text style={styles.rackStats}>
          {filled}/{total} bottles{!isBin && rack.depth > 1 ? ` · ${rack.depth} deep` : ''}
          {isBin ? ` · ${rack.columns * rack.rows} bins` : ''}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )
}

const getWallStyle = (position: string): any => {
  const base = { position: 'absolute' as const }
  switch (position) {
    case 'back': return { ...base, top: 0, left: 50, right: 50, height: 46 }
    case 'front': return { ...base, bottom: 0, left: 50, right: 50, height: 46 }
    case 'left': return { ...base, left: 0, top: 50, bottom: 50, width: 46 }
    case 'right': return { ...base, right: 0, top: 50, bottom: 50, width: 46 }
    case 'floor': return { ...base, top: 55, bottom: 55, left: 55, right: 55 }
    default: return base
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.muted[50] },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 16, color: '#722F37', fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '800', color: colors.muted[900], marginTop: 4 },
  subtitle: { fontSize: 13, color: colors.muted[500], marginTop: 2 },
  addRackChip: { backgroundColor: '#722F37', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 8 },
  addRackChipText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  content: { padding: 20, paddingTop: 8 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.muted[900] },
  emptyDesc: { fontSize: 14, color: colors.muted[500], textAlign: 'center', marginTop: 8 },
  createBtn: { marginTop: 24, backgroundColor: '#722F37', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Room viz (interactive floor plan)
  roomViz: {
    height: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  wallStrip: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  wallStripSelected: { borderWidth: 2, borderColor: '#fff' },
  wallStripName: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.3, zIndex: 1 },
  wallStripNameVertical: { writingDirection: 'ltr', transform: [{ rotate: '-90deg' }] },
  // (fill styles removed - using direct backgroundColor)
  roomCenter: {
    position: 'absolute', top: 55, bottom: 55, left: 55, right: 55,
    backgroundColor: '#f9f6f3', borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  roomCenterName: { fontSize: 18, fontWeight: '700', color: '#722F37' },
  roomCenterSub: { fontSize: 11, color: colors.muted[500], marginTop: 2 },
  roomCenterTotal: { fontSize: 32, fontWeight: '800', color: colors.muted[900], marginTop: 8 },
  roomCenterTotalLabel: { fontSize: 12, color: colors.muted[500] },
  roomHint: { fontSize: 12, color: colors.muted[400], textAlign: 'center', marginBottom: 16 },
  wallEmptyText: { fontSize: 14, color: colors.muted[400], textAlign: 'center', paddingVertical: 20 },

  // Wall sections
  wallSection: { marginBottom: 20 },
  wallSectionTitle: { fontSize: 16, fontWeight: '700', color: colors.muted[800], marginBottom: 8 },

  // Rack card
  rackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  miniGrid: { marginRight: 14 },
  miniRow: { flexDirection: 'row', gap: 2, marginBottom: 2 },
  miniSlot: { width: 8, height: 8, borderRadius: 4 },
  miniSlotEmpty: { backgroundColor: colors.muted[200] },
  miniBin: { width: 14, height: 10, borderRadius: 3, backgroundColor: colors.muted[200], borderWidth: 0.5, borderColor: colors.muted[300] },
  rackInfo: { flex: 1 },
  rackName: { fontSize: 15, fontWeight: '600', color: colors.muted[900] },
  rackStats: { fontSize: 12, color: colors.muted[500], marginTop: 2 },
  chevron: { fontSize: 24, color: colors.muted[300], fontWeight: '300' },
})
