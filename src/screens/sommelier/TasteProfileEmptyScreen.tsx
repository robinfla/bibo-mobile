import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

export const TasteProfileEmptyScreen = () => {
  const navigation = useNavigation()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyzeCellar = async () => {
    setIsAnalyzing(true)
    try {
      // Start a new conversation with analysis prompt
      const response = await apiFetch<{ conversationId: string; message: string }>('/api/chat/sommelier', {
        method: 'POST',
        body: {
          message: 'Please analyze my wine cellar and tell me about my taste preferences. Look at what wines I have, their regions, grapes, and colors. Based on this collection, what can you tell me about my wine personality and what I might enjoy?',
        },
      })
      
      // Navigate to chat to see the analysis
      // @ts-ignore - Navigation typing
      navigation.replace('SommelierChat', { conversationId: response.conversationId })
    } catch (error) {
      console.error('Failed to analyze cellar:', error)
      // TODO: Show error message
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnswerQuestions = () => {
    // @ts-ignore - Navigation typing
    navigation.navigate('SommelierOnboarding')
  }

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="chevron-left" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Taste Profile</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.content}>
          {/* Empty Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.emptyIcon}>🍷</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Let's get to know you</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to build your taste profile
          </Text>

          {/* Option Cards */}
          <View style={styles.optionsContainer}>
            {/* Option 1: Analyze Cellar */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleAnalyzeCellar}
              disabled={isAnalyzing}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionIcon}>🏛️</Text>
                <Text style={styles.optionTitle}>Analyse my cellar</Text>
              </View>
              <Text style={styles.optionDescription}>
                I'll learn from your current collection to understand your preferences
              </Text>
              {isAnalyzing && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color={colors.coral} />
                  <Text style={styles.loadingText}>Analyzing your cellar...</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Option 2: Answer Questions */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleAnswerQuestions}
              disabled={isAnalyzing}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionIcon}>📝</Text>
                <Text style={styles.optionTitle}>Answer a few questions</Text>
              </View>
              <Text style={styles.optionDescription}>
                This will help me give you more accurate information and recommendations based on you, not just your cellar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.coral,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 32,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.coral,
    fontWeight: '600',
  },
})
