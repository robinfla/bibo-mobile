import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const GUIDE_WIDTH = 300
const GUIDE_HEIGHT = 400

type ScanMode = 'bottle' | 'wine-menu'

export const WineScanCameraScreen = () => {
  const navigation = useNavigation()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [cameraType, setCameraType] = useState<CameraType>('back')
  const [flash, setFlash] = useState(false)
  const [mode, setMode] = useState<ScanMode>('bottle')

  if (!permission) {
    return <View style={styles.container} />
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-off" size={64} color="#722F37" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Bibo needs camera access to scan wine labels
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
      })

      if (!photo) return

      // Navigate to loading screen with photo
      // @ts-ignore - navigation typing
      navigation.navigate('WineScanLoading', {
        imageUri: photo.uri,
        imageBase64: photo.base64,
        mode,
      })
    } catch (error) {
      console.error('Failed to capture photo:', error)
      Alert.alert('Capture Error', 'Failed to take photo. Please try again.')
    }
  }

  const handleGalleryPick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        'Photo Library Permission',
        'Bibo needs photo library access. Please enable it in Settings.'
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
      base64: true,
    })

    if (!result.canceled && result.assets[0]) {
      // Navigate to loading screen with photo
      // @ts-ignore - navigation typing
      navigation.navigate('WineScanLoading', {
        imageUri: result.assets[0].uri,
        imageBase64: result.assets[0].base64,
        mode,
      })
    }
  }

  const toggleFlash = () => {
    setFlash(!flash)
  }

  const flipCamera = () => {
    setCameraType((current) => (current === 'back' ? 'front' : 'back'))
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={cameraType}
        enableTorch={flash}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topControls}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
              <Icon
                name={flash ? 'flash' : 'flash-off'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={flipCamera}>
              <Icon name="camera-flip" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Tabs */}
        <View style={styles.modeTabsContainer}>
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'bottle' && styles.modeTabActive]}
              onPress={() => setMode('bottle')}
            >
              <Text
                style={[styles.modeTabText, mode === 'bottle' && styles.modeTabTextActive]}
              >
                Bottle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'wine-menu' && styles.modeTabActive]}
              onPress={() => setMode('wine-menu')}
            >
              <Text
                style={[
                  styles.modeTabText,
                  mode === 'wine-menu' && styles.modeTabTextActive,
                ]}
              >
                Wine Menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dim Overlay */}
        <View style={styles.dimOverlay} pointerEvents="none" />

        {/* Guide Frame */}
        <View style={styles.guideFrameContainer} pointerEvents="none">
          <View style={styles.guideFrame}>
            {/* Corner Markers */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Scan front or back of label{' '}
            <Text style={styles.instructionsLink}>Learn more.</Text>
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleGalleryPick}
            activeOpacity={0.8}
          >
            <Icon name="image" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.spacer} />
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef9f5',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#722F37',
    marginTop: 24,
    marginBottom: 12,
    fontFamily: 'Nunito_700Bold',
  },
  permissionText: {
    fontSize: 16,
    color: '#8a7568',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Nunito_400Regular',
  },
  permissionButton: {
    backgroundColor: '#722F37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topControls: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabsContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 4,
    gap: 12,
  },
  modeTab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  modeTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modeTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Nunito_600SemiBold',
  },
  modeTabTextActive: {
    color: '#722F37',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  guideFrameContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - GUIDE_HEIGHT / 2,
    left: SCREEN_WIDTH / 2 - GUIDE_WIDTH / 2,
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
  },
  guideFrame: {
    flex: 1,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#fff',
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    fontFamily: 'Nunito_500',
  },
  instructionsLink: {
    textDecorationLine: 'underline',
  },
  bottomControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  spacer: {
    width: 56,
  },
})
