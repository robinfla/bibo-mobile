import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { colors } from '../../theme/colors'

type Priority = 'must_have' | 'nice_to_have' | 'someday'

type RootStackParamList = {
  Wishlist: undefined
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const PRIORITIES = [
  { id: 'must_have' as Priority, emoji: '🔥', label: 'Must Have' },
  { id: 'nice_to_have' as Priority, emoji: '⭐', label: 'Nice' },
  { id: 'someday' as Priority, emoji: '💭', label: 'Someday' },
]

export const AddWishlistStep2 = () => {
  const route = useRoute<any>()
  const navigation = useNavigation<NavigationProp>()
  const wine = route.params?.wine

  const [priority, setPriority] = useState<Priority>('nice_to_have')
  const [budget, setBudget] = useState('')
  const [whereToBuy, setWhereToBuy] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Manual entry fields (when wine.id === 0)
  const [manualName, setManualName] = useState('')
  const [manualVintage, setManualVintage] = useState('')
  const [manualRegion, setManualRegion] = useState('')
  const [manualColor, setManualColor] = useState('')
  
  const isManualEntry = wine?.id === 0

  const handleBack = () => {
    if (budget || whereToBuy || notes) {
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
    if (isManualEntry && !manualName.trim()) {
      Alert.alert('Required', 'Please enter a wine name')
      return
    }
    
    if (!isManualEntry && !wine) {
      Alert.alert('Error', 'No wine selected')
      return
    }

    setIsSubmitting(true)
    
    // TODO: POST /api/wishlist with manual or AI-selected wine data
    const wineData = isManualEntry
      ? {
          name: manualName.trim(),
          vintage: manualVintage ? parseInt(manualVintage) : null,
          region: manualRegion.trim() || null,
          color: manualColor.trim() || null,
        }
      : wine
    
    console.log('Submitting wishlist item:', { wineData, priority, budget, whereToBuy, notes })
    
    setTimeout(() => {
      setIsSubmitting(false)
      Alert.alert('Success', 'Wine added to wishlist!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to wishlist tab
            navigation.navigate('Wishlist' as never)
          },
        },
      ])
    }, 1000)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Wishlist</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            {isManualEntry ? 'What wine are you dreaming of? 🍷' : 'One step away! ✨'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isManualEntry ? 'Tell us about the wine you want.' : 'Tell us why this wine matters to you.'}
          </Text>
        </View>

        {/* Wine Preview Card - Manual Entry */}
        {isManualEntry ? (
          <View style={styles.section}>
            <Text style={styles.label}>Wine Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Château Margaux"
              placeholderTextColor="#aaa"
              value={manualName}
              onChangeText={setManualName}
            />
            
            <Text style={styles.label}>Vintage (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2015"
              placeholderTextColor="#aaa"
              value={manualVintage}
              onChangeText={setManualVintage}
              keyboardType="number-pad"
            />
            
            <Text style={styles.label}>Region (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bordeaux"
              placeholderTextColor="#aaa"
              value={manualRegion}
              onChangeText={setManualRegion}
            />
            
            <Text style={styles.label}>Color (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Red, White, Rosé"
              placeholderTextColor="#aaa"
              value={manualColor}
              onChangeText={setManualColor}
            />
          </View>
        ) : (
          /* Wine Preview Card - AI Selected */
          <View style={styles.wineCard}>
            <View style={styles.wineImagePlaceholder}>
              <Text style={styles.wineImageText}>🍷</Text>
            </View>
            <View style={styles.wineInfo}>
              <Text style={styles.wineName}>{wine?.name || 'Unknown Wine'}</Text>
              <Text style={styles.wineMeta}>
                {wine?.vintage} • {wine?.region} • {wine?.color}
              </Text>
            </View>
          </View>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            💡 We'll keep an eye out for this one and let you know when we find a good deal!
          </Text>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.label}>How much do you want it?</Text>
          <View style={styles.priorityContainer}>
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.id
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityChip,
                    isSelected && styles.priorityChipSelected,
                  ]}
                  onPress={() => setPriority(p.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.priorityEmoji, isSelected && styles.priorityEmojiSelected]}>
                    {p.emoji}
                  </Text>
                  <Text style={[styles.priorityLabel, isSelected && styles.priorityLabelSelected]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. $150"
            placeholderTextColor="#aaa"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />
        </View>

        {/* Where to Buy */}
        <View style={styles.section}>
          <Text style={styles.label}>Where to find it? (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Wine.com, local shop, auction..."
            placeholderTextColor="#aaa"
            value={whereToBuy}
            onChangeText={setWhereToBuy}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Why this wine? (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Special occasion? Gift idea? Just curious?"
            placeholderTextColor="#aaa"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (isSubmitting || (isManualEntry && !manualName.trim())) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || (isManualEntry && !manualName.trim())}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isSubmitting ? ['#e0e0e0', '#e0e0e0'] : ['#8B4049', '#722F37']}
            style={styles.submitGradient}
          >
            <Text style={[styles.submitButtonText, isSubmitting && styles.submitButtonTextDisabled]}>
              {isSubmitting ? 'Adding...' : 'Add to My Wishlist ✨'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Background Decorations */}
      <View style={styles.decorationTop} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 16,
    color: '#722F37',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scrollContent: {
    padding: 20,
  },
  hero: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  wineCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  wineImagePlaceholder: {
    width: 70,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#722F37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  wineImageText: {
    fontSize: 36,
  },
  wineInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  wineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  wineMeta: {
    fontSize: 14,
    color: '#888',
  },
  infoBanner: {
    backgroundColor: '#fffbf0',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    shadowColor: '#ffc107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  priorityChipSelected: {
    backgroundColor: '#f5b731',
    transform: [{ scale: 1.05 }],
    shadowColor: '#f5b731',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  priorityEmoji: {
    fontSize: 28,
    marginBottom: 8,
    opacity: 0.6,
  },
  priorityEmojiSelected: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  priorityLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  priorityLabelSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  submitButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  decorationTop: {
    position: 'absolute',
    top: 100,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(245, 183, 49, 0.08)',
  },
})
