import type { Producer } from '../src/types/terroir';
import { CRETAN_PRODUCERS } from '../src/data/producers';
import { SANTORINI_PRODUCERS } from '../src/data/santoriniProducers';
import { PHASE10B_PRODUCERS } from '../src/data/phase10bProducers';
import { PHASE13_DAIRY_PRODUCERS } from '../src/data/phase13DairyProducers';

/**
 * Static, deterministic catalogue used by SEO/AEO generation and verification.
 * Live Supabase remains the runtime authority; this bundle mirrors the approved
 * records that must also have crawlable canonical entity pages at deploy time.
 */
export const SEO_PRODUCERS: Producer[] = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
  ...PHASE13_DAIRY_PRODUCERS,
];

/**
 * Live Supabase catalogue metrics, verified directly against public.producers
 * on 2026-09-18. These are intentionally separate from SEO_PRODUCERS because
 * the deterministic canonical/offline snapshot has not yet been synchronized
 * with every live European expansion record.
 */
export const LIVE_CATALOGUE_METRICS = {
  verifiedAt: '2026-09-18',
  totalProducers: 148,
  destinationCount: 22,
  countryCount: 8,
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
