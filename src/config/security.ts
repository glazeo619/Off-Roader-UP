/**
 * Security configuration for content moderation
 */

export const SECURITY_CONFIG = {
  // Trusted domains for images
  TRUSTED_IMAGE_DOMAINS: [
    'images.unsplash.com',
    'via.placeholder.com',
    'picsum.photos',
    'source.unsplash.com',
    // Add your own CDN domains here
  ],

  // Content moderation settings
  MODERATION: {
    ENABLE_AI_MODERATION: true,
    ENABLE_KEYWORD_FILTERING: true,
    ENABLE_DOMAIN_FILTERING: true,
    DEFAULT_TO_SAFE: true, // If moderation fails, default to safe content
  },

  // Inappropriate content keywords
  BLOCKED_KEYWORDS: [
    'nude', 'naked', 'nsfw', 'adult', 'porn', 'sex', 'explicit',
    'bikini', 'lingerie', 'underwear', 'topless', 'bare',
    'violence', 'weapon', 'gun', 'knife', 'blood', 'gore',
    'drug', 'marijuana', 'cocaine', 'pills', 'smoking',
    'hate', 'racist', 'nazi', 'offensive'
  ],

  // Safe marketplace keywords
  SAFE_KEYWORDS: [
    'jeep', 'truck', 'suv', 'tire', 'wheel', 'engine', 'part',
    'camping', 'tent', 'gear', 'tool', 'winch', 'bumper',
    'lift', 'suspension', 'light', 'bar', 'roof', 'rack',
    'off-road', 'vehicle', 'automotive', 'outdoor'
  ],

  // Rate limiting for AI moderation calls
  RATE_LIMITS: {
    MAX_MODERATION_CALLS_PER_MINUTE: 10,
    MAX_MODERATION_CALLS_PER_HOUR: 100,
  }
};

/**
 * Check if content moderation is enabled
 */
export const isModerationEnabled = (): boolean => {
  return SECURITY_CONFIG.MODERATION.ENABLE_AI_MODERATION ||
         SECURITY_CONFIG.MODERATION.ENABLE_KEYWORD_FILTERING ||
         SECURITY_CONFIG.MODERATION.ENABLE_DOMAIN_FILTERING;
};

/**
 * Get security headers for image requests
 */
export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': `img-src 'self' ${SECURITY_CONFIG.TRUSTED_IMAGE_DOMAINS.join(' ')};`,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};