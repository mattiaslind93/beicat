import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';

import { useT } from '@/i18n';
import type { DeparturesStackParamList, RootTabParamList } from '@/navigation/types';
import { DeparturesScreen } from '@/screens/DeparturesScreen';
import { DisruptionsScreen } from '@/screens/DisruptionsScreen';
import { MapScreen } from '@/screens/MapScreen';
import { MoreScreen } from '@/screens/MoreScreen';
import { StopDetailScreen } from '@/screens/StopDetailScreen';
import { TripSearchScreen } from '@/screens/TripSearchScreen';
import { useServiceAlerts } from '@/hooks/queries';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const DeparturesStack = createNativeStackNavigator<DeparturesStackParamList>();

function DeparturesStackNavigator() {
  const t = useT();
  return (
    <DeparturesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
      }}
    >
      <DeparturesStack.Screen
        name="DeparturesHome"
        component={DeparturesScreen}
        options={{ title: t.departures.title }}
      />
      <DeparturesStack.Screen name="StopDetail" component={StopDetailScreen} />
    </DeparturesStack.Navigator>
  );
}

function tabIcon(glyph: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ fontSize: 20, color }}>{glyph}</Text>
  );
}

export function RootNavigator() {
  const t = useT();
  const { data: alerts } = useServiceAlerts();
  const alertCount = alerts?.length ?? 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          title: t.map.title,
          tabBarLabel: t.tabs.map,
          tabBarIcon: tabIcon('🗺'),
        }}
      />
      <Tab.Screen
        name="DeparturesTab"
        component={DeparturesStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: t.tabs.departures,
          tabBarIcon: tabIcon('🚌'),
        }}
      />
      <Tab.Screen
        name="TripTab"
        component={TripSearchScreen}
        options={{
          title: t.trip.title,
          tabBarLabel: t.tabs.trip,
          tabBarIcon: tabIcon('🧭'),
        }}
      />
      <Tab.Screen
        name="DisruptionsTab"
        component={DisruptionsScreen}
        options={{
          title: t.disruptions.title,
          tabBarLabel: t.tabs.disruptions,
          tabBarIcon: tabIcon('⚠️'),
          tabBarBadge: alertCount > 0 ? alertCount : undefined,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreScreen}
        options={{
          title: t.more.title,
          tabBarLabel: t.tabs.more,
          tabBarIcon: tabIcon('⋯'),
        }}
      />
    </Tab.Navigator>
  );
}
