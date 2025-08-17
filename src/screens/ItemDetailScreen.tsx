import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Share,
  Alert,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMarketplaceStore } from '../state/marketplaceStore';
import { MarketplaceItem } from '../types/marketplace';
import { auth } from '../api/firebase';



const { width } = Dimensions.get('window');

interface ItemDetailScreenProps {
  navigation: any;
  route: {
    params: {
      itemId: string;
    };
  };
}

const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View className="relative">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      >
        {images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={{ width, height: 250 }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Image Indicators */}
      {images.length > 1 && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
          {images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </View>
      )}

      {/* Image Counter */}
      <View className="absolute top-4 right-4 bg-black/50 rounded-lg px-2 py-1">
        <Text className="text-white text-sm">
          {currentIndex + 1} / {images.length}
        </Text>
      </View>
    </View>
  );
};

const ActionButton = ({ 
  icon, 
  label, 
  onPress, 
  variant = 'secondary' 
}: { 
  icon: string; 
  label: string; 
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg ${
      variant === 'primary' 
        ? 'bg-orange-500' 
        : 'bg-gray-100'
    }`}
  >
    <Ionicons 
      name={icon as any} 
      size={20} 
      color={variant === 'primary' ? 'white' : '#374151'} 
    />
    <Text className={`font-semibold ml-2 ${
      variant === 'primary' ? 'text-white' : 'text-gray-700'
    }`}>
      {label}
    </Text>
  </Pressable>
);

export default function ItemDetailScreen({ navigation, route }: ItemDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { itemId } = route.params;
  const { items, favoriteItems, toggleFavorite } = useMarketplaceStore();
  const user = auth.user;

  const item = items.find(item => item.id === itemId);
  const isFavorite = favoriteItems.includes(itemId);
  const isOwnItem = item?.sellerId === user?.uid;

  if (!item) {
    return (
      <View className="flex-1 bg-white items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-lg">Item not found</Text>
        <Pressable 
          onPress={() => navigation.goBack()}
          className="mt-4 bg-orange-500 px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${item.title} on Off Roader Up! ${item.isTradeOnly ? 'Trade Only' : `${item.price.toLocaleString()}`}`,
        url: `offroadup://item/${item.id}` // Deep link
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContact = () => {
    if (isOwnItem) {
      Alert.alert('Your Item', 'This is your own listing');
      return;
    }

    Alert.alert(
      'Contact Seller',
      `How would you like to contact ${item.sellerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, you'd have phone numbers
            Alert.alert('Feature Coming Soon', 'Phone calling will be available in a future update');
          }
        },
        {
          text: 'Message',
          onPress: () => {
            // In a real app, you'd open a chat screen
            Alert.alert('Feature Coming Soon', 'Messaging will be available in a future update');
          }
        }
      ]
    );
  };

  const handleMakeOffer = () => {
    if (isOwnItem) {
      Alert.alert('Your Item', 'This is your own listing');
      return;
    }

    if (item.isTradeOnly) {
      Alert.alert(
        'Make Trade Offer',
        `This seller is looking for: ${item.tradeFor}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Trade Offer',
            onPress: () => {
              Alert.alert('Feature Coming Soon', 'Trade offers will be available in a future update');
            }
          }
        ]
      );
    } else {
      Alert.alert('Feature Coming Soon', 'Make offer feature will be available in a future update');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <View className="flex-row items-center">
          <Pressable
            onPress={() => toggleFavorite(itemId)}
            className="w-6 h-6 items-center justify-center"
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={14}
              color={isFavorite ? "#EF4444" : "#6B7280"}
            />
          </Pressable>
          
          <Pressable
            onPress={handleShare}
            className="w-6 h-6 items-center justify-center ml-2"
          >
            <Ionicons name="share-outline" size={14} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Images */}
        <ImageCarousel images={item.images} />

        {/* Content */}
        <View className="p-4">
          {/* Price and Title */}
          <View className="mb-4">
            <Text className="text-3xl font-bold text-orange-600 mb-2">
              {item.isTradeOnly ? 'Trade Only' : `$${item.price.toLocaleString()}`}
            </Text>
            <Text className="text-xl font-semibold text-gray-900 leading-6">
              {item.title}
            </Text>
          </View>

          {/* Trade Info */}
          {item.isTradeOnly && item.tradeFor && (
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <Text className="text-blue-800 font-medium mb-1">Looking to trade for:</Text>
              <Text className="text-blue-700">{item.tradeFor}</Text>
            </View>
          )}

          {/* Stats */}
          <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
            <View className="items-center">
              <Text className="text-gray-500 text-sm">Views</Text>
              <Text className="text-gray-900 font-semibold">{item.views}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-sm">Likes</Text>
              <Text className="text-gray-900 font-semibold">{item.likes}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-sm">Posted</Text>
              <Text className="text-gray-900 font-semibold">{formatDate(item.createdAt)}</Text>
            </View>
          </View>

          {/* Details */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Details</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Category</Text>
                <Text className="text-gray-900 font-medium capitalize">
                  {item.category.replace('_', ' ')}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Condition</Text>
                <Text className="text-gray-900 font-medium capitalize">
                  {item.condition.replace('_', ' ')}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Location</Text>
                <Text className="text-gray-900 font-medium">{item.location}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Description</Text>
            <Text className="text-gray-700 leading-6">{item.description}</Text>
          </View>

          {/* Tags */}
          {item.tags.length > 0 && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Tags</Text>
              <View className="flex-row flex-wrap">
                {item.tags.map((tag, index) => (
                  <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-gray-700 text-sm">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Seller Info */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-2">Seller</Text>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold">
                  {item.sellerName[0].toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{item.sellerName}</Text>
                <Text className="text-gray-600 text-sm">Member since 2024</Text>
              </View>
            </View>
          </View>


        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isOwnItem && (
        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="flex-row space-x-3">
            <ActionButton
              icon="chatbubble-outline"
              label="Contact"
              onPress={handleContact}
              variant="secondary"
            />
            <ActionButton
              icon={item.isTradeOnly ? "swap-horizontal-outline" : "cash-outline"}
              label={item.isTradeOnly ? "Make Trade Offer" : "Make Offer"}
              onPress={handleMakeOffer}
              variant="primary"
            />
          </View>
        </View>
      )}

      {isOwnItem && (
        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <Text className="text-orange-800 font-medium text-center">
              This is your listing
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}