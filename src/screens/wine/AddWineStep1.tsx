import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = {
  AddWineStep2: { wine?: { id: number; name: string; vintage?: number; region?: string; color?: string } }
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const RECENT_ADDITIONS = [
  'Barolo 2016',
  'Châteauneuf-du-Pape',
  'Burgundy Pinot Noir',
]

export const AddWineStep1 = () => {
  const navigation = useNavigation<NavigationProp>()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // TODO: Call AI wine search API
    setTimeout(() => {
      setIsSearching(false)
      // Mock: navigate to Step 2 with AI results
      navigation.navigate('AddWineStep2', {
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

  const handleRecentTap = (recent: string) => {
    setSearchQuery(recent)
  }

  const handleManualEntry = () => {
    // Navigate to Step 2 with empty form
    navigation.navigate('AddWineStep2', {
      wine: {
        id: 0, // 0 indicates manual entry
        name: '',
        vintage: undefined,
        region: '',
        color: '',
      },
    })
  }

  const handleBack = () => {
    navigation.goBack()
  }

  const handleSkip = () => {
    handleManualEntry()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Wine</Text>
        <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>What's in the bottle? 🍷</Text>
          <Text style={styles.heroSubtitle}>
            Describe the wine you're adding, and I'll find it.
          </Text>
          
          <LinearGradient
            colors={['#722F37', '#944654']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiBadge}
          >
            <Text style={styles.aiBadgeText}>✨ AI-Powered</Text>
          </LinearGradient>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="A rich Bordeaux from 2015..."
            placeholderTextColor="#999"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!isSearching}
          />
          
          {isSearching && (
            <View style={styles.searchingOverlay}>
              <Text style={styles.searchingText}>Searching...</Text>
            </View>
          )}
        </View>

        {/* Recent Additions */}
        <View style={styles.recentSection}>
          <Text style={styles.recentLabel}>RECENT ADDITIONS</Text>
          <View style={styles.recentChips}>
            {RECENT_ADDITIONS.map((recent) => (
              <TouchableOpacity
                key={recent}
                style={styles.recentChip}
                onPress={() => handleRecentTap(recent)}
              >
                <Text style={styles.recentChipText}>{recent}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual Entry Button */}
        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleManualEntry}
        >
          <Text style={styles.manualButtonText}>✏️ I know exactly what it is</Text>
        </TouchableOpacity>

        {/* Decorative Background */}
        <View style={styles.decorationTop} pointerEvents="none" />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 17,
    color: '#722F37',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  skipButton: {
    fontSize: 17,
    color: '#722F37',
    fontWeight: '600',
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#1a1a1a',
  },
  searchingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingText: {
    fontSize: 16,
    color: '#722F37',
    fontWeight: '600',
  },
  recentSection: {
    marginBottom: 32,
  },
  recentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recentChipText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(228, 213, 203, 0.3)',
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  manualButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(228, 213, 203, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  decorationTop: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(114, 47, 55, 0.03)',
    zIndex: -1,
  },
})
