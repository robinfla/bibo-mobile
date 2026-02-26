import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

interface AgingTimelineProps {
  drinkFrom: number
  drinkUntil: number
  currentYear: number
}

export const AgingTimeline: React.FC<AgingTimelineProps> = ({
  drinkFrom,
  drinkUntil,
  currentYear,
}) => {
  const windowLength = drinkUntil - drinkFrom
  const thirdLength = Math.max(1, Math.round(windowLength / 3))
  
  const peakStart = drinkFrom + thirdLength
  const peakEnd = drinkFrom + thirdLength * 2
  
  // Calculate position percentage (0-100)
  const getPosition = () => {
    if (currentYear < drinkFrom) return 0
    if (currentYear > drinkUntil) return 100
    return ((currentYear - drinkFrom) / windowLength) * 100
  }
  
  const position = getPosition()
  
  return (
    <View style={styles.container}>
      {/* Timeline track */}
      <View style={styles.track}>
        {/* Youth (blue) */}
        <View style={[styles.segment, styles.youth, { flex: 1 }]} />
        {/* Maturity (orange) */}
        <View style={[styles.segment, styles.maturity, { flex: 1 }]} />
        {/* Peak (green) */}
        <View style={[styles.segment, styles.peak, { flex: 1 }]} />
        {/* Decline (pink) */}
        <View style={[styles.segment, styles.decline, { flex: 1 }]} />
      </View>
      
      {/* Current position marker */}
      <View style={[styles.marker, { left: `${position}%` }]}>
        <View style={styles.markerDot} />
      </View>
      
      {/* Labels */}
      <View style={styles.labels}>
        <View style={styles.label}>
          <Text style={styles.labelYear}>{drinkFrom}</Text>
          <Text style={styles.labelText}>Youth</Text>
        </View>
        <View style={styles.label}>
          <Text style={styles.labelYear}>{peakStart}</Text>
          <Text style={styles.labelText}>Maturity</Text>
        </View>
        <View style={styles.label}>
          <Text style={styles.labelYear}>{peakEnd}</Text>
          <Text style={styles.labelText}>Peak</Text>
        </View>
        <View style={styles.label}>
          <Text style={styles.labelYear}>{drinkUntil}</Text>
          <Text style={styles.labelText}>Decline</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  track: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 24,
  },
  segment: {
    height: '100%',
  },
  youth: {
    backgroundColor: '#3b82f6', // Blue
  },
  maturity: {
    backgroundColor: '#f59e0b', // Orange
  },
  peak: {
    backgroundColor: '#10b981', // Green
  },
  decline: {
    backgroundColor: '#ec4899', // Pink
  },
  marker: {
    position: 'absolute',
    top: 16,
    marginLeft: -8,
    width: 16,
    height: 16,
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    alignItems: 'center',
  },
  labelYear: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 12,
    color: colors.muted[500],
  },
})
