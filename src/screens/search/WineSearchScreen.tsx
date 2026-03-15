import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import debounce from 'lodash.debounce'
import { apiFetch } from '../../api/client'
import { KBSearchResult, KBSearchResponse } from '../../types/api'

const COLORS = {
  background: '#FEF9F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  wineRed: '#722F37',
  border: '#E8E0D8',
  inputBg: '#FAF7F4',
}

const WineSearchScreen: React.FC = () => {
  const navigation = useNavigation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KBSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchWines = async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch<KBSearchResponse>('/api/knowledge/search', {
        query: { q, limit: 30 },
      })
      setResults(data.results)
      setSearched(true)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useCallback(
    debounce((q: string) => searchWines(q), 300),
    []
  )

  const handleQueryChange = (text: string) => {
    setQuery(text)
    debouncedSearch(text)
  }

  const handleWinePress = (wine: KBSearchResult) => {
    Keyboard.dismiss()
    // Navigate to wine detail with KB data
    navigation.navigate('KBWineDetail' as never, { kbWineId: wine.id } as never)
  }

  const getColorDot = (color: string | null) => {
    const colorMap: Record<string, string> = {
      red: '#722F37',
      white: '#F5E6C8',
      rosé: '#FFB6C1',
      sparkling: '#E8E0D8',
      dessert: '#D4A574',
      fortified: '#8B4513',
    }
    return colorMap[color?.toLowerCase() || ''] || '#999'
  }

  const renderWineItem = ({ item }: { item: KBSearchResult }) => (
    <TouchableOpacity style={styles.wineCard} onPress={() => handleWinePress(item)}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.wineImage} resizeMode="contain" />
      ) : (
        <View style={[styles.wineImage, styles.placeholderImage]}>
          <Ionicons name="wine-outline" size={32} color={COLORS.border} />
        </View>
      )}
      
      <View style={styles.wineInfo}>
        <View style={styles.wineHeader}>
          <View style={[styles.colorDot, { backgroundColor: getColorDot(item.color) }]} />
          <Text style={styles.wineName} numberOfLines={2}>{item.wineName}</Text>
        </View>
        
        <Text style={styles.producer}>{item.producer}</Text>
        
        <View style={styles.metaRow}>
          {item.region && (
            <Text style={styles.metaText}>
              {item.region}{item.countryCode ? `, ${item.countryCode}` : ''}
            </Text>
          )}
          {item.score && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{item.score}</Text>
            </View>
          )}
        </View>
        
        {item.foodPairings.length > 0 && (
          <Text style={styles.pairings} numberOfLines={1}>
            🍽️ {item.foodPairings.slice(0, 3).join(', ')}
          </Text>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Wines</Text>
        <Text style={styles.subtitle}>493,000+ wines in our database</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by wine, producer, or region..."
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={handleQueryChange}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.wineRed} />
        </View>
      )}

      {!loading && searched && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>No wines found for "{query}"</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWineItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {!searched && !loading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="wine-outline" size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>Search our wine database</Text>
          <Text style={styles.emptySubtext}>Find wines to add to your cellar</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  wineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  wineImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  wineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 8,
  },
  wineName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  producer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginLeft: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 18,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scoreBadge: {
    backgroundColor: COLORS.wineRed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  pairings: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginLeft: 18,
  },
})

export default WineSearchScreen
