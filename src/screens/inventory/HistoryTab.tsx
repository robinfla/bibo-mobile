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
import { colors } from '../../theme/colors'
import { HistoryCard } from '../../components/HistoryCard'

interface HistoryWine {
  id: string
  name: string
  vintage?: number
  region?: string
  imageUrl?: string
  consumedDate: Date
  score?: number
  tastingNotes?: string
}

export const HistoryTab: React.FC = () => {
  const navigation = useNavigation<any>()
  const [wines, setWines] = useState<HistoryWine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call
      // const data = await apiFetch<HistoryWine[]>('/api/history')

      // Mock data matching the mockup
      const mockData: HistoryWine[] = [
        {
          id: '1',
          name: 'Château Margaux',
          vintage: 2015,
          region: 'Bordeaux',
          consumedDate: new Date('2026-02-15'),
          score: 94,
          tastingNotes:
            'Exceptional wine. Rich blackcurrant with elegant tannins. Perfect for the anniversary dinner. Would buy again.',
        },
        {
          id: '2',
          name: 'Barolo Riserva',
          vintage: 2013,
          region: 'Piedmont',
          consumedDate: new Date('2026-02-10'),
          // No score, no notes
        },
        {
          id: '3',
          name: 'Brunello di Montalcino',
          vintage: 2012,
          region: 'Tuscany',
          consumedDate: new Date('2026-02-05'),
          // Notes only, no score
          tastingNotes:
            'Shared with friends at dinner. Great complexity but a bit too tannic for my taste. Needed more time.',
        },
        {
          id: '4',
          name: 'Sassicaia',
          vintage: 2016,
          region: 'Tuscany',
          consumedDate: new Date('2026-01-28'),
          score: 91,
          // Score only, no notes
        },
      ]

      setWines(mockData)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchHistory()
    setRefreshing(false)
  }, [fetchHistory])

  const handleCardPress = (wine: HistoryWine) => {
    // TODO: Navigate to EditTasting screen
    console.log('Edit tasting for wine:', wine.id)
    // navigation.navigate('EditTasting', {
    //   wineId: wine.id,
    //   consumedDate: wine.consumedDate,
    //   currentScore: wine.score,
    //   currentNotes: wine.tastingNotes,
    // })
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🍷</Text>
      <Text style={styles.emptyTitle}>No wines enjoyed yet</Text>
      <Text style={styles.emptySubtitle}>
        Start enjoying wines and they'll appear here with your tasting notes
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
        data={wines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryCard
            wineName={item.name}
            vintage={item.vintage}
            region={item.region}
            imageUrl={item.imageUrl}
            consumedDate={item.consumedDate}
            score={item.score}
            tastingNotes={item.tastingNotes}
            onPress={() => handleCardPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          wines.length === 0 && styles.listContentEmpty,
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
