import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'

interface WineActionFABProps {
  onConsume: () => void
  onAddTastingNote: () => void
}

export const WineActionFAB: React.FC<WineActionFABProps> = ({
  onConsume,
  onAddTastingNote,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [rotation] = useState(new Animated.Value(0))
  const [scale1] = useState(new Animated.Value(0))
  const [scale2] = useState(new Animated.Value(0))

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1

    Animated.parallel([
      Animated.spring(rotation, {
        toValue,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(scale1, {
        toValue,
        useNativeDriver: true,
        delay: toValue ? 50 : 0,
        friction: 8,
      }),
      Animated.spring(scale2, {
        toValue,
        useNativeDriver: true,
        delay: toValue ? 100 : 0,
        friction: 8,
      }),
    ]).start()

    setExpanded(!expanded)
  }

  const handleActionPress = (action: () => void) => {
    toggleExpand()
    setTimeout(() => action(), 300)
  }

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  return (
    <>
      {/* Backdrop */}
      {expanded && (
        <TouchableWithoutFeedback onPress={toggleExpand}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.container}>
        {/* Secondary Actions */}
        <Animated.View
          style={[
            styles.secondaryButton,
            {
              transform: [{ scale: scale2 }, { translateY: -12 }],
              opacity: scale2,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => handleActionPress(onConsume)}
            activeOpacity={0.8}
          >
            <View style={styles.label}>
              <Text style={styles.labelText}>Consume Wine</Text>
            </View>
            <View style={styles.secondaryFAB}>
              <Icon name="glass-wine" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.secondaryButton,
            {
              transform: [{ scale: scale1 }, { translateY: -12 }],
              opacity: scale1,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => handleActionPress(onAddTastingNote)}
            activeOpacity={0.8}
          >
            <View style={styles.label}>
              <Text style={styles.labelText}>Add Tasting Note</Text>
            </View>
            <View style={styles.secondaryFAB}>
              <Icon name="note-edit" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity
          style={styles.mainFAB}
          onPress={toggleExpand}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <Icon name="plus" size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  mainFAB: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#722F37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryButton: {
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  labelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryFAB: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#944654',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
})
