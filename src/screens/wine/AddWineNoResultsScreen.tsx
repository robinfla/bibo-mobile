import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import Svg, { Path } from 'react-native-svg'

type NavigationProp = NativeStackNavigationProp<any>

interface RouteParams {
  query: string
}

const CameraSvg = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <Path d="M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H3V8h3V6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 14c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5-5 2.24-5 5zm5-3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3z" />
  </Svg>
)

export const AddWineNoResultsScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<any>()
  const initialQuery = (route.params as RouteParams)?.query || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const handleClearSearch = () => {
    setSearchQuery('')
    navigation.goBack()
  }

  const handleScanPress = () => {
    navigation.navigate('ScanTab', { screen: 'WineScanCamera' })
  }

  const handleAddManually = () => {
    // Navigate to manual entry form (AddWineStep2)
    navigation.navigate('AddWineStep2', {
      wine: {
        name: searchQuery, // Pre-fill with search query
      },
    })
  }

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
              onChangeText={setSearchQuery}
              placeholder="Search wine name or producer..."
              placeholderTextColor="rgba(45, 45, 45, 0.4)"
              editable={false}
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

        {/* No Results State */}
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsIcon}>🤷</Text>
          <Text style={styles.noResultsTitle}>No results found</Text>
          <Text style={styles.noResultsMessage}>
            We couldn't find <Text style={styles.queryText}>{searchQuery}</Text> in our wine database.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.addManuallyButton}
              onPress={handleAddManually}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#722F37', '#944654']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addManuallyGradient}
              >
                <Icon name="plus" size={20} color="white" />
                <Text style={styles.addManuallyText}>Add Manually</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tryScanButton}
              onPress={handleScanPress}
              activeOpacity={0.8}
            >
              <Text style={styles.tryScanEmoji}>📷</Text>
              <Text style={styles.tryScanText}>Try Scanning Label</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 60,
  },
  noResultsIcon: {
    fontSize: 72,
    opacity: 0.4,
    marginBottom: 24,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#722F37',
    marginBottom: 12,
  },
  noResultsMessage: {
    fontSize: 15,
    color: 'rgba(45, 45, 45, 0.6)',
    textAlign: 'center',
    lineHeight: 22.5,
    marginBottom: 32,
  },
  queryText: {
    fontWeight: '600',
    color: '#722F37',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  addManuallyButton: {
    borderRadius: 16,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  addManuallyGradient: {
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
    fontWeight: '600',
    color: 'white',
  },
  tryScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tryScanEmoji: {
    fontSize: 20,
  },
  tryScanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#722F37',
  },
})
