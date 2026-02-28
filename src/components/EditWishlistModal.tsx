import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

type Priority = 'must_have' | 'nice_to_have' | 'someday'

interface EditWishlistModalProps {
  visible: boolean
  wineName: string
  vintage?: number
  region?: string
  currentPriority: Priority
  currentBudget?: number
  currentNotes?: string
  onSave: (data: { priority: Priority; budget?: number; notes?: string }) => void
  onDelete: () => void
  onClose: () => void
}

const PRIORITIES = [
  { id: 'must_have' as Priority, emoji: '🔥', label: 'Must Have' },
  { id: 'nice_to_have' as Priority, emoji: '⭐', label: 'Nice' },
  { id: 'someday' as Priority, emoji: '💭', label: 'Someday' },
]

export const EditWishlistModal: React.FC<EditWishlistModalProps> = ({
  visible,
  wineName,
  vintage,
  region,
  currentPriority,
  currentBudget,
  currentNotes = '',
  onSave,
  onDelete,
  onClose,
}) => {
  const [priority, setPriority] = useState<Priority>(currentPriority)
  const [budget, setBudget] = useState(currentBudget ? String(currentBudget) : '')
  const [notes, setNotes] = useState(currentNotes)

  useEffect(() => {
    setPriority(currentPriority)
    setBudget(currentBudget ? String(currentBudget) : '')
    setNotes(currentNotes)
  }, [currentPriority, currentBudget, currentNotes, visible])

  const handleSave = () => {
    const budgetNum = budget ? parseFloat(budget) : undefined
    onSave({
      priority,
      budget: budgetNum,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  const handleDelete = () => {
    Alert.alert(
      'Remove from Wishlist?',
      `Are you sure you want to remove "${wineName}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onDelete()
            onClose()
          },
        },
      ]
    )
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Wishlist</Text>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Wine Info */}
            <View style={styles.wineInfo}>
              <Text style={styles.wineName} numberOfLines={2}>
                {wineName}
              </Text>
              {(vintage || region) && (
                <Text style={styles.wineMeta}>
                  {vintage ? `${vintage}` : ''}{vintage && region ? ' • ' : ''}{region || ''}
                </Text>
              )}
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={styles.label}>How much do you want it?</Text>
              <View style={styles.priorityChips}>
                {PRIORITIES.map((p) => {
                  const isActive = priority === p.id

                  return isActive ? (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setPriority(p.id)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#f9a825', '#fbc02d']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.priorityChipActive}
                      >
                        <Text style={styles.priorityChipEmojiActive}>{p.emoji}</Text>
                        <Text style={styles.priorityChipTextActive}>{p.label}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.priorityChip}
                      onPress={() => setPriority(p.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.priorityChipEmoji}>{p.emoji}</Text>
                      <Text style={styles.priorityChipText}>{p.label}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Budget */}
            <View style={styles.section}>
              <Text style={styles.label}>Budget (optional)</Text>
              <TextInput
                style={styles.input}
                value={budget}
                onChangeText={setBudget}
                placeholder="€0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Why do you want this wine?"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#722F37', '#944654']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
    maxHeight: '85%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  wineInfo: {
    marginBottom: 32,
    alignItems: 'center',
  },
  wineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 6,
  },
  wineMeta: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  priorityChips: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  priorityChipActive: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#f9a825',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  priorityChipEmoji: {
    fontSize: 28,
  },
  priorityChipEmojiActive: {
    fontSize: 28,
  },
  priorityChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  priorityChipTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 213, 203, 0.15)',
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
