import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { colors } from '../theme/colors'

interface WineMenuDropdownProps {
  onEditDetails: () => void
  onShare: () => void
  onRemove: () => void
}

export const WineMenuDropdown: React.FC<WineMenuDropdownProps> = ({
  onEditDetails,
  onShare,
  onRemove,
}) => {
  const [menuVisible, setMenuVisible] = useState(false)

  const handleMenuPress = (action: () => void) => {
    setMenuVisible(false)
    setTimeout(() => action(), 100)
  }

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.7}
      >
        <Icon name="dots-horizontal" size={24} color="#1f2937" />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuCard}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(onEditDetails)}
                  activeOpacity={0.7}
                >
                  <Icon name="pencil" size={20} color="#722F37" />
                  <Text style={styles.menuItemText}>Edit Details</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(onShare)}
                  activeOpacity={0.7}
                >
                  <Icon name="share-variant" size={20} color="#722F37" />
                  <Text style={styles.menuItemText}>Share Wine</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(onRemove)}
                  activeOpacity={0.7}
                >
                  <Icon name="delete" size={20} color="#d32f2f" />
                  <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                    Remove from Cellar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.muted[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingRight: 16,
    alignItems: 'flex-end',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  menuItemDanger: {
    color: '#d32f2f',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.muted[100],
    marginHorizontal: 12,
  },
})
