import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native'
import { apiFetch, ApiError } from '../../api/client'
import { colors } from '../../theme/colors'
import type { ChatMessage, PairingResponse } from '../../types/api'

interface PairingChatModalProps {
  visible: boolean
  onClose: () => void
}

const PairingChatModal = ({ visible, onClose }: PairingChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your sommelier assistant. Tell me what you're eating or craving, and I'll suggest the perfect wine from your cellar! 🍷",
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (visible) {
      // Reset messages when modal opens
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm your sommelier assistant. Tell me what you're eating or craving, and I'll suggest the perfect wine from your cellar! 🍷",
        },
      ])
      setInputText('')
      setIsTyping(false)
    }
  }, [visible])

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return

    const userMessage: ChatMessage = { role: 'user', content: inputText.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputText('')
    setIsTyping(true)

    // Scroll to bottom after user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      const response = await apiFetch<PairingResponse>('/api/chat/pairing', {
        method: 'POST',
        body: {
          message: userMessage.content,
          history: messages, // Send previous history, not including the current user message
        },
      })

      const assistantMessage: ChatMessage = { role: 'assistant', content: response.reply }
      setMessages([...newMessages, assistantMessage])

      // Scroll to bottom after assistant response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to get response'
      Alert.alert('Error', msg)
    } finally {
      setIsTyping(false)
    }
  }

  const TypingIndicator = () => {
    const [dotOpacity, setDotOpacity] = useState([0.4, 0.6, 0.8])
    
    useEffect(() => {
      const interval = setInterval(() => {
        setDotOpacity((prev) => [prev[2], prev[0], prev[1]])
      }, 500)
      return () => clearInterval(interval)
    }, [])

    return (
      <View style={styles.assistantMessageContainer}>
        <View style={styles.assistantBubble}>
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, { opacity: dotOpacity[0] }]} />
            <View style={[styles.typingDot, { opacity: dotOpacity[1] }]} />
            <View style={[styles.typingDot, { opacity: dotOpacity[2] }]} />
          </View>
        </View>
      </View>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Wine Pairing Assistant</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message, index) => (
              <View
                key={index}
                style={
                  message.role === 'user'
                    ? styles.userMessageContainer
                    : styles.assistantMessageContainer
                }
              >
                <View
                  style={
                    message.role === 'user'
                      ? styles.userBubble
                      : styles.assistantBubble
                  }
                >
                  <Text
                    style={
                      message.role === 'user'
                        ? styles.userBubbleText
                        : styles.assistantBubbleText
                    }
                  >
                    {message.content}
                  </Text>
                </View>
              </View>
            ))}

            {isTyping && <TypingIndicator />}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="What are you eating or craving?"
              placeholderTextColor={colors.muted[400]}
              multiline
              maxLength={500}
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
  },
  closeButton: {
    fontSize: 20,
    color: colors.muted[400],
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: colors.primary[600],
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  assistantBubble: {
    backgroundColor: colors.muted[100],
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  userBubbleText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  assistantBubbleText: {
    color: colors.muted[900],
    fontSize: 15,
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted[400],
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.muted[200],
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.muted[900],
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    minHeight: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
})

export default PairingChatModal