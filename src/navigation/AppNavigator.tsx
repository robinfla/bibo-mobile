import React, { useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme/colors'
import { LoginScreen } from '../screens/LoginScreen'
import { HomeScreen } from '../screens/home/HomeScreen'
import { InventoryScreen } from '../screens/inventory/InventoryScreen'
import { InventoryDetailScreen } from '../screens/inventory/InventoryDetailScreen'
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen'
import { ScanWineModal } from '../screens/home/ScanWineModal'
import type { InventoryLot } from '../types/api'

type InventoryStackParamList = {
  InventoryList: undefined
  InventoryDetail: { lot: InventoryLot }
}

const HomeStack = createNativeStackNavigator()
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>()
const Tab = createBottomTabNavigator()

const HomeIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 20, color }}>⌂</Text>
)

const ListIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 20, color }}>☰</Text>
)

const ChartIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 20, color }}>📊</Text>
)

const ScanIcon = () => (
  <View style={styles.scanButton}>
    <Text style={{ fontSize: 24, color: colors.white }}>📷</Text>
  </View>
)

// Dummy screen — scan tab never actually renders, it opens a modal
const DummyScreen = () => <View />;


const AnalyticsStack = createNativeStackNavigator()

const AnalyticsStackScreen = () => (
  <AnalyticsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.white },
      headerTitleStyle: { fontWeight: '700', color: colors.muted[900] },
      headerShadowVisible: false,
    }}
  >
    <AnalyticsStack.Screen
      name="AnalyticsMain"
      component={AnalyticsScreen}
      options={{ title: 'Analytics' }}
    />
  </AnalyticsStack.Navigator>
)

const HomeStackScreen = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.white },
      headerTitleStyle: { fontWeight: '700', color: colors.muted[900] },
      headerShadowVisible: false,
    }}
  >
    <HomeStack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ title: 'Home' }}
    />
  </HomeStack.Navigator>
)

const InventoryStackScreen = () => (
  <InventoryStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.white },
      headerTitleStyle: { fontWeight: '700', color: colors.muted[900] },
      headerShadowVisible: false,
    }}
  >
    <InventoryStack.Screen
      name="InventoryList"
      component={InventoryScreen}
      options={{ title: 'Inventory' }}
    />
    <InventoryStack.Screen
      name="InventoryDetail"
      component={InventoryDetailScreen}
      options={{ title: 'Wine Details' }}
    />
  </InventoryStack.Navigator>
)

const AuthenticatedTabs = () => {
  const [showScan, setShowScan] = useState(false)

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.muted[200],
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 6,
          },
          tabBarActiveTintColor: colors.primary[600],
          tabBarInactiveTintColor: colors.muted[400],
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: HomeIcon,
          }}
        />
        <Tab.Screen
          name="InventoryTab"
          component={InventoryStackScreen}
          options={{
            tabBarLabel: 'Inventory',
            tabBarIcon: ListIcon,
          }}
        />
        <Tab.Screen
          name="ScanTab"
          component={DummyScreen}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              setShowScan(true)
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ScanIcon,
          }}
        />
        <Tab.Screen
          name="AnalyticsTab"
          component={AnalyticsStackScreen}
          options={{
            tabBarLabel: 'Analytics',
            tabBarIcon: ChartIcon,
          }}
        />
      </Tab.Navigator>
      <ScanWineModal
        visible={showScan}
        onClose={() => setShowScan(false)}
        onSuccess={() => setShowScan(false)}
      />
    </>
  )
}

const LoadingScreen = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={colors.primary[600]} />
  </View>
)

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <AuthenticatedTabs />
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muted[50],
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
})
