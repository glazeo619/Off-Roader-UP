export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  images: string[];
  location: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isSold: boolean;
  isTradeOnly: boolean;
  tradeFor?: string;
  views: number;
  likes: number;
  tags: string[];
  isPremium: boolean;
  premiumExpiresAt?: Date;
}

export enum ItemCategory {
  VEHICLES = 'vehicles',
  PARTS = 'parts', 
  ACCESSORIES = 'accessories',
  GEAR = 'gear',
  TOOLS = 'tools',
  TIRES = 'tires',
  CAMPING = 'camping',
  ELECTRONICS = 'electronics',
  OTHER = 'other'
}

export enum ItemCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  EXCELLENT = 'excellent', 
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  FOR_PARTS = 'for_parts'
}

export interface MarketplaceFilters {
  category?: ItemCategory;
  condition?: ItemCondition;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  searchQuery?: string;
  tradeOnly?: boolean;
}

export interface CreateItemData {
  title: string;
  description: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  images: string[];
  location: string;
  isTradeOnly: boolean;
  tradeFor?: string;
  tags: string[];
  isPremium?: boolean;
}

export interface PremiumPurchase {
  itemId: string;
  purchaseToken: string;
  receiptId: string;
  purchaseDate: Date;
  expiryDate: Date;
}