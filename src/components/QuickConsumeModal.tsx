import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { X, Wine, XCircle, ArrowsLeftRight } from 'phosphor-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { apiFetch } from '../api/client'
import { colors } from '../theme/colors'

interface CellarSpace {
  id: number
  name: string
  type: string
}

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
  cellarId: number
  currentSpaceId: number
}

const getWineColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: colors.wine.red,
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
  cellarId,
  currentSpaceId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [spaces, setSpaces] = useState<CellarSpace[]>([])
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false)

  useEffect(() => {
    if (visible) {
      loadSpaces()
    }
  }, [visible])

  const loadSpaces = async () => {
    setIsLoadingSpaces(true)
    try {
      const result = await apiFetch<{ cellarId: number; unplacedCount: number; spaces: CellarSpace[] }>(`/api/cellars/${cellarId}/spaces`)
      // Filter out current space - only show other spaces
      setSpaces((result?.spaces || []).filter(space => space.id !== currentSpaceId))
    } catch (error) {
      console.error('Failed to load spaces:', error)
      Alert.alert('Error', `Failed to load spaces: ${error}`)
    } finally {
      setIsLoadingSpaces(false)
    }
  }

  const handleRemove = () => {
    Alert.alert(
      'Remove Bottle',
      'What would you like to do?',
      [
        {
          text: 'Mark as Consumed',
          onPress: handleConsume,
        },
        {
          text: 'Remove from Cellar',
          onPress: handleRemoveFromCellar,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    )
  }

  const handleConsume = async () => {
    setIsSubmitting(true)
    try {
      await apiFetch('/api/history/consume', {
        method: 'POST',
        body: {
          inventoryLotId,
          quantity: 1,
        },
      })

      Alert.alert('Success', 'Marked 1 bottle as consumed.')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to consume wine:', error)
      Alert.alert('Error', error.message || 'Failed to mark wine as consumed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFromCellar = async () => {
    setIsSubmitting(true)
    try {
      await apiFetch('/api/inventory/unassign', {
        method: 'POST',
        body: {
          lotId: inventoryLotId,
          quantity: 1,
        },
      })

      Alert.alert('Success', 'Removed 1 bottle from cellar location.')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to remove from cellar:', error)
      Alert.alert('Error', error.message || 'Failed to remove from cellar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTransfer = async (targetSpaceId: number, targetSpaceName: string) => {
    setIsSubmitting(true)
    try {
      await apiFetch(`/api/inventory/${inventoryLotId}/transfer-space`, {
        method: 'POST',
        body: {
          targetSpaceId,
          quantity: 1,
        },
      })

      Alert.alert('Success', `Transferred 1 bottle to ${targetSpaceName}.`)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to transfer wine:', error)
      Alert.alert('Error', error.message || 'Failed to transfer wine.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const showTransferOptions = () => {
    if (spaces.length === 0) {
      Alert.alert('No Other Spaces', 'No other storage spaces available in this cellar.')
      return
    }

    Alert.alert(
      'Transfer to Storage',
      'Select destination:',
      [
        ...spaces.map(space => ({
          text: space.name,
          onPress: () => handleTransfer(space.id, space.name),
        })),
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    )
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity 
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} weight="bold" color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Remove Bottle</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Wine Info Card */}
          <View style={styles.content}>
          <LinearGradient
            colors={[colors.linen, '#f8f4f0']}
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
                <Wine size={28} weight="fill" color={colors.textInverse} />
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

        {/* Action Buttons */}
        <SafeAreaView edges={['bottom']}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]}
              onPress={handleRemove}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.coral, colors.coralDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <XCircle size={20} weight="regular" color={colors.textInverse} />
                    <Text style={styles.actionButtonText}>Remove{'\n'}Bottle</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]}
              onPress={showTransferOptions}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4caf50', '#2e7d32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <ArrowsLeftRight size={20} weight="regular" color={colors.textInverse} />
                    <Text style={styles.actionButtonText}>Transfer to{'\n'}Another Storage</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: colors.linen,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.15)',
    backgroundColor: colors.surface,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: 16,
  },
  wineCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.2)',
  },
  wineCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  wineInfo: {
    flex: 1,
  },
  wineName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  wineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  wineVintage: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  wineDivider: {
    fontSize: 13,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  wineRegion: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  wineStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4caf50',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionGradient: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textInverse,
    textAlign: 'center',
    lineHeight: 16,
  },
})
