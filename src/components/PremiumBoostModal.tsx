import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';
import { useMarketplaceStore } from '../state/marketplaceStore';
import { PREMIUM_PRODUCTS } from '../api/in-app-purchase';

interface PremiumBoostModalProps {
  visible: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
}

export const PremiumBoostModal: React.FC<PremiumBoostModalProps> = ({
  visible,
  onClose,
  itemId,
  itemTitle
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const purchasePremiumBoost = useMarketplaceStore(state => state.purchasePremiumBoost);
  const premiumProduct = PREMIUM_PRODUCTS[0];

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      const success = await purchasePremiumBoost(itemId);
      
      if (success) {
        Alert.alert(
          'Purchase Successful!',
          'Your listing has been boosted to the top for 7 days.',
          [{ text: 'Great!', onPress: onClose }]
        );
      } else {
        Alert.alert(
          'Purchase Failed',
          'There was an issue processing your payment. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 pb-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-900">Premium Boost</Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#666" />
            </Pressable>
          </View>

          {/* Premium Badge */}
          <View className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="star" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Premium Listing</Text>
            </View>
            <Text className="text-white/90 text-sm">
              Move "{itemTitle}" to the top of search results for maximum visibility
            </Text>
          </View>

          {/* Features */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">What you get:</Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="arrow-up-circle" size={20} color="#22c55e" />
                <Text className="text-gray-700 ml-3">Featured at the top of listings</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="eye" size={20} color="#22c55e" />
                <Text className="text-gray-700 ml-3">Increased visibility and views</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#22c55e" />
                <Text className="text-gray-700 ml-3">7 days of premium placement</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="trending-up" size={20} color="#22c55e" />
                <Text className="text-gray-700 ml-3">Higher chance of quick sale</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">Premium Boost (7 days)</Text>
              <Text className="text-2xl font-bold text-gray-900">{premiumProduct.localizedPrice}</Text>
            </View>
          </View>

          {/* Purchase Button */}
          <Pressable
            onPress={handlePurchase}
            disabled={isProcessing}
            className={cn(
              "bg-blue-600 rounded-xl py-4 items-center justify-center",
              isProcessing && "opacity-50"
            )}
          >
            {isProcessing ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold text-lg ml-2">Processing...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">
                Purchase for {premiumProduct.localizedPrice}
              </Text>
            )}
          </Pressable>

          {/* Disclaimer */}
          <Text className="text-xs text-gray-500 text-center mt-4">
            Payment will be charged to your App Store account. Premium boost lasts 7 days from purchase.
          </Text>
        </View>
      </View>
    </Modal>
  );
};