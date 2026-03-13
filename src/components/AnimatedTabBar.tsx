import React, { useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Platform, Animated, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '../theme/colors'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCAN_BUTTON_WIDTH = 48
const SCAN_MARGIN = 8
const DIVIDER_WIDTH = 25 // 1px divider + 12px margin on each side
const CONTAINER_PADDING = 24 // 12px on each side

export const AnimatedTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const blobPosition = useRef(new Animated.Value(0)).current
  const blobScale = useRef(new Animated.Value(1)).current

  // Separate scan tab from regular tabs
  const regularTabs = state.routes.filter((route) => {
    const { options } = descriptors[route.key]
    return route.name !== 'ScanTab' && options.tabBarLabel !== ''
  })
  
  const scanTab = state.routes.find((route) => {
    const { options } = descriptors[route.key]
    return route.name === 'ScanTab' || options.tabBarLabel === ''
  })

  // Find active index among regular tabs only
  const activeRoute = state.routes[state.index]
  const activeRegularIndex = regularTabs.findIndex((route) => route.key === activeRoute.key)

  useEffect(() => {
    // Only animate blob if active tab is a regular tab (not scan)
    if (activeRegularIndex >= 0) {
      // Animate blob to active tab position
      Animated.spring(blobPosition, {
        toValue: activeRegularIndex,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start()

      // Pulse animation when changing tabs
      Animated.sequence([
        Animated.timing(blobScale, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(blobScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [activeRegularIndex])

  // Removed continuous floating animation - blob should stay still when focused

  // Calculate available width for regular tabs
  // Screen width - container margins (32px) - container padding (24px) - scan button - scan margin - divider
  const regularTabsWidth = SCREEN_WIDTH - 32 - CONTAINER_PADDING - SCAN_BUTTON_WIDTH - SCAN_MARGIN - DIVIDER_WIDTH
  const singleTabWidth = regularTabsWidth / regularTabs.length
  
  // Create array of blob positions in pixels (offset by left padding)
  const blobPositions = regularTabs.map((_, index) => {
    return (index * singleTabWidth) + (singleTabWidth / 2) + 12 // +12 for container paddingLeft
  })

  const blobTranslateX = blobPosition.interpolate({
    inputRange: regularTabs.map((_, index) => index),
    outputRange: blobPositions,
  })

  return (
    <View style={styles.container}>
      {/* Animated active tab background pill */}
      <Animated.View
        style={[
          styles.blobContainer,
          {
            transform: [
              { translateX: blobTranslateX },
              { scale: blobScale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(114, 47, 55, 0.12)', 'rgba(148, 70, 84, 0.18)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.blob}
        />
      </Animated.View>

      {/* Main tabs container */}
      <View style={styles.tabsContainer}>
        {/* Regular tabs on the left */}
        <View style={styles.regularTabsContainer}>
          {regularTabs.map((route) => {
            const { options } = descriptors[route.key]
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name

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
                <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                  {IconComponent && IconComponent({
                    focused: isFocused,
                    color: isFocused ? '#722F37' : colors.muted[400],
                    size: 20,
                  })}
                </View>
                {typeof label === 'string' && label && (
                  <Animated.Text
                    style={[
                      styles.label,
                      { color: isFocused ? '#722F37' : colors.muted[400] },
                    ]}
                  >
                    {label}
                  </Animated.Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Divider */}
        {scanTab && (
          <View style={styles.divider} />
        )}

        {/* Scan button on the right */}
        {scanTab && (() => {
          const { options } = descriptors[scanTab.key]
          const IconComponent = options.tabBarIcon

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
              onPress={onPress}
              style={styles.scanButton}
            >
              {IconComponent && IconComponent({
                focused: false,
                color: '#722F37',
                size: 20,
              })}
            </TouchableOpacity>
          )
        })()}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 16,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  blobContainer: {
    position: 'absolute',
    top: 8,
    left: -30, // Half of blob width to center it
    width: 60,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  regularTabsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.muted[200],
    marginHorizontal: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    marginLeft: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    transform: [{ scale: 1.05 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
})
