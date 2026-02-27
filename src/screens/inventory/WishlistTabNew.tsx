import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import { WishlistCard } from '../../components/WishlistCard'

type Priority = 'must_have' | 'nice_to_have' | 'someday'

interface WishlistItem {
  id: string
  wine: {
    name: string
    vintage?: number | null
    region?: string | null
    producer?: string | null
  }
  priority: Priority
  targetBudget?: number | null
  whereToBuy?: string | null
  notes?: string | null
  addedAt: string
}

export const WishlistTabNew = () => {
  const navigation = useNavigation<any>()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call
      // const data = await apiFetch<WishlistItem[]>('/api/wishlist')
      
      // Mock data for now
      const mockData: WishlistItem[] = [
        {
          id: '1',
          wine: {
            name: 'Château Margaux',
            vintage: 2015,
            region: 'Bordeaux',
            producer: 'Château Margaux',
          },
          priority: 'must_have',
          targetBudget: 200,
          notes: 'Special occasion wine — want for anniversary',
          addedAt: new Date().toISOString(),
        },
        {
          id: '2',
          wine: {
            name: 'Barolo Riserva',
            vintage: 2013,
            region: 'Piedmont',
            producer: 'Giuseppe Mascarello',
          },
          priority: 'nice_to_have',
          targetBudget: 120,
          notes: 'Great reviews, want to try',
          addedAt: new Date().toISOString(),
        },
        {
          id: '3',
          wine: {
            name: 'Sassicaia',
            vintage: 2016,
            region: 'Tuscany',
            producer: 'Tenuta San Guido',
          },
          priority: 'someday',
          notes: 'Been wanting to try this for years',
          addedAt: new Date().toISOString(),
        },
      ]
      
      setItems(mockData)
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchWishlist()
    setRefreshing(false)
  }, [fetchWishlist])

  const handleCardPress = (item: WishlistItem) => {
    // TODO: Navigate to wishlist detail screen
    console.log('Pressed wishlist item:', item.id)
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🍷</Text>
      <Text style={styles.emptyTitle}>Nothing on your wishlist</Text>
      <Text style={styles.emptySubtitle}>
        Add wines you want to try or purchase later
      </Text>
    </View>
  )

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#722F37" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WishlistCard
            id={item.id}
            wineName={item.wine.name}
            vintage={item.wine.vintage}
            region={item.wine.region}
            priority={item.priority}
            targetBudget={item.targetBudget}
            notes={item.notes}
            onPress={() => handleCardPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef9f5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22.5,
    textAlign: 'center',
  },
})
