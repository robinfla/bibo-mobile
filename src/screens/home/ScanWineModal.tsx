import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { apiFetch, ApiError } from '../../api/client'
import { colors } from '../../theme/colors'
import AddWineModal from './AddWineModal'
import type {
  ScanResponse,
  ParsedWine,
  WineMatch,
  InventoryLot,
  ConsumePayload,
} from '../../types/api'

interface ScanWineModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const WINE_COLORS: Record<string, string> = {
  red: colors.wine.red,
  white: colors.wine.white,
  rose: colors.wine.rose,
  rosé: colors.wine.rose,
  sparkling: colors.wine.sparkling,
  dessert: colors.wine.dessert,
  fortified: colors.wine.fortified,
}

const getWineColor = (color: string): string =>
  WINE_COLORS[color.toLowerCase()] ?? colors.muted[400]

export const ScanWineModal = ({ visible, onClose, onSuccess }: ScanWineModalProps) => {
  const [step, setStep] = useState<'choose' | 'preview' | 'scanning' | 'results' | 'manual-search' | 'manual-searching' | 'tasting'>('choose')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null)
  const [scanResults, setScanResults] = useState<ScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [prefillData, setPrefillData] = useState<ParsedWine | null>(null)

  // Consume flow state
  const [consumeMatch, setConsumeMatch] = useState<WineMatch | null>(null)
  const [consumeLot, setConsumeLot] = useState<InventoryLot | null>(null)
  const [consumeQty, setConsumeQty] = useState(1)
  const [consumeScore, setConsumeScore] = useState('')
  const [consumeComment, setConsumeComment] = useState('')
  const [consumePairing, setConsumePairing] = useState('')
  const [isConsuming, setIsConsuming] = useState(false)
  const [consumeError, setConsumeError] = useState<string | null>(null)
  const [isFindingLot, setIsFindingLot] = useState(false)

  // Manual search state
  const [manualSearchText, setManualSearchText] = useState('')
  const [manualSearchResults, setManualSearchResults] = useState<ScanResponse | null>(null)

  const resetModal = useCallback(() => {
    setStep('choose')
    setSelectedImage(null)
    setSelectedImageBase64(null)
    setScanResults(null)
    setError(null)
    setShowAddModal(false)
    setPrefillData(null)
    setConsumeMatch(null)
    setConsumeLot(null)
    setConsumeQty(1)
    setConsumeScore('')
    setConsumeComment('')
    setConsumePairing('')
    setIsConsuming(false)
    setConsumeError(null)
    setIsFindingLot(false)
    setManualSearchText('')
    setManualSearchResults(null)
  }, [])

  const handleClose = useCallback(() => {
    resetModal()
    onClose()
  }, [resetModal, onClose])

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is needed to take photos')
      return false
    }
    return true
  }

  const takePhoto = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      })

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri)
        setSelectedImageBase64(result.assets[0].base64 || null)
        setStep('preview')
        setError(null)
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to take photo')
    }
  }

  const chooseFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      })

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri)
        setSelectedImageBase64(result.assets[0].base64 || null)
        setStep('preview')
        setError(null)
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to select image')
    }
  }

  const scanImage = async () => {
    if (!selectedImageBase64) {
      setError('No image data available')
      return
    }

    setStep('scanning')
    setError(null)

    try {
      const scanResponse = await apiFetch<ScanResponse>('/api/wines/scan', {
        method: 'POST',
        body: { image: selectedImageBase64 },
      })

      setScanResults(scanResponse)
      setStep('results')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to scan wine label'
      setError(msg)
      setStep('preview')
    }
  }

  const startConsume = async (match: WineMatch) => {
    setIsFindingLot(true)
    setConsumeError(null)
    setConsumeMatch(match)

    try {
      const inventory = await apiFetch<{ lots: InventoryLot[] }>('/api/inventory', {
        query: { search: match.wine.name, inStock: 'true', limit: 50 },
      })

      const availableLots = inventory.lots.filter(lot => lot.wineId === match.wine.id && lot.quantity > 0)
      
      if (availableLots.length === 0) {
        setConsumeError('No bottles available for this wine')
        setIsFindingLot(false)
        return
      }

      setConsumeLot(availableLots[0])
      setConsumeQty(1)
      setConsumeScore('')
      setConsumeComment('')
      setConsumePairing('')
      setStep('tasting' as any)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to find bottle'
      setConsumeError(msg)
    } finally {
      setIsFindingLot(false)
    }
  }

  const confirmConsume = async () => {
    if (!consumeLot) return
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
      await apiFetch(`/api/inventory/${consumeLot.id}/consume`, {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      })
      onSuccess()
      handleClose()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to open bottle'
      setConsumeError(msg)
    } finally {
      setIsConsuming(false)
    }
  }

  const addAsNewWine = (parsed?: ParsedWine) => {
    const data = parsed || scanResults?.parsed || manualSearchResults?.parsed
    if (data) {
      setPrefillData(data)
      setShowAddModal(true)
    }
  }

  const handleManualSearch = async () => {
    if (!manualSearchText.trim()) return
    setStep('manual-searching')
    try {
      const results = await apiFetch<ScanResponse>('/api/wines/ai-search', {
        method: 'POST',
        body: { text: manualSearchText.trim() },
      })
      setManualSearchResults(results)
      setScanResults(results)
      setStep('results')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Search failed'
      Alert.alert('Error', msg)
      setStep('manual-search')
    }
  }

  const renderChooseStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.modalTitle}>Scan Wine Label</Text>
      <Text style={styles.subtitle}>Take a photo or upload from your library</Text>

      <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
        <View style={[styles.optionIcon, { backgroundColor: colors.primary[100] }]}>
          <Text style={styles.optionEmoji}>📷</Text>
        </View>
        <Text style={styles.optionLabel}>Take a Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={chooseFromLibrary}>
        <View style={[styles.optionIcon, { backgroundColor: colors.secondary?.[100] ?? '#dcfce7' }]}>
          <Text style={styles.optionEmoji}>🖼️</Text>
        </View>
        <Text style={styles.optionLabel}>Upload from Library</Text>
      </TouchableOpacity>
    </View>
  )

  const renderPreviewStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.modalTitle}>Preview</Text>
      
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => setStep('choose')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={scanImage}
        >
          <Text style={styles.primaryButtonText}>Scan Label</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderScanningStep = () => (
    <View style={[styles.stepContainer, styles.centered]}>
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text style={styles.loadingText}>Reading your wine label...</Text>
    </View>
  )

  const renderResultsStep = () => {
    if (!scanResults) return null

    const { parsed, matches } = scanResults
    const hasMatches = matches.length > 0

    return (
      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.modalTitle}>Scan Results</Text>

        {/* Parsed wine info card */}
        <View style={styles.parsedCard}>
          <View style={styles.parsedHeader}>
            <View style={[styles.colorDot, { backgroundColor: getWineColor(parsed.color) }]} />
            <View style={styles.parsedText}>
              <Text style={styles.parsedName}>{parsed.wineName}</Text>
              <Text style={styles.parsedMeta}>
                {parsed.producer} · {parsed.vintage ?? 'NV'} · {parsed.color}
              </Text>
              {parsed.region && (
                <Text style={styles.parsedRegion}>{parsed.region}</Text>
              )}
            </View>
          </View>
        </View>

        {hasMatches ? (
          <>
            <Text style={styles.sectionTitle}>Found in your cellar:</Text>
            {matches.slice(0, 3).map((match, index) => (
              <View key={`${match.wine.id}-${index}`} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <View style={[styles.colorDot, { backgroundColor: getWineColor(match.wine.color) }]} />
                  <View style={styles.matchText}>
                    <Text style={styles.matchName}>{match.wine.name}</Text>
                    <Text style={styles.matchMeta}>
                      {match.producer.name} · {match.wine.color}
                      {match.region && ` · ${match.region.name}`}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.matchActions}>
                  <TouchableOpacity 
                    style={styles.consumeButton}
                    onPress={() => startConsume(match)}
                    disabled={isFindingLot}
                  >
                    {isFindingLot && consumeMatch?.wine.id === match.wine.id ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.consumeButtonText}>Open this bottle</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {consumeError && consumeMatch?.wine.id === match.wine.id && (
                  <Text style={styles.errorText}>{consumeError}</Text>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addNewButton} onPress={() => addAsNewWine()}>
              <Text style={styles.addNewButtonText}>Add as new wine instead</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Wine not found in your cellar</Text>
            <TouchableOpacity style={styles.addToCellarButton} onPress={() => addAsNewWine()}>
              <Text style={styles.addToCellarButtonText}>Add to cellar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Manual search fallback */}
        <TouchableOpacity style={styles.manualSearchLink} onPress={() => setStep('manual-search')}>
          <Text style={styles.manualSearchLinkText}>Not your wine? Try manual search instead</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  const renderTastingStep = () => {
    if (!consumeLot || !consumeMatch) return null

    return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.modalTitle}>Tasting Notes</Text>

        <View style={styles.tastingWineInfo}>
          <View style={[styles.colorDot, { backgroundColor: getWineColor(consumeMatch.wine.color) }]} />
          <View style={styles.tastingWineText}>
            <Text style={styles.tastingWineName}>{consumeMatch.wine.name}</Text>
            <Text style={styles.tastingWineMeta}>
              {consumeMatch.producer.name} · {consumeLot.vintage ?? 'NV'}
            </Text>
          </View>
        </View>

        <Text style={styles.tastingLabel}>Quantity ({consumeLot.quantity} available)</Text>
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
            onPress={() => setConsumeQty((q) => Math.min(consumeLot.quantity, q + 1))}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.tastingLabel}>Score (0-100, optional)</Text>
        <TextInput
          style={styles.tastingInput}
          value={consumeScore}
          onChangeText={setConsumeScore}
          placeholder="e.g. 88"
          placeholderTextColor={colors.muted[400]}
          keyboardType="number-pad"
          maxLength={3}
        />

        <Text style={styles.tastingLabel}>Tasting Notes (optional)</Text>
        <TextInput
          style={[styles.tastingInput, styles.tastingTextArea]}
          value={consumeComment}
          onChangeText={setConsumeComment}
          placeholder="Describe the wine..."
          placeholderTextColor={colors.muted[400]}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.tastingLabel}>Food Pairing (optional)</Text>
        <TextInput
          style={styles.tastingInput}
          value={consumePairing}
          onChangeText={setConsumePairing}
          placeholder="What did you pair it with?"
          placeholderTextColor={colors.muted[400]}
        />

        {consumeError && (
          <Text style={styles.errorText}>{consumeError}</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setStep('results')}
            disabled={isConsuming}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, isConsuming && styles.buttonDisabled]}
            onPress={confirmConsume}
            disabled={isConsuming}
          >
            {isConsuming ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  const renderManualSearchStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.modalTitle}>Manual Search</Text>
      <Text style={styles.subtitle}>Describe your wine and we'll find it with AI</Text>

      <TextInput
        style={styles.manualSearchInput}
        value={manualSearchText}
        onChangeText={setManualSearchText}
        placeholder="e.g. Mullineux Old Vines White 2024"
        placeholderTextColor={colors.muted[400]}
        autoFocus
        onSubmitEditing={handleManualSearch}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('results')}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, !manualSearchText.trim() && styles.buttonDisabled]}
          onPress={handleManualSearch}
          disabled={!manualSearchText.trim()}
        >
          <Text style={styles.primaryButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.manualSearchLink} onPress={() => addAsNewWine(scanResults?.parsed || undefined)}>
        <Text style={styles.manualSearchLinkText}>Skip search — add wine manually</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseIcon} onPress={handleClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {step === 'choose' && renderChooseStep()}
            {step === 'preview' && renderPreviewStep()}
            {step === 'scanning' && renderScanningStep()}
            {step === 'results' && renderResultsStep()}
            {step === 'tasting' && renderTastingStep()}
            {step === 'manual-search' && renderManualSearchStep()}
            {step === 'manual-searching' && renderScanningStep()}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <AddWineModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false)
          onSuccess()
          handleClose()
        }}
        prefillData={prefillData}
      />
    </>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.muted[600],
    fontWeight: '600',
  },
  stepContainer: {
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    minHeight: 200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted[500],
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Choose step
  optionButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted[700],
  },
  
  // Preview step
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.muted[700],
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Scanning step
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.muted[600],
    textAlign: 'center',
  },
  
  // Results step
  resultsContainer: {
    maxHeight: '100%',
  },
  parsedCard: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  parsedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    marginTop: 4,
  },
  parsedText: {
    flex: 1,
  },
  parsedName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 2,
  },
  parsedMeta: {
    fontSize: 14,
    color: colors.muted[600],
    marginBottom: 4,
  },
  parsedRegion: {
    fontSize: 13,
    color: colors.muted[500],
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted[900],
    marginBottom: 12,
  },
  
  // Match cards
  matchCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchText: {
    flex: 1,
  },
  matchName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.muted[900],
    marginBottom: 2,
  },
  matchMeta: {
    fontSize: 13,
    color: colors.muted[500],
  },
  matchActions: {
    alignItems: 'flex-start',
  },
  consumeButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  consumeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Action buttons
  addNewButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  addNewButtonText: {
    color: colors.muted[700],
    fontSize: 14,
    fontWeight: '600',
  },
  
  addToCellarButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  addToCellarButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    color: colors.muted[600],
    fontSize: 16,
    fontWeight: '600',
  },
  
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  // Tasting notes
  tastingWineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted[50],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted[200],
    marginBottom: 20,
  },
  tastingWineText: {
    flex: 1,
  },
  tastingWineName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
  },
  tastingWineMeta: {
    fontSize: 14,
    color: colors.muted[500],
    marginTop: 2,
  },
  tastingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[700],
    marginBottom: 6,
    marginTop: 12,
  },
  tastingInput: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.muted[900],
  },
  tastingTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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

  manualSearchLink: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  manualSearchLinkText: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '600',
  },
  manualSearchInput: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.muted[900],
    width: '100%',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})

export default ScanWineModal