import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { colors } from '../theme/colors'

const SCREEN_HEIGHT = Dimensions.get('window').height

interface PhotoPickerSheetProps {
  visible: boolean
  onClose: () => void
  onTakePhoto: () => void
  onChooseFromGallery: () => void
  onScanLabel: () => void
}

export const PhotoPickerSheet: React.FC<PhotoPickerSheetProps> = ({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromGallery,
  onScanLabel,
}) => {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  if (!visible) return null

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Send Photo</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={20} color={colors.coral} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View style={styles.options}>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onClose()
                  onTakePhoto()
                }}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📸</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Take Photo</Text>
                  <Text style={styles.optionSubtitle}>
                    Scan label or snap a picture
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(45, 45, 45, 0.3)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onClose()
                  onChooseFromGallery()
                }}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>🖼️</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Choose from Gallery</Text>
                  <Text style={styles.optionSubtitle}>Pick existing photo</Text>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(45, 45, 45, 0.3)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onClose()
                  onScanLabel()
                }}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>🍷</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Scan Wine Label</Text>
                  <Text style={styles.optionSubtitle}>Quick add to cellar</Text>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(45, 45, 45, 0.3)" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.linen,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.coral,
    fontFamily: 'NunitoSans_700Bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    padding: 16,
    paddingHorizontal: 20,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  optionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'NunitoSans_400Regular',
  },
})
