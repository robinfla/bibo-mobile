import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { Audio } from 'expo-av'

interface VoiceMessageBubbleProps {
  audioUrl: string
  duration: number
  timestamp?: string
}

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
  audioUrl,
  duration,
  timestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlayback = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync()
          setIsPlaying(false)
        } else {
          await sound.playAsync()
          setIsPlaying(true)
        }
      } else {
        // Load and play
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        )
        setSound(newSound)
        setIsPlaying(true)

        // Set up playback status update
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false)
          }
        })
      }
    } catch (error) {
      console.error('Audio playback error:', error)
    }
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [sound])

  const waveHeights = [8, 14, 10, 18, 12, 16, 10, 14, 8, 12, 16, 10]

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#722F37', '#944654']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bubble}
      >
        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayback}
          activeOpacity={0.8}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color="#722F37"
          />
        </TouchableOpacity>

        <View style={styles.waveform}>
          {waveHeights.map((height, index) => (
            <View
              key={index}
              style={[styles.waveformBar, { height }]}
            />
          ))}
        </View>

        <Text style={styles.duration}>{formatDuration(duration)}</Text>
      </LinearGradient>

      {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    maxWidth: '75%',
    marginBottom: 12,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    gap: 12,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  waveformBar: {
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 1,
  },
  duration: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Nunito_400Regular',
    fontVariant: ['tabular-nums'],
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(45, 45, 45, 0.5)',
    marginTop: 4,
    textAlign: 'right',
    fontFamily: 'Nunito_400Regular',
  },
})
