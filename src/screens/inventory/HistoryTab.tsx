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
import { apiFetch } from '../../api/client'
import { HistoryCard } from '../../components/HistoryCard'
import { ScorePickerModal } from '../../components/ScorePickerModal'
import { NotesInputModal } from '../../components/NotesInputModal'

interface HistoryWine {
  id: number
  lotId: number
  eventType: string
  quantityChange: number
  eventDate: string
  notes?: string | null
  rating?: number | null
  tastingNotes?: string | null
  wineName: string
  wineColor: string
  producerName: string
  vintage?: number | null
  cellarName: string
  pairing?: string | null
}

export const HistoryTab: React.FC = () => {
  const navigation = useNavigation<any>()
  const [wines, setWines] = useState<HistoryWine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [scoreModalVisible, setScoreModalVisible] = useState(false)
  const [notesModalVisible, setNotesModalVisible] = useState(false)
  const [selectedWine, setSelectedWine] = useState<HistoryWine | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ events: HistoryWine[] }>('/api/inventory/events?eventType=consume')
      setWines(response.events || [])
    } catch (error) {
      console.error('Failed to load history:', error)
      setWines([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchHistory()
    setRefreshing(false)
  }, [fetchHistory])

  const handleEditScore = (wine: HistoryWine) => {
    setSelectedWine(wine)
    setScoreModalVisible(true)
  }

  const handleSaveScore = (newScore: number) => {
    if (!selectedWine) return

    // TODO: Save to API
    // await apiFetch(`/api/history/${selectedWine.id}/score`, {
    //   method: 'PUT',
    //   body: JSON.stringify({ score: newScore }),
    // })

    // Update local state
    setWines((prevWines) =>
      prevWines.map((w) =>
        w.id === selectedWine.id ? { ...w, score: newScore } : w
      )
    )

    setScoreModalVisible(false)
    setSelectedWine(null)
  }

  const handleEditNotes = (wine: HistoryWine) => {
    setSelectedWine(wine)
    setNotesModalVisible(true)
  }

  const handleSaveNotes = (newNotes: string) => {
    if (!selectedWine) return

    // TODO: Save to API
    // await apiFetch(`/api/history/${selectedWine.id}/notes`, {
    //   method: 'PUT',
    //   body: JSON.stringify({ notes: newNotes }),
    // })

    // Update local state
    setWines((prevWines) =>
      prevWines.map((w) =>
        w.id === selectedWine.id ? { ...w, tastingNotes: newNotes } : w
      )
    )

    setNotesModalVisible(false)
    setSelectedWine(null)
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
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <HistoryCard
            wineName={`${item.producerName} ${item.wineName}`}
            vintage={item.vintage ?? undefined}
            region={item.cellarName}
            imageUrl={undefined}
            consumedDate={new Date(item.eventDate)}
            score={item.rating ?? undefined}
            tastingNotes={item.tastingNotes ?? undefined}
            onEditScore={() => handleEditScore(item)}
            onEditNotes={() => handleEditNotes(item)}
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

      {/* Score Picker Modal */}
      {selectedWine && (
        <ScorePickerModal
          visible={scoreModalVisible}
          wineName={`${selectedWine.producerName} ${selectedWine.wineName}`}
          currentScore={selectedWine.rating ?? undefined}
          onSave={handleSaveScore}
          onClose={() => {
            setScoreModalVisible(false)
            setSelectedWine(null)
          }}
        />
      )}

      {/* Notes Input Modal */}
      {selectedWine && (
        <NotesInputModal
          visible={notesModalVisible}
          wineName={`${selectedWine.producerName} ${selectedWine.wineName}`}
          currentNotes={selectedWine.tastingNotes ?? undefined}
          onSave={handleSaveNotes}
          onClose={() => {
            setNotesModalVisible(false)
            setSelectedWine(null)
          }}
        />
      )}
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
