import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useMarketplaceStore } from "../state/marketplaceStore";
import { ItemCategory, ItemCondition, CreateItemData } from "../types/marketplace";
import { auth } from "../api/firebase";
import { useTheme } from "../components/ThemeProvider";
import { moderateMarketplaceItem } from "../utils/contentModeration";

interface SellItemScreenProps {
  navigation: any;
}

const CategoryButton = ({ 
  category, 
  label, 
  icon,
  isSelected, 
  onPress 
}: { 
  category: ItemCategory; 
  label: string; 
  icon: string;
  isSelected: boolean; 
  onPress: () => void 
}) => (
  <Pressable
    onPress={onPress}
    className={`border rounded-lg p-2 mr-2 mb-2 min-w-16 items-center ${
      isSelected 
        ? 'border-orange-500 bg-orange-50' 
        : 'border-gray-200 bg-white'
    }`}
  >
    <Ionicons 
      name={icon as any} 
      size={16} 
      color={isSelected ? '#EA580C' : '#6B7280'} 
      style={{ marginBottom: 2 }}
    />
    <Text className={`text-xs font-medium ${
      isSelected ? 'text-orange-600' : 'text-gray-700'
    }`}>
      {label}
    </Text>
  </Pressable>
);

const ConditionButton = ({ 
  condition, 
  label, 
  isSelected, 
  onPress 
}: { 
  condition: ItemCondition; 
  label: string; 
  isSelected: boolean; 
  onPress: () => void 
}) => (
  <Pressable
    onPress={onPress}
    className={`border rounded-lg p-3 mr-3 mb-3 ${
      isSelected 
        ? 'border-orange-500 bg-orange-50' 
        : 'border-gray-200 bg-white'
    }`}
  >
    <Text className={`text-sm font-medium ${
      isSelected ? 'text-orange-600' : 'text-gray-700'
    }`}>
      {label}
    </Text>
  </Pressable>
);

export default function SellItemScreen({ navigation }: SellItemScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const { addItem } = useMarketplaceStore();
  const user = auth.user;

  const [formData, setFormData] = useState<Partial<CreateItemData>>({
    title: '',
    description: '',
    price: 0,
    location: '',
    isTradeOnly: false,
    tradeFor: '',
    tags: [],
    images: []
  });

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | null>(null);
  const [priceText, setPriceText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera state
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Lightweight feedback modal state
  const [modalState, setModalState] = useState<{visible: boolean; title: string; message: string}>({ visible: false, title: "", message: "" });

  const categories = [
    { key: ItemCategory.VEHICLES, label: 'Vehicles', icon: 'car-outline' },
    { key: ItemCategory.PARTS, label: 'Parts', icon: 'construct-outline' },
    { key: ItemCategory.TIRES, label: 'Tires', icon: 'ellipse-outline' },
    { key: ItemCategory.ACCESSORIES, label: 'Accessories', icon: 'hardware-chip-outline' },
    { key: ItemCategory.GEAR, label: 'Gear', icon: 'backpack-outline' },
    { key: ItemCategory.TOOLS, label: 'Tools', icon: 'hammer-outline' },
    { key: ItemCategory.CAMPING, label: 'Camping', icon: 'bonfire-outline' },
    { key: ItemCategory.ELECTRONICS, label: 'Electronics', icon: 'radio-outline' },
    { key: ItemCategory.OTHER, label: 'Other', icon: 'apps-outline' }
  ];

  const conditions = [
    { key: ItemCondition.NEW, label: 'New' },
    { key: ItemCondition.LIKE_NEW, label: 'Like New' },
    { key: ItemCondition.EXCELLENT, label: 'Excellent' },
    { key: ItemCondition.GOOD, label: 'Good' },
    { key: ItemCondition.FAIR, label: 'Fair' },
    { key: ItemCondition.POOR, label: 'Poor' },
    { key: ItemCondition.FOR_PARTS, label: 'For Parts' }
  ];

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      const imageUris = result.assets.map(asset => asset.uri);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imageUris].slice(0, 5) // Max 5 images
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const handlePriceChange = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setPriceText(numericText);
    setFormData(prev => ({
      ...prev,
      price: numericText ? parseFloat(numericText) : 0
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title?.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for your item.');
      return false;
    }
    
    if (!formData.description?.trim()) {
      Alert.alert('Missing Information', 'Please enter a description.');
      return false;
    }
    
    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a category.');
      return false;
    }
    
    if (!selectedCondition) {
      Alert.alert('Missing Information', 'Please select the item condition.');
      return false;
    }
    
    if (!formData.location?.trim()) {
      Alert.alert('Missing Information', 'Please enter your location.');
      return false;
    }
    
    if (!formData.isTradeOnly && (!formData.price || formData.price <= 0)) {
      Alert.alert('Missing Information', 'Please enter a valid price or select trade only.');
      return false;
    }
    
    if (!formData.images || formData.images.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one photo.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post an item.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const itemData: CreateItemData = {
        title: formData.title!,
        description: formData.description!,
        price: formData.isTradeOnly ? 0 : formData.price!,
        category: selectedCategory!,
        condition: selectedCondition!,
        images: formData.images!,
        location: formData.location!,
        isTradeOnly: formData.isTradeOnly!,
        tradeFor: formData.tradeFor,
        tags: formData.title!.toLowerCase().split(' ').filter(word => word.length > 2)
      };

      addItem(itemData, user.uid, user.displayName || user.email);
      
      Alert.alert(
        'Success!', 
        'Your item has been posted to the marketplace.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post your item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ 
        paddingTop: insets.top,
        backgroundColor: theme === 'light' ? '#ffffff' : '#000000'
      }}
    >
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ 
          borderBottomColor: theme === 'light' ? '#e5e7eb' : '#374151'
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme === 'light' ? '#374151' : '#f9fafb'} />
        </Pressable>
        <Text 
          className="text-lg font-semibold"
          style={{ color: theme === 'light' ? '#111827' : '#f9fafb' }}
        >
          Sell Item
        </Text>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg ${
            isSubmitting ? 'bg-gray-300' : 'bg-orange-500'
          }`}
        >
          <Text className="text-white font-medium">
            {isSubmitting ? 'Posting...' : 'Post'}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-6">
          {/* Photos */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Add Photo Buttons */}
              <Pressable
                onPress={handleImagePicker}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mr-3"
              >
                <Ionicons name="images-outline" size={22} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 mt-1">Library</Text>
              </Pressable>
              <Pressable
                onPress={() => setCameraVisible(true)}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mr-3"
              >
                <Ionicons name="camera-outline" size={22} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 mt-1">Camera</Text>
              </Pressable>
              
              {/* Image Previews */}
              {formData.images?.map((uri, index) => (
                <View key={index} className="relative mr-3">
                  <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                  <Pressable
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
            <Text className="text-sm text-gray-500 mt-2">
              Add up to 5 photos. First photo will be the main image.
            </Text>
          </View>

          {/* Title */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Title</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="e.g., 2018 Jeep Wrangler JL Rubicon"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              maxLength={80}
            />
          </View>

          {/* Category */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Category</Text>
            <View className="flex-row flex-wrap">
              {categories.map((category) => (
                <CategoryButton
                  key={category.key}
                  category={category.key}
                  label={category.label}
                  icon={category.icon}
                  isSelected={selectedCategory === category.key}
                  onPress={() => setSelectedCategory(category.key)}
                />
              ))}
            </View>
          </View>

          {/* Condition */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Condition</Text>
            <View className="flex-row flex-wrap">
              {conditions.map((condition) => (
                <ConditionButton
                  key={condition.key}
                  condition={condition.key}
                  label={condition.label}
                  isSelected={selectedCondition === condition.key}
                  onPress={() => setSelectedCondition(condition.key)}
                />
              ))}
            </View>
          </View>

          {/* Price / Trade */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Price</Text>
            
            {/* Trade Only Toggle */}
            <Pressable
              onPress={() => setFormData(prev => ({ ...prev, isTradeOnly: !prev.isTradeOnly }))}
              className="flex-row items-center mb-4"
            >
              <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                formData.isTradeOnly ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
              }`}>
                {formData.isTradeOnly && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text className="text-gray-700">Trade only (no cash)</Text>
            </Pressable>

            {!formData.isTradeOnly ? (
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
                <Text className="text-gray-700 text-lg">$</Text>
                <TextInput
                  value={priceText}
                  onChangeText={handlePriceChange}
                  placeholder="0"
                  keyboardType="numeric"
                  className="flex-1 ml-2 text-gray-900 text-lg"
                />
              </View>
            ) : (
              <TextInput
                value={formData.tradeFor}
                onChangeText={(text) => setFormData(prev => ({ ...prev, tradeFor: text }))}
                placeholder="What are you looking to trade for?"
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              />
            )}
          </View>

          {/* Description */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Description</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe your item in detail..."
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 h-24"
              textAlignVertical="top"
            />
          </View>

          {/* Location */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Location</Text>
            <TextInput
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="City, State"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View className="flex-1 bg-black">
          {/* Top bar */}
          <View className="absolute top-12 left-4 right-4 z-10 flex-row items-center justify-between">
            <Pressable
              onPress={() => setCameraVisible(false)}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => setFacing(prev => (prev === "back" ? "front" : "back"))}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Ionicons name="camera-reverse-outline" size={22} color="#ffffff" />
            </Pressable>
          </View>

          {permission?.granted ? (
            <CameraView
              ref={cameraRef as any}
              style={{ flex: 1 }}
              facing={facing}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-black">
              <Text className="text-white text-center text-base mb-4">
                We need your permission to use the camera
              </Text>
              <Pressable
                onPress={requestPermission}
                className="bg-orange-500 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">Grant Permission</Text>
              </Pressable>
            </View>
          )}

          {permission?.granted && (
            <View className="absolute bottom-12 left-0 right-0 items-center">
              <Pressable
                onPress={async () => {
                  try {
                    const photo = await (cameraRef.current as any)?.takePictureAsync?.({ quality: 0.8 });
                    if (photo?.uri) {
                      setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), photo.uri].slice(0, 5)
                      }));
                      setCameraVisible(false);
                    }
                  } catch (e) {}
                }}
                className="w-16 h-16 bg-white rounded-full items-center justify-center"
              >
                <Ionicons name="radio-button-on" size={32} color="#111827" />
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={modalState.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalState({ visible: false, title: "", message: "" })}
      >
        <View className="flex-1 bg-black/40 items-center justify-center">
          <View className="bg-white rounded-2xl p-5 w-11/12">
            <Text className="text-lg font-semibold text-gray-900">{modalState.title}</Text>
            <Text className="text-gray-600 mt-2">{modalState.message}</Text>
            <Pressable
              onPress={() => setModalState({ visible: false, title: "", message: "" })}
              className="mt-4 bg-orange-500 rounded-lg px-4 py-2 self-end"
            >
              <Text className="text-white font-medium">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
