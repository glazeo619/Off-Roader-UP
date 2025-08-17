import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  Image, 
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useMarketplaceStore } from '../state/marketplaceStore';
import { MarketplaceItem, ItemCategory } from '../types/marketplace';



import { useTheme } from '../components/ThemeProvider';
import { PremiumBoostModal } from '../components/PremiumBoostModal';
import { isPremiumActive } from '../api/in-app-purchase';


const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

interface MarketplaceScreenProps {
  navigation: any;
}



// Sort Options Component
const SortDropdown = ({ 
  selectedSort, 
  onSelectSort 
}: { 
  selectedSort: string; 
  onSelectSort: (sort: string) => void 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const sortOptions = [
    { key: 'recent', label: 'Recent', icon: 'time-outline' },
    { key: 'price_asc', label: 'Price: Low to High', icon: 'trending-up-outline' },
    { key: 'price_desc', label: 'Price: High to Low', icon: 'trending-down-outline' },
    { key: 'distance', label: 'Distance', icon: 'location-outline' }
  ];
  
  const selectedOption = sortOptions.find(opt => opt.key === selectedSort) || sortOptions[0];
  
  return (
    <View className="relative">
      <Pressable
        onPress={() => setShowDropdown(!showDropdown)}
        className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 py-2"
      >
        <Ionicons name={selectedOption.icon as any} size={16} color="#6B7280" />
        <Text className="text-gray-700 text-sm font-medium ml-2 flex-1">
          {selectedOption.label}
        </Text>
        <Ionicons 
          name={showDropdown ? "chevron-up-outline" : "chevron-down-outline"} 
          size={16} 
          color="#6B7280" 
        />
      </Pressable>
      
      {showDropdown && (
        <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10">
          {sortOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => {
                onSelectSort(option.key);
                setShowDropdown(false);
              }}
              className={`flex-row items-center px-3 py-3 border-b border-gray-100 ${
                selectedSort === option.key ? 'bg-orange-50' : ''
              }`}
            >
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={selectedSort === option.key ? '#EA580C' : '#6B7280'} 
              />
              <Text className={`ml-3 text-sm ${
                selectedSort === option.key ? 'text-orange-600 font-medium' : 'text-gray-700'
              }`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const CategoryChip = ({ 
  category, 
  icon,
  isSelected, 
  onPress 
}: { 
  category: string; 
  icon: string;
  isSelected: boolean; 
  onPress: () => void 
}) => (
  <Pressable
    onPress={onPress}
    className="items-center mr-4"
  >
    <View className={`w-12 h-12 rounded-lg items-center justify-center mb-1 ${
      isSelected 
        ? 'bg-orange-500' 
        : 'bg-white border border-gray-200'
    }`}>
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={isSelected ? 'white' : '#6B7280'} 
      />
    </View>
    <Text className={`text-xs font-medium ${
      isSelected ? 'text-orange-600' : 'text-gray-600'
    }`}>
      {category}
    </Text>
  </Pressable>
);

const ItemCard = ({ 
  item, 
  onPress, 
  onFavorite, 
  isFavorite,
  onPremiumBoost
}: { 
  item: MarketplaceItem; 
  onPress: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  onPremiumBoost?: () => void;
}) => (
  <Pressable 
    onPress={onPress}
    className="bg-white rounded-xl mb-4"
    style={{ width: ITEM_WIDTH }}
  >
    {/* Square Image */}
    <View className="relative">
      <Image
        source={{ uri: item.images[0] }}
        style={{ width: ITEM_WIDTH, height: ITEM_WIDTH }}
        className="rounded-xl"
        resizeMode="cover"
      />
      
      {/* Premium badge - top left */}
      {isPremiumActive(item.premiumExpiresAt) && (
        <View className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-2 py-1 flex-row items-center">
          <Ionicons name="star" size={12} color="white" />
          <Text className="text-white text-xs font-bold ml-1">Premium</Text>
        </View>
      )}
      
      {/* Price overlay - bottom left */}
      <View className="absolute bottom-2 left-2 bg-black/80 rounded px-2 py-1">
        <Text className="text-white text-sm font-bold">
          {item.isTradeOnly ? 'Trade' : `$${item.price.toLocaleString()}`}
        </Text>
      </View>
      
      {/* Favorite Button - top right */}
      <Pressable
        onPress={onFavorite}
        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm"
      >
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={16} 
          color={isFavorite ? "#EF4444" : "#6B7280"} 
        />
      </Pressable>
    </View>

    {/* Content below image */}
    <View className="px-2 py-2">
      {/* Title */}
      <Text className="font-semibold text-gray-900 text-sm mb-1" numberOfLines={2}>
        {item.title}
      </Text>
      
      {/* Location and Premium Boost Button */}
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center flex-1">
          <Ionicons name="location-outline" size={12} color="#9CA3AF" />
          <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>{item.location}</Text>
        </View>
        {onPremiumBoost && !isPremiumActive(item.premiumExpiresAt) && (
          <Pressable
            onPress={onPremiumBoost}
            className="bg-yellow-500 rounded px-2 py-1 ml-2"
          >
            <Text className="text-white text-xs font-bold">Boost</Text>
          </Pressable>
        )}
      </View>
      
      {/* Seller info */}
      <View className="flex-row items-center">
        <View className="w-4 h-4 bg-orange-500 rounded-full items-center justify-center mr-1">
          <Text className="text-white text-xs font-bold">
            {item.sellerName[0].toUpperCase()}
          </Text>
        </View>
        <Text className="text-gray-600 text-xs flex-1" numberOfLines={1}>
          {item.sellerName}
        </Text>
      </View>
    </View>
  </Pressable>
);

export default function MarketplaceScreen({ navigation }: MarketplaceScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { 
    getFilteredItems, 
    favoriteItems, 
    toggleFavorite, 
    filters, 
    setFilters,
    incrementViews 
  } = useMarketplaceStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [sortBy, setSortBy] = useState<string>('recent');


  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [selectedItemForBoost, setSelectedItemForBoost] = useState<MarketplaceItem | null>(null);
  
  const filteredItems = getFilteredItems();


  
  const categories = [
    { key: null, label: 'All', icon: 'grid-outline' },
    { key: ItemCategory.VEHICLES, label: 'Vehicles', icon: 'car-outline' },
    { key: ItemCategory.PARTS, label: 'Parts', icon: 'remove-outline' },
    { key: ItemCategory.TIRES, label: 'Tires', icon: 'disc' },
    { key: ItemCategory.ACCESSORIES, label: 'Accessories', icon: 'hardware-chip-outline' },
    { key: ItemCategory.GEAR, label: 'Gear', icon: 'git-pull-request-outline' },
    { key: ItemCategory.CAMPING, label: 'Camping', icon: 'bonfire-outline' }
  ];

  const handleSearch = () => {
    setFilters({ ...filters, searchQuery });
  };

  const handleCategorySelect = (category: ItemCategory | null) => {
    setSelectedCategory(category);
    setFilters({ ...filters, category: category || undefined });
    // Update ad based on category

  };

  const handleItemPress = (item: MarketplaceItem) => {
    incrementViews(item.id);
    navigation.navigate('ItemDetail', { itemId: item.id });
  };

  const handlePremiumBoost = (item: MarketplaceItem) => {
    setSelectedItemForBoost(item);
    setPremiumModalVisible(true);
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <ItemCard
      item={item}
      onPress={() => handleItemPress(item)}
      onFavorite={() => toggleFavorite(item.id)}
      isFavorite={favoriteItems.includes(item.id)}
      onPremiumBoost={() => handlePremiumBoost(item)}
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
      <View 
        className="px-4 py-4" 
        style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#1f1f1f' }}
      >

        
        {/* Search Bar */}
        <View 
          className="flex-row items-center rounded-xl px-4 py-3"
          style={{ backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151' }}
        >
          <Ionicons name="search-outline" size={20} color={theme === 'light' ? '#9CA3AF' : '#D1D5DB'} />
          <TextInput
            placeholder="Search vehicles, parts, gear..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            className="flex-1 ml-3"
            style={{ color: theme === 'light' ? '#111827' : '#F9FAFB' }}
            placeholderTextColor={theme === 'light' ? '#9CA3AF' : '#6B7280'}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => {
              setSearchQuery('');
              setFilters({ ...filters, searchQuery: undefined });
            }}>
              <Ionicons name="close-circle" size={20} color={theme === 'light' ? '#9CA3AF' : '#D1D5DB'} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Categories Filter and Advertisement Banner */}
      <View style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#1f1f1f' }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 pt-3 pb-3"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category.key || 'all'}
              category={category.label}
              icon={category.icon}
              isSelected={selectedCategory === category.key}
              onPress={() => handleCategorySelect(category.key)}
            />
          ))}
        </ScrollView>


      </View>

      {/* Sort and Results Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ 
          backgroundColor: theme === 'light' ? '#ffffff' : '#1f1f1f',
          borderBottomColor: theme === 'light' ? '#e5e7eb' : '#374151'
        }}
      >
        <View className="flex-1 mr-4">
          <Text 
            className="text-sm font-medium mb-2"
            style={{ color: theme === 'light' ? '#4b5563' : '#9ca3af' }}
          >
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </Text>
          <SortDropdown selectedSort={sortBy} onSelectSort={setSortBy} />
        </View>
        <Pressable 
          className="flex-row items-center"
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="location-outline" size={16} color="#EA580C" />
          <Text className="text-orange-600 text-sm font-medium ml-1">Near you</Text>
        </Pressable>
      </View>

      {/* Items Grid */}
      <View className="flex-1 px-4">
        <FlashList
          data={filteredItems}
          renderItem={renderItem}
          numColumns={2}
          ItemSeparatorComponent={() => <View className="w-4" />}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={280}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-20">
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 text-xl font-medium mt-4">No items found</Text>
              <Text className="text-gray-400 text-center mt-2 px-8">
                Try searching for something else or check back later for new listings
              </Text>
              <Pressable 
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setFilters({});
                }}
                className="mt-4 bg-orange-500 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-medium">Clear filters</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
      
      {/* Premium Boost Modal */}
      {selectedItemForBoost && (
        <PremiumBoostModal
          visible={premiumModalVisible}
          onClose={() => {
            setPremiumModalVisible(false);
            setSelectedItemForBoost(null);
          }}
          itemId={selectedItemForBoost.id}
          itemTitle={selectedItemForBoost.title}
        />
      )}
    </View>
  );
}