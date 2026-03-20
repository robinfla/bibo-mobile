import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
const WineGlassIcon = ({ fillLevel }: { fillLevel: Animated.Value }) => {
  return (
    <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 60, opacity: 0.8 }}>🍷</Text>
    </View>
  )
}

export const WineScanLoadingScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { imageUri, imageBase64, mode } = route.params as {
    imageUri: string
    imageBase64?: string
    mode: 'bottle' | 'wine-menu'
  }

  const [dotsCount, setDotsCount] = useState(0)

  // Animation refs
  const fillLevel = useRef(new Animated.Value(0)).current
  const corner1Opacity = useRef(new Animated.Value(0.4)).current
  const corner2Opacity = useRef(new Animated.Value(0.4)).current
  const corner3Opacity = useRef(new Animated.Value(0.4)).current
  const corner4Opacity = useRef(new Animated.Value(0.4)).current
  const scanLineY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Wine glass fill animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fillLevel, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(fillLevel, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Corner pulse animations (staggered)
    const pulseAnimation = (opacityValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )
    }

    pulseAnimation(corner1Opacity, 0).start()
    pulseAnimation(corner2Opacity, 250).start()
    pulseAnimation(corner3Opacity, 500).start()
    pulseAnimation(corner4Opacity, 750).start()

    // Scanning line animation
    Animated.loop(
      Animated.timing(scanLineY, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start()

    // Dots animation
    const dotsInterval = setInterval(() => {
      setDotsCount((prev) => (prev + 1) % 4)
    }, 500)

    return () => clearInterval(dotsInterval)
  }, [])

  useEffect(() => {
    // Trigger scan
    performScan()
  }, [])

  const performScan = async () => {
    try {
      if (!imageBase64) {
        throw new Error('No image data')
      }

      const response = await apiFetch<{
        parsed: {
          producer: string
          wineName: string
          vintage: number | null
          color: string
          region: string | null
          appellation: string | null
        }
        matches: Array<{
          wine: any
          producer: any
          region: any
          score: number
        }>
        suggestions: any[]
        enrichment: any
      }>('/api/wines/scan', {
        method: 'POST',
        body: {
          image: `data:image/jpeg;base64,${imageBase64}`,
        },
      })

      // Navigate to wine detail with scan result
      // For now, show best match or enrichment
      const bestMatch = response.matches[0] || response.enrichment

      if (bestMatch) {
        // Navigate to wine detail screen
        // @ts-ignore - navigation typing
        navigation.replace('WineScanResult', {
          wine: bestMatch,
          scanData: response.parsed,
          mode,
        })
      } else {
        // No matches found
        Alert.alert(
          'No Matches Found',
          'Could not find this wine in the database. Would you like to try again or add it manually?',
          [
            { text: 'Try Again', onPress: () => navigation.goBack() },
            {
              text: 'Manual Entry',
              onPress: () => {
                // TODO: Navigate to manual wine entry
                navigation.goBack()
              },
            },
          ]
        )
      }
    } catch (error) {
      console.error('Scan failed:', error)
      Alert.alert(
        'Scan Failed',
        'Failed to scan wine label. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    }
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  const dots = '.'.repeat(dotsCount)

  return (
    <View style={styles.container}>
      {/* Cancel button */}
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      {/* Captured image with scanning overlay */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        {/* Golden corner markers */}
        <Animated.View
          style={[styles.corner, styles.cornerTopLeft, { opacity: corner1Opacity }]}
        />
        <Animated.View
          style={[styles.corner, styles.cornerTopRight, { opacity: corner2Opacity }]}
        />
        <Animated.View
          style={[styles.corner, styles.cornerBottomLeft, { opacity: corner3Opacity }]}
        />
        <Animated.View
          style={[styles.corner, styles.cornerBottomRight, { opacity: corner4Opacity }]}
        />

        {/* Scanning line */}
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [
                {
                  translateY: scanLineY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 380],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Wine glass fill animation */}
      <View style={styles.iconContainer}>
        <WineGlassIcon fillLevel={fillLevel} />
      </View>

      {/* Loading text */}
      <Text style={styles.loadingText}>Searching database{dots}</Text>
      <Text style={styles.subText}>Matching label with wine database</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textInverse,
    fontFamily: 'NunitoSans_400Regular',
  },
  imageContainer: {
    width: 280,
    height: 380,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.honey,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 16,
    left: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 16,
    right: 16,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 16,
    left: 16,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 16,
    right: 16,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.honey,
    opacity: 0.8,
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textInverse,
    marginBottom: 8,
    fontFamily: 'NunitoSans_500Medium',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'NunitoSans_400Regular',
  },
})
