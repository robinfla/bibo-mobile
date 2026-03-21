import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { apiFetch } from '../../api/client'
import { colors } from '../../theme/colors'

interface PersonalityConfig {
  tone: 'professional' | 'friendly' | 'casual' | 'playful'
  verbosity: 'concise' | 'balanced' | 'detailed'
  formality: 'formal' | 'casual' | 'expert'
  teachingStyle: 'skip' | 'explain' | 'deep'
  recommendationStyle: 'safe' | 'adventurous' | 'balanced'
  priceSensitivity: 'budget' | 'value' | 'premium'
  regionalPreference: 'classic' | 'modern' | 'balanced'
}

const DEFAULT_PERSONALITY: PersonalityConfig = {
  tone: 'friendly',
  verbosity: 'balanced',
  formality: 'casual',
  teachingStyle: 'explain',
  recommendationStyle: 'balanced',
  priceSensitivity: 'value',
  regionalPreference: 'balanced',
}

const PERSONALITY_OPTIONS = {
  tone: [
    { value: 'professional', label: 'Professional', emoji: '👔', description: 'Expert sommelier at a high-end restaurant' },
    { value: 'friendly', label: 'Friendly', emoji: '😊', description: 'Warm and approachable wine buddy' },
    { value: 'casual', label: 'Casual', emoji: '🤙', description: 'Laid-back friend who knows wine' },
    { value: 'playful', label: 'Playful', emoji: '🎉', description: 'Fun and enthusiastic wine lover' },
  ],
  verbosity: [
    { value: 'concise', label: 'Concise', emoji: '📝', description: 'Short and to the point' },
    { value: 'balanced', label: 'Balanced', emoji: '⚖️', description: 'Right amount of detail' },
    { value: 'detailed', label: 'Detailed', emoji: '📚', description: 'In-depth explanations' },
  ],
  formality: [
    { value: 'formal', label: 'Formal Sommelier', emoji: '🎩', description: 'Traditional wine service' },
    { value: 'casual', label: 'Casual Friend', emoji: '👋', description: 'Like chatting with a friend' },
    { value: 'expert', label: 'Wine Geek', emoji: '🤓', description: 'Technical and precise' },
  ],
  teachingStyle: [
    { value: 'skip', label: 'Skip Basics', emoji: '⏭️', description: 'Assume I know wine' },
    { value: 'explain', label: 'Explain Concepts', emoji: '💡', description: 'Teach when relevant' },
    { value: 'deep', label: 'Deep Dive', emoji: '🔬', description: 'Always educate me' },
  ],
  recommendationStyle: [
    { value: 'safe', label: 'Safe Picks', emoji: '✅', description: 'Classic, crowd-pleasing wines' },
    { value: 'adventurous', label: 'Adventurous', emoji: '🚀', description: 'Push me to explore' },
    { value: 'balanced', label: 'Balanced', emoji: '🎯', description: 'Mix of familiar and new' },
  ],
  priceSensitivity: [
    { value: 'budget', label: 'Budget-Conscious', emoji: '💰', description: 'Focus on value wines under €20' },
    { value: 'value', label: 'Value-Focused', emoji: '💎', description: 'Best quality for the price' },
    { value: 'premium', label: 'Premium-First', emoji: '👑', description: 'Don\'t worry about price' },
  ],
  regionalPreference: [
    { value: 'classic', label: 'Classic (Old World)', emoji: '🏛️', description: 'France, Italy, Spain focus' },
    { value: 'modern', label: 'Modern (New World)', emoji: '🌎', description: 'US, Australia, SA focus' },
    { value: 'balanced', label: 'Balanced', emoji: '🌍', description: 'Best from everywhere' },
  ],
}

export const SommelierSettingsScreen = () => {
  const navigation = useNavigation()
  const [personality, setPersonality] = useState<PersonalityConfig>(DEFAULT_PERSONALITY)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPersonality()
  }, [])

  const fetchPersonality = async () => {
    try {
      setIsLoading(true)
      const data = await apiFetch<{ personality: PersonalityConfig }>('/api/profile/sommelier-personality')
      setPersonality(data.personality || DEFAULT_PERSONALITY)
    } catch (error) {
      console.error('Failed to fetch personality:', error)
      setPersonality(DEFAULT_PERSONALITY)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await apiFetch('/api/profile/sommelier-personality', {
        method: 'PUT',
        body: { personality },
      })
      navigation.goBack()
    } catch (error) {
      console.error('Failed to save personality:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderSection = (
    key: keyof PersonalityConfig,
    title: string,
    description: string
  ) => {
    const options = PERSONALITY_OPTIONS[key]
    
    return (
      <View style={styles.section} key={key}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
        
        <View style={styles.optionsGrid}>
          {options.map((option) => {
            const isSelected = personality[key] === option.value
            
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setPersonality({ ...personality, [key]: option.value })}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Icon name="check-circle" size={20} color={colors.coral} />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.coral} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={28} color={colors.coral} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sommelier Personality</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.coral} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Text style={styles.introEmoji}>🍷</Text>
          <Text style={styles.introTitle}>Customize Your Sommelier</Text>
          <Text style={styles.introText}>
            Shape how your AI sommelier interacts with you. Choose the personality traits that match your style.
          </Text>
        </View>

        {renderSection('tone', 'Tone', 'How should I sound?')}
        {renderSection('verbosity', 'Detail Level', 'How much should I explain?')}
        {renderSection('formality', 'Formality', 'What\'s our relationship?')}
        {renderSection('teachingStyle', 'Teaching Style', 'How much should I educate?')}
        {renderSection('recommendationStyle', 'Recommendations', 'How adventurous should I be?')}
        {renderSection('priceSensitivity', 'Price Sensitivity', 'How should I consider budget?')}
        {renderSection('regionalPreference', 'Regional Focus', 'Where should I look first?')}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.linen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.linen,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.coral,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  intro: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  introEmoji: {
    fontSize: 48,
    fontFamily: 'NunitoSans_400Regular',
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: colors.coral,
    backgroundColor: colors.linen,
  },
  optionEmoji: {
    fontSize: 28,
    fontFamily: 'NunitoSans_400Regular',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: colors.coral,
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
})
