import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

type WallPosition = 'left' | 'right' | 'back' | 'front' | 'floor'

export const RoomSetupScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { cellarId, name } = route.params

  const [selectedWalls, setSelectedWalls] = useState<WallPosition[]>(['back'])
  const [saving, setSaving] = useState(false)

  const toggleWall = (wall: WallPosition) => {
    setSelectedWalls(prev =>
      prev.includes(wall) ? prev.filter(w => w !== wall) : [...prev, wall]
    )
  }

  const handleCreate = async () => {
    if (selectedWalls.length === 0) {
      Alert.alert('Select Walls', 'Pick at least one wall with racks')
      return
    }
    setSaving(true)
    try {
      await apiFetch(`/api/cellars/${cellarId}/spaces`, {
        method: 'POST',
        body: { name, type: 'room', walls: selectedWalls },
      })
      // Go back to spaces list (pop CreateSpace + RoomSetup)
      navigation.pop(2)
    } catch (err) {
      Alert.alert('Error', 'Failed to create space')
    } finally {
      setSaving(false)
    }
  }

  const isActive = (w: WallPosition) => selectedWalls.includes(w)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Room setup</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Select walls with racks</Text>
        <Text style={styles.sectionDesc}>Tap the walls where you have wine storage</Text>

        {/* Top-down room preview */}
        <View style={styles.roomPreview}>
          {/* Back wall (top) */}
          <TouchableOpacity
            style={[styles.wallH, styles.wallBack, isActive('back') && styles.wallActive, isActive('back') && styles.wallBackActive]}
            onPress={() => toggleWall('back')}
          >
            <Text style={[styles.wallLabel, isActive('back') && styles.wallLabelActive]}>Back</Text>
          </TouchableOpacity>

          {/* Left wall */}
          <TouchableOpacity
            style={[styles.wallV, styles.wallLeft, isActive('left') && styles.wallActive, isActive('left') && styles.wallLeftActive]}
            onPress={() => toggleWall('left')}
          >
            <Text style={[styles.wallLabel, isActive('left') && styles.wallLabelActive]}>L</Text>
          </TouchableOpacity>

          {/* Right wall */}
          <TouchableOpacity
            style={[styles.wallV, styles.wallRight, isActive('right') && styles.wallActive, isActive('right') && styles.wallRightActive]}
            onPress={() => toggleWall('right')}
          >
            <Text style={[styles.wallLabel, isActive('right') && styles.wallLabelActive]}>R</Text>
          </TouchableOpacity>

          {/* Front wall (bottom) */}
          <TouchableOpacity
            style={[styles.wallH, styles.wallFront, isActive('front') && styles.wallActive, isActive('front') && styles.wallFrontActive]}
            onPress={() => toggleWall('front')}
          >
            <Text style={[styles.wallLabel, isActive('front') && styles.wallLabelActive]}>Front</Text>
          </TouchableOpacity>

          {/* Floor / island */}
          <TouchableOpacity
            style={[styles.floorArea, isActive('floor') && styles.floorActive]}
            onPress={() => toggleWall('floor')}
          >
            <Text style={[styles.wallLabel, isActive('floor') && styles.wallLabelActive]}>
              {isActive('floor') ? '✓ Island' : 'Island/Floor'}
            </Text>
          </TouchableOpacity>

          {/* Room center label */}
          <View style={styles.roomCenter}>
            <Text style={styles.roomCenterText}>{name}</Text>
          </View>
        </View>

        <Text style={styles.selectedCount}>
          {selectedWalls.length} wall{selectedWalls.length !== 1 ? 's' : ''} selected
        </Text>

        {/* Create button */}
        <TouchableOpacity
          style={[styles.createBtn, saving && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={saving}
        >
          <Text style={styles.createBtnText}>{saving ? 'Creating...' : 'Create Room'}</Text>
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

  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4 },
  sectionDesc: { fontSize: 12, color: '#aaa', marginBottom: 16 },

  // Room preview (top-down view)
  roomPreview: {
    width: 260,
    height: 220,
    alignSelf: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },

  wallH: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  wallV: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  wallBack: { top: 0, borderBottomWidth: 3, borderBottomColor: '#d1d5db' },
  wallFront: { bottom: 0, borderTopWidth: 3, borderTopColor: '#d1d5db' },
  wallLeft: { left: 0, borderRightWidth: 3, borderRightColor: '#d1d5db' },
  wallRight: { right: 0, borderLeftWidth: 3, borderLeftColor: '#d1d5db' },

  wallActive: { backgroundColor: 'rgba(114,47,55,0.08)' },
  wallBackActive: { borderBottomColor: '#722F37' },
  wallFrontActive: { borderTopColor: '#722F37' },
  wallLeftActive: { borderRightColor: '#722F37' },
  wallRightActive: { borderLeftColor: '#722F37' },

  wallLabel: { fontSize: 11, fontWeight: '600', color: '#bbb' },
  wallLabelActive: { color: '#722F37' },

  floorArea: {
    position: 'absolute',
    top: 80,
    left: 80,
    right: 80,
    bottom: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorActive: { borderColor: '#722F37', backgroundColor: 'rgba(114,47,55,0.08)' },

  roomCenter: { position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center' },
  roomCenterText: { fontSize: 14, color: '#ccc', fontWeight: '600' },

  selectedCount: { textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 8 },

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
