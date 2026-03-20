import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'

export const ComprehensiveTastingReviewScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { wine } = route.params as { wine: any }

  const [rating, setRating] = useState<number>(5)
  const [visual, setVisual] = useState('')
  const [nose, setNose] = useState('')
  const [palate, setPalate] = useState('')
  const [finish, setFinish] = useState('')
  const [pairing, setPairing] = useState('')
  const [context, setContext] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Build comprehensive notes
      const comprehensiveNotes = [
        visual && `Visual: ${visual}`,
        nose && `Nose: ${nose}`,
        palate && `Palate: ${palate}`,
        finish && `Finish: ${finish}`,
        pairing && `Pairing: ${pairing}`,
        context && `Context: ${context}`,
        notes && `Notes: ${notes}`,
      ]
        .filter(Boolean)
        .join('\n\n')

      await apiFetch(`/api/inventory/${wine.id}/tasting-notes`, {
        method: 'POST',
        body: {
          score: rating * 10, // Convert 1-10 scale to 0-100
          comment: comprehensiveNotes,
          pairing: pairing || null,
          tastedAt: new Date(date).toISOString(),
        },
      })

      Alert.alert(
        'Review Saved',
        'Your comprehensive tasting note has been saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      )
    } catch (error) {
      console.error('Failed to save tasting note:', error)
      Alert.alert('Save Failed', 'Failed to save tasting note. Please try again.')
      setIsSaving(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#722F37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comprehensive Review</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wine Info */}
        <View style={styles.wineInfo}>
          <Text style={styles.wineName}>{wine.name}</Text>
          {wine.vintage && <Text style={styles.wineVintage}>{wine.vintage}</Text>}
          <Text style={styles.timeEstimate}>⏱ Estimated time: 10-15 minutes</Text>
        </View>

        {/* Visual Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Visual</Text>
          <TextInput
            style={styles.textInput}
            value={visual}
            onChangeText={setVisual}
            placeholder="Color, clarity, intensity..."
            placeholderTextColor="#b5a89e"
            multiline
          />
        </View>

        {/* Nose Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nose</Text>
          <TextInput
            style={styles.textInput}
            value={nose}
            onChangeText={setNose}
            placeholder="Primary, secondary, tertiary aromas..."
            placeholderTextColor="#b5a89e"
            multiline
          />
        </View>

        {/* Palate Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Palate</Text>
          <TextInput
            style={styles.textInput}
            value={palate}
            onChangeText={setPalate}
            placeholder="Body, tannins, acidity, alcohol, flavors..."
            placeholderTextColor="#b5a89e"
            multiline
          />
        </View>

        {/* Finish Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Finish</Text>
          <TextInput
            style={styles.textInput}
            value={finish}
            onChangeText={setFinish}
            placeholder="Length, quality..."
            placeholderTextColor="#b5a89e"
            multiline
          />
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Overall Rating (1-10)</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingSlider}>
              <View style={styles.ratingTrack}>
                <View style={[styles.ratingFill, { width: `${rating * 10}%` }]} />
              </View>
              <View style={styles.ratingNumbers}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.ratingNumber}
                    onPress={() => setRating(num)}
                  >
                    <Text
                      style={[
                        styles.ratingNumberText,
                        rating === num && styles.ratingNumberTextActive,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Text style={styles.ratingValue}>{rating}</Text>
          </View>
        </View>

        {/* Pairing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Food Pairing Suggestions</Text>
          <TextInput
            style={styles.textInput}
            value={pairing}
            onChangeText={setPairing}
            placeholder="Recommended dishes, flavors, ingredients..."
            placeholderTextColor="#b5a89e"
            multiline
          />
        </View>

        {/* Context Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Context</Text>
          <TextInput
            style={styles.textInput}
            value={context}
            onChangeText={setContext}
            placeholder="Where tasted, occasion, company, serving conditions..."
            placeholderTextColor="#b5a89e"
            multiline
          />
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Additional Notes</Text>
          <TextInput
            style={styles.textInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any other observations or thoughts..."
            placeholderTextColor="#b5a89e"
            multiline
          />
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tasting Date</Text>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#b5a89e"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#722F37', '#944654']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Comprehensive Review'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.3)',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#722F37',
    fontFamily: 'NunitoSans_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  wineInfo: {
    marginBottom: 32,
  },
  wineName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#722F37',
    marginBottom: 6,
    fontFamily: 'NunitoSans_700Bold',
  },
  wineVintage: {
    fontSize: 17,
    color: '#8a7568',
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  timeEstimate: {
    fontSize: 14,
    color: '#8a7568',
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#722F37',
    marginBottom: 12,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2c1810',
    fontFamily: 'NunitoSans_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingSlider: {
    flex: 1,
  },
  ratingTrack: {
    height: 6,
    backgroundColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ratingFill: {
    height: '100%',
    backgroundColor: '#722F37',
  },
  ratingNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingNumber: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingNumberText: {
    fontSize: 14,
    color: '#8a7568',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  ratingNumberTextActive: {
    color: '#722F37',
    fontWeight: '700',
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#722F37',
    fontFamily: 'NunitoSans_700Bold',
    minWidth: 48,
    textAlign: 'center',
  },
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2c1810',
    fontFamily: 'NunitoSans_400Regular',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'NunitoSans_600SemiBold',
  },
})
