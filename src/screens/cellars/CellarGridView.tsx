import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useRoute, useNavigation } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

interface GridSlot {
  slotNumber: number
  wineId?: number
  lotId?: number
  quantity?: number
  color?: string
  isEmpty: boolean
  highlighted: boolean
}

interface GridRow {
  rowNumber: number
  slots: GridSlot[]
}

interface CellarGrid {
  cellarId: number
  rows: GridRow[]
}

interface LocateInfo {
  cellarId: number
  cellarName: string
  filters: {
    wineName: string
    grape?: string | null
    vintage?: number | null
  }
}

export const CellarGridView = () => {
  const route = useRoute<any>()
  const navigation = useNavigation()
  const { cellarId, highlightWineId } = route.params || {}

  const [grid, setGrid] = useState<CellarGrid | null>(null)
  const [locateInfo, setLocateInfo] = useState<LocateInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pulseAnim = new Animated.Value(1)

  useEffect(() => {
    if (!cellarId || !highlightWineId) return
    loadGridData()
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [cellarId, highlightWineId])

  const loadGridData = async () => {
    try {
      setIsLoading(true)

      const [gridData, locateData] = await Promise.all([
        apiFetch<CellarGrid>(`/api/cellars/${cellarId}/grid?highlightWineId=${highlightWineId}`),
        apiFetch<LocateInfo>(`/api/cellars/${cellarId}/locate?wineId=${highlightWineId}`),
      ])

      setGrid(gridData)
      setLocateInfo(locateData)
    } catch (error) {
      console.error('Failed to load cellar grid:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getBottleColor = (slot: GridSlot) => {
    if (slot.isEmpty) return colors.muted[200]
    if (slot.highlighted) return colors.coral
    
    switch (slot.color) {
      case 'red': return colors.coralDark
      case 'white': return '#f4e8d0'
      case 'rose': return '#ff9999'
      default: return colors.textTertiary
    }
  }

  const highlightedCount = grid?.rows.reduce((count, row) => 
    count + row.slots.filter(s => s.highlighted).length, 0
  ) || 0

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.coral} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cellars</Text>
          <Text style={styles.headerSubtitle}>{locateInfo?.cellarName || 'Main Cellar'}</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Chips */}
      {locateInfo && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterChip}>
            <Icon name="filter-check" size={16} color={colors.textInverse} />
            <Text style={styles.filterChipText}>{locateInfo.filters.wineName}</Text>
          </View>
          {locateInfo.filters.vintage && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{locateInfo.filters.vintage}</Text>
            </View>
          )}
        </View>
      )}

      {/* Info Banner */}
      {highlightedCount > 0 && (
        <LinearGradient
          colors={['#fff3e0', '#ffe0b2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoBanner}
        >
          <Icon name="information-outline" size={20} color="#ef6c00" />
          <Text style={styles.infoBannerText}>
            <Text style={styles.infoBannerBold}>{highlightedCount} bottle{highlightedCount > 1 ? 's' : ''}</Text> found matching filters
          </Text>
        </LinearGradient>
      )}

      {/* Cellar Grid */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.gridContainer}>
          {grid?.rows.map((row) => (
            <View key={row.rowNumber} style={styles.row}>
              {/* Row Label */}
              <View style={styles.rowLabel}>
                <Text style={styles.rowLabelText}>{row.rowNumber}</Text>
              </View>

              {/* Shelf */}
              <LinearGradient
                colors={['#e8d4a8', '#d4c094']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shelf}
              >
                {/* Bottles */}
                {row.slots.map((slot) => (
                  <TouchableOpacity
                    key={slot.slotNumber}
                    style={styles.bottleSlot}
                    disabled={slot.isEmpty}
                    activeOpacity={0.7}
                  >
                    {!slot.isEmpty && (
                      <Animated.View
                        style={[
                          styles.bottle,
                          {
                            backgroundColor: getBottleColor(slot),
                            transform: slot.highlighted ? [{ scale: pulseAnim }] : [],
                          },
                        ]}
                      >
                        {slot.highlighted && (
                          <View style={styles.glowRing} />
                        )}
                      </Animated.View>
                    )}
                  </TouchableOpacity>
                ))}
              </LinearGradient>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.linen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.15)',
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c68a5e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textInverse,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef6c00',
    gap: 8,
  },
  infoBannerText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_400Regular',
    color: '#ef6c00',
  },
  infoBannerBold: {
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  gridContainer: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabelText: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textInverse,
  },
  shelf: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  bottleSlot: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottle: {
    width: 24,
    height: 64,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: 'rgba(114, 47, 55, 0.3)',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
})
