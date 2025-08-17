import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeProvider';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import SellItemScreen from '../screens/SellItemScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import MapScreen from '../screens/MapScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for Marketplace flow
function MarketplaceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketplaceMain" component={MarketplaceScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen as any} />
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
}

// Stack navigator for Profile flow  
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen as any} />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Browse') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Sell') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EA580C', // Orange color
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: theme === 'light' ? 'white' : '#1f1f1f',
          borderTopWidth: 1,
          borderTopColor: theme === 'light' ? '#E5E7EB' : '#374151',
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Browse" 
        component={MarketplaceStack}
        options={{
          tabBarLabel: 'Browse',
        }}
      />
      
      <Tab.Screen 
        name="Sell" 
        component={SellItemScreen}
        options={{
          tabBarLabel: 'Sell'
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}