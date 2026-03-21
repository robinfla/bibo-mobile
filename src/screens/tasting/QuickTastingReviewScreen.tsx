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
import { X } from 'phosphor-react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

export const QuickTastingReviewScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { wine } = route.params as { wine: any }

  const [rating, setRating] = useState<number>(5)
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await apiFetch(`/api/inventory/${wine.id}/tasting-notes`, {
        method: 'POST',
        body: {
          score: rating * 10, // Convert 1-10 scale to 0-100
          comment: notes || null,
          tastedAt: new Date(date).toISOString(),
        },
      })

      Alert.alert(
        'Review Saved',
        'Your tasting note has been saved successfully!',
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
          <X size={24} weight="regular" color={colors.coral} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Tasting Review</Text>
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
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Rating (1-10)</Text>
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

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Smooth tannins, dark fruit, good structure"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date</Text>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textTertiary}
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
            colors={[colors.coral, colors.coralDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Review'}
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
    color: colors.coral,
    marginBottom: 6,
    fontFamily: 'NunitoSans_700Bold',
  },
  wineVintage: {
    fontSize: 17,
    color: colors.textSecondary,
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.coral,
    marginBottom: 12,
    fontFamily: 'NunitoSans_600SemiBold',
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
    backgroundColor: colors.coral,
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
    color: colors.textSecondary,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  ratingNumberTextActive: {
    color: colors.coral,
    fontWeight: '700',
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.coral,
    fontFamily: 'NunitoSans_700Bold',
    minWidth: 48,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_400Regular',
    minHeight: 120,
  },
  dateInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_400Regular',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.coral,
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
    color: colors.textInverse,
    fontFamily: 'NunitoSans_600SemiBold',
  },
})
