import React, { useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme/colors'
import { LoginScreen } from '../screens/LoginScreen'
import { HomeScreen } from '../screens/home/HomeScreen'
import { InventoryScreen } from '../screens/inventory/InventoryScreen'
import { InventoryDetailScreen } from '../screens/inventory/InventoryDetailScreen'
import { WineDetailScreenV3 } from '../screens/wine/WineDetailScreenV3'
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { ImportScreen } from '../screens/ImportScreen'
import { ScanWineModal } from '../screens/home/ScanWineModal'
import { AddWishlistStep1 } from '../screens/wishlist/AddWishlistStep1'
import { AddWishlistStep2 } from '../screens/wishlist/AddWishlistStep2'
import { AddWineStep1 } from '../screens/wine/AddWineStep1'
import { AddWineStep2 } from '../screens/wine/AddWineStep2'
import { CellarsScreen } from '../screens/cellars/CellarsScreen'
import { SpacesListScreen } from '../screens/cellars/SpacesListScreen'
import { CreateSpaceScreen } from '../screens/cellars/CreateSpaceScreen'
import { SpaceDetailScreen } from '../screens/cellars/SpaceDetailScreen'
import { CreateRackScreen } from '../screens/cellars/CreateRackScreen'
import { RackViewScreen } from '../screens/cellars/RackViewScreen'
import { RoomSetupScreen } from '../screens/cellars/RoomSetupScreen'
import { FridgeSetupScreen } from '../screens/cellars/FridgeSetupScreen'
import type { InventoryLot } from '../types/api'

type InventoryStackParamList = {
  InventoryList: undefined
  InventoryDetail: { lot: InventoryLot }
  WineDetail: { wineId: number }
  AddWishlistStep1: undefined
  AddWishlistStep2: { wine: { id: number; name: string; vintage?: number; region?: string; color?: string } }
}

const HomeStack = createNativeStackNavigator()
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>()
const Tab = createBottomTabNavigator()

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size + 4, color, lineHeight: size + 8 }}>⌂</Text>
)

const ListIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size + 2, color, lineHeight: size + 6 }}>☰</Text>
)

const ChartIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size + 2, color, lineHeight: size + 6 }}>📊</Text>
)

// Scan button — elevated bordeaux circle, centered in tab bar
const ScanButton = () => (
  <View
    style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#722F37',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#722F37',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }}
  >
    {/* Scan/viewfinder icon */}
    <View style={{ width: 24, height: 24, position: 'relative' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, width: 7, height: 7, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderColor: '#fff', borderTopLeftRadius: 2 }} />
      <View style={{ position: 'absolute', top: 0, right: 0, width: 7, height: 7, borderTopWidth: 2.5, borderRightWidth: 2.5, borderColor: '#fff', borderTopRightRadius: 2 }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, width: 7, height: 7, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderColor: '#fff', borderBottomLeftRadius: 2 }} />
      <View style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderColor: '#fff', borderBottomRightRadius: 2 }} />
    </View>
  </View>
)

// Cellars icon
const CellarIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size + 2, color, lineHeight: size + 6 }}>🏠</Text>
)

// Dummy screen — scan tab never actually renders, it opens a modal
const DummyScreen = () => <View />;


const CellarsStack = createNativeStackNavigator()
const AnalyticsStack = createNativeStackNavigator()

const CellarsStackScreen = () => (
  <CellarsStack.Navigator screenOptions={{ headerShown: false }}>
    <CellarsStack.Screen name="CellarsList" component={CellarsScreen} />
    <CellarsStack.Screen name="SpacesList" component={SpacesListScreen} />
    <CellarsStack.Screen name="CreateSpace" component={CreateSpaceScreen} />
    <CellarsStack.Screen name="RoomSetup" component={RoomSetupScreen} />
    <CellarsStack.Screen name="FridgeSetup" component={FridgeSetupScreen} />
    <CellarsStack.Screen name="SpaceDetail" component={SpaceDetailScreen} />
    <CellarsStack.Screen name="CreateRack" component={CreateRackScreen} />
    <CellarsStack.Screen name="RackView" component={RackViewScreen} />
  </CellarsStack.Navigator>
)

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
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="Import"
      component={ImportScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="AddWineStep1"
      component={AddWineStep1}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="AddWineStep2"
      component={AddWineStep2}
      options={{ headerShown: false }}
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
      options={{ headerShown: false }}
    />
    <InventoryStack.Screen
      name="InventoryDetail"
      component={InventoryDetailScreen}
      options={{ title: 'Wine Details' }}
    />
    <InventoryStack.Screen
      name="WineDetail"
      component={WineDetailScreenV3}
      options={{ title: 'Wine Info', headerShown: false }}
    />
    <InventoryStack.Screen
      name="AddWishlistStep1"
      component={AddWishlistStep1}
      options={{ headerShown: false }}
    />
    <InventoryStack.Screen
      name="AddWishlistStep2"
      component={AddWishlistStep2}
      options={{ headerShown: false }}
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
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 88 : 72,
            paddingBottom: Platform.OS === 'ios' ? 24 : 12,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarActiveTintColor: '#722F37',
          tabBarInactiveTintColor: colors.muted[400],
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="InventoryTab"
          component={InventoryStackScreen}
          options={({ route }) => ({
            tabBarLabel: 'Inventory',
            tabBarIcon: ({ color }) => <ListIcon color={color} size={24} />,
            tabBarStyle: (() => {
              const routeName = getFocusedRouteNameFromRoute(route)
              // Hide tab bar on WineDetail screen
              if (routeName === 'WineDetail') {
                return { display: 'none' }
              }
              return {
                backgroundColor: colors.white,
                borderTopColor: colors.muted[200],
                borderTopWidth: 0,
                height: Platform.OS === 'ios' ? 88 : 72,
                paddingBottom: Platform.OS === 'ios' ? 24 : 12,
                paddingTop: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 10,
              }
            })(),
          })}
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
            tabBarLabel: '',
            tabBarIcon: () => <ScanButton />,
          }}
        />
        <Tab.Screen
          name="AnalyticsTab"
          component={AnalyticsStackScreen}
          options={{
            tabBarLabel: 'Analytics',
            tabBarIcon: ({ color }) => <ChartIcon color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="CellarsTab"
          component={CellarsStackScreen}
          options={{
            tabBarLabel: 'Cellars',
            tabBarIcon: ({ color }) => <CellarIcon color={color} size={24} />,
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
})
