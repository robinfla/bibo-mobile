import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { colors } from '../../theme/colors'

export const CreateSpaceScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { cellarId } = route.params

  const [name, setName] = useState('')
  const [type, setType] = useState<'room' | 'fridge'>('room')

  const handleNext = () => {
    if (!name.trim()) return
    if (type === 'room') {
      navigation.navigate('RoomSetup', { cellarId, name: name.trim() })
    } else {
      navigation.navigate('FridgeSetup', { cellarId, name: name.trim() })
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Space</Text>
        <Text style={styles.subtitle}>Add a room, fridge, or cabinet to organize your bottles.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, name.length > 0 && styles.inputActive]}
          placeholder="e.g. Wine Cave, Kitchen Fridge"
          placeholderTextColor={colors.muted[400]}
          value={name}
          onChangeText={setName}
          autoFocus={false}
        />

        {/* Type selector */}
        <Text style={[styles.label, { marginTop: 24 }]}>Type</Text>
        <View style={styles.typeCards}>
          <TouchableOpacity
            style={[styles.typeCard, type === 'room' && styles.typeCardActive]}
            onPress={() => setType('room')}
          >
            {type === 'room' && <View style={styles.typeCheck}><Text style={styles.typeCheckText}>✓</Text></View>}
            <View style={[styles.typeIcon, type === 'room' && styles.typeIconActive]}>
              <Text style={{ fontSize: 32 }}>🏠</Text>
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeName}>Room</Text>
              <Text style={styles.typeDesc}>A room with walls where you mount racks. Select which walls have storage.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeCard, type === 'fridge' && styles.typeCardActive]}
            onPress={() => setType('fridge')}
          >
            {type === 'fridge' && <View style={styles.typeCheck}><Text style={styles.typeCheckText}>✓</Text></View>}
            <View style={[styles.typeIcon, type === 'fridge' && styles.typeIconActive]}>
              <Text style={{ fontSize: 32 }}>❄️</Text>
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeName}>Fridge / Cabinet</Text>
              <Text style={styles.typeDesc}>Shelves with configurable width and depth. Perfect for wine fridges.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={[styles.nextBtn, !name.trim() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!name.trim()}
        >
          <Text style={styles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.muted[50] },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 28, color: colors.muted[400], fontFamily: 'NunitoSans_400Regular' },
  title: { fontSize: 24, fontWeight: '800', fontFamily: 'NunitoSans_800ExtraBold', color: colors.textPrimary, marginTop: 4 },
  subtitle: { fontSize: 13, fontFamily: 'NunitoSans_400Regular', color: colors.textSecondary, marginTop: 4, lineHeight: 18 },

  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', fontFamily: 'NunitoSans_600SemiBold', color: colors.textSecondary, marginBottom: 8 },

  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.muted[200],
  },
  inputActive: { borderColor: colors.coral },

  // Type cards (vertical stack like v3)
  typeCards: { gap: 12 },
  typeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: colors.muted[200],
    position: 'relative',
  },
  typeCardActive: { borderColor: colors.coral, backgroundColor: colors.coralLight },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.muted[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconActive: { backgroundColor: colors.coralLight },
  typeContent: { flex: 1 },
  typeName: { fontSize: 16, fontWeight: '700', fontFamily: 'NunitoSans_700Bold', color: colors.textPrimary },
  typeDesc: { fontSize: 12, fontFamily: 'NunitoSans_400Regular', color: colors.textSecondary, marginTop: 4, lineHeight: 17 },
  typeCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    backgroundColor: colors.coral,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeCheckText: { color: colors.textInverse, fontSize: 13, fontWeight: '700', fontFamily: 'NunitoSans_700Bold' },

  nextBtn: {
    backgroundColor: colors.coral,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: colors.textInverse, fontSize: 16, fontWeight: '700', fontFamily: 'NunitoSans_700Bold' },
})
