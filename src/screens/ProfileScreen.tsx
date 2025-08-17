import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { auth, signOut, User } from '../api/firebase';
import { useMarketplaceStore } from '../state/marketplaceStore';
import { MarketplaceItem } from '../types/marketplace';
import { useTheme } from '../components/ThemeProvider';
import { useFollowStore } from '../state/followStore';

interface ProfileScreenProps {
  navigation: any;
}

const ListingCard = ({ 
  item, 
  onPress, 
  onEdit, 
  onDelete 
}: { 
  item: MarketplaceItem; 
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Pressable 
    onPress={onPress}
    className="bg-white rounded-lg border border-gray-200 p-4 mb-3 flex-row"
  >
    <Image
      source={{ uri: item.images[0] }}
      className="w-16 h-16 rounded-lg mr-4"
    />
    
    <View className="flex-1">
      <Text className="font-semibold text-gray-900" numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text className="text-orange-600 font-bold text-lg mt-1">
        {item.isTradeOnly ? 'Trade Only' : `$${item.price.toLocaleString()}`}
      </Text>
      
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-gray-500 text-sm">
          {item.views} views • {item.likes} likes
        </Text>
        
        {item.isSold && (
          <View className="bg-green-100 px-2 py-1 rounded">
            <Text className="text-green-800 text-xs font-medium">SOLD</Text>
          </View>
        )}
      </View>
    </View>
    
    <View className="flex-col items-center ml-2">
      <Pressable
        onPress={onEdit}
        className="w-8 h-8 items-center justify-center"
      >
        <Ionicons name="pencil" size={16} color="#6B7280" />
      </Pressable>
      
      <Pressable
        onPress={onDelete}
        className="w-8 h-8 items-center justify-center mt-1"
      >
        <Ionicons name="trash-outline" size={16} color="#EF4444" />
      </Pressable>
    </View>
  </Pressable>
);

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Pressable
      onPress={toggleTheme}
      className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
    >
      <Ionicons 
        name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} 
        size={20} 
        color={theme === 'light' ? '#374151' : '#F59E0B'} 
      />
    </Pressable>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: number; 
  icon: string 
}) => (
  <View className="bg-orange-50 rounded-lg p-4 items-center flex-1 mx-1">
    <Ionicons name={icon as any} size={24} color="#EA580C" />
    <Text className="text-orange-600 font-bold text-2xl mt-2">{value}</Text>
    <Text className="text-orange-800 text-sm font-medium">{title}</Text>
  </View>
);

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const user = auth.user;
  const { theme, colors } = useTheme();
  const { getUserListings, deleteItem, favoriteItems, markItemAsSold } = useMarketplaceStore();
  const { getFollowersCount, getFollowingCount } = useFollowStore();
  const [selectedTab, setSelectedTab] = useState<'active' | 'sold' | 'favorites'>('active');
  
  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Please log in to view profile</Text>
      </View>
    );
  }

  const userListings = getUserListings(user.uid);
  const activeListings = userListings.filter(item => !item.isSold);
  const soldListings = userListings.filter(item => item.isSold);
  const favoriteListings = useMarketplaceStore.getState().items.filter(item => 
    favoriteItems.includes(item.id)
  );

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteListing = (item: MarketplaceItem) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItem(item.id)
        }
      ]
    );
  };

  const handleEditListing = (item: MarketplaceItem) => {
    Alert.alert('Feature Coming Soon', 'Edit listing functionality will be available in a future update');
  };

  const handleMarkAsSold = (item: MarketplaceItem) => {
    Alert.alert(
      'Mark as Sold',
      'Mark this item as sold?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Sold',
          onPress: () => markItemAsSold(item.id)
        }
      ]
    );
  };

  const getCurrentListings = () => {
    switch (selectedTab) {
      case 'active':
        return activeListings;
      case 'sold':
        return soldListings;
      case 'favorites':
        return favoriteListings;
      default:
        return [];
    }
  };

  const renderListingItem = ({ item }: { item: MarketplaceItem }) => (
    <ListingCard
      item={item}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      onEdit={() => handleEditListing(item)}
      onDelete={() => handleDeleteListing(item)}
    />
  );

  return (
    <View 
      className="flex-1" 
      style={{ 
        paddingTop: insets.top,
        backgroundColor: theme === 'light' ? '#f9fafb' : '#000000'
      }}
    >
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View />
          <View className="flex-row items-center">
            <ThemeToggleButton />
            <Pressable
              onPress={handleSignOut}
              className="w-10 h-10 bg-red-100 rounded-full items-center justify-center ml-2"
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </Pressable>
          </View>
        </View>

        {/* User Info */}
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 bg-orange-500 rounded-full items-center justify-center mr-4">
            <Text className="text-white font-bold text-xl">
              {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-900">
              {user.displayName || 'User'}
            </Text>
            <Text className="text-gray-600">{user.email}</Text>
            <Text className="text-gray-500 text-sm mt-1">Member since 2024</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row">
          <StatCard title="Followers" value={getFollowersCount(user.uid)} icon="people-outline" />
          <StatCard title="Following" value={getFollowingCount(user.uid)} icon="person-add-outline" />
          <StatCard title="Active" value={activeListings.length} icon="storefront-outline" />
          <StatCard title="Sold" value={soldListings.length} icon="checkmark-circle-outline" />
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row px-4">
          {[
            { key: 'active', label: 'Active', count: activeListings.length },
            { key: 'sold', label: 'Sold', count: soldListings.length },
            { key: 'favorites', label: 'Favorites', count: favoriteListings.length }
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setSelectedTab(tab.key as any)}
              className={`flex-1 py-4 items-center border-b-2 ${
                selectedTab === tab.key 
                  ? 'border-orange-500' 
                  : 'border-transparent'
              }`}
            >
              <Text className={`font-medium ${
                selectedTab === tab.key 
                  ? 'text-orange-600' 
                  : 'text-gray-500'
              }`}>
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Listings */}
      <View className="flex-1 px-4 py-4">
        {getCurrentListings().length > 0 ? (
          <FlashList
            data={getCurrentListings()}
            renderItem={renderListingItem}
            estimatedItemSize={80}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons 
              name={
                selectedTab === 'active' ? "storefront-outline" :
                selectedTab === 'sold' ? "checkmark-circle-outline" : "heart-outline"
              } 
              size={64} 
              color="#D1D5DB" 
            />
            <Text className="text-gray-500 text-lg mt-4">
              {selectedTab === 'active' && 'No active listings'}
              {selectedTab === 'sold' && 'No sold items yet'}
              {selectedTab === 'favorites' && 'No favorites yet'}
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              {selectedTab === 'active' && 'Start selling by posting your first item'}
              {selectedTab === 'sold' && 'Items you mark as sold will appear here'}
              {selectedTab === 'favorites' && 'Items you like will appear here'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}