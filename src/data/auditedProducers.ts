import { Producer } from '../types/terroir';
import { CRETAN_PRODUCERS } from './producers';
import { SANTORINI_PRODUCERS } from './santoriniProducers';
import { PHASE10B_PRODUCERS } from './phase10bProducers';
import { PHASE13_DAIRY_PRODUCERS } from './phase13DairyProducers';
import { enrichPhase13DairyProducer } from './phase13DairyContentOverrides';

/**
 * Canonical bundled fallback / static-generation catalogue.
 *
 * Live Supabase remains authoritative at runtime when configured. This bundle is
 * kept in parity for offline fallback, SEO/AEO generation and deterministic CI.
 */
export const AUDITED_PRODUCERS: Producer[] = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
  ...PHASE13_DAIRY_PRODUCERS.map(enrichPhase13DairyProducer),
];
