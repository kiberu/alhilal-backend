import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { useGuestTheme } from '@/lib/guest/theme';

export default function TabLayout() {
  const theme = useGuestTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.palette.primary,
        tabBarInactiveTintColor: theme.palette.tabInactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16,
            backgroundColor: theme.palette.card,
            borderWidth: 1,
            borderColor: theme.palette.border,
            shadowColor: theme.palette.shadow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 12,
            height: 78,
            paddingTop: 8,
            paddingBottom: 16,
            borderRadius: 30,
          },
          default: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16,
            backgroundColor: theme.palette.card,
            borderWidth: 1,
            borderColor: theme.palette.border,
            shadowColor: theme.palette.shadow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 12,
            height: 74,
            paddingBottom: 12,
            paddingTop: 8,
            borderRadius: 30,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: 24,
          marginHorizontal: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: 'Journeys',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="guidance"
        options={{
          title: 'Guidance',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="trips" options={{ href: null }} />
      <Tabs.Screen name="lessons" options={{ href: null }} />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'menu' : 'menu-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
