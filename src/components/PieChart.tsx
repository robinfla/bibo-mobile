import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, G } from 'react-native-svg'
import { colors } from '../theme/colors'

interface PieSlice {
  label: string
  value: number
  color: string
}

interface PieChartProps {
  title: string
  data: PieSlice[]
  size?: number
}

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => ({
  x: cx + r * Math.cos(angle),
  y: cy + r * Math.sin(angle),
})

const createArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

export const PieChart = ({ title, data, size = 180 }: PieChartProps) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4
  let currentAngle = -Math.PI / 2 // Start from top

  const slices = data.filter(d => d.value > 0).map((slice) => {
    const sliceAngle = (slice.value / total) * Math.PI * 2
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    currentAngle = endAngle
    return { ...slice, path: createArc(cx, cy, r, startAngle, endAngle) }
  })

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartRow}>
        <Svg width={size} height={size}>
          <G>
            {slices.map((slice, i) => (
              <Path key={i} d={slice.path} fill={slice.color} />
            ))}
          </G>
        </Svg>
        <View style={styles.legend}>
          {data.filter(d => d.value > 0).map((slice, i) => {
            const pct = Math.round((slice.value / total) * 100)
            return (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {slice.label}
                </Text>
                <Text style={styles.legendValue}>{slice.value} ({pct}%)</Text>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted[200],
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
    marginBottom: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.muted[700],
    fontWeight: '500',
    flex: 1,
  },
  legendValue: {
    fontSize: 12,
    color: colors.muted[500],
    fontWeight: '600',
  },
})
