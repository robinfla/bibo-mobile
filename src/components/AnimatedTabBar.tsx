import React from 'react'
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native'
import { CornersOut } from 'phosphor-react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '../theme/colors'

export const AnimatedTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const activeRoute = state.routes[state.index]

  // Separate scan tab from regular tabs
  const regularTabs = state.routes.filter((route) => {
    const { options } = descriptors[route.key]
    return route.name !== 'ScanTab' && options.tabBarLabel !== ''
  })

  const scanTab = state.routes.find((route) => {
    const { options } = descriptors[route.key]
    return route.name === 'ScanTab' || options.tabBarLabel === ''
  })

  // Hide tab bar when ScanTab is active
  if (activeRoute.name === 'ScanTab') {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Tab pill */}
      <View style={styles.tabPill}>
        {regularTabs.map((route) => {
          const { options } = descriptors[route.key]
          const routeIndex = state.routes.findIndex((r) => r.key === route.key)
          const isFocused = state.index === routeIndex

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          const IconComponent = options.tabBarIcon

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              {IconComponent && IconComponent({
                focused: isFocused,
                color: isFocused ? colors.brand.wine : colors.brand.tabInactive,
                size: 22,
              })}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Scan button — standalone pink circle */}
      {scanTab && (() => {
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: scanTab.key,
            canPreventDefault: true,
          })

          if (!event.defaultPrevented) {
            navigation.navigate(scanTab.name)
          }
        }

        return (
          <TouchableOpacity
            key={scanTab.key}
            accessibilityRole="button"
            accessibilityLabel="Scan wine label"
            onPress={onPress}
            style={styles.scanButton}
          >
            <CornersOut size={26} weight="bold" color={colors.brand.wine} />
          </TouchableOpacity>
        )
      })()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
})
