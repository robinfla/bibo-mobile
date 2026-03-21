import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { colors } from '../../theme/colors'

type RootStackParamList = {
  AddWishlistStep2: { wine: { id: number; name: string; vintage?: number; region?: string; color?: string } }
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const RECENT_WISHES = [
  'Barolo 2016',
  'Châteauneuf-du-Pape',
  'Burgundy Pinot Noir',
]

export const AddWishlistStep1 = () => {
  const navigation = useNavigation<NavigationProp>()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // TODO: Call AI wine search API
    setTimeout(() => {
      setIsSearching(false)
      // Mock: navigate to Step 2
      navigation.navigate('AddWishlistStep2', {
        wine: {
          id: 1,
          name: 'Château Margaux',
          vintage: 2015,
          region: 'Bordeaux',
          color: 'Red',
        },
      })
    }, 1500)
  }

  const handleRecentWishTap = (wish: string) => {
    setSearchQuery(wish)
  }

  const handleManualEntry = () => {
    // Navigate to Step 2 with manual entry mode
    navigation.navigate('AddWishlistStep2', {
      wine: {
        id: 0, // 0 indicates manual entry
        name: '',
        vintage: undefined,
        region: '',
        color: '',
      },
    })
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  const handleSkip = () => {
    handleManualEntry()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Wishlist</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>What's calling you? 🍷</Text>
          <Text style={styles.heroSubtitle}>
            Describe the wine you're dreaming about, and I'll find it.
          </Text>
          
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>✨ AI-Powered</Text>
          </View>
        </View>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="A rich Bordeaux from 2015..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Recent Wishes */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>RECENT WISHES</Text>
          <View style={styles.chipsContainer}>
            {RECENT_WISHES.map((wish, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => handleRecentWishTap(wish)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{wish}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* OR Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual Entry Button */}
        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleManualEntry}
          activeOpacity={0.7}
        >
          <Text style={styles.manualButtonText}>
            ✏️ I know exactly what I want
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Background Decorations */}
      <View style={styles.decorationTop} />
      <View style={styles.decorationBottom} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[200],
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  skipButton: {
    fontSize: 16,
    color: colors.coral,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    zIndex: 1,
  },
  hero: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  aiBadge: {
    backgroundColor: colors.coral,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  aiBadgeText: {
    color: colors.textInverse,
    fontSize: 13,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: 32,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textPrimary,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  recentSection: {
    marginBottom: 40,
  },
  recentTitle: {
    fontSize: 12,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(114, 47, 55, 0.15)',
  },
  dividerText: {
    fontSize: 13,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textTertiary,
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  manualButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.muted[300],
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
    zIndex: 1,
  },
  manualButtonText: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.coral,
  },
  decorationTop: {
    position: 'absolute',
    top: 100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(114, 47, 55, 0.05)',
    zIndex: -1,
    pointerEvents: 'none',
  },
  decorationBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(245, 183, 49, 0.05)',
    zIndex: -1,
    pointerEvents: 'none',
  },
})
