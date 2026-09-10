import { Producer } from '../types/terroir';

export const CATEGORY_FALLBACK_IMAGES: Record<Producer['category'], string> = {
  winery: '/images/estates/boutari-skalani.jpg',
  brewery: '/images/estates/boutari-skalani.jpg',
  kazani: '/images/estates/crete-kazani-copper-still.jpg',
  olive_mill: '/images/estates/vouves-ancient-olive-tree.jpg',
  cheese_dairy: '/images/estates/crete-mitato-shepherd.jpg',
  apiary: '/images/estates/rethymno-graviera.jpg',
};

/**
 * Returns a guaranteed local bundled asset fallback image for a given artisan category
 */
export function getCategoryFallbackImage(category: Producer['category']): string {
  return CATEGORY_FALLBACK_IMAGES[category] || '/images/estates/boutari-skalani.jpg';
}
