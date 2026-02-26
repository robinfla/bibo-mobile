import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { apiFetch, ApiError } from '../../api/client'
import { colors } from '../../theme/colors'
import type { InventoryLot, ConsumePayload, MaturityInfo } from '../../types/api'

type InventoryStackParamList = {
  InventoryList: undefined
  InventoryDetail: { lot: InventoryLot }
}

type Props = NativeStackScreenProps<InventoryStackParamList, 'InventoryDetail'>

const WINE_COLORS: Record<string, string> = {
  red: '#ef4444',
  white: '#fcd34d',
  rose: '#f472b6',
  rosé: '#f472b6',
  sparkling: '#facc15',
  dessert: '#fb923c',
  fortified: '#a855f7',
}

const getWineColor = (color: string): string =>
  WINE_COLORS[color.toLowerCase()] ?? colors.muted[400]

const MATURITY_COLORS: Record<string, { bg: string; text: string }> = {
  peak: { bg: '#dcfce7', text: '#15803d' },
  ready: { bg: '#dcfce7', text: '#15803d' },
  approaching: { bg: '#fef3c7', text: '#b45309' },
  declining: { bg: '#fef3c7', text: '#b45309' },
  to_age: { bg: '#dbeafe', text: '#1d4ed8' },
  past_prime: { bg: '#fef3c7', text: '#92400e' },
  past: { bg: '#fef2f2', text: '#dc2626' },
  unknown: { bg: '#f3f4f6', text: '#6b7280' },
}

const getMaturityStyle = (status: MaturityInfo['status']) =>
  MATURITY_COLORS[status] ?? MATURITY_COLORS.unknown

const MATURITY_LABELS: Record<string, string> = {
  peak: 'Peak',
  ready: 'Ready to Drink',
  approaching: 'Approaching',
  declining: 'Declining',
  to_age: 'To Age',
  past_prime: 'Past Prime',
  past: 'Past Prime',
  unknown: 'Unknown',
}

const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

export const InventoryDetailScreen = ({ route, navigation }: Props) => {
  const { lot } = route.params

  const [showModal, setShowModal] = useState(false)
  const [consumeQty, setConsumeQty] = useState(1)
  const [consumeScore, setConsumeScore] = useState('')
  const [consumeComment, setConsumeComment] = useState('')
  const [consumePairing, setConsumePairing] = useState('')
  const [isConsuming, setIsConsuming] = useState(false)
  const [consumeError, setConsumeError] = useState<string | null>(null)

  const openModal = useCallback(() => {
    setConsumeQty(1)
    setConsumeScore('')
    setConsumeComment('')
    setConsumePairing('')
    setConsumeError(null)
    setShowModal(true)
  }, [])

  const handleConsume = useCallback(async () => {
    setIsConsuming(true)
    setConsumeError(null)

    const payload: ConsumePayload = { quantity: consumeQty }
    const scoreNum = parseInt(consumeScore, 10)
    if (consumeComment.trim() || consumePairing.trim() || (!isNaN(scoreNum) && scoreNum >= 0)) {
      payload.tastingNote = {
        score: !isNaN(scoreNum) ? scoreNum : 0,
        comment: consumeComment.trim(),
        pairing: consumePairing.trim(),
      }
    }

    try {
      await apiFetch(`/api/inventory/${lot.id}/consume`, {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      })
      setShowModal(false)
      navigation.goBack()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to consume bottle'
      setConsumeError(msg)
    } finally {
      setIsConsuming(false)
    }
  }, [lot.id, consumeQty, consumeScore, consumeComment, consumePairing, navigation])

  const maturityStyle = lot.maturity ? getMaturityStyle(lot.maturity.status) : null

  const drinkingWindow = lot.maturity?.drinkFrom || lot.maturity?.drinkUntil
    ? [
        lot.maturity.drinkFrom ? String(lot.maturity.drinkFrom) : '?',
        lot.maturity.drinkUntil ? String(lot.maturity.drinkUntil) : '?',
      ].join(' – ')
    : null

  const priceDisplay = lot.purchasePricePerBottle
    ? `${parseFloat(lot.purchasePricePerBottle).toFixed(2)} €`
    : null

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={[styles.colorDot, { backgroundColor: getWineColor(lot.wineColor) }]} />
            <View style={styles.headerText}>
              <Text style={styles.wineName}>{lot.wineName}</Text>
              <Text style={styles.producerName}>{lot.producerName}</Text>
            </View>
          </View>

          {lot.maturity && maturityStyle && (
            <View style={[styles.maturityBadge, { backgroundColor: maturityStyle.bg }]}>
              <Text style={[styles.maturityText, { color: maturityStyle.text }]}>
                {MATURITY_LABELS[lot.maturity.status] ?? lot.maturity.status}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <DetailRow label="Vintage" value={lot.vintage ? String(lot.vintage) : 'NV'} />
          <DetailRow
            label="Region"
            value={[lot.regionName, lot.appellationName].filter(Boolean).join(' · ') || null}
          />
          <DetailRow label="Cellar" value={lot.cellarName} />
          <DetailRow label="Quantity" value={`${lot.quantity} bottle${lot.quantity !== 1 ? 's' : ''}`} />
          <DetailRow label="Format" value={lot.formatName} />
          <DetailRow label="Purchase Date" value={lot.purchaseDate} />
          <DetailRow label="Purchase Price" value={priceDisplay} />
          {drinkingWindow && (
            <DetailRow label="Drinking Window" value={drinkingWindow} />
          )}
        </View>

        {lot.maturity?.message && (
          <View style={styles.maturityCard}>
            <Text style={styles.sectionTitle}>Maturity</Text>
            <Text style={styles.maturityMessage}>{lot.maturity.message}</Text>
          </View>
        )}
      </ScrollView>

      {lot.quantity > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.consumeButton} onPress={openModal} activeOpacity={0.8}>
            <Text style={styles.consumeButtonText}>Consume a Bottle</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Consume Bottle</Text>

            <View style={styles.modalWineInfo}>
              <View style={[styles.colorDot, { backgroundColor: getWineColor(lot.wineColor) }]} />
              <View style={styles.modalWineText}>
                <Text style={styles.modalWineName}>{lot.wineName}</Text>
                <Text style={styles.modalWineMeta}>
                  {lot.producerName} · {lot.vintage ?? 'NV'}
                </Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Quantity ({lot.quantity} available)</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setConsumeQty((q) => Math.max(1, q - 1))}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{consumeQty}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setConsumeQty((q) => Math.min(lot.quantity, q + 1))}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Score (0-100, optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={consumeScore}
              onChangeText={setConsumeScore}
              placeholder="e.g. 88"
              placeholderTextColor={colors.muted[400]}
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.fieldLabel}>Tasting Notes (optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={consumeComment}
              onChangeText={setConsumeComment}
              placeholder="Describe the wine..."
              placeholderTextColor={colors.muted[400]}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Food Pairing (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={consumePairing}
              onChangeText={setConsumePairing}
              placeholder="What did you pair it with?"
              placeholderTextColor={colors.muted[400]}
            />

            {consumeError && (
              <Text style={styles.consumeErrorText}>{consumeError}</Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
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
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.muted[50],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  headerText: {
    flex: 1,
  },
  wineName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
  },
  producerName: {
    fontSize: 15,
    color: colors.muted[500],
    marginTop: 2,
  },
  maturityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 12,
  },
  maturityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[100],
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted[500],
  },
  detailValue: {
    fontSize: 14,
    color: colors.muted[900],
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  maturityCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  maturityMessage: {
    fontSize: 14,
    color: colors.muted[700],
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.muted[200],
    padding: 16,
    paddingBottom: 32,
  },
  consumeButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  consumeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 16,
  },
  modalWineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.muted[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[200],
  },
  modalWineText: {
    flex: 1,
  },
  modalWineName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
  },
  modalWineMeta: {
    fontSize: 14,
    color: colors.muted[500],
    marginTop: 2,
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
  modalInput: {
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
  consumeErrorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
