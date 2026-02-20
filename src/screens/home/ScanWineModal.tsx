import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
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
  const [step, setStep] = useState<'choose' | 'preview' | 'scanning' | 'results'>('choose')
  const [cameraLaunched, setCameraLaunched] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null)
  const [scanResults, setScanResults] = useState<ScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [prefillData, setPrefillData] = useState<ParsedWine | null>(null)

  // Consume flow state
  const [isConsuming, setIsConsuming] = useState(false)
  const [consumeError, setConsumeError] = useState<string | null>(null)

  const resetModal = useCallback(() => {
    setStep('choose')
    setSelectedImage(null)
    setSelectedImageBase64(null)
    setScanResults(null)
    setError(null)
    setShowAddModal(false)
    setPrefillData(null)
    setIsConsuming(false)
    setConsumeError(null)
  }, [])

  const handleClose = useCallback(() => {
    resetModal()
    setCameraLaunched(false)
    onClose()
  }, [resetModal, onClose])

  // Auto-launch camera when modal opens
  useEffect(() => {
    if (visible && !cameraLaunched) {
      setCameraLaunched(true)
      takePhotoAuto()
    }
  }, [visible])

  const takePhotoAuto = async () => {
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
      } else {
        // User cancelled camera — close modal
        handleClose()
      }
    } catch {
      // Camera failed — fall back to choose screen
      setStep('choose')
    }
  }

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

  const consumeWine = async (match: WineMatch, quantity: number = 1) => {
    setIsConsuming(true)
    setConsumeError(null)

    try {
      // First get inventory for this wine to find available lots
      const inventory = await apiFetch<{ lots: InventoryLot[] }>('/api/inventory', {
        query: { search: `${match.producer.name} ${match.wine.name}`, inStock: 'true' },
      })

      const availableLots = inventory.lots.filter(lot => lot.wineId === match.wine.id && lot.quantity > 0)
      
      if (availableLots.length === 0) {
        setConsumeError('No bottles available for this wine')
        setIsConsuming(false)
        return
      }

      // Use the first available lot
      const lot = availableLots[0]
      const consumeQty = Math.min(quantity, lot.quantity)

      const payload: ConsumePayload = { quantity: consumeQty }

      await apiFetch(`/api/inventory/${lot.id}/consume`, {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      })

      Alert.alert('Success', `Opened ${consumeQty} bottle(s) of ${match.wine.name}`)
      onSuccess()
      handleClose()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to open bottle'
      setConsumeError(msg)
    } finally {
      setIsConsuming(false)
    }
  }

  const addAsNewWine = () => {
    if (scanResults?.parsed) {
      setPrefillData(scanResults.parsed)
      setShowAddModal(true)
    }
  }

  const renderChooseStep = () => {
    // If camera hasn't returned yet, render nothing (avoid flash)
    if (cameraLaunched) return null

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.modalTitle}>Scan Wine Label</Text>
        <Text style={styles.subtitle}>Choose how to add your wine photo</Text>

        <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
          <View style={[styles.optionIcon, { backgroundColor: colors.primary[100] }]}>
            <Text style={styles.optionEmoji}>📷</Text>
          </View>
          <Text style={styles.optionLabel}>Take a Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={chooseFromLibrary}>
          <View style={[styles.optionIcon, { backgroundColor: colors.secondary?.[100] ?? '#dcfce7' }]}>
            <Text style={styles.optionEmoji}>📱</Text>
          </View>
          <Text style={styles.optionLabel}>Choose from Library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }

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
                    onPress={() => consumeWine(match)}
                    disabled={isConsuming}
                  >
                    {isConsuming ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.consumeButtonText}>Open this bottle</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {consumeError && (
                  <Text style={styles.errorText}>{consumeError}</Text>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addNewButton} onPress={addAsNewWine}>
              <Text style={styles.addNewButtonText}>Add as new wine</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Wine not found in your cellar</Text>
            <TouchableOpacity style={styles.addToCellarButton} onPress={addAsNewWine}>
              <Text style={styles.addToCellarButtonText}>Add to cellar</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  return (
    <>
      <Modal visible={visible} transparent animationType={step === 'choose' && cameraLaunched ? 'none' : 'slide'}>
        <View style={[styles.modalOverlay, step === 'choose' && cameraLaunched && { backgroundColor: 'transparent' }]}>
          {!(step === 'choose' && cameraLaunched) && (
            <View style={styles.modalContent}>
              {step === 'choose' && renderChooseStep()}
              {step === 'preview' && renderPreviewStep()}
              {step === 'scanning' && renderScanningStep()}
              {step === 'results' && renderResultsStep()}
            </View>
          )}
        </View>
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
})

export default ScanWineModal