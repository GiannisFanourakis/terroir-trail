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

export type DataProvenance = 'fallback' | 'live';

/**
 * Transforms a Supabase PostgreSQL row into the frontend Producer type
 */
export function mapRowToProducer(row: any): Producer {
  const country = row.country || (row.destination === 'tuscany' ? 'Italy' : 'Greece');
  const countryCode = row.country_code || (row.destination === 'tuscany' ? 'IT' : 'GR');
  const locality = row.locality || row.village;

  return {
    id: row.id,
    name: row.name,
    greekName: row.greek_name || row.name,
    category: row.category as Category,
    destination: row.destination as Destination,
    country,
    countryCode,
    region: row.region,
    village: locality,
    locality,
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
 * Transforms a Supabase PostgreSQL row into the frontend TastingExperience type
 */
export function mapRowToExperience(row: any): TastingExperience {
  return {
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
  };
}

/**
 * Helper to filter a list of producers based on standard query options
 */
function filterProducersList(producers: Producer[], options: ProducerQueryOptions): Producer[] {
  const { destination, category, searchQuery, bounds, limit = 1000, offset = 0 } = options;
  let list = [...producers];

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
        (p.country && p.country.toLowerCase().includes(q)) ||
        p.indigenousVarieties.some((v) => v.toLowerCase().includes(q))
    );
  }

  return list.slice(offset, offset + limit);
}

/**
 * Authoritative in-memory state and provenance tracking.
 *
 * Architecture:
 * - 'fallback': Supabase is unconfigured, initial startup before live fetch, or request failed.
 *               Static seed data (CRETAN_PRODUCERS / ALL_EXPERIENCES) serves as offline fallback.
 * - 'live':     Supabase successfully returned data. Supabase is the SOLE authority:
 *               zero rows means zero rows, live values replace seed values, and bundled-only
 *               producers that Supabase did not return are NEVER merged in.
 */
let cacheProvenance: DataProvenance = 'fallback';
const liveProducersCache = new Map<string, Producer>();

let experienceProvenance: DataProvenance = 'fallback';
let liveExperiencesCache: TastingExperience[] = [];

export const producerService = {
  /**
   * Check if live database is configured and client exists
   */
  isLiveDb(): boolean {
    return isSupabaseConfigured && Boolean(supabase);
  },

  /**
   * Get the current producer cache provenance ('fallback' | 'live')
   */
  getCacheProvenance(): DataProvenance {
    return cacheProvenance;
  },

  /**
   * Get the current experience cache provenance ('fallback' | 'live')
   */
  getExperienceProvenance(): DataProvenance {
    return experienceProvenance;
  },

  /**
   * Reset cache state (primarily for automated unit and integration tests)
   */
  resetCacheForTesting(): void {
    cacheProvenance = 'fallback';
    liveProducersCache.clear();
    experienceProvenance = 'fallback';
    liveExperiencesCache = [];
  },

  /**
   * Fetch producers with optional spatial bounding box or filters.
   *
   * When Supabase is configured and succeeds:
   * - Supabase response is authoritative.
   * - Zero rows means zero rows (empty array).
   * - Live values replace seed values; bundled-only records not returned by Supabase are excluded.
   *
   * When Supabase is unconfigured or request genuinely fails:
   * - Falls back to bundled static seed producers.
   */
  async getProducers(options: ProducerQueryOptions = {}): Promise<Producer[]> {
    const { destination, category, searchQuery, bounds, limit = 1000, offset = 0 } = options;

    if (this.isLiveDb() && supabase) {
      try {
        let query = supabase.from('producers').select('*');

        if (destination && destination !== 'all') {
          query = query.eq('destination', destination);
        }
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
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
        if (error) {
          throw error;
        }

        if (data !== null && data !== undefined) {
          const remoteProducers = data.map(mapRowToProducer);

          const isFullCatalogue =
            (!destination || destination === 'all') &&
            (!category || category === 'all') &&
            !bounds &&
            !searchQuery &&
            offset === 0;

          if (isFullCatalogue) {
            liveProducersCache.clear();
            remoteProducers.forEach((p) => liveProducersCache.set(p.id, p));
            cacheProvenance = 'live';
          } else {
            remoteProducers.forEach((p) => liveProducersCache.set(p.id, p));
            cacheProvenance = 'live';
          }

          return remoteProducers;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to static seed data:', err);
      }
    }

    // Fallback: Supabase unconfigured or request failed
    return filterProducersList(CRETAN_PRODUCERS, options);
  },

  /**
   * Get single producer by ID.
   *
   * When Supabase is configured:
   * - Checks live cache first if live catalogue is already loaded.
   * - Otherwise queries Supabase directly.
   * - If Supabase returns null / no rows without error, returns null (authoritative zero rows).
   * - If query genuinely fails, falls back to static seed data.
   *
   * When Supabase is unconfigured:
   * - Falls back to static seed data.
   */
  async getProducerById(id: string): Promise<Producer | null> {
    if (this.isLiveDb() && supabase) {
      if (cacheProvenance === 'live' && liveProducersCache.has(id)) {
        return liveProducersCache.get(id) || null;
      }

      try {
        const { data, error } = await supabase.from('producers').select('*').eq('id', id).maybeSingle();
        if (!error) {
          if (data) {
            const prod = mapRowToProducer(data);
            liveProducersCache.set(prod.id, prod);
            cacheProvenance = 'live';
            return prod;
          }
          // Supabase is authoritative and answered that this record does not exist
          return null;
        }
        console.warn('Supabase getProducerById failed, falling back to static seed:', error);
        return CRETAN_PRODUCERS.find((p) => p.id === id) || null;
      } catch (err) {
        console.warn('Supabase getProducerById error, falling back to static seed:', err);
        return CRETAN_PRODUCERS.find((p) => p.id === id) || null;
      }
    }

    return CRETAN_PRODUCERS.find((p) => p.id === id) || null;
  },

  /**
   * Get experiences (optionally filtered by producer).
   *
   * When Supabase is configured and succeeds:
   * - Supabase response is authoritative.
   * - Zero rows means zero rows.
   * - Does NOT fall back to ALL_EXPERIENCES on empty response.
   *
   * When Supabase is unconfigured or request genuinely fails:
   * - Falls back to ALL_EXPERIENCES static seed data.
   */
  async getExperiences(producerId?: string): Promise<TastingExperience[]> {
    if (this.isLiveDb() && supabase) {
      try {
        let query = supabase.from('experiences').select('*').eq('is_active', true);
        if (producerId) {
          query = query.eq('producer_id', producerId);
        }
        const { data, error } = await query;
        if (error) {
          throw error;
        }
        if (data !== null && data !== undefined) {
          const remote = data.map(mapRowToExperience);
          if (!producerId) {
            liveExperiencesCache = remote;
            experienceProvenance = 'live';
          }
          return remote;
        }
      } catch (err) {
        console.warn('Error fetching experiences from Supabase, falling back to static seed:', err);
      }
    }

    // Fallback path
    if (producerId) {
      return ALL_EXPERIENCES.filter((e) => e.producerId === producerId);
    }
    return ALL_EXPERIENCES;
  },

  /**
   * Synchronous getter for instant React renders.
   * Returns live cached producers if live catalogue has resolved,
   * or static bundled seed producers if still in fallback state.
   */
  getCachedProducers(): Producer[] {
    if (cacheProvenance === 'live') {
      return Array.from(liveProducersCache.values());
    }
    return CRETAN_PRODUCERS;
  },

  /**
   * Synchronous getter for a single cached producer.
   * In 'live' mode, only returns records known to the live database.
   */
  getCachedProducer(id: string): Producer | undefined {
    if (cacheProvenance === 'live') {
      return liveProducersCache.get(id);
    }
    return CRETAN_PRODUCERS.find((p) => p.id === id);
  },

  /**
   * Synchronous getter for cached experiences.
   */
  getCachedExperiences(producerId?: string): TastingExperience[] {
    if (experienceProvenance === 'live') {
      if (producerId) {
        return liveExperiencesCache.filter((e) => e.producerId === producerId);
      }
      return liveExperiencesCache;
    }
    if (producerId) {
      return ALL_EXPERIENCES.filter((e) => e.producerId === producerId);
    }
    return ALL_EXPERIENCES;
  },
};
