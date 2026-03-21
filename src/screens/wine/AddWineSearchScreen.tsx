import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { X, Camera, MagnifyingGlass, XCircle, CaretRight, Plus } from 'phosphor-react-native'
import { apiFetch } from '../../api/client'
import Svg, { Path, Rect, Ellipse, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg'
import { colors } from '../../theme/colors'

type NavigationProp = NativeStackNavigationProp<any>

interface WineSearchResult {
  id: number
  wineName: string
  producer: string
  region: string
  country?: string
  color: string | null
  imageUrl?: string | null
  thumbnailUrl?: string | null
}

interface SearchResponse {
  query: string
  count: number
  results: WineSearchResult[]
}

const SUGGESTION_CHIPS = ['Château', 'Domaine', 'Pinot Noir']

const WineGlassIllustration = () => (
  <View style={illustrationStyles.container}>
    <Svg viewBox="0 0 120 160" width={128} height={160}>
      <Defs>
        <SvgLinearGradient id="wineColor" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F28482" stopOpacity={0.85} />
          <Stop offset="40%" stopColor="#e85d75" stopOpacity={0.9} />
          <Stop offset="100%" stopColor="#e85d75" stopOpacity={0.95} />
        </SvgLinearGradient>
        <SvgLinearGradient id="glassLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
          <Stop offset="30%" stopColor="#ffffff" stopOpacity={0} />
        </SvgLinearGradient>
        <SvgLinearGradient id="glassRight" x1="100%" y1="0%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
          <Stop offset="20%" stopColor="#ffffff" stopOpacity={0} />
        </SvgLinearGradient>
      </Defs>
      {/* Glass rim */}
      <Ellipse cx={60} cy={24} rx={32} ry={7} fill="none" stroke="#F5CAC3" strokeWidth={1.5} opacity={0.6} />
      {/* Wine liquid */}
      <G>
        <Path d="M 32 65 C 32 88, 45 108, 60 108 C 75 108, 88 88, 88 65 C 72 68, 48 68, 32 65 Z" fill="url(#wineColor)" />
        <Ellipse cx={60} cy={65} rx={28} ry={4.5} fill="#F5CAC3" opacity={0.95} />
        <Path d="M 35 70 C 37 85, 45 100, 55 105" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
      </G>
      {/* Glass bowl */}
      <Path d="M 28 24 L 30 45 C 32 75, 42 110, 60 110 C 78 110, 88 75, 90 45 L 92 24" fill="none" stroke="#F5CAC3" strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M 28 24 L 30 45 C 32 75, 42 110, 60 110 C 78 110, 88 75, 90 45 L 92 24" fill="url(#glassLeft)" opacity={0.5} />
      <Path d="M 28 24 L 30 45 C 32 75, 42 110, 60 110 C 78 110, 88 75, 90 45 L 92 24" fill="url(#glassRight)" opacity={0.3} />
      {/* Glass top curve */}
      <Path d="M 28 24 C 28 28, 42 31, 60 31 C 78 31, 92 28, 92 24" fill="none" stroke="#F5CAC3" strokeWidth={1.5} />
      {/* Stem */}
      <Path d="M 58 110 L 58 145 M 62 110 L 62 145" stroke="#F5CAC3" strokeWidth={1.5} />
      <Rect x={58} y={110} width={4} height={35} fill="#ffffff" opacity={0.4} />
      {/* Base */}
      <Ellipse cx={60} cy={146} rx={24} ry={5.5} fill="rgba(255,255,255,0.7)" stroke="#F5CAC3" strokeWidth={1.5} />
      <Ellipse cx={60} cy={146} rx={20} ry={3.5} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.8} />
      {/* Glass highlight */}
      <Path d="M 34 35 C 36 60, 44 85, 52 100" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.4} />
    </Svg>
  </View>
)

const illustrationStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export const AddWineSearchScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<WineSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    try {
      const response = await apiFetch<SearchResponse>(
        `/api/knowledge/search?q=${encodeURIComponent(query)}&limit=10`
      )
      setSearchResults(response.results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = (text: string) => {
    setSearchQuery(text)

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      performSearch(text)
    }, 300)

    setSearchTimeout(timeout)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setHasSearched(false)
  }

  const handleWineSelect = (wine: WineSearchResult) => {
    navigation.navigate('AddWineStep2', {
      wine: {
        id: wine.id,
        name: wine.wineName,
        region: wine.region,
        color: wine.color || 'red',
      },
    })
  }

  const handleScanPress = () => {
    navigation.navigate('ScanTab', { screen: 'WineScanCamera' })
  }

  const handleChipPress = (chip: string) => {
    setSearchQuery(chip)
    performSearch(chip)
  }

  const handleAddManually = () => {
    navigation.navigate('AddWineStep2', {
      wine: {
        name: searchQuery,
      },
    })
  }

  const getTypeColor = (type: string | null): string => {
    const map: Record<string, string> = {
      red: colors.wine.red,
      white: colors.wine.white,
      rose: colors.wine.rose,
      sparkling: colors.wine.sparkling,
      dessert: colors.wine.dessert,
      fortified: colors.wine.fortified,
    }
    return map[type || 'red'] || colors.wine.red
  }

  const renderWineCard = ({ item }: { item: WineSearchResult }) => (
    <TouchableOpacity
      style={styles.wineCard}
      onPress={() => handleWineSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.wineImageContainer}>
        <LinearGradient
          colors={[getTypeColor(item.color), getTypeColor(item.color) + 'DD']}
          style={styles.wineImagePlaceholder}
        >
          <Text style={styles.wineImageEmoji}>🍷</Text>
        </LinearGradient>
      </View>

      <View style={styles.wineInfo}>
        <Text style={styles.wineName} numberOfLines={2}>
          {item.wineName}
        </Text>
        <Text style={styles.wineProducer} numberOfLines={1}>
          {item.producer}
        </Text>
        <Text style={styles.wineMeta} numberOfLines={1}>
          {item.region}{item.country ? `, ${item.country}` : ''}
        </Text>
      </View>

      <CaretRight size={18} weight="bold" color="#F5CAC3" />
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <WineGlassIllustration />
    </View>
  )

  const renderNoResultsState = () => (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsTitle}>No results found</Text>
      <Text style={styles.noResultsMessage}>
        We couldn't find <Text style={styles.queryText}>{searchQuery}</Text> in our wine database.
      </Text>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.addManuallyButton}
          onPress={handleAddManually}
          activeOpacity={0.8}
        >
          <View style={styles.addManuallyInner}>
            <Plus size={18} weight="bold" color="white" />
            <Text style={styles.addManuallyText}>Add Manually</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tryScanButton}
          onPress={handleScanPress}
          activeOpacity={0.8}
        >
          <Camera size={20} weight="regular" color="#e85d75" />
          <Text style={styles.tryScanText}>Try Scanning Label</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <X size={20} weight="bold" color="#4b5563" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Wine</Text>

          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleScanPress}
            activeOpacity={0.8}
          >
            <Camera size={22} weight="regular" color="#e85d75" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MagnifyingGlass size={20} weight="regular" color="#F5CAC3" style={{ marginLeft: 4 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search wine name or producer..."
              placeholderTextColor="#9ca3af"
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <XCircle size={18} weight="fill" color="#F5CAC3" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Suggestion Chips */}
        {!hasSearched && (
          <View style={styles.chipsRow}>
            {SUGGESTION_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.chip}
                onPress={() => handleChipPress(chip)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results or Empty State */}
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e85d75" />
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderWineCard}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          />
        ) : hasSearched && searchQuery.length >= 2 ? (
          renderNoResultsState()
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EDE2',
  },
  inner: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5CAC3',
    shadowColor: '#e85d75',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.3,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5CAC3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 169, 0.2)',
    shadowColor: '#F5CAC3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(244, 235, 236, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
    shadowColor: '#e85d75',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'NunitoSans_500Medium',
    fontWeight: '500',
    paddingVertical: 12,
    letterSpacing: 0.2,
  },
  clearButton: {
    padding: 4,
  },

  // Suggestion Chips
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7EDE2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5CAC3',
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_500Medium',
    fontWeight: '500',
    color: '#111827',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },

  // No results
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  noResultsMessage: {
    fontSize: 15,
    fontFamily: 'NunitoSans_400Regular',
    color: 'rgba(45, 45, 45, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  queryText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: '#e85d75',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  addManuallyButton: {
    borderRadius: 16,
    backgroundColor: '#e85d75',
    shadowColor: '#e85d75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  addManuallyInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  addManuallyText: {
    fontSize: 16,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: 'white',
  },
  tryScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F5CAC3',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#e85d75',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tryScanText: {
    fontSize: 16,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: '#e85d75',
  },

  // Wine cards
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  wineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 235, 236, 0.6)',
    shadowColor: '#e85d75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    gap: 12,
  },
  wineImageContainer: {
    flexShrink: 0,
  },
  wineImagePlaceholder: {
    width: 48,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wineImageEmoji: {
    fontSize: 22,
  },
  wineInfo: {
    flex: 1,
  },
  wineName: {
    fontSize: 15,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  wineProducer: {
    fontSize: 13,
    fontFamily: 'NunitoSans_400Regular',
    color: '#6b7280',
    marginBottom: 2,
  },
  wineMeta: {
    fontSize: 12,
    fontFamily: 'NunitoSans_400Regular',
    color: '#9ca3af',
  },
})
