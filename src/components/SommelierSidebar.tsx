import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { apiFetch } from '../api/client'

interface Conversation {
  conversationId: string
  title: string | null
  lastMessage: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

interface SommelierSidebarProps {
  visible: boolean
  onClose: () => void
  onConversationSelect: (conversationId: string) => void
  onNewChat: () => void
  onProfilePress: () => void
}

export const SommelierSidebar = ({
  visible,
  onClose,
  onConversationSelect,
  onNewChat,
  onProfilePress,
}: SommelierSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [slideAnim] = useState(new Animated.Value(-300))

  useEffect(() => {
    if (visible) {
      fetchConversations()
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter((conv) => {
        const title = getConversationTitle(conv).toLowerCase()
        const query = searchQuery.toLowerCase()
        return title.includes(query) || conv.lastMessage.toLowerCase().includes(query)
      })
      setFilteredConversations(filtered)
    } else {
      setFilteredConversations(conversations)
    }
  }, [searchQuery, conversations])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const data = await apiFetch<{ conversations: Conversation[] }>('/api/chat/conversations')
      setConversations(data.conversations || [])
      setFilteredConversations(data.conversations || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getConversationTitle = (item: Conversation) => {
    if (item.title) return item.title
    return item.lastMessage.length > 40 
      ? item.lastMessage.substring(0, 40) + '...'
      : item.lastMessage
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
    const isoString = dateString.replace(' ', 'T')
    const date = new Date(isoString)
    
    if (isNaN(date.getTime())) return ''
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const handleConversationPress = (conversationId: string) => {
    onConversationSelect(conversationId)
    onClose()
  }

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => handleConversationPress(item.conversationId)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationHeader}>
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {getConversationTitle(item)}
        </Text>
        <Text style={styles.conversationMeta}>
          {formatDate(item.updatedAt)} · {item.messageCount} msg
        </Text>
      </View>
      <Text style={styles.conversationPreview} numberOfLines={2}>
        {item.lastMessage}
      </Text>
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <SafeAreaView style={styles.sidebarContent}>
            {/* Header */}
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Conversations</Text>
              <TouchableOpacity
                style={styles.newChatButton}
                onPress={() => {
                  onNewChat()
                  onClose()
                }}
                activeOpacity={0.7}
              >
                <Icon name="plus" size={20} color="#722F37" />
              </TouchableOpacity>
            </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#8a7568" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conversations..."
              placeholderTextColor="#b5a89e"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Icon name="close-circle" size={20} color="#b5a89e" />
              </TouchableOpacity>
            )}
          </View>

          {/* Conversation List */}
          <View style={styles.listContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : filteredConversations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredConversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.conversationId}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Profile Button */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              onProfilePress()
              onClose()
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#722F37', '#944654']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileGradient}
            >
              <Icon name="account" size={20} color="#fff" />
              <Text style={styles.profileText}>Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fef9f5',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c1810',
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2c1810',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#8a7568',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#8a7568',
    textAlign: 'center',
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(228, 213, 203, 0.3)',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#722F37',
    marginRight: 8,
  },
  conversationMeta: {
    fontSize: 11,
    color: '#b5a89e',
  },
  conversationPreview: {
    fontSize: 13,
    color: '#8a7568',
    lineHeight: 18,
  },
  profileButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  profileText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})
