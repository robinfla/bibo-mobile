import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { CaretRight, Plus } from 'phosphor-react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

interface Conversation {
  conversationId: string
  title: string | null
  lastMessage: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

export const ConversationListScreen = () => {
  const navigation = useNavigation()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchConversations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const data = await apiFetch<{ conversations: Conversation[] }>('/api/chat/conversations')
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations()
    }, [])
  )

  const handleNewChat = () => {
    // @ts-ignore - Navigation typing
    navigation.navigate('SommelierChat')
  }

  const handleConversationPress = (conversationId: string) => {
    // @ts-ignore - Navigation typing
    navigation.navigate('SommelierChat', { conversationId })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
    // Handle PostgreSQL timestamp format (space instead of T)
    const isoString = dateString.replace(' ', 'T')
    const date = new Date(isoString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) return ''
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getConversationTitle = (item: Conversation) => {
    if (item.title) return item.title
    // Generate title from first message, truncate to ~40 chars
    return item.lastMessage.length > 40 
      ? item.lastMessage.substring(0, 40) + '...'
      : item.lastMessage
  }

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => handleConversationPress(item.conversationId)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {getConversationTitle(item)}
        </Text>
        <Text style={styles.conversationDate}>{formatDate(item.updatedAt)}</Text>
      </View>
      <CaretRight size={20} weight="bold" color={colors.textTertiary} />
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[colors.coral, colors.coralDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyIcon}
      >
        <Text style={styles.emptyEmoji}>🍷</Text>
      </LinearGradient>
      <Text style={styles.emptyTitle}>Start your first conversation</Text>
      <Text style={styles.emptySubtitle}>Ask me anything about wine</Text>
      <TouchableOpacity style={styles.newChatButtonEmpty} onPress={handleNewChat} activeOpacity={0.8}>
        <LinearGradient
          colors={[colors.coral, colors.coralDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.newChatGradient}
        >
          <Plus size={20} weight="regular" color={colors.textInverse} />
          <Text style={styles.newChatText}>New Chat</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.linen, colors.linen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sommelier</Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={handleNewChat}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[colors.coral, colors.coralDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newChatButtonGradient}
            >
              <Plus size={18} weight="regular" color={colors.textInverse} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Conversation List */}
        {!isLoading && conversations.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.conversationId}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchConversations(true)}
                tintColor={colors.coral}
              />
            }
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
    color: colors.textPrimary,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  newChatButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  conversationDate: {
    fontSize: 14,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  newChatButtonEmpty: {
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  newChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  newChatText: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textInverse,
  },
})
