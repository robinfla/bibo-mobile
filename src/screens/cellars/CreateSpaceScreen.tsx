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
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 28, color: colors.muted[400] },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginTop: 4 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4, lineHeight: 18 },

  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  inputActive: { borderColor: '#722F37' },

  // Type cards (vertical stack like v3)
  typeCards: { gap: 12 },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    position: 'relative',
  },
  typeCardActive: { borderColor: '#722F37', backgroundColor: '#fef8f8' },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconActive: { backgroundColor: '#fde8ea' },
  typeContent: { flex: 1 },
  typeName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  typeDesc: { fontSize: 12, color: '#888', marginTop: 4, lineHeight: 17 },
  typeCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    backgroundColor: '#722F37',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeCheckText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  nextBtn: {
    backgroundColor: '#722F37',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
