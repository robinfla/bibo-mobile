import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { apiFetch } from '../../api/client'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const ONBOARDING_CARDS = [
  {
    id: 1,
    title: "What's calling you?",
    subtitle: 'Pick the color that speaks to your heart',
    type: 'single-select',
    options: [
      { id: 'red', emoji: '🍷', label: 'Red' },
      { id: 'white', emoji: '🥂', label: 'White & Sparkling' },
      { id: 'rose', emoji: '🌹', label: 'Rosé' },
    ],
    field: 'color_preference',
  },
  {
    id: 2,
    title: 'How adventurous?',
    subtitle: 'Should I play it safe or push your palate?',
    type: 'slider',
    options: [
      { id: 1, emoji: '🛡️', label: 'Play it safe' },
      { id: 2, emoji: '🧭', label: 'Some adventure' },
      { id: 3, emoji: '🚀', label: 'Full explorer' },
    ],
    field: 'adventure_level',
  },
  {
    id: 3,
    title: 'Favorite regions?',
    subtitle: 'Pick up to 5 places you love',
    type: 'multi-select',
    maxSelect: 5,
    options: [
      { id: 'bordeaux', label: 'Bordeaux', flag: '🇫🇷' },
      { id: 'burgundy', label: 'Burgundy', flag: '🇫🇷' },
      { id: 'champagne', label: 'Champagne', flag: '🇫🇷' },
      { id: 'italy', label: 'Italy', flag: '🇮🇹' },
      { id: 'spain', label: 'Spain', flag: '🇪🇸' },
      { id: 'california', label: 'California', flag: '🇺🇸' },
    ],
    field: 'region_picks',
  },
  {
    id: 4,
    title: 'Favorite grapes?',
    subtitle: 'Pick the ones you know you love',
    type: 'multi-select',
    maxSelect: 8,
    options: [
      { id: 'cabernet', label: 'Cabernet Sauvignon', color: '#722F37' },
      { id: 'pinot', label: 'Pinot Noir', color: '#944654' },
      { id: 'syrah', label: 'Syrah/Shiraz', color: '#6B2833' },
      { id: 'chardonnay', label: 'Chardonnay', color: '#D4E6B5' },
      { id: 'sauvignon', label: 'Sauvignon Blanc', color: '#C8DFA8' },
    ],
    field: 'favorite_grapes',
  },
  {
    id: 5,
    title: 'Any turn-offs?',
    subtitle: 'What should I avoid?',
    type: 'multi-select',
    options: [
      { id: 'too_oaky', emoji: '🪵', label: 'Too oaky' },
      { id: 'too_sweet', emoji: '🍯', label: 'Too sweet' },
      { id: 'too_dry', emoji: '🏜️', label: 'Too dry' },
      { id: 'too_tannic', emoji: '☕', label: 'Too tannic' },
    ],
    field: 'dislikes',
  },
  {
    id: 6,
    title: 'Comfort zone?',
    subtitle: 'What feels right for most bottles?',
    type: 'single-select',
    options: [
      { id: 'under_20', emoji: '💸', label: 'Under $20' },
      { id: '20_50', emoji: '💵', label: '$20-50' },
      { id: '50_100', emoji: '💳', label: '$50-100' },
      { id: 'over_100', emoji: '💎', label: '$100+' },
    ],
    field: 'budget',
  },
  {
    id: 7,
    title: 'How often?',
    subtitle: 'How frequently do you open a bottle?',
    type: 'single-select',
    options: [
      { id: 'daily', emoji: '🍷', label: 'Daily' },
      { id: 'few_week', emoji: '📅', label: 'Few times a week' },
      { id: 'weekly', emoji: '🗓️', label: 'Weekly' },
      { id: 'monthly', emoji: '🌙', label: 'Monthly' },
    ],
    field: 'frequency',
  },
  {
    id: 8,
    title: "You're all set!",
    subtitle: 'Ready to discover amazing wines',
    type: 'complete',
  },
]

export const SommelierOnboardingScreen = () => {
  const navigation = useNavigation()
  const scrollRef = useRef<ScrollView>(null)
  const [currentCard, setCurrentCard] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  const handleOptionSelect = (field: string, value: any, isMultiSelect = false, maxSelect?: number) => {
    if (isMultiSelect) {
      const current = answers[field] || []
      const exists = current.includes(value)
      
      if (exists) {
        setAnswers({ ...answers, [field]: current.filter((v: any) => v !== value) })
      } else if (!maxSelect || current.length < maxSelect) {
        setAnswers({ ...answers, [field]: [...current, value] })
      }
    } else {
      setAnswers({ ...answers, [field]: value })
    }
  }

  const handleNext = () => {
    if (currentCard < ONBOARDING_CARDS.length - 1) {
      const nextCard = currentCard + 1
      setCurrentCard(nextCard)
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * nextCard, animated: true })
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleSubmit = async () => {
    try {
      await apiFetch('/api/profile/onboarding', {
        method: 'POST',
        body: answers,
      })
      
      // @ts-ignore - Navigation
      navigation.replace('ConversationList')
    } catch (error) {
      console.error('Failed to submit onboarding:', error)
    }
  }

  const renderCard = (card: typeof ONBOARDING_CARDS[0]) => {
    if (card.type === 'complete') {
      return (
        <View style={styles.card} key={card.id}>
          <View style={styles.cardContent}>
            <View style={styles.completeIcon}>
              <Text style={styles.completeEmoji}>✨</Text>
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#722F37', '#944654']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.completeGradient}
              >
                <Text style={styles.completeButtonText}>Start Chatting</Text>
                <Icon name="arrow-right" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    const currentValue = answers[card.field!]
    const canContinue = card.type === 'single-select' ? !!currentValue : true

    return (
      <View style={styles.card} key={card.id}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.subtitle}</Text>

          <View style={styles.optionsContainer}>
            {card.type === 'single-select' && (
              <View style={styles.gridContainer}>
                {card.options?.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      currentValue === option.id && styles.optionCardSelected,
                    ]}
                    onPress={() => handleOptionSelect(card.field!, option.id)}
                    activeOpacity={0.7}
                  >
                    {'emoji' in option && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {card.type === 'slider' && (
              <View style={styles.sliderContainer}>
                {card.options?.map((option, index) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sliderOption,
                      currentValue === option.id && styles.sliderOptionSelected,
                    ]}
                    onPress={() => handleOptionSelect(card.field!, option.id)}
                    activeOpacity={0.7}
                  >
                    {'emoji' in option && <Text style={styles.sliderEmoji}>{option.emoji}</Text>}
                    <Text style={styles.sliderLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {card.type === 'multi-select' && (
              <View style={styles.gridContainer}>
                {card.options?.map((option) => {
                  const selected = (currentValue || []).includes(option.id)
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.multiOptionCard,
                        selected && styles.multiOptionCardSelected,
                      ]}
                      onPress={() => handleOptionSelect(card.field!, option.id, true, card.maxSelect)}
                      activeOpacity={0.7}
                    >
                      {'flag' in option && option.flag && <Text style={styles.optionFlag}>{option.flag}</Text>}
                      {'emoji' in option && option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
                      {'color' in option && option.color && (
                        <View style={[styles.colorDot, { backgroundColor: option.color }]} />
                      )}
                      <Text style={[styles.multiOptionLabel, selected && styles.multiOptionLabelSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          {currentCard < ONBOARDING_CARDS.length - 1 && (
            <TouchableOpacity
              style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
              onPress={handleNext}
              disabled={!canContinue}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={canContinue ? ['#722F37', '#944654'] : ['#ccc', '#aaa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fef9f5', '#f8f0e8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerProgress}>
            {currentCard + 1}/{ONBOARDING_CARDS.length}
          </Text>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentCard + 1) / ONBOARDING_CARDS.length) * 100}%` },
            ]}
          />
        </View>

        {/* Cards */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.scrollView}
        >
          {ONBOARDING_CARDS.map((card) => renderCard(card))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a7568',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#722F37',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(44, 24, 16, 0.1)',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#722F37',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c1810',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#8a7568',
    marginBottom: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#722F37',
    backgroundColor: 'rgba(114, 47, 55, 0.05)',
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c1810',
    textAlign: 'center',
  },
  sliderContainer: {
    gap: 12,
  },
  sliderOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sliderOptionSelected: {
    borderColor: '#722F37',
    backgroundColor: 'rgba(114, 47, 55, 0.05)',
  },
  sliderEmoji: {
    fontSize: 32,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c1810',
  },
  multiOptionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  multiOptionCardSelected: {
    borderColor: '#722F37',
    backgroundColor: 'rgba(114, 47, 55, 0.05)',
  },
  optionFlag: {
    fontSize: 24,
    marginBottom: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  multiOptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c1810',
    textAlign: 'center',
  },
  multiOptionLabelSelected: {
    color: '#722F37',
  },
  buttonContainer: {
    paddingVertical: 20,
  },
  continueButton: {
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  completeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(114, 47, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    marginTop: 60,
  },
  completeEmoji: {
    fontSize: 50,
  },
  completeButton: {
    marginTop: 40,
    shadowColor: '#722F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  completeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    borderRadius: 16,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
})
