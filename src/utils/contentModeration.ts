import { getOpenAIChatResponse } from '../api/chat-service';

export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  reasons: string[];
  category: 'safe' | 'inappropriate' | 'explicit' | 'violent' | 'spam';
}

// Whitelist of trusted domains for images
const TRUSTED_DOMAINS = [
  'images.unsplash.com',
  'via.placeholder.com',
  'picsum.photos',
  'source.unsplash.com',
  // Add your own trusted CDN domains here
];

// Blacklisted keywords that indicate inappropriate content
const INAPPROPRIATE_KEYWORDS = [
  'nude', 'naked', 'nsfw', 'adult', 'porn', 'sex', 'explicit',
  'bikini', 'lingerie', 'underwear', 'topless', 'bare',
  'violence', 'weapon', 'gun', 'knife', 'blood', 'gore',
  'drug', 'marijuana', 'cocaine', 'pills', 'smoking',
  'hate', 'racist', 'nazi', 'offensive'
];

// Safe keywords for off-road marketplace
const SAFE_KEYWORDS = [
  'jeep', 'truck', 'suv', 'tire', 'wheel', 'engine', 'part',
  'camping', 'tent', 'gear', 'tool', 'winch', 'bumper',
  'lift', 'suspension', 'light', 'bar', 'roof', 'rack'
];

/**
 * Check if an image URL is from a trusted domain
 */
export const isTrustedDomain = (imageUrl: string): boolean => {
  try {
    const url = new URL(imageUrl);
    return TRUSTED_DOMAINS.some(domain => url.hostname.includes(domain));
  } catch {
    return false;
  }
};

/**
 * Analyze text content for inappropriate material
 */
export const moderateText = (text: string): ModerationResult => {
  const lowerText = text.toLowerCase();
  const inappropriateMatches = INAPPROPRIATE_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword)
  );
  
  const safeMatches = SAFE_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword)
  );

  if (inappropriateMatches.length > 0) {
    return {
      isAppropriate: false,
      confidence: 0.9,
      reasons: [`Contains inappropriate keywords: ${inappropriateMatches.join(', ')}`],
      category: 'inappropriate'
    };
  }

  if (safeMatches.length > 2) {
    return {
      isAppropriate: true,
      confidence: 0.8,
      reasons: ['Contains safe marketplace keywords'],
      category: 'safe'
    };
  }

  return {
    isAppropriate: true,
    confidence: 0.6,
    reasons: ['No inappropriate content detected'],
    category: 'safe'
  };
};

/**
 * Moderate image using URL analysis and trusted domains
 */
export const moderateImageWithAI = async (imageUrl: string, description?: string): Promise<ModerationResult> => {
  try {
    // Treat local/device images as safe (cannot verify domain)
    const lower = imageUrl.toLowerCase();
    if (lower.startsWith('file://') || lower.startsWith('content://') || lower.startsWith('assets-library://') || lower.startsWith('ph://') || lower.startsWith('data:image')) {
      return {
        isAppropriate: true,
        confidence: 0.8,
        reasons: ['Local device image assumed safe'],
        category: 'safe'
      };
    }

    // First check if it's from a trusted domain
    if (isTrustedDomain(imageUrl)) {
      return {
        isAppropriate: true,
        confidence: 0.9,
        reasons: ['Image from trusted domain'],
        category: 'safe'
      };
    }

    // Check URL for inappropriate keywords
    const urlLower = imageUrl.toLowerCase();
    const inappropriateInUrl = INAPPROPRIATE_KEYWORDS.some(keyword => 
      urlLower.includes(keyword)
    );

    if (inappropriateInUrl) {
      return {
        isAppropriate: false,
        confidence: 0.8,
        reasons: ['URL contains inappropriate keywords'],
        category: 'inappropriate'
      };
    }

    // If description is provided, moderate it
    if (description) {
      const textModeration = moderateText(description);
      if (!textModeration.isAppropriate) {
        return {
          ...textModeration,
          reasons: ['Image description contains inappropriate content']
        };
      }
    }

    // For non-trusted domains, use AI text analysis of the description
    if (description) {
      try {
        const prompt = `Analyze this image description for content moderation in a family-friendly off-road marketplace: "${description}". 
        
Is this appropriate for a marketplace selling vehicles, parts, tires, camping gear, and off-road accessories? 
Respond with only "APPROPRIATE" or "INAPPROPRIATE" followed by a brief reason.`;

        const response = await getOpenAIChatResponse(prompt);
        const isAppropriate = response.content.toUpperCase().includes('APPROPRIATE');
        
        return {
          isAppropriate,
          confidence: 0.7,
          reasons: [response.content],
          category: isAppropriate ? 'safe' : 'inappropriate'
        };
      } catch (error) {
        console.error('AI moderation error:', error);
      }
    }

    // Default to requiring manual review for non-trusted domains
    return {
      isAppropriate: false,
      confidence: 0.5,
      reasons: ['Image from untrusted domain requires manual review'],
      category: 'inappropriate'
    };
  } catch (error) {
    console.error('Content moderation error:', error);
    // Default to safe if moderation fails
    return {
      isAppropriate: true,
      confidence: 0.3,
      reasons: ['Moderation service unavailable, defaulting to safe'],
      category: 'safe'
    };
  }
};

/**
 * Comprehensive content moderation for marketplace items
 */
export const moderateMarketplaceItem = async (item: {
  title: string;
  description: string;
  images: string[];
  tags: string[];
}): Promise<ModerationResult> => {
  // Moderate text content
  const textContent = `${item.title} ${item.description} ${item.tags.join(' ')}`;
  const textModeration = moderateText(textContent);
  
  if (!textModeration.isAppropriate) {
    return textModeration;
  }

  // Moderate images
  for (const imageUrl of item.images) {
    const imageModeration = await moderateImageWithAI(imageUrl, item.title);
    if (!imageModeration.isAppropriate) {
      return imageModeration;
    }
  }

  return {
    isAppropriate: true,
    confidence: 0.8,
    reasons: ['All content passed moderation checks'],
    category: 'safe'
  };
};



/**
 * Get safe fallback image for inappropriate content
 */
export const getSafeFallbackImage = (category: string): string => {
  const fallbackImages = {
    vehicles: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
    parts: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    tires: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    accessories: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    gear: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    camping: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=300&fit=crop',
    default: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop'
  };
  
  return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.default;
};