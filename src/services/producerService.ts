import { Producer, Destination, Category, Ethos, RoadAccess, FoodOption } from '../types/terroir';
import { TastingExperience } from '../types/booking';
import { CRETAN_PRODUCERS } from '../data/producers';
import { ALL_EXPERIENCES } from '../data/experiences';
import { supabase, isSupabaseConfigured } from './supabase';

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ProducerQueryOptions {
  destination?: Destination | 'all';
  category?: Category | 'all';
  searchQuery?: string;
  bounds?: ViewportBounds;
  limit?: number;
  offset?: number;
}

/**
 * Transforms a Supabase PostgreSQL row into the frontend Producer type
 */
export function mapRowToProducer(row: any): Producer {
  return {
    id: row.id,
    name: row.name,
    greekName: row.greek_name || row.name,
    category: row.category as Category,
    destination: row.destination as Destination,
    region: row.region,
    village: row.village,
    coordinates: [row.lat ?? (row.coordinates?.[0] || 0), row.lng ?? (row.coordinates?.[1] || 0)],
    coverImage: row.cover_image || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    tagLine: row.tag_line || '',
    description: row.description || '',
    story: row.story || '',
    indigenousVarieties: Array.isArray(row.indigenous_varieties) ? row.indigenous_varieties : [],
    tastingHighlights: Array.isArray(row.tasting_highlights) ? row.tasting_highlights : [],
    openingHours: row.opening_hours || '',
    bestSeason: row.best_season,
    phone: row.phone,
    website: row.website,
    googleMapsUrl: row.google_maps_url || `https://maps.google.com/?q=${row.lat},${row.lng}`,
    roadAccess: (row.road_access || 'paved') as RoadAccess,
    ethos: Array.isArray(row.ethos) ? (row.ethos as Ethos[]) : [],
    foodOption: (row.food_option || 'dakos_snacks') as FoodOption,
    dogFriendly: Boolean(row.dog_friendly),
    kidFriendly: Boolean(row.kid_friendly),
    walkInFriendly: Boolean(row.walk_in_friendly),
    campervanFriendly: Boolean(row.campervan_friendly),
    priceLevel: (row.price_level || '€€') as '€' | '€€' | '€€€',
    rating: Number(row.rating || 5.0),
    reviewCount: Number(row.review_count || 0),
    vipPerks: row.vip_perks,
  };
}

/**
 * In-memory client cache to prevent redundant fetches and ensure instant 0ms responses
 */
const producerCache = new Map<string, Producer>();
let allProducersLoaded = false;

// Pre-fill cache with static seed data for instant offline startup
CRETAN_PRODUCERS.forEach((p) => producerCache.set(p.id, p));

export const producerService = {
  /**
   * Check if live database is active
   */
  isLiveDb(): boolean {
    return isSupabaseConfigured && Boolean(supabase);
  },

  /**
   * Fetch producers with optional spatial bounding box or filters
   */
  async getProducers(options: ProducerQueryOptions = {}): Promise<Producer[]> {
    const { destination, category, searchQuery, bounds, limit = 1000, offset = 0 } = options;

    // 1. If Supabase is connected, attempt remote fetch
    if (this.isLiveDb() && supabase) {
      try {
        let query = supabase.from('producers').select('*');

        if (destination && destination !== 'all') {
          query = query.eq('destination', destination);
        }
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        // Bounding box filter (if viewport is provided)
        if (bounds) {
          query = query
            .gte('lat', bounds.south)
            .lte('lat', bounds.north)
            .gte('lng', bounds.west)
            .lte('lng', bounds.east);
        }

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim();
          query = query.or(`name.ilike.%${q}%,greek_name.ilike.%${q}%,village.ilike.%${q}%,region.ilike.%${q}%`);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const remoteProducers = data.map(mapRowToProducer);
          remoteProducers.forEach((p) => producerCache.set(p.id, p));
          return remoteProducers;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local cache/seed:', err);
      }
    }

    // 2. Fallback to local memory / seed data (100% offline-ready)
    let list = Array.from(producerCache.values());

    if (destination && destination !== 'all') {
      list = list.filter((p) => p.destination === destination);
    }
    if (category && category !== 'all') {
      list = list.filter((p) => p.category === category);
    }
    if (bounds) {
      list = list.filter(
        (p) =>
          p.coordinates[0] >= bounds.south &&
          p.coordinates[0] <= bounds.north &&
          p.coordinates[1] >= bounds.west &&
          p.coordinates[1] <= bounds.east
      );
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.greekName.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q) ||
          p.indigenousVarieties.some((v) => v.toLowerCase().includes(q))
      );
    }

    return list.slice(offset, offset + limit);
  },

  /**
   * Get single producer by ID
   */
  async getProducerById(id: string): Promise<Producer | null> {
    if (producerCache.has(id)) {
      return producerCache.get(id) || null;
    }

    if (this.isLiveDb() && supabase) {
      try {
        const { data, error } = await supabase.from('producers').select('*').eq('id', id).single();
        if (!error && data) {
          const prod = mapRowToProducer(data);
          producerCache.set(prod.id, prod);
          return prod;
        }
      } catch (err) {
        console.warn('Error fetching producer from Supabase:', err);
      }
    }

    return CRETAN_PRODUCERS.find((p) => p.id === id) || null;
  },

  /**
   * Get experiences (optionally filtered by producer)
   */
  async getExperiences(producerId?: string): Promise<TastingExperience[]> {
    if (this.isLiveDb() && supabase) {
      try {
        let query = supabase.from('experiences').select('*').eq('is_active', true);
        if (producerId) {
          query = query.eq('producer_id', producerId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            title: row.title,
            durationMinutes: row.duration_minutes,
            pricePerPerson: Number(row.price_per_person),
            description: row.description,
            includes: Array.isArray(row.includes) ? row.includes : [],
            badge: row.badge,
            producerId: row.producer_id,
            producerName: row.producer_name,
            producerGreekName: row.producer_greek_name,
            category: row.category as Category,
            destination: row.destination as Destination,
            location: row.location,
          }));
        }
      } catch (err) {
        console.warn('Error fetching experiences from Supabase:', err);
      }
    }

    if (producerId) {
      return ALL_EXPERIENCES.filter((e) => e.producerId === producerId);
    }
    return ALL_EXPERIENCES;
  },

  /**
   * Synchronous getter for instant React renders where data is already cached
   */
  getCachedProducers(): Producer[] {
    return Array.from(producerCache.values());
  },

  /**
   * Synchronous getter for a single cached producer
   */
  getCachedProducer(id: string): Producer | undefined {
    return producerCache.get(id) || CRETAN_PRODUCERS.find((p) => p.id === id);
  },
};
