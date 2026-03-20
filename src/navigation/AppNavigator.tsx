import React, { useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { House, List, Compass, HouseLine, CornersOut } from 'phosphor-react-native'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme/colors'
import { LoginScreen } from '../screens/LoginScreen'
import { HomeScreen } from '../screens/home/HomeScreen'
import { InventoryScreen } from '../screens/inventory/InventoryScreen'
import { InventoryDetailScreen } from '../screens/inventory/InventoryDetailScreen'
import { WineDetailScreenV3 } from '../screens/wine/WineDetailScreenV3'
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen'
import { AnalyticsDetailScreen } from '../screens/analytics/AnalyticsDetailScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { ImportScreen } from '../screens/ImportScreen'
import { ScanWineModal } from '../screens/home/ScanWineModal'
import { AddWishlistStep1 } from '../screens/wishlist/AddWishlistStep1'
import { AddWishlistStep2 } from '../screens/wishlist/AddWishlistStep2'
import { AddWineStep1 } from '../screens/wine/AddWineStep1'
import { AddWineStep2 } from '../screens/wine/AddWineStep2'
import { AddWineSearchScreen } from '../screens/wine/AddWineSearchScreen'
import { AddWineNoResultsScreen } from '../screens/wine/AddWineNoResultsScreen'
import { CellarsScreen } from '../screens/cellars/CellarsScreen'
import { CellarLocateScreen } from '../screens/cellars/CellarLocateScreen'
import { SpacesListScreen } from '../screens/cellars/SpacesListScreen'
import { CreateSpaceScreen } from '../screens/cellars/CreateSpaceScreen'
import { SpaceDetailScreen } from '../screens/cellars/SpaceDetailScreen'
import { CreateRackScreen } from '../screens/cellars/CreateRackScreen'
import { RackViewScreen } from '../screens/cellars/RackViewScreen'
import { RoomSetupScreen } from '../screens/cellars/RoomSetupScreen'
import { FridgeSetupScreen } from '../screens/cellars/FridgeSetupScreen'
import { SommelierScreen } from '../screens/sommelier/SommelierScreen'
import { SommelierOnboardingScreen } from '../screens/sommelier/SommelierOnboardingScreen'
import { SommelierSettingsScreen } from '../screens/sommelier/SommelierSettingsScreen'
import { ConversationListScreen } from '../screens/sommelier/ConversationListScreen'
import { TasteProfileScreen } from '../screens/sommelier/TasteProfileScreen'
import { TasteProfileSummaryScreen } from '../screens/sommelier/TasteProfileSummaryScreen'
import { TasteProfileEmptyScreen } from '../screens/sommelier/TasteProfileEmptyScreen'
import { WineSearchScreen, KBWineDetailScreen } from '../screens/search'
import { WineScanCameraScreen } from '../screens/scan/WineScanCameraScreen'
import { WineScanLoadingScreen } from '../screens/scan/WineScanLoadingScreen'
import { WineScanResultScreen } from '../screens/scan/WineScanResultScreen'
import { QuickTastingReviewScreen } from '../screens/tasting/QuickTastingReviewScreen'
import { ComprehensiveTastingScreen } from '../screens/tasting/ComprehensiveTastingScreen'
import { AddToWishlistScreen } from '../screens/wishlist/AddToWishlistScreen'
import { AnimatedTabBar } from '../components/AnimatedTabBar'
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
const ScanStack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()


// Scan Stack Screen
const ScanStackScreen = () => (
  <ScanStack.Navigator screenOptions={{ headerShown: false }}>
    <ScanStack.Screen name="WineScanCamera" component={WineScanCameraScreen} />
    <ScanStack.Screen name="WineScanLoading" component={WineScanLoadingScreen} />
    <ScanStack.Screen name="WineScanResult" component={WineScanResultScreen} />
    <ScanStack.Screen name="QuickTastingReview" component={QuickTastingReviewScreen} />
    <ScanStack.Screen name="ComprehensiveTastingReview" component={ComprehensiveTastingScreen} />
    <ScanStack.Screen name="AddToWishlist" component={AddToWishlistScreen} />
    <ScanStack.Screen name="AddWine" component={AddWineSearchScreen} />
    <ScanStack.Screen name="AddWineSearch" component={AddWineSearchScreen} />
    <ScanStack.Screen name="AddWineNoResults" component={AddWineNoResultsScreen} />
    <ScanStack.Screen name="AddWineStep2" component={AddWineStep2} />
  </ScanStack.Navigator>
)

// Dummy screen — scan tab never actually renders, it opens a modal
const DummyScreen = () => <View />;


const CellarsStack = createNativeStackNavigator()
const AnalyticsStack = createNativeStackNavigator()
const SommelierStack = createNativeStackNavigator()

const CellarsStackScreen = () => (
  <CellarsStack.Navigator screenOptions={{ headerShown: false }}>
    <CellarsStack.Screen name="CellarsList" component={CellarsScreen} />
    <CellarsStack.Screen name="CellarLocate" component={CellarLocateScreen} />
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
      options={{ headerShown: false }}
    />
    <AnalyticsStack.Screen
      name="AnalyticsDetail"
      component={AnalyticsDetailScreen}
      options={{ headerShown: false }}
    />
  </AnalyticsStack.Navigator>
)

const SommelierStackScreen = () => (
  <SommelierStack.Navigator screenOptions={{ headerShown: false }}>
    <SommelierStack.Screen name="SommelierChat" component={SommelierScreen} />
    <SommelierStack.Screen name="TasteProfile" component={TasteProfileSummaryScreen} />
    <SommelierStack.Screen name="TasteProfileEmpty" component={TasteProfileEmptyScreen} />
    <SommelierStack.Screen name="SommelierOnboarding" component={SommelierOnboardingScreen} />
    <SommelierStack.Screen name="SommelierSettings" component={SommelierSettingsScreen} />
  </SommelierStack.Navigator>
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
      component={AddWineSearchScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="AddWineSearch"
      component={AddWineSearchScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="AddWineNoResults"
      component={AddWineNoResultsScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="AddWineStep2"
      component={AddWineStep2}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="Sommelier"
      component={SommelierScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="Analytics"
      component={AnalyticsScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="WineSearch"
      component={WineSearchScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="KBWineDetail"
      component={KBWineDetailScreen}
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
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Always pop to Home when tapping Home tab
              const state = navigation.getState()
              const homeRoute = state.routes.find(r => r.name === 'HomeTab')
              if (homeRoute?.state?.index && homeRoute.state.index > 0) {
                e.preventDefault()
                navigation.navigate('HomeTab', { screen: 'HomeMain' })
              }
            },
          })}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, focused }) => <House size={24} weight={focused ? 'fill' : 'regular'} color={color} />,
          }}
        />
        <Tab.Screen
          name="InventoryTab"
          component={InventoryStackScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // If already on InventoryTab and it has a navigation stack, pop to top
              const state = navigation.getState()
              const inventoryRoute = state.routes.find(r => r.name === 'InventoryTab')
              if (inventoryRoute?.state?.index && inventoryRoute.state.index > 0) {
                e.preventDefault()
                navigation.navigate('InventoryTab', { screen: 'InventoryList' })
              }
            },
          })}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route)
            // Hide tab bar on WineDetail screen for full immersion
            const hideTabBar = routeName === 'WineDetail'
            
            return {
              tabBarLabel: 'Inventory',
              tabBarIcon: ({ color, focused }) => <List size={24} weight={focused ? 'fill' : 'regular'} color={color} />,
              tabBarStyle: hideTabBar ? { display: 'none' } : undefined,
            }
          }}
        />
        <Tab.Screen
          name="ScanTab"
          component={ScanStackScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Navigate to camera screen
              navigation.navigate('ScanTab', { screen: 'WineScanCamera' })
            },
          })}
          options={{
            tabBarLabel: '',
            tabBarIcon: () => <CornersOut size={24} weight="bold" color={colors.coral} />,
          }}
        />
        <Tab.Screen
          name="SommelierTab"
          component={SommelierStackScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // If already on SommelierTab and it has a navigation stack, pop to top
              const state = navigation.getState()
              const sommelierRoute = state.routes.find(r => r.name === 'SommelierTab')
              if (sommelierRoute?.state?.index && sommelierRoute.state.index > 0) {
                e.preventDefault()
                navigation.navigate('SommelierTab', { screen: 'ConversationList' })
              }
            },
          })}
          options={{
            tabBarLabel: 'Guide',
            tabBarIcon: ({ color, focused }) => <Compass size={24} weight={focused ? 'fill' : 'regular'} color={color} />,
          }}
        />
        <Tab.Screen
          name="CellarsTab"
          component={CellarsStackScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // If already on CellarsTab and it has a navigation stack, pop to top
              const state = navigation.getState()
              const cellarsRoute = state.routes.find(r => r.name === 'CellarsTab')
              if (cellarsRoute?.state?.index && cellarsRoute.state.index > 0) {
                e.preventDefault()
                navigation.navigate('CellarsTab', { screen: 'CellarsList' })
              }
            },
          })}
          options={{
            tabBarLabel: 'Cellars',
            tabBarIcon: ({ color, focused }) => <HouseLine size={24} weight={focused ? 'fill' : 'regular'} color={color} />,
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
    <ActivityIndicator size="large" color={colors.coral} />
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
