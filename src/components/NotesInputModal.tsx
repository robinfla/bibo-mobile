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
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface NotesInputModalProps {
  visible: boolean
  wineName: string
  currentNotes?: string
  onSave: (notes: string) => void
  onClose: () => void
}

const TASTING_PROMPTS = [
  'How does it taste?',
  'What aromas do you notice?',
  'How does it pair with food?',
  'Would you buy it again?',
  'Any special occasion?',
]

export const NotesInputModal: React.FC<NotesInputModalProps> = ({
  visible,
  wineName,
  currentNotes = '',
  onSave,
  onClose,
}) => {
  const [notes, setNotes] = useState(currentNotes)
  const [charCount, setCharCount] = useState(currentNotes.length)

  useEffect(() => {
    setNotes(currentNotes)
    setCharCount(currentNotes.length)
  }, [currentNotes, visible])

  const handleTextChange = (text: string) => {
    setNotes(text)
    setCharCount(text.length)
  }

  const handleSave = () => {
    onSave(notes.trim())
    onClose()
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
            <Text style={styles.headerTitle}>Tasting Notes</Text>
            <View style={styles.closeButton} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Wine Name */}
            <Text style={styles.wineName} numberOfLines={2}>
              {wineName}
            </Text>

            {/* Notes Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={notes}
                onChangeText={handleTextChange}
                placeholder="Share your thoughts about this wine..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.charCounter}>
                <Text style={styles.charCounterText}>
                  {charCount} characters
                </Text>
              </View>
            </View>

            {/* Tasting Prompts */}
            <View style={styles.promptsSection}>
              <Text style={styles.promptsLabel}>Need inspiration?</Text>
              <View style={styles.promptsGrid}>
                {TASTING_PROMPTS.map((prompt) => (
                  <View
                    key={prompt}
                    style={styles.promptChip}
                  >
                    <Text style={styles.promptChipText}>{prompt}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoEmoji}>💡</Text>
              <Text style={styles.infoText}>
                Your notes help you remember what you loved (or didn't!) about this wine.
              </Text>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <LinearGradient
                colors={['#722F37', '#944654']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {currentNotes ? 'Update Notes' : 'Save Notes'}
                </Text>
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
    maxHeight: '90%',
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  wineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    marginBottom: 24,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    minHeight: 150,
    fontSize: 16,
    color: '#1a1a1a',
    padding: 16,
    lineHeight: 24,
  },
  charCounter: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  charCounterText: {
    fontSize: 12,
    color: '#999',
  },
  promptsSection: {
    marginBottom: 24,
  },
  promptsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  promptChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  promptChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 243, 224, 0.5)',
    borderLeftWidth: 3,
    borderLeftColor: '#f9a825',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
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
