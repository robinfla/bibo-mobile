import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRoute, useNavigation } from '@react-navigation/native'
import { apiFetch, ApiError } from '../../api/client'
import { colors } from '../../theme/colors'
import { AgingTimeline } from '../../components/AgingTimeline'
import { TastingNotesCard } from '../../components/TastingNotesCard'
import { MealSuggestionsGrid } from '../../components/MealSuggestionsGrid'
import type { WineDetail, InventoryLot } from '../../types/api'

const MATURITY_BADGES = {
  to_age: { emoji: '🍇', label: 'To Age', bg: '#dbeafe', fg: '#1e40af' },
  approaching: { emoji: '🍷', label: 'Approaching', bg: '#fef3c7', fg: '#92400e' },
  peak: { emoji: '✨', label: 'Peak', bg: '#fef9c3', fg: '#854d0e' },
  past_prime: { emoji: '📉', label: 'Past Prime', bg: '#fecaca', fg: '#991b1b' },
  declining: { emoji: '⚠️', label: 'Declining', bg: '#fed7aa', fg: '#9a3412' },
  unknown: { emoji: '', label: '', bg: 'transparent', fg: 'transparent' },
}

export const WineDetailScreen = () => {
  const route = useRoute<any>()
  const navigation = useNavigation()
  const wineId = route.params?.wineId

  const [wine, setWine] = useState<WineDetail | null>(null)
  const [selectedVintage, setSelectedVintage] = useState<number | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!wineId) return
    loadWineDetail()
  }, [wineId])

  const loadWineDetail = async () => {
    setIsLoading(true)
    try {
      const data = await apiFetch<WineDetail>(`/api/wines/${wineId}`)
      
      // Flatten producer/region/appellation for easier access
      const wineWithFlattened = {
        ...data,
        producerName: data.producer?.name ?? 'Unknown Producer',
        regionName: data.region?.name ?? null,
        appellationName: data.appellation?.name ?? null,
      }
      setWine(wineWithFlattened)
      
      // Use vintages from wine detail response — select first vintage + format
      if (data.vintages && data.vintages.length > 0) {
        const firstVintage = data.vintages[0].vintage
        const firstFormat = data.vintages[0].format?.name || 'Standard'
        if (firstVintage) {
          setSelectedVintage(firstVintage)
          setSelectedFormat(firstFormat)
        }
      }
      
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load wine')
    } finally {
      setIsLoading(false)
    }
  }

  const getVintageSummary = () => {
    if (!wine?.vintages) return []
    
    // Group by vintage + format
    const vintageGroups = wine.vintages.reduce((acc, v) => {
      const vintage = v.vintage ?? 0
      const formatName = v.format?.name || 'Standard'
      const key = `${vintage}-${formatName}`
      
      if (!acc[key]) {
        acc[key] = {
          vintage,
          formatName,
          formatVolume: v.format?.volumeMl || 750,
          quantity: 0,
          items: [],
        }
      }
      acc[key].quantity += v.quantity
      acc[key].items.push(v)
      return acc
    }, {} as Record<string, {
      vintage: number
      formatName: string
      formatVolume: number
      quantity: number
      items: typeof wine.vintages
    }>)
    
    return Object.values(vintageGroups).sort((a, b) => {
      if (a.vintage !== b.vintage) return b.vintage - a.vintage
      return b.formatVolume - a.formatVolume // Larger bottles first
    })
  }

  const getSelectedVintageData = () => {
    if (!wine?.vintages || !selectedVintage || !selectedFormat) return null
    return wine.vintages.find(
      v => v.vintage === selectedVintage && (v.format?.name || 'Standard') === selectedFormat
    )
  }

  const getSelectedVintageGroup = () => {
    if (!selectedVintage || !selectedFormat) return null
    const vintages = getVintageSummary()
    return vintages.find(
      v => v.vintage === selectedVintage && v.formatName === selectedFormat
    )
  }

  const getAgingCurveData = () => {
    const vintageData = getSelectedVintageData()
    if (!vintageData?.maturity) return null
    
    const { maturity } = vintageData
    const drinkFrom = maturity.drinkFrom
    const drinkUntil = maturity.drinkUntil
    
    if (!drinkFrom || !drinkUntil) return null
    
    const currentYear = new Date().getFullYear()
    
    // Calculate phase boundaries (1/3, 2/3)
    const windowLength = drinkUntil - drinkFrom
    const thirdLength = Math.max(1, Math.round(windowLength / 3))
    const peakStart = drinkFrom + thirdLength
    const peakEnd = drinkFrom + thirdLength * 2
    
    return {
      drinkFrom,
      drinkUntil,
      peakStart,
      peakEnd,
      currentYear,
      status: maturity.status,
    }
  }



  const renderGrapes = () => {
    if (!wine?.grapes || wine.grapes.length === 0) return null
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grapes 🍇</Text>
        <View style={styles.grapesGrid}>
          {wine.grapes.map((grape, index) => (
            <View key={index} style={styles.grapeChip}>
              <Text style={styles.grapeText}>
                {grape.name} ({grape.percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  const renderMealSuggestions = () => {
    const meals = wine?.foodPairings?.map((pairing, index) => ({
      name: pairing,
      score: 95 - (index * 5), // Placeholder scoring
    })) || [
      { name: 'Grilled Ribeye', score: 95 },
      { name: 'Aged Cheese', score: 90 },
      { name: 'Lamb Ragù', score: 88 },
      { name: 'Duck Confit', score: 85 },
    ]
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Suggestions</Text>
        <MealSuggestionsGrid meals={meals} />
      </View>
    )
  }



  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    )
  }

  if (error || !wine) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Wine not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWineDetail}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const vintages = getVintageSummary()
  const selectedVintageData = getSelectedVintageData()
  const curveData = getAgingCurveData()
  const badge = curveData ? MATURITY_BADGES[curveData.status] : null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header with bottle image */}
      <LinearGradient colors={['#8B4049', '#722F37']} style={styles.header}>
        {wine.bottleImageUrl ? (
          <Image source={{ uri: wine.bottleImageUrl }} style={styles.bottleImage} resizeMode="contain" />
        ) : (
          <Text style={styles.bottleFallback}>🍷</Text>
        )}
        
        <View style={styles.colorBadge}>
          <Text style={styles.colorBadgeText}>{wine.color.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      {/* Wine name & producer */}
      <View style={styles.titleSection}>
        <Text style={styles.wineName}>{wine.name}</Text>
        <Text style={styles.producerName}>{wine.producerName}</Text>
      </View>

      {/* Vintage tabs */}
      {vintages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Vintages</Text>
          <View style={styles.vintageTabsRow}>
            {vintages.map((v, index) => {
              const isActive = selectedVintage === v.vintage && selectedFormat === v.formatName
              return (
                <TouchableOpacity
                  key={`${v.vintage}-${v.formatName}-${index}`}
                  style={styles.vintageTabContainer}
                  onPress={() => {
                    setSelectedVintage(v.vintage)
                    setSelectedFormat(v.formatName)
                  }}
                >
                  <View
                    style={[
                      styles.vintageTab,
                      isActive && styles.vintageTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.vintageTabText,
                        isActive && styles.vintageTabTextActive,
                      ]}
                    >
                      {v.vintage} (x{v.quantity})
                    </Text>
                  </View>
                  <Text style={styles.vintageFormatText}>
                    {v.formatName} {v.formatVolume}ml
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}

      {/* Maturity status & drinking window */}
      {selectedVintageData && curveData && badge && badge.label && (
        <View style={styles.section}>
          <View style={styles.maturityRow}>
            <View style={[styles.maturityBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.maturityBadgeText, { color: badge.fg }]}>
                {badge.emoji} {badge.label}
              </Text>
            </View>
            
            <View style={styles.drinkingWindow}>
              <Text style={styles.drinkingWindowLabel}>Maturity date</Text>
              <Text style={styles.drinkingWindowDate}>
                {curveData.drinkFrom} - {curveData.drinkUntil}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Average buy price & current value */}
      {selectedVintageData?.purchasePricePerBottle && (
        <View style={styles.section}>
          <View style={styles.valueRow}>
            <View>
              <Text style={styles.valueLabel}>Average buy price</Text>
              <Text style={styles.valueAmount}>
                {selectedVintageData.purchaseCurrency || '€'}
                {selectedVintageData.purchasePricePerBottle} / bottle
              </Text>
            </View>
            
            <Text style={styles.valueChangeCenter}>
              {selectedVintageData.valuation?.priceEstimate && (() => {
                const purchase = parseFloat(selectedVintageData.purchasePricePerBottle!)
                const current = parseFloat(selectedVintageData.valuation.priceEstimate!)
                const change = Math.round(((current - purchase) / purchase) * 100)
                return `${change >= 0 ? '+' : ''}${change}% ${change >= 0 ? '📈' : '📉'}`
              })()}
            </Text>
            
            {selectedVintageData.valuation?.priceEstimate && (
              <View style={styles.valueRight}>
                <Text style={styles.valueLabel}>Current value</Text>
                <Text style={styles.valueAmount}>
                  {selectedVintageData.purchaseCurrency || '€'}
                  {selectedVintageData.valuation.priceEstimate}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Vintage notes */}
      {wine.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vintage notes and reviews 📝</Text>
          <Text style={styles.notesText}>{wine.notes}</Text>
        </View>
      )}

      {/* Aging Phase */}
      {curveData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aging Phase</Text>
          <Text style={styles.sectionSubtitle}>
            Drinking Window ({curveData.drinkFrom}-{curveData.drinkUntil} vintage)
          </Text>
          
          <AgingTimeline
            drinkFrom={curveData.drinkFrom}
            drinkUntil={curveData.drinkUntil}
            currentYear={curveData.currentYear}
          />
        </View>
      )}

      {/* Tasting Notes */}
      {(() => {
        // Get most recent tasting note from history
        const tastingHistory = wine?.history
          ?.filter(h => h.tastingNotes || h.rating)
          .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
        const latestTasting = tastingHistory?.[0]
        
        if (!latestTasting) return null
        
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasting Notes</Text>
            <TastingNotesCard 
              score={latestTasting.rating || undefined} 
              notes={latestTasting.tastingNotes || undefined} 
            />
          </View>
        )
      })()}

      {/* Grapes */}
      {renderGrapes()}

      {/* Meal Suggestions */}
      {renderMealSuggestions()}

      {/* Comments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comments</Text>
        <View style={styles.commentsCard}>
          <Text style={styles.commentsText}>
            Purchased at auction. Excellent provenance. Store in lower cellar, temperature stable at 13°C. Open 2030 for best experience. Decant 2 hours before serving.
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Actions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.muted[50],
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bottleImage: {
    width: 100,
    height: 150,
  },
  bottleFallback: {
    fontSize: 80,
    opacity: 0.6,
  },
  colorBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  colorBadgeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  titleSection: {
    padding: 16,
    alignItems: 'center',
  },
  wineName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  producerName: {
    fontSize: 16,
    color: colors.primary[600],
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.muted[500],
    marginBottom: 12,
  },
  vintageTabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  vintageTabContainer: {
    alignItems: 'center',
  },
  vintageTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.muted[300],
    marginBottom: 6,
  },
  vintageTabActive: {
    backgroundColor: '#722F37',
    borderColor: '#722F37',
  },
  vintageTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[700],
  },
  vintageTabTextActive: {
    color: colors.white,
  },
  vintageFormatText: {
    fontSize: 11,
    color: colors.muted[500],
    textAlign: 'center',
  },
  maturityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maturityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  maturityBadgeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  drinkingWindow: {
    alignItems: 'flex-end',
  },
  drinkingWindowLabel: {
    fontSize: 12,
    color: colors.muted[500],
    marginBottom: 2,
  },
  drinkingWindowDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueChangeCenter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  valueLabel: {
    fontSize: 12,
    color: colors.muted[500],
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  valueRight: {
    alignItems: 'flex-end',
  },
  valueChange: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.muted[700],
    lineHeight: 20,
    fontStyle: 'italic',
  },
  curveContainer: {
    marginTop: 12,
  },
  curveLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  curveLabel: {
    alignItems: 'center',
  },
  curveLabelYear: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted[600],
  },
  curveLabelText: {
    fontSize: 10,
    color: colors.muted[500],
    marginTop: 2,
  },
  commentsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted[200],
    padding: 16,
  },
  commentsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1f2937',
  },
  grapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grapeChip: {
    backgroundColor: colors.muted[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  grapeText: {
    fontSize: 13,
    color: colors.muted[700],
    fontWeight: '500',
  },


  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#722F37',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[300],
  },
  removeButtonText: {
    color: colors.muted[700],
    fontSize: 16,
    fontWeight: '600',
  },
})
