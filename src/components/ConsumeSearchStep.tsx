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
import { X, MagnifyingGlass, XCircle } from 'phosphor-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg'
import { apiFetch } from '../api/client'
import { colors } from '../theme/colors'

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
    red: '#84454E',
    white: '#F4E8D0',
    rose: colors.rose,
    sparkling: colors.honey,
    dessert: '#D4A574',
    fortified: '#8B4513',
  }
  return colorMap[color] || '#ccc'
}

const MagnifyingGlassIllustration = () => (
  <View style={illustrationStyles.wrapper}>
    {/* Gradient blur blob behind */}
    <LinearGradient
      colors={[colors.rose, colors.honey]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={illustrationStyles.blob}
    />
    <View style={illustrationStyles.iconContainer}>
      <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
        <Defs>
          <SvgLinearGradient id="magGrad" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor={colors.rose} />
            <Stop offset="100%" stopColor={colors.honey} />
          </SvgLinearGradient>
        </Defs>
        {/* Lens */}
        <Circle cx={50} cy={50} r={36} stroke="url(#magGrad)" strokeWidth={12} />
        {/* Handle */}
        <Path d="M75 75L108 108" stroke="url(#magGrad)" strokeWidth={14} strokeLinecap="round" />
        {/* Highlight */}
        <Path d="M50 24C55 24 60 27 64 31" stroke="white" strokeWidth={4} strokeLinecap="round" opacity={0.9} />
        <Circle cx={34} cy={34} r={3} fill="white" opacity={0.8} />
      </Svg>
    </View>
  </View>
)

const illustrationStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 200,
    height: 200,
  },
  blob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.35,
  },
  iconContainer: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

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

  const handleClearSearch = () => {
    setSearchQuery('')
    setWines([])
  }

  const renderWineCard = ({ item }: { item: Wine }) => (
    <TouchableOpacity
      style={styles.wineCard}
      onPress={() => onSelectWine(item)}
      activeOpacity={0.7}
    >
      <View style={styles.wineImageContainer}>
        <View style={[styles.wineImagePlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={styles.wineEmoji}>🍷</Text>
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

      <View style={styles.stockBadge}>
        <Text style={styles.stockText}>
          {item.stock} {item.stock === 1 ? 'bottle' : 'bottles'}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const hasResults = wines.length > 0
  const hasSearched = searchQuery.length >= 2

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.linen, '#f8f4f0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modal}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Consume Wine</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={14} weight="bold" color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={{ fontSize: 20, opacity: 0.4 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search your cellar..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
              placeholderTextColor="rgba(45, 45, 45, 0.4)"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} activeOpacity={0.7} style={{ padding: 4 }}>
                <XCircle size={18} weight="fill" color="rgba(45, 45, 45, 0.4)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.coral} />
          </View>
        ) : (
          <FlatList
            data={wines}
            renderItem={renderWineCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              hasSearched ? (
                <View style={styles.emptyContainer}>
                  <MagnifyingGlass size={48} weight="regular" color="#d4c4b0" />
                  <Text style={styles.emptyTitle}>No wines found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <MagnifyingGlassIllustration />
                  <Text style={styles.emptyTitle}>Search your cellar</Text>
                  <Text style={styles.emptySubtext}>Type at least 2 characters to search</Text>
                </View>
              )
            }
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  modal: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    color: '#2d2d2d',
    padding: 0,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },

  // Wine Cards
  wineCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  wineImageContainer: {
    marginRight: 14,
  },
  wineImagePlaceholder: {
    width: 64,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wineEmoji: {
    fontSize: 28,
    fontFamily: 'NunitoSans_400Regular',
  },
  colorBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
  },
  wineInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  wineName: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  wineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vintageChip: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  vintageText: {
    fontSize: 13,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textSecondary,
  },
  regionText: {
    fontSize: 13,
    fontFamily: 'NunitoSans_500Medium',
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#E8F5E9',
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: '#2E7D32',
  },

  // Empty states
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'NunitoSans_500Medium',
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
})
