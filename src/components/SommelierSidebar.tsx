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
import { Gear, Plus, MagnifyingGlass, XCircle, User } from 'phosphor-react-native'
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
  onSettingsPress: () => void
}

const C = {
  cream: '#FEF6ED',
  burgundy: '#6B2D3D',
  burgundyDark: '#4A1F2A',
  pink: '#FFB3C6',
  pinkLight: '#FFD9E2',
  yellow: '#FFE57A',
  warmgray: '#8C7A7E',
  warmgrayLight: '#A8999C',
}

export const SommelierSidebar = ({
  visible,
  onClose,
  onConversationSelect,
  onNewChat,
  onProfilePress,
  onSettingsPress,
}: SommelierSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [slideAnim] = useState(new Animated.Value(-320))

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
        toValue: -320,
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
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => {
                    onSettingsPress()
                    onClose()
                  }}
                  activeOpacity={0.7}
                >
                  <Gear size={20} weight="regular" color={C.burgundy} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => {
                    onNewChat()
                    onClose()
                  }}
                  activeOpacity={0.7}
                >
                  <Plus size={20} weight="regular" color={C.burgundy} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <MagnifyingGlass size={18} weight="regular" color={C.warmgray} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search conversations..."
                  placeholderTextColor="rgba(140, 122, 126, 0.6)"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                    <XCircle size={18} weight="fill" color={C.warmgray} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Conversation List */}
            <View style={styles.listContainer}>
              {isLoading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Loading...</Text>
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

            {/* Profile Button — frosted pink glass */}
            <View style={styles.profileContainer}>
              <LinearGradient
                colors={[C.cream, 'rgba(254, 246, 237, 0.95)', 'transparent']}
                style={styles.profileFade}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                pointerEvents="none"
              />
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => {
                  onProfilePress()
                  onClose()
                }}
                activeOpacity={0.8}
              >
                <User size={22} weight="fill" color={C.burgundy} />
                <Text style={styles.profileText}>Taste Profile</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '85%',
    backgroundColor: C.cream,
    borderTopRightRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 15, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  sidebarContent: {
    flex: 1,
  },

  // Header
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sidebarTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: C.burgundy,
    letterSpacing: -0.3,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.burgundy,
    fontWeight: '500',
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: C.warmgray,
    textAlign: 'center',
  },

  // Conversation cards
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: 'rgba(107, 45, 61, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.burgundy,
    marginRight: 12,
  },
  conversationMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: C.warmgray,
  },
  conversationPreview: {
    fontSize: 14,
    color: C.warmgray,
    lineHeight: 19.6,
  },

  // Profile
  profileContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 48,
  },
  profileFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 179, 198, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 4,
  },
  profileText: {
    fontSize: 17,
    fontWeight: '700',
    color: C.burgundy,
  },
})
