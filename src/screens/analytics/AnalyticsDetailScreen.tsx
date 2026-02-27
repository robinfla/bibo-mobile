import React, { useState, useEffect, useCallback } from 'react'
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
import { useNavigation, useRoute } from '@react-navigation/native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'

interface AnalyticsItem {
  id: string
  name: string
  icon?: string
  count: number
  percentage: number
}

export const AnalyticsDetailScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  
  const { type, title } = route.params || {}
  
  const [items, setItems] = useState<AnalyticsItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [type])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // const data = await apiFetch(`/api/analytics/${type}`)
      
      // Mock data
      if (type === 'grapes') {
        setItems([
          { id: 'cabernet-sauvignon', name: 'Cabernet Sauvignon', count: 156, percentage: 18 },
          { id: 'chardonnay', name: 'Chardonnay', count: 142, percentage: 16 },
          { id: 'pinot-noir', name: 'Pinot Noir', count: 98, percentage: 11 },
          { id: 'merlot', name: 'Merlot', count: 87, percentage: 10 },
          { id: 'syrah', name: 'Syrah', count: 76, percentage: 9 },
          { id: 'sauvignon-blanc', name: 'Sauvignon Blanc', count: 65, percentage: 7 },
          { id: 'riesling', name: 'Riesling', count: 54, percentage: 6 },
        ])
      } else if (type === 'regions') {
        setItems([
          { id: 'france', name: 'France', icon: '🇫🇷', count: 345, percentage: 39 },
          { id: 'italy', name: 'Italy', icon: '🇮🇹', count: 289, percentage: 33 },
          { id: 'spain', name: 'Spain', icon: '🇪🇸', count: 127, percentage: 14 },
          { id: 'usa', name: 'United States', icon: '🇺🇸', count: 89, percentage: 10 },
          { id: 'australia', name: 'Australia', icon: '🇦🇺', count: 32, percentage: 4 },
        ])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [type])

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItems = items.length
  const totalBottles = items.reduce((sum, item) => sum + item.count, 0)
  const maxCount = Math.max(...items.map(i => i.count))

  const handleItemPress = (item: AnalyticsItem) => {
    navigation.navigate('Inventory', {
      filter: { [type === 'grapes' ? 'grape' : 'region']: item.id },
      title: item.name,
    })
  }

  const handleBack = () => {
    navigation.goBack()
  }

  const getPlaceholder = () => {
    if (type === 'grapes') return 'Search grapes...'
    if (type === 'regions') return 'Search regions...'
    return 'Search...'
  }

  const getStatsLabel = () => {
    if (type === 'grapes') return 'GRAPES'
    if (type === 'regions') return 'REGIONS'
    return 'ITEMS'
  }

  const getIcon = (item: AnalyticsItem) => {
    if (type === 'grapes') return '🍇'
    if (type === 'regions') return item.icon || '🌍'
    return '📊'
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#722F37" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="chevron-left" size={28} color="#722F37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TOTAL {getStatsLabel()}</Text>
          <Text style={styles.statValue}>{totalItems}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TOTAL BOTTLES</Text>
          <Text style={styles.statValue}>{totalBottles}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={getPlaceholder()}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const barWidth = (item.count / maxCount) * 100

          return (
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.itemIcon}>
                <Text style={styles.itemIconEmoji}>{getIcon(item)}</Text>
              </View>

              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemCount}>
                  {item.count} bottles ({item.percentage}%)
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <LinearGradient
                    colors={['#722F37', '#944654']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${barWidth}%` }]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        )}
      />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.15)',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#722F37',
    letterSpacing: -1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f4f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconEmoji: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.2,
  },
  itemCount: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    marginTop: 2,
  },
  progressBarContainer: {
    width: 60,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
})
