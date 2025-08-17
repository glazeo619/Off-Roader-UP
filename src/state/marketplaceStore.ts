import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MarketplaceItem, ItemCategory, ItemCondition, MarketplaceFilters, CreateItemData, PremiumPurchase } from '../types/marketplace';
import { purchasePremiumBoost, calculatePremiumExpiry, isPremiumActive } from '../api/in-app-purchase';

interface MarketplaceState {
  items: MarketplaceItem[];
  favoriteItems: string[];
  userListings: MarketplaceItem[];
  filters: MarketplaceFilters;
  isLoading: boolean;
  
  // Actions
  setItems: (items: MarketplaceItem[]) => void;
  addItem: (item: CreateItemData, userId: string, userName: string) => void;
  updateItem: (itemId: string, updates: Partial<MarketplaceItem>) => void;
  deleteItem: (itemId: string) => void;
  toggleFavorite: (itemId: string) => void;
  setFilters: (filters: MarketplaceFilters) => void;
  clearFilters: () => void;
  markItemAsSold: (itemId: string) => void;
  incrementViews: (itemId: string) => void;
  getFilteredItems: () => MarketplaceItem[];
  getUserListings: (userId: string) => MarketplaceItem[];
  purchasePremiumBoost: (itemId: string) => Promise<boolean>;
}

// Mock data generator
const generateMockData = (): MarketplaceItem[] => {
  const mockItems: MarketplaceItem[] = [
    {
      id: '1',
      title: 'Jeep Wrangler JK Lift Kit 4"',
      description: 'Complete 4 inch lift kit for Jeep Wrangler JK. Includes all hardware and installation instructions. Used for 6 months, excellent condition.',
      price: 850,
      category: ItemCategory.PARTS,
      condition: ItemCondition.EXCELLENT,
      images: [
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center'
      ],
      location: 'San Diego, CA',
      sellerId: 'seller1',
      sellerName: 'Mike\'s Jeep Parts',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      isSold: false,
      isTradeOnly: false,
      views: 45,
      likes: 8,
      tags: ['jeep', 'wrangler', 'lift', 'suspension'],
      isPremium: false
    },
    {
      id: '2',
      title: '2018 Ford F-150 Raptor',
      description: 'Low mileage Raptor with all the off-road goodies. Custom exhaust, LED light bars, and more. Garage kept, never been off-road.',
      price: 65000,
      category: ItemCategory.VEHICLES,
      condition: ItemCondition.EXCELLENT,
      images: [
        'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop&crop=center'
      ],
      location: 'Escondido, CA',
      sellerId: 'seller2',
      sellerName: 'John Smith',
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 5),
      isSold: false,
      isTradeOnly: false,
      views: 234,
      likes: 42,
      tags: ['ford', 'raptor', 'truck', 'off-road'],
      isPremium: false
    },
    {
      id: '3',
      title: 'BFGoodrich All-Terrain Tires 35x12.50R17',
      description: 'Set of 4 BFG All-Terrain tires. About 70% tread remaining. Great for daily driving and light off-roading.',
      price: 600,
      category: ItemCategory.TIRES,
      condition: ItemCondition.GOOD,
      images: [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop&crop=center'
      ],
      location: 'Chula Vista, CA',
      sellerId: 'seller3',
      sellerName: 'Desert Wheels',
      createdAt: new Date(Date.now() - 86400000 * 1),
      updatedAt: new Date(Date.now() - 86400000 * 1),
      isSold: false,
      isTradeOnly: false,
      views: 67,
      likes: 12,
      tags: ['tires', 'bfgoodrich', 'all-terrain', '35s'],
      isPremium: false
    },
    {
      id: '4',
      title: 'Warn VR EVO 10 Winch',
      description: 'Brand new Warn VR EVO 10,000 lb winch. Never used, still in box. Will trade for camping gear or cash.',
      price: 950,
      category: ItemCategory.ACCESSORIES,
      condition: ItemCondition.NEW,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center'
      ],
      location: 'La Mesa, CA',
      sellerId: 'seller4',
      sellerName: 'Trail Gear Co',
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(Date.now() - 86400000 * 3),
      isSold: false,
      isTradeOnly: false,
      tradeFor: 'RTT or camping equipment',
      views: 89,
      likes: 15,
      tags: ['winch', 'warn', 'recovery', 'accessories'],
      isPremium: false
    },
    {
      id: '5',
      title: 'Roof Top Tent - CVT Mt. Shasta',
      description: 'Awesome roof top tent for 2-3 people. Used on a few trips, great condition. Includes ladder and cover.',
      price: 0,
      category: ItemCategory.CAMPING,
      condition: ItemCondition.EXCELLENT,
      images: [
        'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=400&h=300&fit=crop&crop=center'
      ],
      location: 'El Cajon, CA',
      sellerId: 'seller5',
      sellerName: 'Adventure Seeker',
      createdAt: new Date(Date.now() - 86400000 * 4),
      updatedAt: new Date(Date.now() - 86400000 * 4),
      isSold: false,
      isTradeOnly: true,
      tradeFor: 'Jeep parts or tools',
      views: 123,
      likes: 28,
      tags: ['camping', 'rtt', 'roof-tent', 'overlanding'],
      isPremium: false
    }
  ];
  return mockItems;
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      items: generateMockData(),
      favoriteItems: [],
      userListings: [],
      filters: {},
      isLoading: false,

      setItems: (items) => set({ items }),

      addItem: (itemData, userId, userName) => {
        const newItem: MarketplaceItem = {
          ...itemData,
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          sellerId: userId,
          sellerName: userName,
          createdAt: new Date(),
          updatedAt: new Date(),
          isSold: false,
          views: 0,
          likes: 0,
          isPremium: itemData.isPremium || false,
        };
        
        set((state) => ({
          items: [newItem, ...state.items],
          userListings: [newItem, ...state.userListings]
        }));
      },

      updateItem: (itemId, updates) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
          userListings: state.userListings.map(item =>
            item.id === itemId
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          )
        }));
      },

      deleteItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId),
          userListings: state.userListings.filter(item => item.id !== itemId),
          favoriteItems: state.favoriteItems.filter(id => id !== itemId)
        }));
      },

      toggleFavorite: (itemId) => {
        set((state) => ({
          favoriteItems: state.favoriteItems.includes(itemId)
            ? state.favoriteItems.filter(id => id !== itemId)
            : [...state.favoriteItems, itemId]
        }));
      },

      setFilters: (filters) => set({ filters }),

      clearFilters: () => set({ filters: {} }),

      markItemAsSold: (itemId) => {
        get().updateItem(itemId, { isSold: true });
      },

      incrementViews: (itemId) => {
        const item = get().items.find(item => item.id === itemId);
        if (item) {
          get().updateItem(itemId, { views: item.views + 1 });
        }
      },

      getFilteredItems: () => {
        const { items, filters } = get();
        let filteredItems = [...items];

        if (filters.category) {
          filteredItems = filteredItems.filter(item => item.category === filters.category);
        }

        if (filters.condition) {
          filteredItems = filteredItems.filter(item => item.condition === filters.condition);
        }

        if (filters.minPrice !== undefined) {
          filteredItems = filteredItems.filter(item => item.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined) {
          filteredItems = filteredItems.filter(item => item.price <= filters.maxPrice!);
        }

        if (filters.tradeOnly) {
          filteredItems = filteredItems.filter(item => item.isTradeOnly);
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredItems = filteredItems.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }

        // Sort premium items to top, then by creation date
        filteredItems.sort((a, b) => {
          const aIsPremiumActive = isPremiumActive(a.premiumExpiresAt);
          const bIsPremiumActive = isPremiumActive(b.premiumExpiresAt);
          
          if (aIsPremiumActive && !bIsPremiumActive) return -1;
          if (!aIsPremiumActive && bIsPremiumActive) return 1;
          
          // Handle both Date objects and string dates from storage
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          
          return bTime - aTime;
        });
        
        return filteredItems.filter(item => !item.isSold);
      },

      getUserListings: (userId) => {
        return get().items.filter(item => item.sellerId === userId);
      },

      purchasePremiumBoost: async (itemId) => {
        try {
          const result = await purchasePremiumBoost(itemId);
          
          if (result.success) {
            const premiumExpiresAt = calculatePremiumExpiry();
            get().updateItem(itemId, {
              isPremium: true,
              premiumExpiresAt
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Premium purchase failed:', error);
          return false;
        }
      }
    }),
    {
      name: 'marketplace-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoriteItems: state.favoriteItems,
        userListings: state.userListings,
        // Don't persist mock items, only user-created ones
        items: state.items.filter(item => item.sellerId !== 'seller1' && 
                                        item.sellerId !== 'seller2' && 
                                        item.sellerId !== 'seller3' &&
                                        item.sellerId !== 'seller4' &&
                                        item.sellerId !== 'seller5')
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.items = state.items.map(item => ({
            ...item,
            createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
            updatedAt: item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt),
            premiumExpiresAt: item.premiumExpiresAt && !(item.premiumExpiresAt instanceof Date) 
              ? new Date(item.premiumExpiresAt) 
              : item.premiumExpiresAt
          }));
          
          state.userListings = state.userListings.map(item => ({
            ...item,
            createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
            updatedAt: item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt),
            premiumExpiresAt: item.premiumExpiresAt && !(item.premiumExpiresAt instanceof Date) 
              ? new Date(item.premiumExpiresAt) 
              : item.premiumExpiresAt
          }));
          
          // Merge persisted user items with fresh mock data
          const mockData = generateMockData();
          state.items = [...state.items, ...mockData];
        }
      }
    }
  )
);