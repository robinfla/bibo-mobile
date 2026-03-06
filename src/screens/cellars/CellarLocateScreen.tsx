import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useRoute, useNavigation } from '@react-navigation/native'
import { apiFetch, ApiError } from '../../api/client'
import { QuickConsumeModal } from '../../components/QuickConsumeModal'

interface Bottle {
  row: number
  column: number
  wineId: number
  lotId: number
  color: string
  wineName: string
  producerName: string
  vintage: number | null
  region: string
  stock: number
  highlighted: boolean
}

interface LocateResponse {
  cellarId: number
  cellarName: string
  spaceId: number
  spaceName: string
  rackId: number
  rackName: string
  position: {
    row: number
    column: number
  }
  wineColor: string
  zoomContext: {
    rowStart: number
    rowEnd: number
    columnStart: number
    columnEnd: number
    bottles: Bottle[]
  }
  filters: {
    wineName: string
    grape?: string | null
    vintage?: number | null
  }
}

export const CellarLocateScreen = () => {
  const route = useRoute<any>()
  const navigation = useNavigation()
  const { cellarId, highlightWineId, vintage } = route.params || {}

  const [data, setData] = useState<LocateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null)
  const [showConsumeModal, setShowConsumeModal] = useState(false)
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!cellarId || !highlightWineId) return
    loadData()
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [cellarId, highlightWineId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const vintageParam = vintage ? `&vintage=${vintage}` : ''
      const result = await apiFetch<LocateResponse>(
        `/api/cellars/${cellarId}/locate?wineId=${highlightWineId}${vintageParam}`
      )
      setData(result)
    } catch (error) {
      console.error('Failed to load cellar location:', error)
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load cellar location'
      
      Alert.alert(
        'Location Not Found',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getHighlightGradient = (): [string, string] => {
    // Always use green for highlighted bottles
    return ['#4caf50', '#2e7d32']
  }

  const getGlowColor = (): string => {
    // Green glow for highlighted bottles
    return 'rgba(76, 175, 80, 0.4)'
  }

  const getBottleColor = (color: string): string => {
    // Much more dimmed colors for non-highlighted bottles
    switch (color) {
      case 'red':
        return 'rgba(239, 154, 154, 0.3)' // Very dimmed red
      case 'white':
        return 'rgba(255, 245, 157, 0.3)' // Very dimmed yellow
      case 'rose':
        return 'rgba(248, 187, 208, 0.3)' // Very dimmed pink
      default:
        return 'rgba(224, 224, 224, 0.3)' // Very dimmed gray
    }
  }

  const handleBottleTap = (bottle: Bottle) => {
    if (bottle.highlighted) {
      setSelectedBottle(bottle)
      setShowConsumeModal(true)
    }
  }

  const handleConsumeSuccess = () => {
    setShowConsumeModal(false)
    setSelectedBottle(null)
    // Reload data to update stock counts
    loadData()
  }

  const renderGrid = () => {
    if (!data) return null

    const { zoomContext, position, wineColor } = data
    const { rowStart, rowEnd, columnStart, columnEnd, bottles } = zoomContext

    const rows = []
    for (let row = rowStart; row <= rowEnd; row++) {
      const cols = []
      for (let col = columnStart; col <= columnEnd; col++) {
        const bottle = bottles.find((b) => b.row === row && b.column === col)
        const isHighlighted = bottle?.highlighted || false

        cols.push(
          <View key={`${row}-${col}`} style={styles.slotContainer}>
            {bottle ? (
              isHighlighted ? (
                <TouchableOpacity
                  onPress={() => handleBottleTap(bottle)}
                  activeOpacity={0.7}
                  style={styles.bottleWrapper}
                >
                  <Animated.View
                    style={[
                      styles.bottleWrapper,
                      {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={getHighlightGradient()}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.bottle,
                        {
                          shadowColor: getGlowColor(),
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 1,
                          shadowRadius: 24,
                          elevation: 16,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.glowRing,
                          { borderColor: getGlowColor() },
                        ]}
                      />
                      <View
                        style={[
                          styles.glowRingOuter,
                          { 
                            shadowColor: getGlowColor(),
                            shadowOpacity: 0.5,
                          },
                        ]}
                      />
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.bottle,
                    { backgroundColor: getBottleColor(bottle.color) },
                  ]}
                />
              )
            ) : (
              <View style={styles.emptySlot} />
            )}
          </View>
        )
      }
      rows.push(
        <View key={row} style={styles.gridRow}>
          {cols}
        </View>
      )
    }

    return rows
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#722F37" />
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load location</Text>
      </View>
    )
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // @ts-ignore - Replace instead of navigate to remove zoom view from stack
            navigation.replace('RackView', { 
              rackId: data.rackId,
              spaceId: data.spaceId,
            })
          }}
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cellars</Text>
          <Text style={styles.headerSubtitle}>{data.cellarName}</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <LinearGradient
          colors={['#722F37', '#944654']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.filterChip}
        >
          <Icon name="filter-check" size={16} color="#fff" />
          <Text style={styles.filterChipText}>{data.filters.wineName}</Text>
        </LinearGradient>
        {data.filters.vintage && (
          <LinearGradient
            colors={['#722F37', '#944654']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.filterChip}
          >
            <Text style={styles.filterChipText}>{data.filters.vintage}</Text>
          </LinearGradient>
        )}
      </View>

      {/* Rack Card */}
      <View style={styles.content}>
        <View style={styles.rackCard}>
          <Text style={styles.rackTitle}>{data.rackName}</Text>
          <Text style={styles.rackSubtitle}>{data.cellarName}</Text>
          <Text style={styles.zoomLabel}>
            ZOOMED VIEW · ROW {data.zoomContext.rowStart}-{data.zoomContext.rowEnd}
          </Text>

          {/* Grid */}
          <View style={styles.grid}>{renderGrid()}</View>

          {/* Position Label */}
          <LinearGradient
            colors={['#fef9f5', '#f8f4f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.positionLabel}
          >
            <Text style={styles.positionIcon}>🎯</Text>
            <Text style={styles.positionText}>
              Row {data.position.row} · Position {data.position.column}
            </Text>
          </LinearGradient>
        </View>
      </View>
      </SafeAreaView>

      {/* Quick Consume Modal */}
      {selectedBottle && (
        <QuickConsumeModal
          visible={showConsumeModal}
          onClose={() => {
            setShowConsumeModal(false)
            setSelectedBottle(null)
          }}
          onSuccess={handleConsumeSuccess}
          inventoryLotId={selectedBottle.lotId}
          wineName={`${selectedBottle.producerName} ${selectedBottle.wineName}`}
          vintage={selectedBottle.vintage}
          region={selectedBottle.region}
          stock={selectedBottle.stock}
          wineColor={selectedBottle.color as any}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef9f5',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.15)',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  rackCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  rackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  rackSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  zoomLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 20,
  },
  grid: {
    gap: 12,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  slotContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottleWrapper: {
    width: 48,
    height: 48,
  },
  bottle: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  emptySlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e0e0e0',
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    borderWidth: 4,
  },
  glowRingOuter: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 36,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 48,
    elevation: 16,
  },
  positionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.2)',
  },
  positionIcon: {
    fontSize: 16,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#722F37',
  },
})
