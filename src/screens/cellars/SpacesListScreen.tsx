import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

interface Space {
  id: number
  name: string
  type: 'room' | 'fridge'
  wallCount: number
  rackCount: number
  totalSlots: number
  filledSlots: number
}

export const SpacesListScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { cellarId, cellarName } = route.params

  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSpaces = useCallback(async () => {
    try {
      const data = await apiFetch<Space[]>(`/api/cellars/${cellarId}/spaces`)
      setSpaces(data)
    } catch (err) {
      console.error('Failed to fetch spaces:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [cellarId])

  useFocusEffect(
    useCallback(() => {
      fetchSpaces()
    }, [fetchSpaces])
  )

  const handleDeleteSpace = (space: Space) => {
    Alert.alert(
      'Delete Space',
      `Delete "${space.name}" and all its racks? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/api/spaces/${space.id}`, { method: 'DELETE' })
              fetchSpaces()
            } catch (err) {
              Alert.alert('Error', 'Failed to delete space')
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#722F37" style={{ marginTop: 100 }} />
      </View>
    )
  }

  const isEmpty = spaces.length === 0

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{cellarName}</Text>
        <Text style={styles.subtitle}>
          {isEmpty ? 'No spaces yet' : `${spaces.length} space${spaces.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSpaces() }} />}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Create spaces to organize your cellar</Text>
            <Text style={styles.emptyDesc}>
              Add rooms, fridges, or cabinets to map where your bottles live.
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('CreateSpace', { cellarId })}
            >
              <Text style={styles.createBtnText}>+ Create First Space</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {spaces.map((space) => (
              <TouchableOpacity
                key={space.id}
                style={styles.spaceCard}
                onPress={() => navigation.navigate('SpaceDetail', { spaceId: space.id, spaceName: space.name, spaceType: space.type, cellarId })}
                onLongPress={() => handleDeleteSpace(space)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={space.type === 'room' ? ['#1a1a2e', '#16213e'] : ['#1a1a2e', '#0f3460']}
                  style={styles.spaceGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.spaceHeader}>
                    <Text style={styles.spaceIcon}>{space.type === 'room' ? '🏠' : '❄️'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.spaceName}>{space.name}</Text>
                      <Text style={styles.spaceType}>
                        {space.type === 'room' ? 'Room' : 'Fridge / Cabinet'}
                        {space.type === 'room' && space.wallCount > 0 ? ` · ${space.wallCount} wall${space.wallCount !== 1 ? 's' : ''}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>

                  {/* Stats row */}
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{space.rackCount}</Text>
                      <Text style={styles.statLabel}>Racks</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{space.filledSlots}</Text>
                      <Text style={styles.statLabel}>Bottles</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{space.totalSlots - space.filledSlots}</Text>
                      <Text style={styles.statLabel}>Empty</Text>
                    </View>
                  </View>

                  {/* Fill bar */}
                  {space.totalSlots > 0 && (
                    <View style={styles.fillBarBg}>
                      <View style={[styles.fillBar, { width: `${(space.filledSlots / space.totalSlots) * 100}%` }]} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.addSpaceBtn}
              onPress={() => navigation.navigate('CreateSpace', { cellarId })}
            >
              <Text style={styles.addSpaceBtnText}>+ Add Space</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.muted[50] },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 16, color: '#722F37', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: colors.muted[900], marginTop: 4 },
  subtitle: { fontSize: 14, color: colors.muted[500], marginTop: 2 },
  content: { padding: 20, paddingTop: 8 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.muted[900], textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: colors.muted[500], textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  createBtn: { marginTop: 24, backgroundColor: '#722F37', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Space card
  spaceCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  spaceGradient: { padding: 20 },
  spaceHeader: { flexDirection: 'row', alignItems: 'center' },
  spaceIcon: { fontSize: 28, marginRight: 12 },
  spaceName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  spaceType: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  chevron: { fontSize: 28, color: 'rgba(255,255,255,0.4)', fontWeight: '300' },

  statsRow: { flexDirection: 'row', marginTop: 16, gap: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  fillBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: 14 },
  fillBar: { height: 4, backgroundColor: '#722F37', borderRadius: 2 },

  addSpaceBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  addSpaceBtnText: { fontSize: 16, fontWeight: '600', color: '#722F37' },
})
