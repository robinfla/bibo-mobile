import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

const WALL_LABELS: Record<string, string> = {
  left: 'Left Wall', right: 'Right Wall', back: 'Back Wall',
  front: 'Front Wall', floor: 'Floor / Island',
}

interface Wall { id: number; position: string; spaceId: number }

export const CreateRackScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { spaceId, spaceType, walls } = route.params as { spaceId: number; spaceType: string; walls: Wall[] }

  const [rackType, setRackType] = useState<'grid' | 'bin'>('grid')
  const [columns, setColumns] = useState(6)
  const [rows, setRows] = useState(4)
  const [depth, setDepth] = useState(1)
  const [binCount, setBinCount] = useState(12)
  const [binCapacity, setBinCapacity] = useState(10)
  const [binCols, setBinCols] = useState(4)
  const [binRows, setBinRows] = useState(3)
  const [selectedWallId, setSelectedWallId] = useState<number | null>(walls?.length > 0 ? walls[0].id : null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      if (rackType === 'grid') {
        await apiFetch(`/api/spaces/${spaceId}/racks`, {
          method: 'POST',
          body: {
            type: 'grid',
            columns,
            rows,
            depth: spaceType === 'fridge' ? depth : 1,
            ...(selectedWallId ? { wallId: selectedWallId } : {}),
          },
        })
      } else {
        await apiFetch(`/api/spaces/${spaceId}/racks`, {
          method: 'POST',
          body: {
            type: 'bin',
            columns: binCols,
            rows: binRows,
            capacity: binCapacity,
            ...(selectedWallId ? { wallId: selectedWallId } : {}),
          },
        })
      }
      navigation.goBack()
    } catch (err) {
      Alert.alert('Error', 'Failed to create rack')
    } finally {
      setSaving(false)
    }
  }

  const Stepper = ({ label, value, onChange, min = 1, max = 50 }: {
    label: string; value: number; onChange: (v: number) => void; min?: number; max?: number
  }) => (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
          onPress={() => value > min && onChange(value - 1)}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity
          style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
          onPress={() => value < max && onChange(value + 1)}
        >
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const totalSlots = rackType === 'grid'
    ? columns * rows * (spaceType === 'fridge' ? depth : 1)
    : binCols * binRows * binCapacity

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Storage</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Type selector */}
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeCard, rackType === 'grid' && styles.typeCardActive]}
            onPress={() => setRackType('grid')}
          >
            <Text style={styles.typeIcon}>⊞</Text>
            <Text style={[styles.typeName, rackType === 'grid' && styles.typeNameActive]}>Grid</Text>
            <Text style={styles.typeDesc}>Individual slots</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeCard, rackType === 'bin' && styles.typeCardActive]}
            onPress={() => setRackType('bin')}
          >
            <Text style={styles.typeIcon}>▣</Text>
            <Text style={[styles.typeName, rackType === 'bin' && styles.typeNameActive]}>Bin / Casier</Text>
            <Text style={styles.typeDesc}>Bulk compartments</Text>
          </TouchableOpacity>
        </View>

        {/* Wall selector (room only) */}
        {spaceType === 'room' && walls && walls.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 20 }]}>Wall</Text>
            <View style={styles.wallRow}>
              {walls.map((wall: Wall) => (
                <TouchableOpacity
                  key={wall.id}
                  style={[styles.wallChip, selectedWallId === wall.id && styles.wallChipActive]}
                  onPress={() => setSelectedWallId(wall.id)}
                >
                  <Text style={[styles.wallChipText, selectedWallId === wall.id && styles.wallChipTextActive]}>
                    {WALL_LABELS[wall.position] || wall.position}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Grid config */}
        {rackType === 'grid' && (
          <>
            <Text style={[styles.label, { marginTop: 20 }]}>Size</Text>
            <Stepper label="Columns" value={columns} onChange={setColumns} max={20} />
            <Stepper label="Rows" value={rows} onChange={setRows} max={20} />
            {spaceType === 'fridge' && (
              <Stepper label="Depth" value={depth} onChange={setDepth} max={5} />
            )}
          </>
        )}

        {/* Bin config */}
        {rackType === 'bin' && (
          <>
            <Text style={[styles.label, { marginTop: 20 }]}>Layout</Text>
            <Stepper label="Bins wide" value={binCols} onChange={setBinCols} max={10} />
            <Stepper label="Bins high" value={binRows} onChange={setBinRows} max={10} />
            <Text style={[styles.label, { marginTop: 20 }]}>Capacity</Text>
            <Stepper label="Bottles per bin" value={binCapacity} onChange={setBinCapacity} max={50} />
          </>
        )}

        {/* Preview */}
        <Text style={[styles.label, { marginTop: 20 }]}>Preview</Text>
        <View style={styles.previewContainer}>
          {rackType === 'grid' ? (
            <View style={styles.previewGrid}>
              {Array.from({ length: Math.min(rows, 6) }, (_, r) => (
                <View key={r} style={styles.previewRow}>
                  {Array.from({ length: Math.min(columns, 8) }, (_, c) => (
                    <View key={c} style={styles.previewSlot} />
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.previewGrid}>
              {Array.from({ length: Math.min(binRows, 5) }, (_, r) => (
                <View key={r} style={styles.previewRow}>
                  {Array.from({ length: Math.min(binCols, 6) }, (_, c) => (
                    <View key={c} style={styles.previewBin}>
                      <Text style={styles.previewBinText}>0/{binCapacity}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
          <Text style={styles.previewLabel}>{totalSlots} total capacity</Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Creating...' : 'Create'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 16, color: '#722F37', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginTop: 4 },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.muted[700], marginBottom: 8 },

  // Type selector
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 2, borderColor: colors.muted[200],
  },
  typeCardActive: { borderColor: '#722F37', backgroundColor: '#fdf2f3' },
  typeIcon: { fontSize: 28, marginBottom: 6 },
  typeName: { fontSize: 14, fontWeight: '700', color: colors.muted[700] },
  typeNameActive: { color: '#722F37' },
  typeDesc: { fontSize: 11, color: colors.muted[400], marginTop: 2 },

  // Wall chips
  wallRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wallChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.muted[300],
  },
  wallChipActive: { borderColor: '#722F37', backgroundColor: '#fdf2f3' },
  wallChipText: { fontSize: 13, fontWeight: '600', color: colors.muted[600] },
  wallChipTextActive: { color: '#722F37' },

  // Stepper
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  stepperLabel: { fontSize: 16, color: colors.muted[800] },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.muted[300],
  },
  stepperBtnDisabled: { opacity: 0.3 },
  stepperBtnText: { fontSize: 18, fontWeight: '600', color: colors.muted[700] },
  stepperValue: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', minWidth: 30, textAlign: 'center' },

  // Preview
  previewContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' },
  previewGrid: { gap: 3 },
  previewRow: { flexDirection: 'row', gap: 3 },
  previewSlot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: colors.muted[200],
    borderWidth: 1, borderColor: colors.muted[300], borderStyle: 'dashed',
  },
  previewBin: {
    width: 48, height: 36, borderRadius: 8, backgroundColor: colors.muted[100],
    borderWidth: 1.5, borderColor: colors.muted[300], borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  previewBinText: { fontSize: 9, color: colors.muted[400], fontWeight: '600' },
  previewLabel: { marginTop: 12, fontSize: 13, color: colors.muted[500] },

  // Save
  saveBtn: { backgroundColor: '#722F37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
