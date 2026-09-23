import { Producer, Destination, Category, Ethos, RoadAccess, FoodOption } from '../types/terroir';
import { TastingExperience } from '../types/booking';
import { CRETAN_PRODUCERS } from '../data/producers';
import { SANTORINI_PRODUCERS } from '../data/santoriniProducers';
import { PHASE10B_PRODUCERS } from '../data/phase10bProducers';
import { ACTIVE_PRODUCER_IDS } from '../data/activeProducerIds.generated';
import { ALL_EXPERIENCES } from '../data/experiences';
import { supabase, isSupabaseConfigured } from './supabase';
import { logger } from './logger';

const ACTIVE_PRODUCER_ID_SET = new Set<string>(ACTIVE_PRODUCER_IDS);
const BOOTSTRAP_FALLBACK_PRODUCERS: Producer[] = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
].filter((producer) => ACTIVE_PRODUCER_ID_SET.has(producer.id));

let fallbackProducersCache: Producer[] = BOOTSTRAP_FALLBACK_PRODUCERS;
let fullFallbackPromise: Promise<Producer[]> | null = null;

async function loadFullFallbackProducers(): Promise<Producer[]> {
  if (!fullFallbackPromise) {
    fullFallbackPromise = import('../data/liveCatalogue.generated').then(
      ({ LIVE_CATALOGUE_PRODUCERS }) => {
        fallbackProducersCache = LIVE_CATALOGUE_PRODUCERS;
        return fallbackProducersCache;
      }
    );
  }
  return fullFallbackPromise;
}

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
 * Transforms a Supabase PostgreSQL row into the frontend Producer type.
 * Producer category, mapped public-point role, visitability, and road access
 * are intentionally independent trust dimensions.
 */
export function mapRowToProducer(row: any): Producer {
  const country = row.country || (row.destination === 'tuscany' ? 'Italy' : 'Greece');
  const countryCode = row.country_code || (row.destination === 'tuscany' ? 'IT' : 'GR');
  const locality = row.locality || row.village;

  const isUnresolvedLocation = row.location_status === 'unresolved';
  const googleMapsUrl = isUnresolvedLocation ? undefined : (row.google_maps_url || undefined);
  const googlePlaceId =
    typeof row.google_place_id === 'string' && row.google_place_id.trim().length > 0
      ? row.google_place_id.trim()
      : undefined;
  const verifiedRoadAccess =
    row.road_access_status === 'verified' && row.road_access
      ? (row.road_access as RoadAccess)
      : undefined;

  return {
    id: row.id,
    name: row.name,
    greekName: row.local_name || row.greek_name || row.name,
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
    productSpecialties: Array.isArray(row.product_specialties) ? row.product_specialties : undefined,
    tastingHighlights: Array.isArray(row.tasting_highlights) ? row.tasting_highlights : [],
    openingHours: row.opening_hours || '',
    bestSeason: row.best_season || undefined,
    phone: row.phone || undefined,
    website: row.website || undefined,
    googleMapsUrl,
    googlePlaceId,
    roadAccess: verifiedRoadAccess,
    roadAccessStatus: row.road_access_status || 'unreviewed',
    roadAccessSourceUrl: row.road_access_source_url || undefined,
    roadAccessNotes: row.road_access_notes || undefined,
    ethos: Array.isArray(row.ethos) ? (row.ethos as Ethos[]) : [],
    foodOption: row.food_option ? (row.food_option as FoodOption) : undefined,
    dogFriendly: row.dog_friendly != null ? Boolean(row.dog_friendly) : undefined,
    kidFriendly: row.kid_friendly != null ? Boolean(row.kid_friendly) : undefined,
    walkInFriendly: row.walk_in_friendly != null ? Boolean(row.walk_in_friendly) : undefined,
    campervanFriendly: row.campervan_friendly != null ? Boolean(row.campervan_friendly) : undefined,
    priceLevel: row.price_level ? (row.price_level as '€' | '€€' | '€€€') : undefined,
    rating: row.rating != null ? Number(row.rating) : undefined,
    reviewCount: row.review_count != null ? Number(row.review_count) : undefined,
    vipPerks: row.vip_perks || undefined,

    locationStatus: row.location_status || undefined,
    locationSourceUrl: row.location_source_url || undefined,
    locationNotes: row.location_notes || undefined,
    publicPointType: row.public_point_type || undefined,
    visitStatus: row.visit_status || undefined,
    visitSourceUrl: row.visit_source_url || undefined,
    visitNotes: row.visit_notes || undefined,
    visitBookingRequirement: row.visit_booking_requirement || undefined,
    walkInStatus: row.walk_in_status || undefined,
    parkingStatus: row.parking_status || undefined,
    typicalVisitMinutes:
      row.typical_visit_minutes != null ? Number(row.typical_visit_minutes) : undefined,
    visitorHours: row.visitor_hours ?? undefined,
    seasonalVisitNotes: row.seasonal_visit_notes || undefined,
    visitorLanguages:
      Array.isArray(row.visitor_languages) && row.visitor_languages.length > 0
        ? row.visitor_languages
        : undefined,
    visitabilityReviewedAt: row.visitability_reviewed_at || undefined,
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
        p.locationStatus !== 'unresolved' &&
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
        p.indigenousVarieties.some((v) => v.toLowerCase().includes(q)) ||
        p.productSpecialties?.some((specialty) => specialty.toLowerCase().includes(q))
    );
  }

  return list.slice(offset, offset + limit);
}

/**
 * Authoritative in-memory state and provenance tracking.
 *
 * - fallback: lightweight audited bootstrap, then a lazy-loaded deterministic snapshot of the full active catalogue.
 * - live: Supabase successfully returned data and remains the sole authority.
 */
let cacheProvenance: DataProvenance = 'fallback';
const liveProducersCache = new Map<string, Producer>();

let experienceProvenance: DataProvenance = 'fallback';
let liveExperiencesCache: TastingExperience[] = [];

export const producerService = {
  isLiveDb(): boolean {
    return isSupabaseConfigured && Boolean(supabase);
  },

  getCacheProvenance(): DataProvenance {
    return cacheProvenance;
  },

  getExperienceProvenance(): DataProvenance {
    return experienceProvenance;
  },

  resetCacheForTesting(): void {
    cacheProvenance = 'fallback';
    liveProducersCache.clear();
    fallbackProducersCache = BOOTSTRAP_FALLBACK_PRODUCERS;
    fullFallbackPromise = null;
    experienceProvenance = 'fallback';
    liveExperiencesCache = [];
  },

  async getProducers(options: ProducerQueryOptions = {}): Promise<Producer[]> {
    const { destination, category, searchQuery, bounds, limit = 1000, offset = 0 } = options;

    if (this.isLiveDb() && supabase) {
      try {
        let query = supabase.from('producers').select('*').eq('is_active', true);

        if (destination && destination !== 'all') {
          query = query.eq('destination', destination);
        }
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        if (bounds) {
          query = query
            .neq('location_status', 'unresolved')
            .gte('lat', bounds.south)
            .lte('lat', bounds.north)
            .gte('lng', bounds.west)
            .lte('lng', bounds.east);
        }
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim();
          query = query.or(`name.ilike.%${q}%,local_name.ilike.%${q}%,village.ilike.%${q}%,region.ilike.%${q}%`);
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
          }
          remoteProducers.forEach((p) => liveProducersCache.set(p.id, p));
          cacheProvenance = 'live';

          return remoteProducers;
        }
      } catch (err) {
        cacheProvenance = 'fallback';
        logger.warn('Catalogue', 'producers_fetch_failed', {
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const fallbackProducers = await loadFullFallbackProducers();
    return filterProducersList(fallbackProducers, options);
  },

  async getProducerById(id: string): Promise<Producer | null> {
    if (this.isLiveDb() && supabase) {
      if (cacheProvenance === 'live' && liveProducersCache.has(id)) {
        return liveProducersCache.get(id) || null;
      }

      try {
        const { data, error } = await supabase
          .from('producers')
          .select('*')
          .eq('is_active', true)
          .eq('id', id)
          .maybeSingle();
        if (!error) {
          if (data) {
            const prod = mapRowToProducer(data);
            liveProducersCache.set(prod.id, prod);
            cacheProvenance = 'live';
            return prod;
          }
          return null;
        }
        logger.warn('Catalogue', 'producer_by_id_failed', { id, reason: error.message });
        return (await loadFullFallbackProducers()).find((p) => p.id === id) || null;
      } catch (err) {
        logger.warn('Catalogue', 'producer_by_id_error', {
          id,
          reason: err instanceof Error ? err.message : String(err),
        });
        return (await loadFullFallbackProducers()).find((p) => p.id === id) || null;
      }
    }

    return (await loadFullFallbackProducers()).find((p) => p.id === id) || null;
  },

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
        logger.warn('Catalogue', 'experiences_fetch_failed', {
          producerId,
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (producerId) {
      return ALL_EXPERIENCES.filter((e) => e.producerId === producerId);
    }
    return ALL_EXPERIENCES;
  },

  getCachedProducers(): Producer[] {
    if (cacheProvenance === 'live') {
      return Array.from(liveProducersCache.values());
    }
    return fallbackProducersCache;
  },

  getCachedProducer(id: string): Producer | undefined {
    if (cacheProvenance === 'live') {
      return liveProducersCache.get(id);
    }
    return fallbackProducersCache.find((p) => p.id === id);
  },

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
