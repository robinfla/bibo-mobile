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
import { X, Bell, Heart } from 'phosphor-react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

type Priority = 'must-have' | 'nice' | 'someday'

export const AddToWishlistScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { wine } = route.params as { wine: any }

  const [priority, setPriority] = useState<Priority>('nice')
  const [budget, setBudget] = useState('')
  const [notes, setNotes] = useState('')
  const [notify, setNotify] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const priorityOptions: Array<{ value: Priority; label: string; emoji: string }> = [
    { value: 'must-have', label: 'Must Have', emoji: '🔥' },
    { value: 'nice', label: 'Nice to Have', emoji: '⭐' },
    { value: 'someday', label: 'Someday', emoji: '💭' },
  ]

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await apiFetch('/api/wishlist', {
        method: 'POST',
        body: {
          itemType: 'wine',
          wineId: wine.id,
          name: `${wine.name}${wine.vintage ? ` ${wine.vintage}` : ''}`,
          vintage: wine.vintage || null,
          notes: notes || null,
          priceTarget: budget || null,
          priceCurrency: 'EUR',
        },
      })

      Alert.alert(
        'Added to Wishlist',
        `${wine.name} has been added to your wishlist!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      )
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      Alert.alert('Save Failed', 'Failed to add to wishlist. Please try again.')
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
        <Text style={styles.headerTitle}>Add to Wishlist</Text>
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

        {/* Priority Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Priority</Text>
          <View style={styles.priorityChips}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityChip,
                  priority === option.value && styles.priorityChipActive,
                ]}
                onPress={() => setPriority(option.value)}
                activeOpacity={0.7}
              >
                {priority === option.value ? (
                  <LinearGradient
                    colors={[colors.coral, colors.coralDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.priorityChipGradient}
                  >
                    <Text style={styles.priorityChipEmojiActive}>{option.emoji}</Text>
                    <Text style={styles.priorityChipTextActive}>{option.label}</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={styles.priorityChipEmoji}>{option.emoji}</Text>
                    <Text style={styles.priorityChipText}>{option.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Budget (Optional)</Text>
          <TextInput
            style={styles.budgetInput}
            value={budget}
            onChangeText={setBudget}
            placeholder="e.g., 50"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />
          <Text style={styles.budgetHint}>Maximum price you're willing to pay (EUR)</Text>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Why do you want this wine? Where did you taste it? Special occasions?"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Notify Toggle */}
        <TouchableOpacity
          style={styles.notifyToggle}
          onPress={() => setNotify(!notify)}
          activeOpacity={0.7}
        >
          <View style={styles.notifyToggleLeft}>
            <Bell
              size={24}
              weight={notify ? 'fill' : 'regular'}
              color={colors.coral}
            />
            <View style={styles.notifyToggleText}>
              <Text style={styles.notifyToggleTitle}>Notify me when available</Text>
              <Text style={styles.notifyToggleSubtitle}>
                Get alerts when this wine is in stock
              </Text>
            </View>
          </View>
          <View
            style={[styles.switch, notify && styles.switchActive]}
          >
            <View
              style={[styles.switchThumb, notify && styles.switchThumbActive]}
            />
          </View>
        </TouchableOpacity>

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
            <Heart size={18} weight="fill" color={colors.textInverse} />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Adding...' : 'Add to Wishlist'}
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
    borderBottomColor: colors.borderSubtle,
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
  priorityChips: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityChipActive: {
    borderWidth: 0,
    padding: 0,
  },
  priorityChipGradient: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityChipEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  priorityChipEmojiActive: {
    fontSize: 24,
    marginBottom: 4,
  },
  priorityChipTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textInverse,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  budgetInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_400Regular',
    marginBottom: 8,
  },
  budgetHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'NunitoSans_400Regular',
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
  notifyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  notifyToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  notifyToggleText: {
    flex: 1,
  },
  notifyToggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  notifyToggleSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'NunitoSans_400Regular',
  },
  switch: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(228, 213, 203, 0.4)',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: colors.coral,
  },
  switchThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  switchThumbActive: {
    marginLeft: 20,
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
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textInverse,
    fontFamily: 'NunitoSans_600SemiBold',
  },
})
