import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { WineScanActionsSheet } from '../../components/WineScanActionsSheet'
import { colors } from '../../theme/colors'

export const WineScanResultScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { wine, scanData, mode } = route.params as {
    wine: any
    scanData: any
    mode: 'bottle' | 'wine-menu'
  }

  const [showActions, setShowActions] = useState(false)
  const [selectedVintage, setSelectedVintage] = useState<number | null>(
    scanData?.vintage || wine?.wine?.vintage || null
  )

  // Mock data - replace with actual wine data
  const wineData = {
    id: wine?.wine?.id || 1,
    name: scanData?.wineName || wine?.wine?.name || 'Château Margaux',
    producer: scanData?.producer || wine?.producer?.name || 'Château Margaux',
    region: scanData?.region || wine?.region?.name || 'Margaux, Bordeaux, France',
    type: scanData?.color || wine?.wine?.color || 'red',
    vintage: selectedVintage,
    imageUrl: wine?.wine?.imageUrl || null,
    maturity: 'young',
    drinkingWindow: '2026 - 2040',
    availableVintages: [2015, 2016, 2017, 2018, 2019, 2020, 2021],
  }

  const getTypeColor = (type: string): [string, string] => {
    const typeColors: Record<string, [string, string]> = {
      red: [colors.coral, colors.coralDark],
      white: [colors.honey, colors.honeyDark],
      rose: [colors.rose, colors.coral],
      sparkling: [colors.honeyDark, colors.honey],
    }
    return typeColors[type] || typeColors.red
  }

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      red: 'Red',
      white: 'White',
      rose: 'Rosé',
      sparkling: 'Sparkling',
    }
    return names[type] || type
  }

  const handleAddToCellar = () => {
    // Navigate to add to cellar flow with pre-filled data
    // @ts-ignore - navigation typing
    navigation.navigate('AddWine', {
      wineId: wineData.id,
      wineName: wineData.name,
      producer: wineData.producer,
      vintage: wineData.vintage,
      region: wineData.region,
      type: wineData.type,
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Background */}
        <LinearGradient
          colors={[colors.linen, colors.rose]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBackground}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={colors.coral} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Icon name="share-variant" size={20} color={colors.coral} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Icon name="link-variant" size={20} color={colors.coral} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Wine Bottle Display */}
          <View style={styles.bottleContainer}>
            {wineData.imageUrl ? (
              <Image source={{ uri: wineData.imageUrl }} style={styles.bottleImage} />
            ) : (
              <View style={styles.bottlePlaceholder}>
                <LinearGradient
                  colors={getTypeColor(wineData.type)}
                  style={styles.bottlePlaceholderGradient}
                >
                  <Text style={styles.bottlePlaceholderEmoji}>🍷</Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Wine Type Badge */}
          <LinearGradient
            colors={[colors.honeyDark, colors.honey]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.typeBadge}
          >
            <Text style={styles.typeBadgeText}>{getTypeName(wineData.type)}</Text>
          </LinearGradient>

          {/* Region */}
          <Text style={styles.region}>{wineData.region}</Text>

          {/* Wine Name */}
          <Text style={styles.wineName}>{wineData.name}</Text>

          {/* Producer */}
          <Text style={styles.producer}>{wineData.producer}</Text>

          {/* Vintage Selector */}
          {wineData.availableVintages.length > 0 && (
            <View style={styles.vintageSection}>
              <Text style={styles.sectionLabel}>Vintage</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.vintageScrollContent}
              >
                {wineData.availableVintages.map((vintage) => (
                  <TouchableOpacity
                    key={vintage}
                    style={[
                      styles.vintageChip,
                      selectedVintage === vintage && styles.vintageChipActive,
                    ]}
                    onPress={() => setSelectedVintage(vintage)}
                    activeOpacity={0.7}
                  >
                    {selectedVintage === vintage ? (
                      <LinearGradient
                        colors={[colors.honeyDark, colors.honey]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.vintageChipGradient}
                      >
                        <Text style={styles.vintageChipTextActive}>{vintage}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.vintageChipText}>{vintage}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Maturity Section */}
          <View style={styles.maturitySection}>
            <View style={styles.maturityItem}>
              <View style={styles.maturityHeader}>
                <Text style={styles.maturityLabel}>Maturity</Text>
                {wineData.maturity === 'young' && (
                  <View style={styles.warningIcon}>
                    <Text style={styles.warningIconText}>!</Text>
                  </View>
                )}
              </View>
              <Text style={styles.maturityValue}>
                {wineData.maturity.charAt(0).toUpperCase() + wineData.maturity.slice(1)}
              </Text>
            </View>

            <View style={styles.maturityItem}>
              <Text style={styles.maturityLabel}>Drinking Window</Text>
              <Text style={styles.maturityValue}>{wineData.drinkingWindow}</Text>
            </View>
          </View>
        </View>

        {/* Bottom padding for fixed buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Action Buttons */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.98)', colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bottomActions}
      >
        <TouchableOpacity
          style={styles.actionsButton}
          onPress={() => setShowActions(true)}
          activeOpacity={0.7}
        >
          <Icon name="dots-horizontal" size={18} color={colors.coral} />
          <Text style={styles.actionsButtonText}>Actions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCellar}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.coral, colors.coralDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Icon name="plus" size={18} color={colors.textInverse} />
            <Text style={styles.addButtonText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Actions Bottom Sheet */}
      <WineScanActionsSheet
        visible={showActions}
        onClose={() => setShowActions(false)}
        wine={wineData}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  heroBackground: {
    height: 420,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bottleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  bottleImage: {
    width: 140,
    height: 320,
    resizeMode: 'contain',
  },
  bottlePlaceholder: {
    width: 140,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottlePlaceholderGradient: {
    width: 100,
    height: 240,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  bottlePlaceholderEmoji: {
    fontSize: 64,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_700Bold',
  },
  region: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  wineName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.coral,
    lineHeight: 34,
    marginBottom: 8,
    fontFamily: 'NunitoSans_800ExtraBold',
  },
  producer: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 24,
    fontFamily: 'NunitoSans_400Regular',
  },
  vintageSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.coral,
    marginBottom: 12,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  vintageScrollContent: {
    gap: 8,
  },
  vintageChip: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(228, 213, 203, 0.4)',
  },
  vintageChipActive: {
    borderWidth: 0,
    padding: 0,
  },
  vintageChipGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  vintageChipText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  vintageChipTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  maturitySection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.3)',
    paddingBottom: 20,
    gap: 32,
  },
  maturityItem: {
    flex: 1,
  },
  maturityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  maturityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'NunitoSans_400Regular',
  },
  warningIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },
  maturityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_700Bold',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  actionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.coral,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  addButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textInverse,
    fontFamily: 'NunitoSans_600SemiBold',
  },
})
