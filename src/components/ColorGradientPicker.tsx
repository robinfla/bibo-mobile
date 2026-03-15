import React from 'react'
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface ColorGradientPickerProps {
  value: number // 0-100
  onChange: (value: number, colorName: string) => void
}

const COLOR_STOPS = [
  '#fef9c3', // Pale Yellow
  '#fef9c3', // Pale Yellow (0-14%)
  '#fde047', // Lemon Yellow (14-28%)
  '#fbbf24', // Gold (28-42%)
  '#f59e0b', // Amber (42-57%)
  '#ea580c', // Copper (57-71%)
  '#dc2626', // Ruby (71-85%)
  '#7f1d1d', // Garnet (85-100%)
]

const getColorName = (position: number): string => {
  if (position < 14) return 'Pale Yellow'
  if (position < 28) return 'Lemon Yellow'
  if (position < 42) return 'Gold'
  if (position < 57) return 'Amber'
  if (position < 71) return 'Copper'
  if (position < 85) return 'Ruby'
  return 'Garnet'
}

export const ColorGradientPicker: React.FC<ColorGradientPickerProps> = ({
  value,
  onChange,
}) => {
  const [containerWidth, setContainerWidth] = React.useState(0)
  const pan = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (containerWidth > 0) {
      const position = (value / 100) * containerWidth
      pan.setValue(position)
    }
  }, [value, containerWidth])

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const locationX = evt.nativeEvent.locationX
        updatePosition(locationX)
      },
      onPanResponderMove: (evt) => {
        const locationX = evt.nativeEvent.locationX
        updatePosition(locationX)
      },
    })
  ).current

  const updatePosition = (x: number) => {
    if (containerWidth === 0) return

    const clampedX = Math.max(0, Math.min(x, containerWidth))
    const percentage = (clampedX / containerWidth) * 100

    pan.setValue(clampedX)
    onChange(percentage, getColorName(percentage))
  }

  const selectedColor = getColorName(value)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Color</Text>
      <Text style={styles.colorName}>{selectedColor}</Text>
      <View
        style={styles.gradientContainer}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={COLOR_STOPS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
        <Animated.View
          style={[
            styles.selector,
            {
              left: pan.interpolate({
                inputRange: [0, containerWidth || 1],
                outputRange: [0, containerWidth || 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  colorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#722F37',
    marginBottom: 12,
  },
  gradientContainer: {
    height: 48,
    position: 'relative',
  },
  gradient: {
    height: '100%',
    borderRadius: 24,
  },
  selector: {
    position: 'absolute',
    top: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#722F37',
    marginLeft: -18, // Center the selector
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})
