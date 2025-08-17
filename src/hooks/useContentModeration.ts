import { useState } from 'react';
import { 
  moderateMarketplaceItem, 
  getSafeFallbackImage 
} from '../utils/contentModeration';
import { MarketplaceItem } from '../types/marketplace';

export const useContentModeration = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Moderate a marketplace item before displaying
   */
  const moderateItem = async (item: MarketplaceItem): Promise<MarketplaceItem> => {
    setIsLoading(true);
    
    try {
      const moderation = await moderateMarketplaceItem({
        title: item.title,
        description: item.description,
        images: item.images,
        tags: item.tags
      });

      if (!moderation.isAppropriate) {
        console.warn(`Item ${item.id} flagged for moderation:`, moderation.reasons);
        
        // Replace inappropriate images with safe fallbacks
        const safeImages = item.images.map(() => 
          getSafeFallbackImage(item.category.toLowerCase())
        );

        return {
          ...item,
          images: safeImages,
          title: '[Content Under Review]',
          description: 'This item is currently under content review.',
          tags: ['under-review']
        };
      }

      return item;
    } catch (error) {
      console.error('Content moderation error:', error);
      return item; // Return original item if moderation fails
    } finally {
      setIsLoading(false);
    }
  };



  /**
   * Batch moderate multiple items
   */
  const moderateItems = async (items: MarketplaceItem[]): Promise<MarketplaceItem[]> => {
    setIsLoading(true);
    
    try {
      const moderatedItems = await Promise.all(
        items.map(item => moderateItem(item))
      );
      
      return moderatedItems.filter(item => item !== null);
    } catch (error) {
      console.error('Batch moderation error:', error);
      return items; // Return original items if moderation fails
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if an image URL is safe to display
   */
  const isImageSafe = (imageUrl: string): boolean => {
    const trustedDomains = [
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'source.unsplash.com'
    ];

    try {
      const url = new URL(imageUrl);
      return trustedDomains.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  /**
   * Get a safe image URL or fallback
   */
  const getSafeImageUrl = (imageUrl: string, category: string = 'default'): string => {
    if (isImageSafe(imageUrl)) {
      return imageUrl;
    }
    
    return getSafeFallbackImage(category);
  };

  return {
    moderateItem,

    moderateItems,
    isImageSafe,
    getSafeImageUrl,
    isLoading
  };
};

export default useContentModeration;