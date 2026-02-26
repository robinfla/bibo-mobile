import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../theme/colors'

export const HistoryTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>History Tab - Coming Soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted[50],
  },
  text: {
    fontSize: 16,
    color: colors.muted[600],
  },
})
