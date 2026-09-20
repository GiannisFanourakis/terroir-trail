import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { buildCatalogueState } from './catalogueState';
import { fetchActiveProducerRows } from './liveCatalogueSource';

const rootDir = process.cwd();
const catalogueTargetPath = path.resolve(rootDir, 'src', 'data', 'liveCatalogue.generated.ts');
const activeIdsTargetPath = path.resolve(rootDir, 'src', 'data', 'activeProducerIds.generated.ts');

const fail = (message: string): never => {
  console.error(`[SEO catalogue sync failed] ${message}`);
  process.exit(1);
};

async function syncSeoCatalogue(): Promise<void> {
  const rows = await fetchActiveProducerRows();
  const { mapRowToProducer } = await import('../src/services/producerService');
  const producers: Producer[] = rows
    .map((row) => mapRowToProducer(row))
    .sort((a, b) => a.id.localeCompare(b.id));

  const ids = producers.map((producer) => producer.id);
  if (new Set(ids).size !== ids.length) {
    fail('Duplicate producer IDs were returned by the active live catalogue.');
  }

  const invalid = producers.filter(
    (producer) =>
      !producer.id ||
      !producer.destination ||
      !producer.countryCode ||
      !producer.region ||
      !producer.category
  );
  if (invalid.length > 0) {
    fail(`Active live catalogue contains ${invalid.length} row(s) missing required SEO geography/category fields.`);
  }

  const latestUpdatedAt =
    rows
      .map((row) => (typeof row.updated_at === 'string' ? row.updated_at : null))
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) || 'unknown';

  const catalogueSource = `import type { Producer } from '../types/terroir';

/**
 * Deterministic active producer snapshot generated from the live Supabase
 * public.producers catalogue where is_active = true.
 *
 * Runtime Supabase remains authoritative. This file is shared by runtime fallback
 * and SEO/AEO generation and is refreshed automatically; do not hand-edit it.
 * Latest active source row update: ${latestUpdatedAt}
 */
export const LIVE_CATALOGUE_PRODUCERS = ${JSON.stringify(producers, null, 2)} as Producer[];
`;

  const activeIdsSource = `/**
 * Generated from Supabase public.producers where is_active = true.
 * Do not hand-edit. Production catalogue synchronization rewrites this file.
 */
export const ACTIVE_PRODUCER_IDS = ${JSON.stringify(ids, null, 2)} as const;
`;

  fs.writeFileSync(catalogueTargetPath, catalogueSource, 'utf-8');
  fs.writeFileSync(activeIdsTargetPath, activeIdsSource, 'utf-8');

  const state = buildCatalogueState(producers);
  console.log(
    `Live catalogue synchronized: ${state.producers} active records / ${state.destinations} destinations / ${state.countries} countries / ${state.regions} regions / ${state.categories} categories / hash ${state.catalogueHash.slice(0, 12)}…`
  );
}

syncSeoCatalogue().catch((error) =>
  fail(error instanceof Error ? error.message : String(error))
);
