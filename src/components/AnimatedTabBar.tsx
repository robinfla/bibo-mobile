import React, { useEffect, useRef } from 'react'
import { View, TouchableOpacity, Platform, Animated, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '../theme/colors'

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

  // Continuous floating animation
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const regularTabWidth = 100 / regularTabs.length

  const blobTranslateX = blobPosition.interpolate({
    inputRange: [0, regularTabs.length - 1],
    outputRange: [regularTabWidth / 2, ((regularTabs.length - 1) * regularTabWidth) + (regularTabWidth / 2)],
  })

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  })

  return (
    <View style={styles.container}>
      {/* Animated gradient blob */}
      <Animated.View
        style={[
          styles.blobContainer,
          {
            width: `${regularTabWidth}%`,
            transform: [
              { translateX: blobTranslateX },
              { translateY: floatY },
              { scale: blobScale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(114, 47, 55, 0.15)', 'rgba(148, 70, 84, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
                    size: 24,
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
                size: 24,
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
    backgroundColor: colors.white,
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
  },
  blobContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  regularTabsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.muted[200],
    marginHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  scanButton: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
})
