import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { apiFetch } from '../api/client'
import { ScorePickerModal } from './ScorePickerModal'

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

interface ConsumeDetailsStepProps {
  wine: Wine
  onBack: () => void
  onClose: () => void
  onSuccess: () => void
}

const getWineColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: '#722F37',
    white: '#F4E8D0',
    rose: '#FFC0CB',
    sparkling: '#FFD700',
    dessert: '#D4A574',
    fortified: '#8B4513',
  }
  return colorMap[color] || '#ccc'
}

export const ConsumeDetailsStep: React.FC<ConsumeDetailsStepProps> = ({
  wine,
  onBack,
  onClose,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState(1)
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [showRatingPicker, setShowRatingPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= wine.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleRatingSelect = (score: number) => {
    setRating(score)
    setShowRatingPicker(false)
  }

  const handleSubmit = async () => {
    if (quantity > wine.stock) {
      Alert.alert('Insufficient Stock', `Only ${wine.stock} bottles available.`)
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch('/api/history/consume', {
        method: 'POST',
        body: {
          lotId: parseInt(wine.id),
          quantity,
          rating,
          notes: notes.trim() || null,
          consumedAt: new Date().toISOString(),
        },
      })

      Alert.alert('Success', 'Wine consumed ✓', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess()
            onClose()
          },
        },
      ])
    } catch (error: any) {
      console.error('Consume failed:', error)
      Alert.alert('Error', error.message || 'Failed to record consumption')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Icon name="chevron-left" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Mark as Consumed</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Wine Card */}
          <LinearGradient
            colors={['#fef9f5', '#f8f4f0']}
            style={styles.wineCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.wineImageContainer}>
              <View style={[styles.wineImagePlaceholder, { backgroundColor: '#f5f5f5' }]}>
                <Icon name="bottle-wine" size={40} color="#ccc" />
                <View style={[styles.colorBadge, { backgroundColor: getWineColor(wine.color) }]} />
              </View>
            </View>

            <View style={styles.wineInfo}>
              <Text style={styles.wineName} numberOfLines={2}>
                {wine.name}
              </Text>
              <View style={styles.wineMetaRow}>
                {wine.vintage && (
                  <View style={styles.vintageChip}>
                    <Text style={styles.vintageText}>{wine.vintage}</Text>
                  </View>
                )}
                <Text style={styles.regionText} numberOfLines={1}>
                  {wine.region}
                </Text>
              </View>
              <Text style={styles.stockText}>
                {wine.stock} {wine.stock === 1 ? 'bottle' : 'bottles'} in cellar
              </Text>
            </View>
          </LinearGradient>

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>QUANTITY</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity === 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity === 1}
                activeOpacity={0.7}
              >
                <Icon name="minus" size={24} color={quantity === 1 ? '#ccc' : '#722F37'} />
              </TouchableOpacity>

              <Text style={styles.quantityDisplay}>{quantity}</Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity === wine.stock && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity === wine.stock}
                activeOpacity={0.7}
              >
                <Icon name="plus" size={24} color={quantity === wine.stock ? '#ccc' : '#722F37'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RATE THIS WINE (OPTIONAL)</Text>
            <TouchableOpacity
              style={styles.ratingRow}
              onPress={() => setShowRatingPicker(true)}
              activeOpacity={0.7}
            >
              {rating ? (
                <>
                  <Text style={styles.ratingValue}>{rating}/10</Text>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name={star <= rating / 2 ? 'star' : 'star-outline'}
                        size={24}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.ratingPlaceholder}>Tap to rate</Text>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon key={star} name="star-outline" size={24} color="#ccc" />
                    ))}
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TASTING NOTES (OPTIONAL)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="How was it? Any memorable flavors or pairings?"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButtonContainer}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#722F37', '#8b3a45']}
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Mark as Consumed</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScorePickerModal
        visible={showRatingPicker}
        wineName={wine.name}
        currentScore={rating ?? undefined}
        onSave={handleRatingSelect}
        onClose={() => setShowRatingPicker(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    height: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  wineCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  wineImageContainer: {
    marginRight: 16,
  },
  wineImagePlaceholder: {
    width: 72,
    height: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  colorBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  wineInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  wineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  wineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vintageChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  vintageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  regionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
    flex: 1,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingVertical: 12,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityDisplay: {
    fontSize: 48,
    fontWeight: '800',
    marginHorizontal: 40,
    color: '#722F37',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  ratingPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#722F37',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  notesInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 100,
  },
  submitButtonContainer: {
    marginTop: 8,
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
})
