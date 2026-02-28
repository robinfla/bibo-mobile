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
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { apiFetch } from '../api/client'

interface Wine {
  id: string
  wineId: string
  name: string
  vintage: number | null
  region: string
  color: 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'fortified'
  stock: number
  imageUrl: string | null
}

interface ConsumeSearchStepProps {
  onSelectWine: (wine: Wine) => void
  onClose: () => void
}

const getWineColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: '#722F37',
    white: '#F4E8D0',
    rose: '#FFC0CB',
    sparkling: '#FFD700',
    dessert: '#D4A574',
    fortified: '#8B4513',
  }
  return colorMap[color] || '#ccc'
}

export const ConsumeSearchStep: React.FC<ConsumeSearchStepProps> = ({
  onSelectWine,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [wines, setWines] = useState<Wine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setWines([])
      return
    }

    setIsLoading(true)
    try {
      const response = await apiFetch<{ wines: Wine[] }>(`/api/inventory/search?q=${encodeURIComponent(query)}`)
      setWines(response.wines)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
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

  const renderWineCard = ({ item }: { item: Wine }) => (
    <TouchableOpacity
      style={styles.wineCard}
      onPress={() => onSelectWine(item)}
      activeOpacity={0.7}
    >
      <View style={styles.wineImageContainer}>
        <View style={[styles.wineImagePlaceholder, { backgroundColor: '#f5f5f5' }]}>
          <Icon name="bottle-wine" size={40} color="#ccc" />
          <View style={[styles.colorBadge, { backgroundColor: getWineColor(item.color) }]} />
        </View>
      </View>

      <View style={styles.wineInfo}>
        <Text style={styles.wineName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.wineMetaRow}>
          {item.vintage && (
            <View style={styles.vintageChip}>
              <Text style={styles.vintageText}>{item.vintage}</Text>
            </View>
          )}
          <Text style={styles.regionText} numberOfLines={1}>
            {item.region}
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.stockBadge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.stockText}>
          {item.stock} {item.stock === 1 ? 'bottle' : 'bottles'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Consume Wine</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your cellar..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
            placeholderTextColor="#999"
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#722F37" />
          </View>
        ) : (
          <FlatList
            data={wines}
            renderItem={renderWineCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              searchQuery.length >= 2 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="bottle-wine-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No wines found</Text>
                  <Text style={styles.emptySubtext}>
                    Try a different search term
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="magnify" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Search your cellar</Text>
                  <Text style={styles.emptySubtext}>
                    Type at least 2 characters to search
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
  },
  wineCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  wineImageContainer: {
    marginRight: 16,
  },
  wineImagePlaceholder: {
    width: 72,
    height: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  colorBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  wineInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  wineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  wineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vintageChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  vintageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  regionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
    flex: 1,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
})
