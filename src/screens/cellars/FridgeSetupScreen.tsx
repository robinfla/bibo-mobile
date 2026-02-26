import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

export const FridgeSetupScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { cellarId, name } = route.params

  const [shelves, setShelves] = useState(5)
  const [width, setWidth] = useState(6)
  const [depth, setDepth] = useState(2)
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    setSaving(true)
    try {
      // Create space first
      const space = await apiFetch<any>(`/api/cellars/${cellarId}/spaces`, {
        method: 'POST',
        body: { name, type: 'fridge' },
      })

      // Create one rack per shelf
      for (let i = 0; i < shelves; i++) {
        await apiFetch(`/api/spaces/${space.id}/racks`, {
          method: 'POST',
          body: { columns: width, rows: 1, depth },
        })
      }

      navigation.pop(2)
    } catch (err) {
      Alert.alert('Error', 'Failed to create fridge')
    } finally {
      setSaving(false)
    }
  }

  const Stepper = ({ label, sublabel, value, onChange, min = 1, max = 20 }: {
    label: string; sublabel?: string; value: number; onChange: (v: number) => void; min?: number; max?: number
  }) => (
    <View style={styles.stepperRow}>
      <View>
        <Text style={styles.stepperLabel}>{label}</Text>
        {sublabel && <Text style={styles.stepperSub}>{sublabel}</Text>}
      </View>
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

  const totalSlots = shelves * width * depth

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Fridge / cabinet setup</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.fieldLabel}>Dimensions</Text>

        <Stepper label="Shelves" sublabel="Number of shelf levels" value={shelves} onChange={setShelves} max={12} />
        <Stepper label="Width" sublabel="Bottles per shelf" value={width} onChange={setWidth} max={20} />
        <Stepper label="Depth" sublabel="Bottles front-to-back" value={depth} onChange={setDepth} max={5} />

        {/* Fridge preview */}
        <View style={styles.fridgePreview}>
          {Array.from({ length: Math.min(shelves, 8) }, (_, s) => (
            <View key={s} style={styles.shelfGroup}>
              <Text style={styles.shelfLabel}>Shelf {s + 1}</Text>
              <View style={styles.shelfRow}>
                {Array.from({ length: Math.min(width, 10) }, (_, c) => (
                  <View key={c} style={styles.fridgeSlot} />
                ))}
                {width > 10 && <Text style={styles.moreText}>+{width - 10}</Text>}
              </View>
            </View>
          ))}
          {shelves > 8 && <Text style={styles.moreShelves}>+{shelves - 8} more shelves</Text>}
        </View>

        <Text style={styles.totalLabel}>{totalSlots} total slots</Text>

        {/* Create button */}
        <TouchableOpacity
          style={[styles.createBtn, saving && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={saving}
        >
          <Text style={styles.createBtnText}>{saving ? 'Creating...' : 'Create Fridge'}</Text>
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
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginTop: 4 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
  content: { padding: 20 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 12 },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  stepperLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  stepperSub: { fontSize: 11, color: '#888', marginTop: 1 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  stepperBtnDisabled: { opacity: 0.3 },
  stepperBtnText: { fontSize: 20, color: '#666' },
  stepperValue: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', minWidth: 28, textAlign: 'center' },

  // Fridge preview
  fridgePreview: {
    marginTop: 24,
    alignSelf: 'center',
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    padding: 16,
  },
  shelfGroup: { marginBottom: 8 },
  shelfLabel: { fontSize: 9, color: '#aaa', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  shelfRow: { flexDirection: 'row', gap: 4, justifyContent: 'center', flexWrap: 'wrap' },
  fridgeSlot: {
    width: 28,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  moreText: { fontSize: 10, color: '#aaa', alignSelf: 'center', marginLeft: 4 },
  moreShelves: { fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 4 },

  totalLabel: { textAlign: 'center', fontSize: 13, color: '#888', marginTop: 12, marginBottom: 8 },

  createBtn: {
    backgroundColor: '#722F37',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
