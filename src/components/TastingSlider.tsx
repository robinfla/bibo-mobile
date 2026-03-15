import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Slider from '@react-native-community/slider'

interface TastingSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  startLabel: string
  endLabel: string
  step?: number
}

export const TastingSlider: React.FC<TastingSliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  startLabel,
  endLabel,
  step = 1,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={value}
          onValueChange={onChange}
          minimumValue={min}
          maximumValue={max}
          step={step}
          minimumTrackTintColor="#722F37"
          maximumTrackTintColor="#E4D5CB"
          thumbTintColor="#722F37"
        />
      </View>
      <View style={styles.labelsRow}>
        <Text style={styles.rangeLabel}>{startLabel}</Text>
        <Text style={styles.rangeLabel}>{endLabel}</Text>
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
    marginBottom: 8,
  },
  sliderContainer: {
    paddingHorizontal: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  rangeLabel: {
    fontSize: 12,
    color: 'rgba(45, 45, 45, 0.5)',
  },
})
