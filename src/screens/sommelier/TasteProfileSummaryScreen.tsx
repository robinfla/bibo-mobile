import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { CaretLeft, PaperPlaneTilt } from 'phosphor-react-native'
import { useNavigation } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

interface TasteProfile {
  colorPreference: {
    red?: { pct: number }
    white?: { pct: number }
    rose?: { pct: number }
    sparkling?: { pct: number }
  }
  budgetRange: {
    min: number
    max: number
    currency: string
  }
  metrics: {
    totalBottles: number
    uniqueWines: number
    totalConsumed: number
    uniqueProducers: number
  }
  adventureLevel: number
  favoriteGrapes: string[]
  regionInterests: string[]
  dislikes: string[]
  tags: string[]
}

export const TasteProfileSummaryScreen = () => {
  const navigation = useNavigation()
  const [profile, setProfile] = useState<TasteProfile | null>(null)
  const [cellarMetrics, setCellarMetrics] = useState<{ totalBottles: number; uniqueWines: number; totalRegions: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [additionalInput, setAdditionalInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchCellarMetrics()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await apiFetch<{ profile: TasteProfile }>('/api/profile/taste')
      setProfile(data.profile)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCellarMetrics = async () => {
    try {
      const data = await apiFetch<{
        totals: { bottles: number; lots: number }
        byRegion: Array<{ regionId: number }>
      }>('/api/reports/stats')
      setCellarMetrics({
        totalBottles: data.totals.bottles,
        uniqueWines: data.totals.lots,
        totalRegions: data.byRegion.length,
      })
    } catch (error) {
      console.error('Failed to fetch cellar metrics:', error)
    }
  }

  const handleSendUpdate = async () => {
    if (!additionalInput.trim() || isSending) return

    setIsSending(true)
    try {
      // TODO: Send to profile update endpoint or chat API
      await apiFetch('/api/profile/update', {
        method: 'POST',
        body: { additionalInfo: additionalInput.trim() },
      })
      setAdditionalInput('')
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSending(false)
    }
  }

  const generateSummary = () => {
    if (!profile) return ''

    const { colorPreference, adventureLevel, favoriteGrapes, regionInterests } = profile
    
    // Determine dominant color
    const colors = Object.entries(colorPreference).sort(([, a], [, b]) => (b?.pct || 0) - (a?.pct || 0))
    const dominantColor = colors[0]?.[0] || 'wine'

    // Adventure level text
    const adventureText = adventureLevel === 1 ? 'classic' : adventureLevel === 2 ? 'open to adventure' : 'an adventurous explorer'

    // Build summary
    let summary = `You're a ${dominantColor} wine enthusiast who's ${adventureText}. `

    if (regionInterests && regionInterests.length > 0) {
      const regions = regionInterests.slice(0, 2).join(' and ')
      summary += `You love exploring ${regions}. `
    }

    if (favoriteGrapes && favoriteGrapes.length > 0) {
      const grapes = favoriteGrapes.slice(0, 2).join(' and ')
      summary += `Your go-to grapes are ${grapes}. `
    }

    summary += "You're building a collection that reflects your taste and curiosity."

    return summary
  }

  const getFavoriteGrape = () => {
    if (!profile?.favoriteGrapes || profile.favoriteGrapes.length === 0) return 'Not set'
    return profile.favoriteGrapes[0].charAt(0).toUpperCase() + profile.favoriteGrapes[0].slice(1)
  }

  const getAdventureLevel = () => {
    if (!profile) return 'Not set'
    const level = profile.adventureLevel
    return level === 1 ? 'Classic' : level === 2 ? 'Balanced' : 'Explorer'
  }

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.linen, colors.linen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.linen, colors.linen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <CaretLeft size={28} weight="bold" color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Taste Profile</Text>
          <View style={styles.backButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* AI Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Based on everything I know...</Text>
              <Text style={styles.summaryText}>{generateSummary()}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{cellarMetrics?.totalBottles || profile.metrics.totalBottles}</Text>
                <Text style={styles.statLabel}>Bottles in Cellar</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{cellarMetrics?.totalRegions || profile.regionInterests?.length || 0}</Text>
                <Text style={styles.statLabel}>Regions Explored</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{getFavoriteGrape()}</Text>
                <Text style={styles.statLabel}>Favorite Grape</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{getAdventureLevel()}</Text>
                <Text style={styles.statLabel}>Adventure Level</Text>
              </View>
            </View>

            {/* Preferences Section */}
            {profile.favoriteGrapes && profile.favoriteGrapes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Preferences</Text>
                <View style={styles.chipContainer}>
                  {profile.favoriteGrapes.map((grape, index) => (
                    <View key={index} style={styles.chip}>
                      <Text style={styles.chipEmoji}>🍇</Text>
                      <Text style={styles.chipText}>{grape}</Text>
                    </View>
                  ))}
                  {profile.regionInterests?.map((region, index) => (
                    <View key={`region-${index}`} style={styles.chip}>
                      <Text style={styles.chipEmoji}>🌍</Text>
                      <Text style={styles.chipText}>{region}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Avoid Section */}
            {profile.dislikes && profile.dislikes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>You Avoid</Text>
                <View style={styles.chipContainer}>
                  {profile.dislikes.map((dislike, index) => (
                    <View key={index} style={[styles.chip, styles.chipDanger]}>
                      <Text style={styles.chipEmoji}>🚫</Text>
                      <Text style={[styles.chipText, styles.chipTextDanger]}>
                        {dislike.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Anything else I should know?</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={additionalInput}
                onChangeText={setAdditionalInput}
                placeholder="Tell me more about your preferences..."
                placeholderTextColor={colors.textTertiary}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButtonContainer,
                  (!additionalInput.trim() || isSending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendUpdate}
                disabled={!additionalInput.trim() || isSending}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.coral, colors.coralDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendButton}
                >
                  <PaperPlaneTilt size={18} weight="regular" color={colors.textInverse} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileIcon: {
    fontSize: 64,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    lineHeight: 24,
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
    color: colors.coral,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipTextDanger: {
    color: '#dc2626',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
