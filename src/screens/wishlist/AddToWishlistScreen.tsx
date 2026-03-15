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
          <Icon name="close" size={24} color="#722F37" />
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
                    colors={['#722F37', '#944654']}
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
            placeholderTextColor="#b5a89e"
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
            placeholderTextColor="#b5a89e"
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
            <Icon
              name={notify ? 'bell' : 'bell-outline'}
              size={24}
              color="#722F37"
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
            colors={['#722F37', '#944654']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <Icon name="heart" size={18} color="#fff" />
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
    fontFamily: 'Nunito_700Bold',
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
    fontFamily: 'Nunito_700Bold',
  },
  wineVintage: {
    fontSize: 17,
    color: '#8a7568',
    fontFamily: 'Nunito_400Regular',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#722F37',
    marginBottom: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  priorityChips: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
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
    color: '#2c1810',
    fontFamily: 'Nunito_600SemiBold',
  },
  priorityChipEmojiActive: {
    fontSize: 24,
    marginBottom: 4,
  },
  priorityChipTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold',
  },
  budgetInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2c1810',
    fontFamily: 'Nunito_400Regular',
    marginBottom: 8,
  },
  budgetHint: {
    fontSize: 13,
    color: '#8a7568',
    fontFamily: 'Nunito_400Regular',
  },
  notesInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2c1810',
    fontFamily: 'Nunito_400Regular',
    minHeight: 120,
  },
  notifyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
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
    color: '#2c1810',
    marginBottom: 2,
    fontFamily: 'Nunito_600SemiBold',
  },
  notifyToggleSubtitle: {
    fontSize: 13,
    color: '#8a7568',
    fontFamily: 'Nunito_400Regular',
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
    backgroundColor: '#722F37',
  },
  switchThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    marginLeft: 20,
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
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold',
  },
})
