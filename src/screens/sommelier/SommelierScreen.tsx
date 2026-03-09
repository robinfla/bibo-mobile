import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { apiFetch } from '../../api/client'

interface WineSuggestion {
  wineId: number
  name: string
  region: string
  pairingNote: string
  imageUrl?: string | null
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  text: string
  suggestions?: WineSuggestion[]
  timestamp: Date
}

export const SommelierScreen = ({ route }: any) => {
  const navigation = useNavigation()
  const scrollViewRef = useRef<ScrollView>(null)
  const conversationId = route?.params?.conversationId
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      text: "Hello! I'm your wine sommelier. Tell me what you're eating or craving, and I'll suggest the perfect wine from your cellar.",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputHeight, setInputHeight] = useState(44)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId)

  useEffect(() => {
    // Fetch conversation history if conversationId exists
    if (conversationId) {
      fetchConversationHistory(conversationId)
    }
  }, [conversationId])

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [messages])

  const fetchConversationHistory = async (convId: string) => {
    try {
      const data = await apiFetch<{ messages: Array<{ role: string; content: string; timestamp: string }> }>(
        `/api/chat/${convId}`
      )
      
      if (data.messages && data.messages.length > 0) {
        const formattedMessages: Message[] = data.messages.map((msg, idx) => ({
          id: `${idx}`,
          type: msg.role === 'user' ? 'user' : 'assistant',
          text: msg.content,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Failed to fetch conversation history:', error)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setInputHeight(44)
    setIsLoading(true)

    try {
      const response = await apiFetch<{
        conversationId?: string
        message: string
        suggestions: WineSuggestion[]
      }>('/api/chat/sommelier', {
        method: 'POST',
        body: {
          prompt: userMessage.text,
          conversationId: currentConversationId,
        },
      })

      // Store conversation ID if this is a new conversation
      if (response.conversationId && !currentConversationId) {
        setCurrentConversationId(response.conversationId)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: response.message,
        suggestions: response.suggestions,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Sommelier request failed:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleWinePress = (wineId: number) => {
    // @ts-ignore - navigation typing
    navigation.navigate('WineDetail', { wineId })
  }

  const renderMessage = (message: Message, index: number) => {
    if (message.type === 'assistant') {
      return (
        <View
          key={message.id}
          style={[styles.messageContainer, styles.assistantContainer]}
        >
          <View style={styles.assistantBubble}>
            <Text style={styles.assistantText}>{message.text}</Text>

            {message.suggestions && message.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {message.suggestions.map((wine) => (
                  <TouchableOpacity
                    key={wine.wineId}
                    style={styles.wineCard}
                    onPress={() => handleWinePress(wine.wineId)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#fef9f5', '#f8f4f0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.wineCardGradient}
                    >
                      <View style={styles.wineImageContainer}>
                        {wine.imageUrl ? (
                          <Image
                            source={{ uri: wine.imageUrl }}
                            style={styles.wineImage}
                          />
                        ) : (
                          <View style={styles.wineImagePlaceholder}>
                            <Icon name="bottle-wine" size={28} color="#999" />
                          </View>
                        )}
                      </View>

                      <View style={styles.wineInfo}>
                        <Text style={styles.wineName} numberOfLines={2}>
                          {wine.name}
                        </Text>
                        <Text style={styles.wineRegion} numberOfLines={1}>
                          {wine.region}
                        </Text>
                        <Text style={styles.pairingNote} numberOfLines={2}>
                          {wine.pairingNote}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )
    }

    return (
      <View
        key={message.id}
        style={[styles.messageContainer, styles.userContainer]}
      >
        <LinearGradient
          colors={['#722F37', '#944654']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text style={styles.userText}>{message.text}</Text>
        </LinearGradient>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#722F37', '#944654']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sommelierIcon}
          >
            <Text style={styles.sommelierEmoji}>🎩</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Sommelier Assistant</Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Chat Container */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <LinearGradient
          colors={['#fef9f5', '#f8f4f0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chatContainer}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => renderMessage(message, index))}
            {isLoading && (
              <View style={[styles.messageContainer, styles.assistantContainer]}>
                <View style={styles.assistantBubble}>
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { height: Math.max(44, inputHeight) }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="What are you eating or craving?"
              placeholderTextColor="#999"
              multiline
              onContentSizeChange={(e) =>
                setInputHeight(Math.min(100, e.nativeEvent.contentSize.height))
              }
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />

            <TouchableOpacity
              style={[
                styles.sendButtonContainer,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#722F37', '#944654']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButton}
              >
                <Icon name="arrow-up" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.15)',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sommelierIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sommelierEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    gap: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 14,
    paddingHorizontal: 18,
    maxWidth: '80%',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1a1a1a',
  },
  userBubble: {
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 14,
    paddingHorizontal: 18,
    maxWidth: '80%',
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
  },
  typingText: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  wineCard: {
    marginTop: 8,
  },
  wineCardGradient: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.15)',
  },
  wineImageContainer: {
    width: 56,
    height: 70,
    marginRight: 12,
  },
  wineImage: {
    width: 56,
    height: 70,
    borderRadius: 10,
  },
  wineImagePlaceholder: {
    width: 56,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wineInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  wineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  wineRegion: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  pairingNote: {
    fontSize: 13,
    fontWeight: '500',
    color: '#722F37',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 213, 203, 0.15)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  sendButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
