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
  Alert,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { List, Camera, Microphone, PaperPlaneTilt, Wine as WineIcon } from 'phosphor-react-native'
import { useNavigation } from '@react-navigation/native'
import { Audio } from 'expo-av'
import * as ImagePicker from 'expo-image-picker'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'
import { SommelierSidebar } from '../../components/SommelierSidebar'
import { VoiceRecordingBar } from '../../components/VoiceRecordingBar'
import { VoiceMessageBubble } from '../../components/VoiceMessageBubble'
import { PhotoMessageBubble } from '../../components/PhotoMessageBubble'
import { PhotoPickerSheet } from '../../components/PhotoPickerSheet'

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
  messageType?: 'text' | 'voice' | 'photo' | 'label_scan'
  text: string
  audioUrl?: string
  duration?: number
  imageUrl?: string
  caption?: string
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


const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -4, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start()
    }
    animate(dot1, 0)
    animate(dot2, 150)
    animate(dot3, 300)
  }, [])

  return (
    <View style={styles.typingDotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: dot }] }]} />
      ))}
    </View>
  )
}

const BiboAvatar = () => (
  <View style={styles.avatarCircle}>
    <WineIcon size={16} weight="regular" color={colors.coral} />
  </View>
)

export const SommelierScreen = ({ route }: any) => {
  const navigation = useNavigation()
  const scrollViewRef = useRef<ScrollView>(null)
  const textInputRef = useRef<TextInput>(null)
  const conversationId = route?.params?.conversationId

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputHeight, setInputHeight] = useState(44)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioRecording, setAudioRecording] = useState<Audio.Recording | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (conversationId) {
      fetchConversationHistory(conversationId)
    }
  }, [conversationId])

  useEffect(() => {
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

  // Voice recording functions
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync()
      if (!permission.granted) {
        Alert.alert(
          'Microphone Permission',
          'Bibo needs microphone access to record voice messages. Please enable it in Settings.',
          [{ text: 'OK' }]
        )
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )

      setAudioRecording(recording)
      setIsRecording(true)
      setRecordingDuration(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 60) {
            sendVoiceMessage()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      console.error('Failed to start recording:', error)
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.')
    }
  }

  const cancelRecording = async () => {
    if (audioRecording) {
      await audioRecording.stopAndUnloadAsync()
      setAudioRecording(null)
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    setIsRecording(false)
    setRecordingDuration(0)
  }

  const sendVoiceMessage = async () => {
    if (!audioRecording) return

    try {
      await audioRecording.stopAndUnloadAsync()
      const uri = audioRecording.getURI()

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }

      if (!uri) {
        throw new Error('No recording URI')
      }

      const formData = new FormData()
      formData.append('audio', {
        uri,
        name: 'voice-message.m4a',
        type: 'audio/m4a',
      } as any)

      const uploadResponse = await fetch('https://cellar.zubi.wine/api/upload/audio', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await uploadResponse.json()

      const voiceMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        messageType: 'voice',
        text: '',
        audioUrl: `https://cellar.zubi.wine${url}`,
        duration: recordingDuration,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, voiceMessage])
      setIsRecording(false)
      setRecordingDuration(0)
      setAudioRecording(null)
      setIsLoading(true)

      const response = await apiFetch<{
        conversationId?: string
        message: string
        suggestions: WineSuggestion[]
      }>('/api/chat/sommelier', {
        method: 'POST',
        body: {
          type: 'voice',
          audioUrl: `https://cellar.zubi.wine${url}`,
          duration: recordingDuration,
          conversationId: currentConversationId,
        },
      })

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
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to send voice message:', error)
      Alert.alert('Upload Error', 'Failed to send voice message. Please try again.')
      setIsRecording(false)
      setRecordingDuration(0)
      setAudioRecording(null)
      setIsLoading(false)
    }
  }

  // Photo functions
  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        'Camera Permission',
        'Bibo needs camera access to take photos. Please enable it in Settings.',
        [{ text: 'OK' }]
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    })

    if (!result.canceled && result.assets[0]) {
      await uploadAndSendPhoto(result.assets[0].uri)
    }
  }

  const handleChooseFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        'Photo Library Permission',
        'Bibo needs photo library access. Please enable it in Settings.',
        [{ text: 'OK' }]
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    })

    if (!result.canceled && result.assets[0]) {
      await uploadAndSendPhoto(result.assets[0].uri)
    }
  }

  const handleScanLabel = async () => {
    // @ts-ignore - navigation typing
    navigation.navigate('ScanWine')
  }

  const uploadAndSendPhoto = async (uri: string) => {
    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('image', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any)

      const uploadResponse = await fetch('https://cellar.zubi.wine/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await uploadResponse.json()

      const photoMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        messageType: 'photo',
        text: '',
        imageUrl: `https://cellar.zubi.wine${url}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, photoMessage])

      const response = await apiFetch<{
        conversationId?: string
        message: string
        suggestions: WineSuggestion[]
      }>('/api/chat/sommelier', {
        method: 'POST',
        body: {
          type: 'photo',
          imageUrl: `https://cellar.zubi.wine${url}`,
          conversationId: currentConversationId,
        },
      })

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
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to send photo:', error)
      Alert.alert('Upload Error', 'Failed to send photo. Please try again.')
      setIsLoading(false)
    }
  }

  const getAuthToken = async () => {
    return '41040187dfc4b0bf953a62a83a8a4d1e658a330631f86697eab76e8438068715'
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

      if (response.conversationId && !currentConversationId) {
        setCurrentConversationId(response.conversationId)
      }

      const words = response.message.split(' ')
      let currentText = ''

      for (let i = 0; i < words.length; i++) {
        if (i === 0) {
          setIsLoading(false)
        }

        currentText += (i > 0 ? ' ' : '') + words[i]

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, text: currentText, suggestions: i === words.length - 1 ? response.suggestions : undefined }
              : msg
          )
        )

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

  const renderMessage = (message: Message) => {
    if (message.type === 'assistant') {
      return (
        <View key={message.id} style={styles.assistantRow}>
          <BiboAvatar />
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
                    <View style={styles.wineImageContainer}>
                      {wine.imageUrl ? (
                        <Image source={{ uri: wine.imageUrl }} style={styles.wineImage} />
                      ) : (
                        <View style={styles.wineImagePlaceholder}>
                          <WineIcon size={24} weight="regular" color="rgba(242, 143, 166, 0.7)" />
                        </View>
                      )}
                    </View>

                    <View style={styles.wineInfo}>
                      <Text style={styles.wineName} numberOfLines={1}>{wine.name}</Text>
                      <Text style={styles.wineRegion} numberOfLines={1}>{wine.region}</Text>
                      <Text style={styles.pairingNote} numberOfLines={2}>{wine.pairingNote}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )
    }

    // User message - check type
    if (message.messageType === 'voice' && message.audioUrl) {
      return (
        <VoiceMessageBubble
          key={message.id}
          audioUrl={message.audioUrl}
          duration={message.duration || 0}
          timestamp={message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
      )
    }

    if ((message.messageType === 'photo' || message.messageType === 'label_scan') && message.imageUrl) {
      return (
        <PhotoMessageBubble
          key={message.id}
          imageUrl={message.imageUrl}
          caption={message.caption}
          timestamp={message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          onPress={() => {
            console.log('Open image:', message.imageUrl)
          }}
        />
      )
    }

    // Regular text message
    return (
      <View key={message.id} style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
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
      {/* Ambient blobs */}
      <View style={styles.blobYellow} />
      <View style={styles.blobPink} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSidebar(true)}
          activeOpacity={0.7}
        >
          <List size={24} weight="bold" color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Bibo</Text>
        </View>

        <View style={styles.headerButton} />
      </View>

      {/* Chat Container */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={66}
      >
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Date separator */}
            {messages.length > 0 && (
              <View style={styles.dateSeparator}>
                <View style={styles.datePill}>
                  <Text style={styles.dateText}>
                    Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            )}

            {messages.length === 0 ? renderEmptyState() : messages.map((message) => renderMessage(message))}

            {isLoading && (
              <View style={styles.assistantRow}>
                <BiboAvatar />
                <View style={[styles.assistantBubble, styles.typingBubble]}>
                  <TypingDots />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            {/* Fade gradient above input */}
            <LinearGradient
              colors={['rgba(254, 246, 237, 0)', 'rgba(254, 246, 237, 0.95)']}
              style={styles.inputFade}
              pointerEvents="none"
            />

            {/* Suggestion Carousel (show above input when no messages) */}
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

            {isRecording ? (
              <VoiceRecordingBar
                duration={recordingDuration}
                onCancel={cancelRecording}
                onSend={sendVoiceMessage}
              />
            ) : (
              <View style={styles.inputRow}>
                {/* Text Input */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => textInputRef.current?.focus()}
                  style={styles.inputWrapper}
                >
                  <TextInput
                    ref={textInputRef}
                    style={[styles.input, { height: Math.max(44, inputHeight) }]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    onContentSizeChange={(e) =>
                      setInputHeight(Math.min(100, e.nativeEvent.contentSize.height))
                    }
                    returnKeyType="send"
                    onSubmitEditing={() => handleSend()}
                    blurOnSubmit={false}
                  />
                  {!inputText.trim() && (
                    <TouchableOpacity
                      style={styles.micInsideInput}
                      onPress={startRecording}
                      activeOpacity={0.7}
                    >
                      <Microphone size={20} weight="fill" color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {/* Send */}
                <TouchableOpacity
                  style={styles.sendButtonOuter}
                  onPress={() => handleSend()}
                  disabled={isLoading || !inputText.trim()}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.rose, colors.coral]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendButton}
                  >
                    <PaperPlaneTilt size={24} weight="fill" color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Camera */}
                <TouchableOpacity
                  style={styles.frostedButton}
                  onPress={() => setShowPhotoPicker(true)}
                  activeOpacity={0.7}
                >
                  <Camera size={24} weight="regular" color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
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
              // @ts-ignore - Navigation typing
              navigation.navigate('TasteProfileEmpty')
            } else {
              // @ts-ignore - Navigation typing
              navigation.navigate('TasteProfile')
            }
          } catch (error) {
            // @ts-ignore - Navigation typing
            navigation.navigate('TasteProfileEmpty')
          }
        }}
        onSettingsPress={() => {
          // @ts-ignore - Navigation typing
          navigation.navigate('SommelierSettings')
        }}
      />

      {/* Photo Picker Sheet */}
      <PhotoPickerSheet
        visible={showPhotoPicker}
        onClose={() => setShowPhotoPicker(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
        onScanLabel={handleScanLabel}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },

  // Ambient blobs
  blobYellow: {
    position: 'absolute',
    top: '-10%',
    left: '-20%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.honey,
    opacity: 0.25,
  },
  blobPink: {
    position: 'absolute',
    bottom: '10%',
    right: '-20%',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: colors.rose,
    opacity: 0.15,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 40,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },

  // Chat
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 200 : 190,
    flexGrow: 1,
    gap: 16,
  },

  // Date separator
  dateSeparator: {
    alignItems: 'center',
    marginBottom: 8,
  },
  datePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textTertiary,
  },

  // Assistant messages
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    borderBottomLeftRadius: 8,
    padding: 16,
    maxWidth: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  assistantText: {
    fontSize: 15,
    fontFamily: 'NunitoSans_400Regular',
    lineHeight: 22.5,
    color: colors.textPrimary,
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  typingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(232, 139, 158, 0.6)',
  },

  // User messages
  userRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: 'rgba(255, 214, 224, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    borderBottomRightRadius: 8,
    padding: 16,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  userText: {
    fontSize: 15,
    fontFamily: 'NunitoSans_400Regular',
    lineHeight: 22.5,
    color: colors.textPrimary,
  },

  // Wine cards
  suggestionsContainer: {
    marginTop: 12,
    gap: 10,
  },
  wineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  wineImageContainer: {
    width: 52,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  wineImage: {
    width: '100%',
    height: '100%',
  },
  wineImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wineInfo: {
    flex: 1,
  },
  wineName: {
    fontSize: 15,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  wineRegion: {
    fontSize: 12,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textTertiary,
    marginBottom: 4,
  },
  pairingNote: {
    fontSize: 12,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Empty state
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
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Suggestion carousel
  carouselContainer: {
    paddingBottom: 12,
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  suggestionEmoji: {
    fontSize: 18,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Input
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 16,
    backgroundColor: 'rgba(254, 246, 237, 0.95)',
  },
  inputFade: {
    position: 'absolute',
    top: -48,
    left: 0,
    right: 0,
    height: 48,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frostedButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingRight: 44,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'NunitoSans_500Medium',
    fontWeight: '500',
    maxHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  micInsideInput: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  sendButtonOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: colors.rose,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 6,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(254, 246, 237, 0.5)',
  },
})
