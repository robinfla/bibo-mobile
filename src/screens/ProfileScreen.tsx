import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../auth/AuthContext'
import { CaretLeft, CaretRight, UploadSimple, DownloadSimple, Bell, Sliders, Shield, Question, Info, SignOut } from 'phosphor-react-native'
import { colors } from '../theme/colors'

export const ProfileScreen = () => {
  const navigation = useNavigation()
  const { user, logout } = useAuth()

  const userName = user?.name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''
  const initials = userName.substring(0, 2).toUpperCase()

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    )
  }

  const handleImportCSV = () => {
    Alert.alert('Import from CSV', 'CSV import feature coming soon!')
  }

  const handleExportCSV = () => {
    Alert.alert('Export to CSV', 'CSV export feature coming soon!')
  }

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!')
  }

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings coming soon!')
  }

  const handlePreferences = () => {
    Alert.alert('Preferences', 'Preferences coming soon!')
  }

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy settings coming soon!')
  }

  const handleHelp = () => {
    Alert.alert('Help', 'Help & support coming soon!')
  }

  const handleAbout = () => {
    Alert.alert('About', 'About Bibo coming soon!')
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
          <CaretLeft size={24} weight="bold" color={colors.textSecondary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Bibo</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleImportCSV}
            activeOpacity={0.7}
          >
            <UploadSimple size={24} weight="regular" color={colors.coral} />
            <Text style={styles.menuItemText}>Import from CSV</Text>
            <CaretRight size={24} weight="bold" color={colors.textTertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleExportCSV}
            activeOpacity={0.7}
          >
            <DownloadSimple size={24} weight="regular" color={colors.coral} />
            <Text style={styles.menuItemText}>Export to CSV</Text>
            <CaretRight size={24} weight="bold" color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleNotifications}
            activeOpacity={0.7}
          >
            <Bell size={24} weight="regular" color={colors.coral} />
            <Text style={styles.menuItemText}>Notifications</Text>
            <CaretRight size={24} weight="bold" color={colors.textTertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePreferences}
            activeOpacity={0.7}
          >
            <Sliders size={24} weight="regular" color={colors.coral} />
            <Text style={styles.menuItemText}>Preferences</Text>
            <CaretRight size={24} weight="bold" color={colors.textTertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacy}
            activeOpacity={0.7}
          >
            <Shield size={24} weight="regular" color={colors.coral} />
            <Text style={styles.menuItemText}>Privacy</Text>
            <CaretRight size={24} weight="bold" color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleHelp}
            activeOpacity={0.7}
          >
            <Question size={24} weight="regular" color={colors.coral} />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <CaretRight size={24} weight="bold" color={colors.textTertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAbout}
            activeOpacity={0.7}
          >
            <Info size={24} weight="regular" color={colors.coral} />
            <Text style={styles.menuItemText}>About Bibo</Text>
            <CaretRight size={24} weight="bold" color={colors.textTertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, styles.signOutItem]}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <SignOut size={24} weight="regular" color={colors.danger} />
            <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
            <CaretRight size={24} weight="bold" color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // User Card
  userCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 24,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitials: {
    fontSize: 32,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: '800',
    color: colors.textInverse,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textTertiary,
    marginBottom: 20,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.coral,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.coral,
  },
  
  // Sections
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 16,
  },
  signOutItem: {
    marginTop: 8,
  },
  signOutText: {
    color: colors.danger,
  },
})
