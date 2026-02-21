import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme/colors'

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth()

  const userName = user?.name ?? user?.email?.split('@')[0] ?? 'User'
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}

        {/* Settings section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuIcon}>⏻</Text>
            <Text style={styles.menuLabel}>Sign Out</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.muted[50] },
  header: {
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 16, color: colors.primary[600], fontWeight: '600' },

  content: { alignItems: 'center', paddingTop: 16 },

  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary[600],
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarLargeText: { fontSize: 28, fontWeight: '700', color: colors.white },
  userName: { fontSize: 22, fontWeight: '700', color: colors.muted[900] },
  userEmail: { fontSize: 14, color: colors.muted[500], marginTop: 4, marginBottom: 24 },

  section: { width: '100%', paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: colors.muted[500],
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.muted[200], borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuIcon: { fontSize: 18, marginRight: 12, color: colors.muted[600] },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.muted[900] },
  menuArrow: { fontSize: 20, color: colors.muted[400] },
})
