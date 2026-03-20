import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { colors } from '../theme/colors'

interface VoiceRecordingBarProps {
  duration: number
  onCancel: () => void
  onSend: () => void
}

const WaveformBar: React.FC<{ height: number; delay: number }> = ({ height, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [])

  return (
    <Animated.View
      style={[
        styles.waveformBar,
        {
          height,
          transform: [{ scaleY: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[colors.coral, colors.coralDark]}
        style={styles.waveformGradient}
      />
    </Animated.View>
  )
}

export const VoiceRecordingBar: React.FC<VoiceRecordingBarProps> = ({
  duration,
  onCancel,
  onSend,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const waveHeights = [12, 20, 16, 24, 14, 18, 22, 16]
  const delays = waveHeights.map((_, i) => i * 100)

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Recording indicator */}
        <Animated.View
          style={[
            styles.recordingDot,
            {
              opacity: pulseAnim,
            },
          ]}
        />

        {/* Timer */}
        <Text style={styles.timer}>{formatDuration(duration)}</Text>

        {/* Waveform */}
        <View style={styles.waveform}>
          {waveHeights.map((height, index) => (
            <WaveformBar key={index} height={height} delay={delays[index]} />
          ))}
        </View>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Icon name="close" size={20} color="#ea0027" />
        </TouchableOpacity>

        {/* Send button */}
        <TouchableOpacity
          style={styles.sendButtonContainer}
          onPress={onSend}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.coral, colors.coralDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Icon name="arrow-up" size={18} color={colors.textInverse} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Hint text */}
      <Text style={styles.hint}>Tap ✕ to cancel • Tap ↑ to send</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.coral,
    borderRadius: 24,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ea0027',
  },
  timer: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.coral,
    fontFamily: 'NunitoSans_600SemiBold',
    fontVariant: ['tabular-nums'],
    minWidth: 40,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    paddingHorizontal: 8,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  waveformGradient: {
    flex: 1,
    width: '100%',
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 0, 39, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sendButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 13,
    color: 'rgba(45, 45, 45, 0.5)',
    textAlign: 'center',
    marginTop: 6,
    fontFamily: 'NunitoSans_400Regular',
  },
})
