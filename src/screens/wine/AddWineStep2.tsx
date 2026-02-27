import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type Source = 'wine_shop' | 'online' | 'auction' | 'gift' | 'producer' | 'other'

type NavigationProp = NativeStackNavigationProp<any>

const SOURCES = [
  { id: 'wine_shop' as Source, label: 'Wine Shop' },
  { id: 'online' as Source, label: 'Online' },
  { id: 'auction' as Source, label: 'Auction' },
  { id: 'gift' as Source, label: 'Gift' },
  { id: 'producer' as Source, label: 'Producer' },
  { id: 'other' as Source, label: 'Other' },
]

export const AddWineStep2 = () => {
  const route = useRoute<any>()
  const navigation = useNavigation<NavigationProp>()
  const wine = route.params?.wine

  // Wine info (manual entry or pre-filled from AI)
  const [wineName, setWineName] = useState(wine?.name || '')
  const [vintage, setVintage] = useState(wine?.vintage ? String(wine.vintage) : '')
  const [region, setRegion] = useState(wine?.region || '')
  const [color, setColor] = useState(wine?.color || '')

  // Cellar details
  const [quantity, setQuantity] = useState('1')
  const [location, setLocation] = useState('Main Cellar')

  // Purchase info (optional)
  const [purchaseDate, setPurchaseDate] = useState('')
  const [pricePerBottle, setPricePerBottle] = useState('')
  const [source, setSource] = useState<Source | null>(null)
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBack = () => {
    if (wineName || vintage || region) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      )
    } else {
      navigation.goBack()
    }
  }

  const handleSubmit = async () => {
    if (!wineName.trim()) {
      Alert.alert('Required', 'Please enter a wine name')
      return
    }

    setIsSubmitting(true)

    // TODO: POST /api/wines
    const wineData = {
      name: wineName.trim(),
      vintage: vintage ? parseInt(vintage) : null,
      region: region.trim() || null,
      color: color.trim() || null,
      quantity: parseInt(quantity) || 1,
      location: location.trim() || 'Main Cellar',
      purchaseDate: purchaseDate || null,
      pricePerBottle: pricePerBottle ? parseFloat(pricePerBottle) : null,
      source: source || null,
      notes: notes.trim() || null,
    }

    console.log('Submitting wine:', wineData)

    setTimeout(() => {
      setIsSubmitting(false)
      Alert.alert('Success', 'Wine added to cellar!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Home')
          },
        },
      ])
    }, 1000)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Wine</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Tell me about it 🍷</Text>
          <Text style={styles.heroSubtitle}>Share the details of this bottle.</Text>
        </View>

        {/* Wine Information */}
        <View style={styles.section}>
          <Text style={styles.label}>Wine Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Château Margaux"
            placeholderTextColor="#aaa"
            value={wineName}
            onChangeText={setWineName}
          />

          <Text style={styles.label}>Vintage (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2015"
            placeholderTextColor="#aaa"
            value={vintage}
            onChangeText={setVintage}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Region (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Bordeaux"
            placeholderTextColor="#aaa"
            value={region}
            onChangeText={setRegion}
          />

          <Text style={styles.label}>Color (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Red, White, Rosé"
            placeholderTextColor="#aaa"
            value={color}
            onChangeText={setColor}
          />

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoEmoji}>💡</Text>
            <Text style={styles.infoText}>
              I'll use this info to track your bottle and suggest when to open it!
            </Text>
          </View>
        </View>

        {/* Cellar Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cellar Details</Text>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#aaa"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Main Cellar"
                placeholderTextColor="#aaa"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
        </View>

        {/* Purchase Info (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Purchase Info <Text style={styles.sectionTitleOptional}>(optional)</Text>
          </Text>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-02-27"
                placeholderTextColor="#aaa"
                value={purchaseDate}
                onChangeText={setPurchaseDate}
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Price / Bottle</Text>
              <TextInput
                style={styles.input}
                placeholder="€0.00"
                placeholderTextColor="#aaa"
                value={pricePerBottle}
                onChangeText={setPricePerBottle}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Where did you get it?</Text>
          <View style={styles.sourceChips}>
            {SOURCES.map((s) => {
              const isActive = source === s.id

              return isActive ? (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSource(s.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f9a825', '#fbc02d']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sourceChipActive}
                  >
                    <Text style={styles.sourceChipTextActive}>{s.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={s.id}
                  style={styles.sourceChip}
                  onPress={() => setSource(s.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sourceChipText}>{s.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional details..."
            placeholderTextColor="#aaa"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={['#722F37', '#944654']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Adding...' : 'Add to Cellar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Decorative Background */}
        <View style={styles.decorationTop} pointerEvents="none" />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 17,
    color: '#722F37',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  sectionTitleOptional: {
    color: '#999',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 243, 224, 0.5)',
    borderLeftWidth: 3,
    borderLeftColor: '#f9a825',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  sourceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  sourceChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sourceChipActive: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sourceChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  sourceChipTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginTop: 24,
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  decorationTop: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(114, 47, 55, 0.03)',
    zIndex: -1,
  },
})
