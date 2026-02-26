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
      
      // Use vintages from wine detail response
      if (data.vintages && data.vintages.length > 0) {
        const firstVintage = data.vintages[0].vintage
        if (firstVintage) setSelectedVintage(firstVintage)
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
    
    const vintageGroups = wine.vintages.reduce((acc, v) => {
      const vintage = v.vintage ?? 0
      if (!acc[vintage]) {
        acc[vintage] = { vintage, quantity: 0, items: [] }
      }
      acc[vintage].quantity += v.quantity
      acc[vintage].items.push(v)
      return acc
    }, {} as Record<number, { vintage: number; quantity: number; items: typeof wine.vintages }>)
    
    return Object.values(vintageGroups).sort((a, b) => b.vintage - a.vintage)
  }

  const getSelectedVintageData = () => {
    if (!wine?.vintages || !selectedVintage) return null
    return wine.vintages.find(v => v.vintage === selectedVintage)
  }

  const getAgingCurveData = () => {
    if (!selectedVintage || !wine) return null
    
    const drinkFromYears = wine.defaultDrinkFromYears ?? 5
    const drinkUntilYears = wine.defaultDrinkUntilYears ?? 15
    
    const drinkFrom = selectedVintage + drinkFromYears
    const drinkUntil = selectedVintage + drinkUntilYears
    const currentYear = new Date().getFullYear()
    
    // Calculate phase boundaries (1/3, 2/3)
    const windowLength = drinkUntil - drinkFrom
    const thirdLength = Math.max(1, Math.round(windowLength / 3))
    const peakStart = drinkFrom + thirdLength
    const peakEnd = drinkFrom + thirdLength * 2
    
    // Determine status based on current year
    let status: keyof typeof MATURITY_BADGES = 'unknown'
    if (currentYear < drinkFrom) {
      status = 'to_age'
    } else if (currentYear < peakStart) {
      status = 'approaching'
    } else if (currentYear <= peakEnd) {
      status = 'peak'
    } else if (currentYear <= drinkUntil) {
      status = 'past_prime'
    } else {
      status = 'declining'
    }
    
    return {
      drinkFrom,
      drinkUntil,
      peakStart,
      peakEnd,
      currentYear,
      status,
    }
  }

  const renderAgingCurve = () => {
    const curveData = getAgingCurveData()
    if (!curveData) return null
    
    const { drinkFrom, drinkUntil, peakStart, peakEnd, currentYear } = curveData
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aging Phase</Text>
        <Text style={styles.sectionSubtitle}>
          Drinking Window ({drinkFrom}-{drinkUntil} vintage)
        </Text>
        
        {/* Curve visualization */}
        <View style={styles.curveContainer}>
          <View style={styles.curveLabels}>
            <View style={styles.curveLabel}>
              <Text style={styles.curveLabelYear}>{drinkFrom}</Text>
              <Text style={styles.curveLabelText}>Youth</Text>
            </View>
            <View style={styles.curveLabel}>
              <Text style={styles.curveLabelYear}>{peakStart}-{peakEnd}</Text>
              <Text style={styles.curveLabelText}>Maturity</Text>
            </View>
            <View style={styles.curveLabel}>
              <Text style={styles.curveLabelYear}>{peakEnd}</Text>
              <Text style={styles.curveLabelText}>Peak</Text>
            </View>
            <View style={styles.curveLabel}>
              <Text style={styles.curveLabelYear}>{drinkUntil}</Text>
              <Text style={styles.curveLabelText}>Decline</Text>
            </View>
          </View>
          
          {/* Emoji curve markers */}
          <View style={styles.curveEmojis}>
            <Text style={styles.curveEmoji}>🍇</Text>
            <Text style={styles.curveEmoji}>😊</Text>
            <Text style={styles.curveEmoji}>😍</Text>
            <Text style={styles.curveEmoji}>📉</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderTasteCharacteristics = () => {
    if (!wine) return null
    
    const characteristics = [
      { label: 'Light', value: wine.bodyWeight ?? 50, inverseLabel: 'Heavy' },
      { label: 'Flexible', value: wine.tanninLevel ?? 50, inverseLabel: 'Tannic' },
      { label: 'Dry', value: wine.sweetnessLevel ?? 50, inverseLabel: 'Sweet' },
      { label: 'Soft', value: wine.acidityLevel ?? 50, inverseLabel: 'Acid' },
    ]
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taste Characteristics 🍷</Text>
        {characteristics.map((char, index) => (
          <View key={index} style={styles.characteristicRow}>
            <Text style={styles.characteristicLabel}>{char.label}</Text>
            <View style={styles.characteristicBar}>
              <View style={[styles.characteristicFill, { width: `${char.value}%` }]} />
            </View>
            <Text style={styles.characteristicLabel}>{char.inverseLabel}</Text>
          </View>
        ))}
      </View>
    )
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

  const renderAdaptedMeals = () => {
    const meals = [
      { name: 'Beef', match: 95 },
      { name: 'Lamb', match: 90 },
      { name: 'Duck', match: 85 },
      { name: 'Aged Cheese', match: 80 },
    ]
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adapted Meals</Text>
        <View style={styles.mealsGrid}>
          {meals.map((meal, index) => (
            <View key={index} style={styles.mealCard}>
              <View style={styles.mealImagePlaceholder}>
                <View style={styles.mealMatchBadge}>
                  <Text style={styles.mealMatchText}>{meal.match}%</Text>
                </View>
              </View>
              <Text style={styles.mealName}>{meal.name}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  const renderServingGuide = () => {
    if (!wine) return null
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serving Guide</Text>
        
        {wine.servingTempCelsius && (
          <View style={styles.guideRow}>
            <Text style={styles.guideIcon}>🌡️</Text>
            <View>
              <Text style={styles.guideTitle}>{wine.servingTempCelsius}°C</Text>
              <Text style={styles.guideSubtitle}>Slightly below room temperature</Text>
            </View>
          </View>
        )}
        
        {wine.decantMinutes && (
          <View style={styles.guideRow}>
            <Text style={styles.guideIcon}>⏱️</Text>
            <View>
              <Text style={styles.guideTitle}>{wine.decantMinutes} minutes</Text>
              <Text style={styles.guideSubtitle}>Allow time to breathe before serving</Text>
            </View>
          </View>
        )}
        
        {wine.glassType && (
          <View style={styles.guideRow}>
            <Text style={styles.guideIcon}>🍷</Text>
            <View>
              <Text style={styles.guideTitle}>{wine.glassType}</Text>
              <Text style={styles.guideSubtitle}>Use a large bowl to aerate the wine</Text>
            </View>
          </View>
        )}
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
            {vintages.map((v) => (
              <TouchableOpacity
                key={v.vintage}
                style={[
                  styles.vintageTab,
                  selectedVintage === v.vintage && styles.vintageTabActive,
                ]}
                onPress={() => setSelectedVintage(v.vintage)}
              >
                <Text
                  style={[
                    styles.vintageTabText,
                    selectedVintage === v.vintage && styles.vintageTabTextActive,
                  ]}
                >
                  {v.vintage} (x{v.quantity})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Maturity badge & value */}
      {selectedVintageData && (
        <View style={styles.section}>
          {badge && badge.label && (
            <View style={[styles.maturityBadgeLarge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.maturityBadgeLargeText, { color: badge.fg }]}>
                {badge.emoji} {badge.label}
              </Text>
            </View>
          )}
          
          {selectedVintageData.purchasePricePerBottle && (
            <View style={styles.valueRow}>
              <View>
                <Text style={styles.valueLabel}>Average buy price</Text>
                <Text style={styles.valueAmount}>
                  {selectedVintageData.purchaseCurrency || '€'}
                  {selectedVintageData.purchasePricePerBottle} / bottle
                </Text>
              </View>
              {selectedVintageData.valuation?.priceEstimate && (
                <View style={styles.valueRight}>
                  <Text style={styles.valueLabel}>Current value</Text>
                  <Text style={styles.valueAmount}>
                    {selectedVintageData.purchaseCurrency || '€'}
                    {selectedVintageData.valuation.priceEstimate}
                  </Text>
                  <Text style={styles.valueChange}>
                    {(() => {
                      const purchase = parseFloat(selectedVintageData.purchasePricePerBottle)
                      const current = parseFloat(selectedVintageData.valuation.priceEstimate!)
                      const change = Math.round(((current - purchase) / purchase) * 100)
                      return `${change >= 0 ? '+' : ''}${change}% ${change >= 0 ? '📈' : '📉'}`
                    })()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Vintage notes */}
      {wine.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vintage notes and reviews 📝</Text>
          <Text style={styles.notesText}>{wine.notes}</Text>
        </View>
      )}

      {/* Aging curve */}
      {renderAgingCurve()}

      {/* Taste characteristics */}
      {renderTasteCharacteristics()}

      {/* Grapes */}
      {renderGrapes()}

      {/* Adapted meals */}
      {renderAdaptedMeals()}

      {/* Serving guide */}
      {renderServingGuide()}

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
    gap: 8,
  },
  vintageTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.muted[100],
    borderWidth: 1,
    borderColor: colors.muted[300],
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
  maturityBadgeLarge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  maturityBadgeLargeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  curveEmojis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  curveEmoji: {
    fontSize: 32,
  },
  characteristicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  characteristicLabel: {
    fontSize: 13,
    color: colors.muted[600],
    width: 60,
  },
  characteristicBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.muted[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  characteristicFill: {
    height: '100%',
    backgroundColor: '#b8946d',
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
  mealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealCard: {
    width: '48%',
  },
  mealImagePlaceholder: {
    height: 100,
    backgroundColor: '#d4a574',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealMatchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mealMatchText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 8,
    textAlign: 'center',
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  guideIcon: {
    fontSize: 24,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  guideSubtitle: {
    fontSize: 13,
    color: colors.muted[500],
    marginTop: 2,
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
