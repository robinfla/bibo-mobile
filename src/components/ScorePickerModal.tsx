import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Line } from 'react-native-svg'

interface ScorePickerModalProps {
  visible: boolean
  wineName: string
  currentScore?: number
  onSave: (score: number) => void
  onClose: () => void
}

const CIRCLE_SIZE = 280
const CIRCLE_RADIUS = CIRCLE_SIZE / 2
const TRACK_WIDTH = 8
const HANDLE_SIZE = 48

export const ScorePickerModal: React.FC<ScorePickerModalProps> = ({
  visible,
  wineName,
  currentScore = 85,
  onSave,
  onClose,
}) => {
  const [score, setScore] = useState(currentScore)
  const circleCenter = { x: CIRCLE_RADIUS, y: CIRCLE_RADIUS }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent
        updateScoreFromPosition(locationX, locationY)
      },
      onPanResponderRelease: () => {},
    })
  ).current

  const updateScoreFromPosition = (x: number, y: number) => {
    const dx = x - circleCenter.x
    const dy = y - circleCenter.y
    let angle = Math.atan2(dy, dx)
    
    // Normalize angle to 0-360 degrees, starting from top (270 degrees offset)
    angle = angle + Math.PI / 2
    if (angle < 0) angle += 2 * Math.PI
    
    // Convert angle to score (0-100)
    const newScore = Math.round((angle / (2 * Math.PI)) * 100)
    setScore(Math.max(0, Math.min(100, newScore)))
  }

  const getHandlePosition = () => {
    // Convert score to angle (0 at top, clockwise)
    const angle = (score / 100) * 2 * Math.PI - Math.PI / 2
    const radius = CIRCLE_RADIUS - TRACK_WIDTH / 2
    
    return {
      x: circleCenter.x + radius * Math.cos(angle) - HANDLE_SIZE / 2,
      y: circleCenter.y + radius * Math.sin(angle) - HANDLE_SIZE / 2,
    }
  }

  const handleSave = () => {
    onSave(score)
    onClose()
  }

  const handlePosition = getHandlePosition()

  // Generate tick marks around the circle
  const renderTickMarks = () => {
    const ticks = []
    const numTicks = 20 // Show 20 tick marks (every 5 points)
    
    for (let i = 0; i < numTicks; i++) {
      const angle = (i / numTicks) * 2 * Math.PI - Math.PI / 2
      const innerRadius = CIRCLE_RADIUS - TRACK_WIDTH - 8
      const outerRadius = CIRCLE_RADIUS - TRACK_WIDTH
      
      const x1 = circleCenter.x + innerRadius * Math.cos(angle)
      const y1 = circleCenter.y + innerRadius * Math.sin(angle)
      const x2 = circleCenter.x + outerRadius * Math.cos(angle)
      const y2 = circleCenter.y + outerRadius * Math.sin(angle)
      
      ticks.push(
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#ddd"
          strokeWidth="2"
        />
      )
    }
    
    return ticks
  }

  // Calculate the arc progress for visual feedback
  const getArcAngle = () => {
    return (score / 100) * 360
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rate Wine</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Wine Name */}
          <Text style={styles.wineName} numberOfLines={2}>
            {wineName}
          </Text>

          {/* Circular Slider */}
          <View style={styles.circleContainer} {...panResponder.panHandlers}>
            {/* SVG for track and tick marks */}
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
              {/* Background track */}
              <Circle
                cx={CIRCLE_RADIUS}
                cy={CIRCLE_RADIUS}
                r={CIRCLE_RADIUS - TRACK_WIDTH / 2}
                stroke="#e0e0e0"
                strokeWidth={TRACK_WIDTH}
                fill="none"
              />
              
              {/* Progress arc */}
              <Circle
                cx={CIRCLE_RADIUS}
                cy={CIRCLE_RADIUS}
                r={CIRCLE_RADIUS - TRACK_WIDTH / 2}
                stroke="#722F37"
                strokeWidth={TRACK_WIDTH}
                fill="none"
                strokeDasharray={`${(score / 100) * (2 * Math.PI * (CIRCLE_RADIUS - TRACK_WIDTH / 2))} ${2 * Math.PI * (CIRCLE_RADIUS - TRACK_WIDTH / 2)}`}
                strokeDashoffset={Math.PI * (CIRCLE_RADIUS - TRACK_WIDTH / 2) / 2}
                strokeLinecap="round"
              />
              
              {/* Tick marks */}
              {renderTickMarks()}
            </Svg>

            {/* Center score display */}
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreLabel}>out of 100</Text>
              <Text style={styles.instructionText}>Drag the star to rate</Text>
            </View>

            {/* Draggable handle */}
            <View
              style={[
                styles.handle,
                {
                  left: handlePosition.x,
                  top: handlePosition.y,
                },
              ]}
            >
              <LinearGradient
                colors={['#722F37', '#944654']}
                style={styles.handleGradient}
              >
                <Text style={styles.handleStar}>⭐</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={['#722F37', '#944654']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Save Rating</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fef9f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
    minHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  wineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignSelf: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scoreDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: '700',
    color: '#722F37',
    lineHeight: 80,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    overflow: 'hidden',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  handleGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#fff',
  },
  handleStar: {
    fontSize: 24,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})
