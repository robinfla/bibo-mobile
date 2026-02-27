import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRoute, useNavigation } from '@react-navigation/native'
import { apiFetch, ApiError } from '../../api/client'
import { colors } from '../../theme/colors'
import { WineActionFAB } from '../../components/WineActionFAB'
import { WineMenuDropdown } from '../../components/WineMenuDropdown'
import type { WineDetail } from '../../types/api'

const MATURITY_COLORS = {
  to_age: { bg: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', color: '#1e40af', label: 'To Age' },
  approaching: { bg: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', color: '#ef6c00', label: 'Approaching' },
  peak: { bg: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', color: '#2e7d32', label: 'Peak' },
  past_prime: { bg: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', color: '#c2185b', label: 'Past Prime' },
  declining: { bg: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', color: '#c2185b', label: 'Declining' },
  unknown: { bg: '#f0f0f0', color: '#999', label: 'Unknown' },
}

export const WineDetailScreenV3 = () => {
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
      const wineWithFlattened = {
        ...data,
        producerName: data.producer?.name ?? 'Unknown Producer',
        regionName: data.region?.name ?? null,
        appellationName: data.appellation?.name ?? null,
      }
      setWine(wineWithFlattened)
      
      if (data.vintages && data.vintages.length > 0) {
        const firstVintage = data.vintages[0].vintage
        if (firstVintage) {
          setSelectedVintage(firstVintage)
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
    
    const vintageGroups = wine.vintages.reduce((acc, v) => {
      const vintage = v.vintage ?? 0
      const formatName = v.format?.name || 'Standard'
      const formatVolume = v.format?.volumeMl || 750
      const key = `${vintage}`
      
      if (!acc[key]) {
        acc[key] = {
          vintage,
          formatName,
          formatVolume,
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
    
    return Object.values(vintageGroups).sort((a, b) => b.vintage - a.vintage)
  }

  const getSelectedVintageData = () => {
    if (!wine?.vintages || !selectedVintage) return null
    return wine.vintages.find(v => v.vintage === selectedVintage)
  }

  // Action handlers
  const handleConsume = () => {
    Alert.alert('Coming Soon', 'Consume flow will be implemented.')
  }

  const handleAddTastingNote = () => {
    Alert.alert('Coming Soon', 'Tasting note editor will be implemented.')
  }

  const handleEditDetails = () => {
    Alert.alert('Coming Soon', 'Wine editor will be implemented.')
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this wine: ${wine?.name} by ${wine?.producerName}`,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleRemove = () => {
    Alert.alert(
      'Remove from Cellar',
      'Are you sure you want to remove this wine from your cellar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Removed', 'Wine removed from cellar.')
            navigation.goBack()
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#722F37" />
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
  const maturityWindow = selectedVintageData?.maturity?.drinkFrom && selectedVintageData?.maturity?.drinkUntil
    ? `${selectedVintageData.maturity.drinkFrom} – ${selectedVintageData.maturity.drinkUntil}`
    : null
  const maturityStatus = selectedVintageData?.maturity?.status || 'unknown'
  const maturityConfig = MATURITY_COLORS[maturityStatus]

  // Get tasting note
  const tastingHistory = wine.history
    ?.filter(h => h.tastingNotes || h.rating)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
  const latestTasting = tastingHistory?.[0]

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#8b4d5a', '#722F37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Overlaid Navigation */}
          <View style={styles.heroNav}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{wine.color.toUpperCase()}</Text>
            </View>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.wineGlass}>🍷</Text>
            <Text style={styles.heroTitle}>{wine.name}</Text>
            <Text style={styles.heroSubtitle}>{wine.producerName}</Text>
          </View>
        </LinearGradient>

        {/* Sticky Sub-Header */}
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderTitle}>
            {wine.name} {selectedVintage}
          </Text>
          <WineMenuDropdown
            onEditDetails={handleEditDetails}
            onShare={handleShare}
            onRemove={handleRemove}
          />
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Your Vintages Card */}
          {vintages.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Vintages</Text>
              <View style={styles.vintageChips}>
                {vintages.map((v) => {
                  const isSelected = selectedVintage === v.vintage
                  return (
                    <TouchableOpacity
                      key={v.vintage}
                      style={[
                        styles.vintageChip,
                        isSelected && styles.vintageChipSelected,
                      ]}
                      onPress={() => setSelectedVintage(v.vintage)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.vintageYear, isSelected && styles.vintageYearSelected]}>
                        {v.vintage} (x{v.quantity})
                      </Text>
                      <Text style={[styles.vintageMeta, isSelected && styles.vintageMetaSelected]}>
                        {v.formatName} {v.formatVolume}ml
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          {/* Maturity Card */}
          {maturityWindow && (
            <View style={styles.card}>
              <View style={styles.maturityRow}>
                <View style={[styles.maturityBadge, { backgroundColor: maturityConfig.bg }]}>
                  <View style={[styles.maturityDot, { backgroundColor: maturityConfig.color }]} />
                  <Text style={[styles.maturityLabel, { color: maturityConfig.color }]}>
                    {maturityConfig.label}
                  </Text>
                </View>
                <View style={styles.maturityDates}>
                  <Text style={styles.maturityDatesLabel}>MATURITY WINDOW</Text>
                  <Text style={styles.maturityDatesValue}>{maturityWindow}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Aging Phase Card */}
          {selectedVintageData?.maturity?.drinkFrom && selectedVintageData?.maturity?.drinkUntil && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Aging Phase</Text>
              
              {/* Timeline Track */}
              <View style={styles.timeline}>
                <View style={styles.timelineTrack}>
                  <View style={[styles.timelineSegment, styles.timelineYouth]} />
                  <View style={[styles.timelineSegment, styles.timelineMaturity]} />
                  <View style={[styles.timelineSegment, styles.timelinePeak]} />
                  <View style={[styles.timelineSegment, styles.timelineDecline]} />
                </View>
                
                {/* Position Marker */}
                {(() => {
                  const drinkFrom = selectedVintageData.maturity.drinkFrom
                  const drinkUntil = selectedVintageData.maturity.drinkUntil
                  const currentYear = new Date().getFullYear()
                  const windowLength = drinkUntil - drinkFrom
                  const position = currentYear < drinkFrom
                    ? 0
                    : currentYear > drinkUntil
                    ? 100
                    : ((currentYear - drinkFrom) / windowLength) * 100

                  return (
                    <View style={[styles.timelineMarker, { left: `${position}%` }]}>
                      <View style={styles.timelineMarkerDot} />
                    </View>
                  )
                })()}
              </View>

              {/* Timeline Labels */}
              <View style={styles.timelineLabels}>
                {(() => {
                  const drinkFrom = selectedVintageData.maturity.drinkFrom
                  const drinkUntil = selectedVintageData.maturity.drinkUntil
                  const windowLength = drinkUntil - drinkFrom
                  const thirdLength = Math.max(1, Math.round(windowLength / 3))
                  const peakStart = drinkFrom + thirdLength
                  const peakEnd = drinkFrom + thirdLength * 2

                  return (
                    <>
                      <View style={styles.timelineLabel}>
                        <Text style={styles.timelineLabelYear}>{drinkFrom}</Text>
                        <Text style={styles.timelineLabelPhase}>Youth</Text>
                      </View>
                      <View style={styles.timelineLabel}>
                        <Text style={styles.timelineLabelYear}>{peakStart}</Text>
                        <Text style={styles.timelineLabelPhase}>Maturity</Text>
                      </View>
                      <View style={styles.timelineLabel}>
                        <Text style={styles.timelineLabelYear}>{peakEnd}</Text>
                        <Text style={styles.timelineLabelPhase}>Peak</Text>
                      </View>
                      <View style={styles.timelineLabel}>
                        <Text style={styles.timelineLabelYear}>{drinkUntil}</Text>
                        <Text style={styles.timelineLabelPhase}>Decline</Text>
                      </View>
                    </>
                  )
                })()}
              </View>
            </View>
          )}

          {/* Tasting Notes Card */}
          {(latestTasting?.rating || latestTasting?.tastingNotes) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tasting Notes</Text>
              <View style={styles.tastingNotesContent}>
                {latestTasting.rating && (
                  <View style={styles.ratingSection}>
                    <LinearGradient
                      colors={['#8B3A4A', '#722F37']}
                      style={styles.ratingCircle}
                    >
                      <Text style={styles.ratingNumber}>{latestTasting.rating}</Text>
                      <Text style={styles.ratingMax}>/100</Text>
                    </LinearGradient>
                    <Text style={styles.ratingLabel}>Rating</Text>
                  </View>
                )}
                
                {latestTasting.tastingNotes && (
                  <View style={styles.tastingNoteBox}>
                    <Text style={styles.tastingNoteText}>{latestTasting.tastingNotes}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <WineActionFAB
        onConsume={handleConsume}
        onAddTastingNote={handleAddTastingNote}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fef9f5',
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#722F37',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#722F37',
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  wineGlass: {
    fontSize: 90,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  subHeaderTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.4,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  vintageChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vintageChip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  vintageChipSelected: {
    backgroundColor: '#6B2D3E',
    transform: [{ scale: 1.05 }],
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  vintageYear: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
  },
  vintageYearSelected: {
    color: '#fff',
  },
  vintageMeta: {
    fontSize: 12,
    color: '#999',
  },
  vintageMetaSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  maturityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maturityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  maturityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  maturityLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  maturityDates: {
    alignItems: 'flex-end',
  },
  maturityDatesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  maturityDatesValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  tastingNotesContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  ratingMax: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -4,
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
  },
  tastingNoteBox: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 14,
  },
  tastingNoteText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  timeline: {
    position: 'relative',
    marginBottom: 24,
  },
  timelineTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  timelineSegment: {
    flex: 1,
  },
  timelineYouth: {
    backgroundColor: '#bbdefb',
  },
  timelineMaturity: {
    backgroundColor: '#ffe0b2',
  },
  timelinePeak: {
    backgroundColor: '#c8e6c9',
  },
  timelineDecline: {
    backgroundColor: '#f8bbd0',
  },
  timelineMarker: {
    position: 'absolute',
    top: 1,
    marginLeft: -9,
  },
  timelineMarkerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef6c00',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timelineLabel: {
    alignItems: 'center',
  },
  timelineLabelYear: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  timelineLabelPhase: {
    fontSize: 11,
    color: '#999',
  },
})
