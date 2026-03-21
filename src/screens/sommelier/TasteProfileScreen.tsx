import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { CaretLeft, CurrencyDollar } from 'phosphor-react-native'
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg'
import { useNavigation } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

interface TasteProfile {
  flavorProfile: {
    fruity: number
    earthy: number
    bold: number
    delicate: number
    sweet: number
    tannic: number
  }
  wineTypes: {
    red: number
    white: number
    rose: number
    sparkling: number
  }
  priceRange: {
    min: number
    max: number
    preferred: string
  }
  discoveryStyle: string
}

const FlavorWheel = ({ profile }: { profile: TasteProfile['flavorProfile'] }) => {
  const size = 240
  const center = size / 2
  const maxRadius = 100

  const axes = [
    { label: 'Fruity', key: 'fruity' as keyof typeof profile, angle: 0 },
    { label: 'Earthy', key: 'earthy' as keyof typeof profile, angle: 60 },
    { label: 'Bold', key: 'bold' as keyof typeof profile, angle: 120 },
    { label: 'Delicate', key: 'delicate' as keyof typeof profile, angle: 180 },
    { label: 'Sweet', key: 'sweet' as keyof typeof profile, angle: 240 },
    { label: 'Tannic', key: 'tannic' as keyof typeof profile, angle: 300 },
  ]

  const points = axes.map((axis) => {
    const value = profile[axis.key] || 0
    const radius = (value / 10) * maxRadius
    const angleRad = (axis.angle - 90) * (Math.PI / 180)
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    }
  })

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <Svg width={size} height={size} style={styles.radarChart}>
      {/* Background circles */}
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <Circle
          key={scale}
          cx={center}
          cy={center}
          r={maxRadius * scale}
          stroke={colors.coralLight}
          strokeWidth="1"
          fill="none"
        />
      ))}

      {/* Axes lines */}
      {axes.map((axis, i) => {
        const angleRad = (axis.angle - 90) * (Math.PI / 180)
        const endX = center + maxRadius * Math.cos(angleRad)
        const endY = center + maxRadius * Math.sin(angleRad)
        return (
          <Line
            key={i}
            x1={center}
            y1={center}
            x2={endX}
            y2={endY}
            stroke={colors.coralLight}
            strokeWidth="1"
          />
        )
      })}

      {/* Filled polygon */}
      <Polygon
        points={polygonPoints}
        fill={colors.coralLight}
        stroke={colors.coral}
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((point, i) => (
        <Circle key={i} cx={point.x} cy={point.y} r="4" fill={colors.coral} />
      ))}

      {/* Axis labels */}
      {axes.map((axis, i) => {
        const angleRad = (axis.angle - 90) * (Math.PI / 180)
        const labelRadius = maxRadius + 20
        const labelX = center + labelRadius * Math.cos(angleRad)
        const labelY = center + labelRadius * Math.sin(angleRad)
        return (
          <SvgText
            key={i}
            x={labelX}
            y={labelY}
            fontSize="12"
            fontWeight="600"
            fill={colors.textPrimary}
            textAnchor="middle"
          >
            {axis.label}
          </SvgText>
        )
      })}
    </Svg>
  )
}

export const TasteProfileScreen = () => {
  const navigation = useNavigation()
  const [profile, setProfile] = useState<TasteProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTasteProfile()
  }, [])

  const fetchTasteProfile = async () => {
    try {
      const data = await apiFetch<TasteProfile>('/api/profile/taste')
      setProfile(data)
    } catch (error) {
      console.error('Failed to fetch taste profile:', error)
    } finally {
      setIsLoading(false)
    }
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
            <Text style={styles.loadingText}>Loading your taste profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  const totalWineTypes = Object.values(profile.wineTypes).reduce((a, b) => a + b, 0)

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
          <Text style={styles.headerTitle}>Your Wine DNA</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Flavor Wheel */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flavor Profile</Text>
            <View style={styles.wheelContainer}>
              <FlavorWheel profile={profile.flavorProfile} />
            </View>
          </View>

          {/* Favorite Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Types</Text>
            <View style={styles.typesList}>
              {Object.entries(profile.wineTypes).map(([type, value]) => {
                const percentage = totalWineTypes > 0 ? Math.round((value / totalWineTypes) * 100) : 0
                const emoji = type === 'red' ? '🍷' : type === 'white' ? '🥂' : type === 'rose' ? '🌸' : '✨'
                return (
                  <View key={type} style={styles.typeItem}>
                    <View style={styles.typeHeader}>
                      <Text style={styles.typeEmoji}>{emoji}</Text>
                      <Text style={styles.typeLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    </View>
                    <View style={styles.typeBar}>
                      <View style={[styles.typeBarFill, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.typePercentage}>{percentage}%</Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.preferenceCard}>
              <CurrencyDollar size={24} weight="regular" color={colors.coral} />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceLabel}>Most comfortable</Text>
                <Text style={styles.preferenceValue}>${profile.priceRange.min}–${profile.priceRange.max}</Text>
              </View>
            </View>
          </View>

          {/* Discovery Style */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discovery Style</Text>
            <View style={styles.preferenceCard}>
              <Text style={styles.styleEmoji}>
                {profile.discoveryStyle === 'adventurous' ? '🚀' : profile.discoveryStyle === 'classic' ? '🛡️' : '🧭'}
              </Text>
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceValue}>
                  {profile.discoveryStyle.charAt(0).toUpperCase() + profile.discoveryStyle.slice(1)} Explorer
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  wheelContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  radarChart: {
    marginVertical: 8,
  },
  typesList: {
    gap: 12,
  },
  typeItem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  typeEmoji: {
    fontSize: 24,
    fontFamily: 'NunitoSans_400Regular',
  },
  typeLabel: {
    fontSize: 16,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  typePercentage: {
    fontSize: 14,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.coral,
    marginTop: 8,
  },
  typeBar: {
    height: 8,
    backgroundColor: colors.coralLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  typeBarFill: {
    height: '100%',
    backgroundColor: colors.coral,
    borderRadius: 4,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 14,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  styleEmoji: {
    fontSize: 32,
    fontFamily: 'NunitoSans_400Regular',
  },
})
