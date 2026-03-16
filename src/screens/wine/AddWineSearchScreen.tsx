import React, { useState, useCallback, useEffect } from 'react'
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
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { apiFetch } from '../../api/client'
import Svg, { Path } from 'react-native-svg'

type NavigationProp = NativeStackNavigationProp<any>

interface WineSearchResult {
  wineId: string
  name: string
  producer: string
  vintage?: number
  region: string
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'fortified'
  imageUrl?: string
}

interface SearchResponse {
  results: WineSearchResult[]
  count: number
}

const CameraSvg = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <Path d="M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H3V8h3V6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 14c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5-5 2.24-5 5zm5-3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3z" />
  </Svg>
)

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
        `/api/wines/search?q=${encodeURIComponent(query)}&limit=10`
      )
      setSearchResults(response.results)
      
      // Navigate to no results screen if count is 0
      if (response.count === 0) {
        navigation.navigate('AddWineNoResults', { query })
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [navigation])

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
    // Navigate to add details screen (cellar location, quantity, etc.)
    navigation.navigate('AddWineStep2', {
      wine: {
        id: wine.wineId,
        name: wine.name,
        vintage: wine.vintage,
        region: wine.region,
        color: wine.type,
      },
    })
  }

  const handleScanPress = () => {
    // Navigate to wine scan camera
    navigation.navigate('ScanTab', { screen: 'WineScanCamera' })
  }

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      red: '#722F37',
      white: '#F4E8D0',
      rose: '#FFC0CB',
      sparkling: '#FFD700',
      dessert: '#D4A574',
      fortified: '#8B4513',
    }
    return colors[type] || '#722F37'
  }

  const renderWineCard = ({ item }: { item: WineSearchResult }) => (
    <TouchableOpacity
      style={styles.wineCard}
      onPress={() => handleWineSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.wineImageContainer}>
        <LinearGradient
          colors={[getTypeColor(item.type), getTypeColor(item.type) + 'DD']}
          style={styles.wineImagePlaceholder}
        >
          <Text style={styles.wineImageEmoji}>🍷</Text>
        </LinearGradient>
      </View>

      <View style={styles.wineInfo}>
        <Text style={styles.wineName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.wineProducer} numberOfLines={1}>
          {item.producer}
        </Text>
        <Text style={styles.wineMeta} numberOfLines={1}>
          {item.vintage ? `${item.vintage} • ` : ''}{item.region}
        </Text>
      </View>

      <Icon name="chevron-right" size={20} color="rgba(45, 45, 45, 0.3)" />
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🍷</Text>
      <Text style={styles.emptyTitle}>Search wines</Text>
      <Text style={styles.emptyDescription}>
        Type in the name of a wine or producer to get started.
      </Text>
      <TouchableOpacity
        style={styles.scanLabelButton}
        onPress={handleScanPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#722F37', '#944654']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scanLabelGradient}
        >
          <Text style={styles.scanLabelEmoji}>📷</Text>
          <Text style={styles.scanLabelText}>Scan Label</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fef9f5', '#f8f4f0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="close" size={20} color="#2d2d2d" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Wine</Text>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#722F37', '#944654']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanButtonGradient}
            >
              <CameraSvg />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search wine name or producer..."
              placeholderTextColor="rgba(45, 45, 45, 0.4)"
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Icon name="close-circle" size={18} color="rgba(45, 45, 45, 0.4)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results or Empty State */}
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#722F37" />
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderWineCard}
            keyExtractor={(item) => item.wineId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
          />
        ) : hasSearched && searchQuery.length >= 2 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.noResultsText}>No wines found</Text>
          </View>
        ) : (
          renderEmptyState()
        )}
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.3)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#722F37',
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  scanButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    opacity: 0.4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d2d2d',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: 'rgba(45, 45, 45, 0.6)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  wineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  wineImageContainer: {
    flexShrink: 0,
  },
  wineImagePlaceholder: {
    width: 50,
    height: 66,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wineImageEmoji: {
    fontSize: 24,
  },
  wineInfo: {
    flex: 1,
  },
  wineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#722F37',
    marginBottom: 4,
  },
  wineProducer: {
    fontSize: 14,
    color: 'rgba(45, 45, 45, 0.6)',
    marginBottom: 4,
  },
  wineMeta: {
    fontSize: 12,
    color: 'rgba(45, 45, 45, 0.5)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 80,
    opacity: 0.3,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#722F37',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 15,
    color: 'rgba(45, 45, 45, 0.6)',
    textAlign: 'center',
    lineHeight: 22.5,
    marginBottom: 32,
  },
  scanLabelButton: {
    borderRadius: 24,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  scanLabelGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  scanLabelEmoji: {
    fontSize: 20,
  },
  scanLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})
