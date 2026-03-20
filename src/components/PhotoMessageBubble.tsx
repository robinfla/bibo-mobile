import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface PhotoMessageBubbleProps {
  imageUrl: string
  caption?: string
  timestamp?: string
  onPress?: () => void
}

export const PhotoMessageBubble: React.FC<PhotoMessageBubbleProps> = ({
  imageUrl,
  caption,
  timestamp,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#722F37', '#944654']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bubble}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={styles.touchable}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.caption}>{caption}</Text>
            </View>
          )}
        </TouchableOpacity>
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
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 4,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    maxHeight: 300,
    borderRadius: 16,
  },
  captionContainer: {
    padding: 12,
    paddingTop: 8,
  },
  caption: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'NunitoSans_400Regular',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(45, 45, 45, 0.5)',
    marginTop: 4,
    textAlign: 'right',
    fontFamily: 'NunitoSans_400Regular',
  },
})
