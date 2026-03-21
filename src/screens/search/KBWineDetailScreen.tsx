import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { ArrowLeft, Wine, MapPin, Clock, PlusCircle } from 'phosphor-react-native'
import { apiFetch } from '../../api/client'
import { KBWineEnrichment } from '../../types/api'
import { colors } from '../../theme/colors'

type RouteParams = {
  KBWineDetail: { kbWineId: number }
}

const KBWineDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'KBWineDetail'>>()
  const navigation = useNavigation()
  const { kbWineId } = route.params

  const [wine, setWine] = useState<KBWineEnrichment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWine()
  }, [kbWineId])

  const loadWine = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<KBWineEnrichment>(`/api/knowledge/${kbWineId}`)
      setWine(data)
    } catch (err) {
      setError('Failed to load wine details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCellar = () => {
    // Navigate to add wine flow with pre-filled data
    navigation.navigate('AddWine' as never, {
      prefill: {
        producer: wine?.producer,
        wineName: wine?.wineName,
        color: wine?.color,
        region: wine?.region,
        appellation: wine?.appellation,
        imageUrl: wine?.imageUrl,
      },
    } as never)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.coral} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !wine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Wine not found'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const renderTasteBar = (label: string, value: number | null) => {
    if (value === null) return null
    const percentage = (value / 5) * 100
    return (
      <View style={styles.tasteRow}>
        <Text style={styles.tasteLabel}>{label}</Text>
        <View style={styles.tasteBarContainer}>
          <View style={[styles.tasteBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.tasteValue}>{value.toFixed(1)}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} weight="bold" color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Wine image */}
        <View style={styles.imageContainer}>
          {wine.imageUrl ? (
            <Image source={{ uri: wine.imageUrl }} style={styles.wineImage} resizeMode="contain" />
          ) : (
            <View style={[styles.wineImage, styles.placeholderImage]}>
              <Wine size={80} weight="regular" color={colors.muted[200]} />
            </View>
          )}
        </View>

        {/* Wine info */}
        <View style={styles.infoSection}>
          <Text style={styles.wineName}>{wine.wineName}</Text>
          <Text style={styles.producer}>{wine.producer}</Text>
          
          <View style={styles.metaRow}>
            {wine.region && (
              <View style={styles.metaChip}>
                <MapPin size={14} weight="regular" color={colors.textSecondary} />
                <Text style={styles.metaChipText}>{wine.region}</Text>
              </View>
            )}
            {wine.countryCode && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{wine.countryCode}</Text>
              </View>
            )}
            {wine.color && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{wine.color}</Text>
              </View>
            )}
          </View>

          {wine.grape && (
            <Text style={styles.grapeText}>🍇 {wine.grape}</Text>
          )}
        </View>

        {/* Taste Structure */}
        {(wine.acidity || wine.tannin || wine.sweetness || wine.intensity) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Taste Profile</Text>
            <View style={styles.card}>
              {renderTasteBar('Acidity', wine.acidity)}
              {renderTasteBar('Tannin', wine.tannin)}
              {renderTasteBar('Sweetness', wine.sweetness)}
              {renderTasteBar('Intensity', wine.intensity)}
            </View>
          </View>
        )}

        {/* Aging Window */}
        {wine.agingPeakMin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drinking Window</Text>
            <View style={styles.card}>
              <View style={styles.agingRow}>
                <Clock size={20} weight="regular" color={colors.coral} />
                <Text style={styles.agingText}>
                  Best enjoyed {wine.agingPeakMin}–{wine.agingPeakMax} years from vintage
                </Text>
              </View>
              {wine.agingDeclineMin && (
                <Text style={styles.agingNote}>
                  May start declining after {wine.agingDeclineMin} years
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Food Pairings */}
        {wine.foodPairings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Pairings</Text>
            <View style={styles.card}>
              <View style={styles.pairingsGrid}>
                {wine.foodPairings.map((pairing, idx) => (
                  <View key={idx} style={styles.pairingChip}>
                    <Text style={styles.pairingText}>{pairing}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Critic Reviews */}
        {wine.criticReviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Critic Reviews</Text>
            {wine.criticReviews.map((review, idx) => (
              <View key={idx} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  {review.score && (
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>{review.score}</Text>
                    </View>
                  )}
                  <View style={styles.reviewMeta}>
                    {review.vintage && (
                      <Text style={styles.reviewVintage}>{review.vintage} vintage</Text>
                    )}
                    <Text style={styles.reviewCritic}>
                      {review.critic} · {review.source}
                    </Text>
                  </View>
                </View>
                {review.tastingNote && (
                  <Text style={styles.tastingNote}>{review.tastingNote}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add to Cellar button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCellar}>
          <PlusCircle size={24} weight="regular" color="#FFF" />
          <Text style={styles.addButtonText}>Add to Cellar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  backLink: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 16,
    color: colors.coral,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  wineImage: {
    width: 200,
    height: 280,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: colors.muted[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  wineName: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  producer: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  metaChipText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  grapeText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tasteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tasteLabel: {
    fontFamily: 'NunitoSans_400Regular',
    width: 80,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tasteBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.muted[50],
    borderRadius: 4,
    marginHorizontal: 12,
  },
  tasteBarFill: {
    height: '100%',
    backgroundColor: colors.coral,
    borderRadius: 4,
  },
  tasteValue: {
    fontFamily: 'NunitoSans_600SemiBold',
    width: 30,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
  },
  agingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agingText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 16,
    color: colors.textPrimary,
  },
  agingNote: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    marginLeft: 32,
  },
  pairingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pairingChip: {
    backgroundColor: colors.muted[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  pairingText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textPrimary,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreBadge: {
    backgroundColor: colors.coral,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  reviewMeta: {
    marginLeft: 12,
  },
  reviewVintage: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewCritic: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tastingNote: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.linen,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.muted[200],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coral,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  addButtonText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
})

export default KBWineDetailScreen
