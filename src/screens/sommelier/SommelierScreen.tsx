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
import { SommelierSidebar } from '../../components/SommelierSidebar'

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

const SUGGESTION_PROMPTS = [
  { emoji: '🍽️', text: 'Suggest wine for my meal' },
  { emoji: '🏛️', text: 'Explore my cellar' },
  { emoji: '🌍', text: 'Teach me about Bordeaux' },
  { emoji: '💰', text: 'Find a red under $30' },
  { emoji: '📚', text: 'Learn about regions' },
  { emoji: '🍇', text: 'Grape varieties guide' },
]

export const SommelierScreen = ({ route }: any) => {
  const navigation = useNavigation()
  const scrollViewRef = useRef<ScrollView>(null)
  const conversationId = route?.params?.conversationId
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputHeight, setInputHeight] = useState(44)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId)
  const [showSidebar, setShowSidebar] = useState(false)

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

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setInputHeight(44)
    setIsLoading(true)

    // Create placeholder message for streaming effect
    const assistantMessageId = (Date.now() + 1).toString()
    const placeholderMessage: Message = {
      id: assistantMessageId,
      type: 'assistant',
      text: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, placeholderMessage])

    try {
      const response = await apiFetch<{
        conversationId?: string
        message: string
        suggestions: WineSuggestion[]
      }>('/api/chat/sommelier', {
        method: 'POST',
        body: {
          message: userMessage.text,
          conversationId: currentConversationId,
        },
      })

      // Store conversation ID if this is a new conversation
      if (response.conversationId && !currentConversationId) {
        setCurrentConversationId(response.conversationId)
      }

      // Stream the response word by word
      const words = response.message.split(' ')
      let currentText = ''
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i]
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, text: currentText, suggestions: i === words.length - 1 ? response.suggestions : undefined }
              : msg
          )
        )
        
        // Wait between words (faster for short words, slower for long ones)
        const delay = Math.min(50, 20 + words[i].length * 3)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error('Sommelier request failed:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, text: "I'm sorry, I couldn't process that request. Please try again." }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionPress = (suggestion: typeof SUGGESTION_PROMPTS[0]) => {
    handleSend(suggestion.text)
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🍷</Text>
      <Text style={styles.emptyTitle}>What are we up to today?</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowSidebar(true)}
          activeOpacity={0.7}
        >
          <Icon name="menu" size={24} color="#2c1810" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Bibo Sommelier</Text>
        
        <View style={styles.menuButton} />
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
            {messages.length === 0 ? renderEmptyState() : messages.map((message, index) => renderMessage(message, index))}
            {isLoading && (
              <View style={[styles.messageContainer, styles.assistantContainer]}>
                <View style={styles.assistantBubble}>
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Suggestion Carousel (only show when no messages) */}
          {messages.length === 0 && (
            <View style={styles.carouselContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
              >
                {SUGGESTION_PROMPTS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionPress(suggestion)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
                    <Text style={styles.suggestionText}>{suggestion.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input Container */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { height: Math.max(44, inputHeight) }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about wine"
              placeholderTextColor="#999"
              multiline
              onContentSizeChange={(e) =>
                setInputHeight(Math.min(100, e.nativeEvent.contentSize.height))
              }
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />

            <TouchableOpacity
              style={[
                styles.sendButtonContainer,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#722F37', '#944654']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButton}
              >
                <Icon name="send" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Sidebar */}
      <SommelierSidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        onConversationSelect={(conversationId) => {
          setCurrentConversationId(conversationId)
          fetchConversationHistory(conversationId)
        }}
        onNewChat={() => {
          setMessages([])
          setCurrentConversationId(undefined)
        }}
        onProfilePress={async () => {
          try {
            const data = await apiFetch<{ profile: any; onboardingCompleted: boolean }>('/api/profile/taste')
            
            if (!data.profile || !data.onboardingCompleted) {
              // No profile exists, show empty state with options
              // @ts-ignore - Navigation typing
              navigation.navigate('TasteProfileEmpty')
            } else {
              // Profile exists, go to summary
              // @ts-ignore - Navigation typing
              navigation.navigate('TasteProfile')
            }
          } catch (error) {
            // On error (404 or other), assume no profile, show empty state
            // @ts-ignore - Navigation typing
            navigation.navigate('TasteProfileEmpty')
          }
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 213, 203, 0.3)',
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c1810',
    fontFamily: 'Nunito_700Bold',
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
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#722F37',
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
  },
  messageContainer: {
    marginBottom: 12,
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    padding: 14,
    maxWidth: '85%',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2c1810',
    fontFamily: 'Nunito_400Regular',
  },
  userBubble: {
    borderRadius: 18,
    padding: 14,
    maxWidth: '85%',
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
    fontFamily: 'Nunito_400Regular',
  },
  typingText: {
    fontSize: 15,
    color: '#8a7568',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 10,
  },
  wineCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  wineCardGradient: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  wineImageContainer: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  wineImage: {
    width: '100%',
    height: '100%',
  },
  wineImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  wineInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  wineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c1810',
    marginBottom: 4,
    fontFamily: 'Nunito_700Bold',
  },
  wineRegion: {
    fontSize: 12,
    color: '#8a7568',
    marginBottom: 6,
    fontFamily: 'Nunito_400Regular',
  },
  pairingNote: {
    fontSize: 12,
    color: '#722F37',
    fontStyle: 'italic',
    fontFamily: 'Nunito_400Regular',
  },
  carouselContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 213, 203, 0.3)',
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionEmoji: {
    fontSize: 18,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c1810',
    fontFamily: 'Nunito_600SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 213, 203, 0.3)',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2c1810',
    maxHeight: 100,
    fontFamily: 'Nunito_400Regular',
  },
  sendButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
