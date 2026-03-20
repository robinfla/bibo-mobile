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
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const SCREEN_HEIGHT = Dimensions.get('window').height

interface WineScanActionsSheetProps {
  visible: boolean
  onClose: () => void
  wine: {
    id: number
    name: string
    vintage: number | null
  }
}

export const WineScanActionsSheet: React.FC<WineScanActionsSheetProps> = ({
  visible,
  onClose,
  wine,
}) => {
  const navigation = useNavigation()
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

  const handleQuickReview = () => {
    onClose()
    // @ts-ignore - navigation typing
    navigation.navigate('QuickTastingReview', { wine })
  }

  const handleComprehensiveReview = () => {
    onClose()
    // @ts-ignore - navigation typing
    navigation.navigate('ComprehensiveTastingReview', { wine })
  }

  const handleAddToWishlist = () => {
    onClose()
    // @ts-ignore - navigation typing
    navigation.navigate('AddToWishlist', { wine })
  }

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
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>What would you like to do?</Text>
              <Text style={styles.subtitle}>
                {wine.name} {wine.vintage ? wine.vintage : ''}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleQuickReview}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#722F37', '#944654']}
                  style={styles.actionIcon}
                >
                  <Text style={styles.actionIconEmoji}>⭐</Text>
                </LinearGradient>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Quick Tasting Review</Text>
                  <Text style={styles.actionDescription}>Rate + quick notes (2 min)</Text>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(45, 45, 45, 0.3)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleComprehensiveReview}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#722F37', '#944654']}
                  style={styles.actionIcon}
                >
                  <Text style={styles.actionIconEmoji}>📝</Text>
                </LinearGradient>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Comprehensive Tasting Review</Text>
                  <Text style={styles.actionDescription}>Full tasting notes + pairing</Text>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(45, 45, 45, 0.3)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleAddToWishlist}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#722F37', '#944654']}
                  style={styles.actionIcon}
                >
                  <Text style={styles.actionIconEmoji}>❤️</Text>
                </LinearGradient>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Add to Wishlist</Text>
                  <Text style={styles.actionDescription}>Save for future purchase</Text>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(45, 45, 45, 0.3)" />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(45, 45, 45, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#722F37',
    marginBottom: 6,
    fontFamily: 'NunitoSans_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(45, 45, 45, 0.6)',
    fontFamily: 'NunitoSans_400Regular',
  },
  actions: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 47, 55, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 20,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconEmoji: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c1810',
    marginBottom: 2,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  actionDescription: {
    fontSize: 13,
    color: '#8a7568',
    fontFamily: 'NunitoSans_400Regular',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.4)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#722F37',
    textAlign: 'center',
    fontFamily: 'NunitoSans_600SemiBold',
  },
})
