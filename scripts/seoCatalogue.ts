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
