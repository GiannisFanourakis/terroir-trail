import type { Producer } from '../src/types/terroir';
import { SEO_LIVE_PRODUCERS } from './seoLiveCatalogue.generated';

/**
 * Static, deterministic catalogue used by SEO/AEO generation and verification.
 * This snapshot is generated from the live Supabase public.producers catalogue
 * and must be refreshed whenever the live catalogue changes.
 */
export const SEO_PRODUCERS: Producer[] = SEO_LIVE_PRODUCERS;

export const LIVE_CATALOGUE_METRICS = {
  verifiedAt: '2026-09-18',
  totalProducers: SEO_PRODUCERS.length,
  destinationCount: new Set(SEO_PRODUCERS.map((producer) => producer.destination)).size,
  countryCount: new Set(
    SEO_PRODUCERS.map((producer) => producer.countryCode).filter(Boolean)
  ).size,
  countryCounts: {
    Greece: 66,
    Italy: 39,
    France: 8,
    Spain: 6,
    Portugal: 8,
    Croatia: 8,
    Slovenia: 5,
    Norway: 8,
  },
} as const;
