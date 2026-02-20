import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme/colors'
import { LoginScreen } from '../screens/LoginScreen'
import { HomeScreen } from '../screens/home/HomeScreen'
import { InventoryScreen } from '../screens/inventory/InventoryScreen'
import { InventoryDetailScreen } from '../screens/inventory/InventoryDetailScreen'
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

const AuthenticatedTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopColor: colors.muted[200],
        borderTopWidth: 1,
      },
      tabBarActiveTintColor: colors.primary[600],
      tabBarInactiveTintColor: colors.muted[400],
      tabBarLabelStyle: {
        fontSize: 12,
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
  </Tab.Navigator>
)

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
})
