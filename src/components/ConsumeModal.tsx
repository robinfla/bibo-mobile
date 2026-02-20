import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { apiFetch, ApiError } from '../api/client'
import { colors } from '../theme/colors'
import type { InventoryLot, ConsumePayload } from '../types/api'

interface ConsumeModalProps {
  visible: boolean
  lot: InventoryLot | null
  onClose: () => void
  onConsumed: () => void
}

const WINE_COLORS: Record<string, string> = {
  red: '#ef4444',
  white: '#fcd34d',
  rose: '#f472b6',
  sparkling: '#facc15',
  dessert: '#fb923c',
  fortified: '#a855f7',
}

const getWineColor = (color: string): string =>
  WINE_COLORS[color.toLowerCase()] ?? colors.muted[400]

export const ConsumeModal = ({ visible, lot, onClose, onConsumed }: ConsumeModalProps) => {
  const [qty, setQty] = useState(1)
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')
  const [pairing, setPairing] = useState('')
  const [isConsuming, setIsConsuming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetState = useCallback(() => {
    setQty(1)
    setScore('')
    setComment('')
    setPairing('')
    setError(null)
    setIsConsuming(false)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  const handleConsume = useCallback(async () => {
    if (!lot) return
    setIsConsuming(true)
    setError(null)

    const payload: ConsumePayload = { quantity: qty }
    const scoreNum = parseInt(score, 10)
    if (comment.trim() || pairing.trim() || (!isNaN(scoreNum) && scoreNum >= 0)) {
      payload.tastingNote = {
        score: !isNaN(scoreNum) ? scoreNum : 0,
        comment: comment.trim(),
        pairing: pairing.trim(),
      }
    }

    try {
      await apiFetch(`/api/inventory/${lot.id}/consume`, {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      })
      resetState()
      onConsumed()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to consume bottle'
      setError(msg)
    } finally {
      setIsConsuming(false)
    }
  }, [lot, qty, score, comment, pairing, resetState, onConsumed])

  if (!lot) return null

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Consume Bottle</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <View style={styles.wineInfo}>
              <View style={[styles.colorDot, { backgroundColor: getWineColor(lot.wineColor) }]} />
              <View style={styles.wineText}>
                <Text style={styles.wineName}>{lot.wineName}</Text>
                <Text style={styles.wineMeta}>
                  {lot.producerName} · {lot.vintage ?? 'NV'}
                </Text>
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>Quantity ({lot.quantity} available)</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setQty((q) => Math.min(lot.quantity, q + 1))}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Score (0-100, optional)</Text>
            <TextInput
              style={styles.input}
              value={score}
              onChangeText={setScore}
              placeholder="e.g. 88"
              placeholderTextColor={colors.muted[400]}
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.fieldLabel}>Tasting Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comment}
              onChangeText={setComment}
              placeholder="Describe the wine..."
              placeholderTextColor={colors.muted[400]}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Food Pairing (optional)</Text>
            <TextInput
              style={styles.input}
              value={pairing}
              onChangeText={setPairing}
              placeholder="What did you pair it with?"
              placeholderTextColor={colors.muted[400]}
            />

            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isConsuming}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, isConsuming && styles.buttonDisabled]}
                onPress={handleConsume}
                disabled={isConsuming}
              >
                {isConsuming ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[600],
  },
  body: {
    padding: 20,
  },
  wineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.muted[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  wineText: {
    flex: 1,
  },
  wineName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
  },
  wineMeta: {
    fontSize: 14,
    color: colors.muted[500],
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[700],
    marginBottom: 6,
    marginTop: 12,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muted[50],
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.muted[700],
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
    minWidth: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.muted[900],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.muted[700],
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})
