import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../theme/colors'

export const SommelierChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sommelier Chat</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: colors.textSecondary,
  },
})
