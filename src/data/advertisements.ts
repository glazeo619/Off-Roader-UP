export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor?: string;
  category?: string;
  location: string;
  url?: string;
  priority: number;
}

export const advertisements: Advertisement[] = [];
export const getAdsByCategory = (_category?: string): Advertisement[] => [];
export const getRandomAd = (_category?: string): Advertisement | null => null;
export const validateAdvertisements = (): boolean => true;
