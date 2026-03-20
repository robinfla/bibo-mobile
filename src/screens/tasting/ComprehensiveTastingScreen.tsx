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
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { tastingsApi } from '../../api/tastings'
import { TastingSlider } from '../../components/TastingSlider'
import { ColorGradientPicker } from '../../components/ColorGradientPicker'
import { PhotoPickerRow } from '../../components/PhotoPickerRow'
import type { CreateTastingInput } from '../../types/api'
import { colors } from '../../theme/colors'

export const ComprehensiveTastingScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { wine } = route.params as { wine: any }

  // Overall rating
  const [rating, setRating] = useState<number>(50)

  // Visual assessment
  const [visualColorPosition, setVisualColorPosition] = useState(50)
  const [visualColor, setVisualColor] = useState('Gold')
  const [visualIntensity, setVisualIntensity] = useState(60)
  const [visualClarity, setVisualClarity] = useState(80)
  const [visualViscosity, setVisualViscosity] = useState(50)

  // Nose
  const [noseIntensity, setNoseIntensity] = useState(65)
  const [noseDevelopment, setNoseDevelopment] = useState(30)
  const [noseAromas, setNoseAromas] = useState<string[]>([])

  // Palate
  const [palateSweetness, setPalateSweetness] = useState(10)
  const [palateAcidity, setPalateAcidity] = useState(65)
  const [palateTannin, setPalateTannin] = useState(50)
  const [palateBody, setPalateBody] = useState(80)
  const [palateAlcohol, setPalateAlcohol] = useState(55)
  const [palateFinish, setPalateFinish] = useState(75)
  const [palateFlavors, setPalateFlavors] = useState<string[]>([])

  // Context
  const [contextPeople, setContextPeople] = useState('')
  const [contextPlace, setContextPlace] = useState('')
  const [contextMeal, setContextMeal] = useState('')
  const [contextTemperature, setContextTemperature] = useState('')
  const [contextDecanted, setContextDecanted] = useState('')

  // Notes & Photos
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  const [isSaving, setIsSaving] = useState(false)

  const getIntensityLabel = (value: number): string => {
    if (value < 33) return 'Pale'
    if (value < 67) return 'Medium'
    return 'Deep'
  }

  const getClarityLabel = (value: number): string => {
    if (value < 33) return 'Cloudy'
    if (value < 67) return 'Clear'
    return 'Brilliant'
  }

  const getViscosityLabel = (value: number): string => {
    if (value < 33) return 'Watery'
    if (value < 67) return 'Medium'
    return 'Syrupy'
  }

  const getNoseLabel = (value: number, type: 'intensity' | 'development'): string => {
    if (type === 'intensity') {
      if (value < 33) return 'Light'
      if (value < 67) return 'Medium'
      return 'Pronounced'
    } else {
      if (value < 33) return 'Simple'
      if (value < 67) return 'Developing'
      return 'Complex'
    }
  }

  const getPalateLabel = (value: number, type: string): string => {
    if (type === 'sweetness') {
      if (value < 20) return 'Dry'
      if (value < 40) return 'Off-Dry'
      if (value < 60) return 'Medium-Sweet'
      if (value < 80) return 'Sweet'
      return 'Very Sweet'
    }
    if (type === 'acidity' || type === 'tannin') {
      if (value < 33) return 'Low'
      if (value < 67) return 'Medium'
      return 'High'
    }
    if (type === 'body') {
      if (value < 33) return 'Light'
      if (value < 67) return 'Medium'
      return 'Full'
    }
    if (type === 'finish') {
      if (value < 25) return 'Short'
      if (value < 50) return 'Medium'
      if (value < 75) return 'Long'
      return 'Very Long'
    }
    return ''
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const tastingData: CreateTastingInput = {
        wineId: wine.id,
        vintage: wine.vintage || null,
        rating,
        
        // Visual
        visualColor,
        visualColorPosition,
        visualIntensity: getIntensityLabel(visualIntensity),
        visualIntensityValue: visualIntensity,
        visualClarity: getClarityLabel(visualClarity),
        visualClarityValue: visualClarity,
        visualViscosity: getViscosityLabel(visualViscosity),
        visualViscosityValue: visualViscosity,
        
        // Nose
        noseIntensity: getNoseLabel(noseIntensity, 'intensity'),
        noseIntensityValue: noseIntensity,
        noseDevelopment: getNoseLabel(noseDevelopment, 'development'),
        noseDevelopmentValue: noseDevelopment,
        noseAromas: noseAromas.length > 0 ? noseAromas : null,
        
        // Palate
        palateSweetness: getPalateLabel(palateSweetness, 'sweetness'),
        palateSweetnessValue: palateSweetness,
        palateAcidity: getPalateLabel(palateAcidity, 'acidity'),
        palateAcidityValue: palateAcidity,
        palateTannin: getPalateLabel(palateTannin, 'tannin'),
        palateTanninValue: palateTannin,
        palateBody: getPalateLabel(palateBody, 'body'),
        palateBodyValue: palateBody,
        palateAlcohol: null,
        palateAlcoholValue: palateAlcohol,
        palateFinish: getPalateLabel(palateFinish, 'finish'),
        palateFinishValue: palateFinish,
        palateFlavors: palateFlavors.length > 0 ? palateFlavors : null,
        
        // Context
        contextPeople: contextPeople ? contextPeople.split(',').map(p => p.trim()) : null,
        contextPlace: contextPlace || null,
        contextMeal: contextMeal || null,
        contextTemperature: contextTemperature ? parseInt(contextTemperature) : null,
        contextDecantedMinutes: contextDecanted ? parseInt(contextDecanted) : null,
        
        // Notes & Photos
        notes: notes || null,
        photos: photos.length > 0 ? photos : null,
      }

      await tastingsApi.create(tastingData)

      Alert.alert(
        'Tasting Saved',
        'Your comprehensive tasting has been saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      )
    } catch (error) {
      console.error('Failed to save tasting:', error)
      Alert.alert('Save Failed', 'Failed to save tasting. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.coral} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasting Review</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wine Info Card */}
        <View style={styles.wineCard}>
          <View style={styles.wineCardRow}>
            {wine.bottleImageUrl && (
              <Image source={{ uri: wine.bottleImageUrl }} style={styles.bottleImage} />
            )}
            <View style={styles.wineInfo}>
              <Text style={styles.wineName}>
                {wine.name} {wine.vintage && <Text style={styles.vintageText}>{wine.vintage}</Text>}
              </Text>
              <Text style={styles.producerName}>{wine.producerName}</Text>
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Overall Rating</Text>
            <Text style={styles.ratingValue}>{rating}/100</Text>
            <TastingSlider
              label=""
              value={rating}
              onChange={setRating}
              startLabel="0"
              endLabel="100"
            />
          </View>
        </View>

        {/* VISUAL ASSESSMENT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual Assessment</Text>
          
          <ColorGradientPicker
            value={visualColorPosition}
            onChange={(value, colorName) => {
              setVisualColorPosition(value)
              setVisualColor(colorName)
            }}
          />

          <TastingSlider
            label="Intensity"
            value={visualIntensity}
            onChange={setVisualIntensity}
            startLabel="Pale"
            endLabel="Deep"
          />

          <TastingSlider
            label="Clarity"
            value={visualClarity}
            onChange={setVisualClarity}
            startLabel="Cloudy"
            endLabel="Brilliant"
          />

          <TastingSlider
            label="Viscosity"
            value={visualViscosity}
            onChange={setVisualViscosity}
            startLabel="Watery"
            endLabel="Syrupy"
          />
        </View>

        {/* NOSE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nose</Text>

          <TastingSlider
            label="Intensity"
            value={noseIntensity}
            onChange={setNoseIntensity}
            startLabel="Light"
            endLabel="Pronounced"
          />

          <TastingSlider
            label="Development"
            value={noseDevelopment}
            onChange={setNoseDevelopment}
            startLabel="Simple"
            endLabel="Complex"
          />

          <Text style={styles.subsectionLabel}>Aromas</Text>
          <TextInput
            style={styles.textInput}
            value={noseAromas.join(', ')}
            onChangeText={(text) => setNoseAromas(text.split(',').map(a => a.trim()).filter(Boolean))}
            placeholder="e.g., Blackcurrant, Cherry, Vanilla..."
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* PALATE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Palate</Text>

          <TastingSlider
            label="Sweetness"
            value={palateSweetness}
            onChange={setPalateSweetness}
            startLabel="Dry"
            endLabel="Sweet"
          />

          <TastingSlider
            label="Acidity"
            value={palateAcidity}
            onChange={setPalateAcidity}
            startLabel="Low"
            endLabel="High"
          />

          <TastingSlider
            label="Tannin"
            value={palateTannin}
            onChange={setPalateTannin}
            startLabel="Low"
            endLabel="High"
          />

          <TastingSlider
            label="Body"
            value={palateBody}
            onChange={setPalateBody}
            startLabel="Light"
            endLabel="Full"
          />

          <TastingSlider
            label="Alcohol"
            value={palateAlcohol}
            onChange={setPalateAlcohol}
            startLabel="<11%"
            endLabel=">15%"
          />

          <TastingSlider
            label="Finish"
            value={palateFinish}
            onChange={setPalateFinish}
            startLabel="Short"
            endLabel="Very Long"
          />

          <Text style={styles.subsectionLabel}>Flavor Notes</Text>
          <TextInput
            style={styles.textInput}
            value={palateFlavors.join(', ')}
            onChangeText={(text) => setPalateFlavors(text.split(',').map(f => f.trim()).filter(Boolean))}
            placeholder="e.g., Dark fruit, Spice, Oak..."
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* CONTEXT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Context</Text>

          <View style={styles.contextRow}>
            <Ionicons name="people" size={20} color={colors.coral} />
            <TextInput
              style={styles.contextInput}
              value={contextPeople}
              onChangeText={setContextPeople}
              placeholder="Tasting companions (comma-separated)"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.contextRow}>
            <Ionicons name="location" size={20} color={colors.coral} />
            <TextInput
              style={styles.contextInput}
              value={contextPlace}
              onChangeText={setContextPlace}
              placeholder="Place"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.contextRow}>
            <Ionicons name="restaurant" size={20} color={colors.coral} />
            <TextInput
              style={styles.contextInput}
              value={contextMeal}
              onChangeText={setContextMeal}
              placeholder="Meal pairing"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.servingGrid}>
            <View style={styles.servingItem}>
              <Ionicons name="thermometer" size={20} color={colors.coral} />
              <TextInput
                style={styles.servingInput}
                value={contextTemperature}
                onChangeText={setContextTemperature}
                placeholder="Temp (°C)"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.servingItem}>
              <Ionicons name="wine" size={20} color={colors.coral} />
              <TextInput
                style={styles.servingInput}
                value={contextDecanted}
                onChangeText={setContextDecanted}
                placeholder="Decanted (min)"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* NOTES & PHOTOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes & Photos</Text>

          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Write your tasting impressions..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
          />

          <PhotoPickerRow photos={photos} onChange={setPhotos} />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.coral, colors.coralDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Tasting'}
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
    backgroundColor: colors.linen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: colors.surface,
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
    color: colors.coral,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  wineCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  wineCardRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  bottleImage: {
    width: 90,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.linen,
    marginRight: 16,
  },
  wineInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  wineName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.coral,
    marginBottom: 6,
  },
  vintageText: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  producerName: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  ratingSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 213, 203, 0.3)',
    paddingTop: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.coral,
    marginBottom: 12,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.coral,
    marginBottom: 20,
  },
  subsectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contextInput: {
    flex: 1,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  servingGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  servingItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servingInput: {
    flex: 1,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  notesInput: {
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textInverse,
  },
})
