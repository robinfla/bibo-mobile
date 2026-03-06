import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { apiFetch } from '../api/client'

interface QuickConsumeModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  inventoryLotId: number
  wineName: string
  vintage: number | null
  region: string
  stock: number
  wineColor: 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'fortified'
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

export const QuickConsumeModal: React.FC<QuickConsumeModalProps> = ({
  visible,
  onClose,
  onSuccess,
  inventoryLotId,
  wineName,
  vintage,
  region,
  stock,
  wineColor,
}) => {
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity)
    }
  }

  const handleSubmit = async () => {
    if (quantity > stock) {
      Alert.alert('Insufficient Stock', `Only ${stock} bottles available.`)
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch('/api/history/consume', {
        method: 'POST',
        body: {
          inventoryLotId,
          quantity,
        },
      })

      Alert.alert('Success', `Marked ${quantity} bottle(s) as consumed.`)
      setQuantity(1)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to consume wine:', error)
      Alert.alert('Error', error.message || 'Failed to mark wine as consumed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setQuantity(1)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mark as Consumed</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Wine Info Card */}
        <View style={styles.content}>
          <LinearGradient
            colors={['#fef9f5', '#f8f4f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wineCard}
          >
            <View style={styles.wineCardContent}>
              <View
                style={[
                  styles.bottleIcon,
                  { backgroundColor: getWineColor(wineColor) },
                ]}
              >
                <Icon name="bottle-wine" size={32} color="#fff" />
              </View>

              <View style={styles.wineInfo}>
                <Text style={styles.wineName}>{wineName}</Text>
                <View style={styles.wineMetaRow}>
                  <Text style={styles.wineVintage}>
                    {vintage || 'NV'}
                  </Text>
                  <Text style={styles.wineDivider}>•</Text>
                  <Text style={styles.wineRegion}>{region}</Text>
                </View>
                <Text style={styles.wineStock}>
                  {stock} bottle{stock !== 1 ? 's' : ''} in cellar
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Quantity Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>QUANTITY</Text>
            <View style={styles.quantityPicker}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Icon name="minus" size={24} color={quantity <= 1 ? '#ccc' : '#722F37'} />
              </TouchableOpacity>

              <Text style={styles.quantityValue}>{quantity}</Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity >= stock && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= stock}
              >
                <Icon name="plus" size={24} color={quantity >= stock ? '#ccc' : '#722F37'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#722F37', '#944654']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Mark as Consumed</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.15)',
    backgroundColor: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  wineCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.2)',
  },
  wineCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  wineInfo: {
    flex: 1,
  },
  wineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  wineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  wineVintage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  wineDivider: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 8,
  },
  wineRegion: {
    fontSize: 14,
    color: '#666',
  },
  wineStock: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4caf50',
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#999',
    marginBottom: 12,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 32,
  },
  quantityButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8f4f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#722F37',
    minWidth: 80,
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
})
