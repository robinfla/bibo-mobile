import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export const SommelierOnboardingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sommelier Onboarding</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c1810',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#8a7568',
  },
})
