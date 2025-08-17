import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMarketplaceStore } from '../state/marketplaceStore';
import { MarketplaceItem } from '../types/marketplace';

const { width, height } = Dimensions.get('window');

interface MapScreenProps {
  navigation: any;
}

// Mock coordinates for San Diego area items
const mockItemLocations = [
  { id: '1', lat: 32.7157, lng: -117.1611, title: 'Jeep Wrangler JK Lift Kit 4"', price: 850 },
  { id: '2', lat: 32.7353, lng: -117.1490, title: '2018 Ford F-150 Raptor', price: 65000 },
  { id: '3', lat: 32.6981, lng: -117.1320, title: 'BFGoodrich All-Terrain Tires', price: 600 },
  { id: '4', lat: 32.7503, lng: -117.1230, title: 'Warn VR EVO 10 Winch', price: 950 },
  { id: '5', lat: 32.6851, lng: -117.1839, title: 'ARB Roof Top Tent', price: 1200 },
  { id: '6', lat: 32.7767, lng: -117.0711, title: 'Fox Racing Shocks', price: 1800 },
  { id: '7', lat: 32.6400, lng: -117.0841, title: 'Yakima Roof Rack System', price: 450 },
  { id: '8', lat: 32.8153, lng: -117.1350, title: 'Rigid LED Light Bar', price: 320 },
];

export default function MapScreen({ navigation }: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const { getFilteredItems } = useMarketplaceStore();
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(10);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const radiusOptions = [5, 10, 25, 50, 100];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getItemsInRadius = () => {
    if (!location) return [];
    
    return mockItemLocations.filter(item => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        item.lat,
        item.lng
      );
      return distance <= radiusMiles;
    });
  };

  const handleMarkerPress = (item: any) => {
    setSelectedItem(item);
  };

  const handleItemPress = (itemId: string) => {
    navigation.navigate('ItemDetail', { itemId });
  };

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50" style={{ paddingTop: insets.top }}>
        <Ionicons name="location-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-xl font-medium mt-4">Location Access Required</Text>
        <Text className="text-gray-400 text-center mt-2 px-8">
          Please enable location permissions to see nearby items
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-lg">Getting your location...</Text>
      </View>
    );
  }

  const itemsInRadius = getItemsInRadius();

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-gray-900">Near Me</Text>
          <Pressable 
            onPress={() => navigation.goBack()}
            className="w-8 h-8 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>
        
        {/* Radius Selector */}
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm font-medium mr-3">Radius:</Text>
          <View className="flex-row">
            {radiusOptions.map((radius) => (
              <Pressable
                key={radius}
                onPress={() => setRadiusMiles(radius)}
                className={`px-3 py-1 rounded-full mr-2 ${
                  radiusMiles === radius 
                    ? 'bg-orange-500' 
                    : 'bg-gray-100'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  radiusMiles === radius 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}>
                  {radius}mi
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Map */}
      <View className="flex-1">
        <MapView
          style={{ width, height: height - 200 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Radius Circle */}
          <Circle
            center={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            radius={radiusMiles * 1609.34} // Convert miles to meters
            strokeColor="rgba(255, 107, 53, 0.5)"
            fillColor="rgba(255, 107, 53, 0.1)"
            strokeWidth={2}
          />
          
          {/* Item Markers */}
          {itemsInRadius.map((item) => (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.lat, longitude: item.lng }}
              onPress={() => handleMarkerPress(item)}
            >
              <View className="bg-orange-500 rounded-full w-8 h-8 items-center justify-center border-2 border-white">
                <Text className="text-white text-xs font-bold">$</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Selected Item Card */}
      {selectedItem && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
                {selectedItem.title}
              </Text>
              <Text className="text-orange-600 font-bold text-lg">
                ${selectedItem.price.toLocaleString()}
              </Text>
              <Text className="text-gray-500 text-sm">
                {calculateDistance(
                  location.coords.latitude,
                  location.coords.longitude,
                  selectedItem.lat,
                  selectedItem.lng
                ).toFixed(1)} miles away
              </Text>
            </View>
            <View className="flex-row">
              <Pressable
                onPress={() => setSelectedItem(null)}
                className="w-10 h-10 items-center justify-center mr-2"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
              <Pressable
                onPress={() => handleItemPress(selectedItem.id)}
                className="bg-orange-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">View</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Items Count */}
      <View className="absolute top-20 right-4 bg-white rounded-full px-3 py-2 shadow-sm border border-gray-200">
        <Text className="text-gray-700 text-sm font-medium">
          {itemsInRadius.length} items
        </Text>
      </View>
    </View>
  );
}