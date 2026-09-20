import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { buildCatalogueState } from './catalogueState';
import { fetchActiveProducerRows } from './liveCatalogueSource';

const rootDir = process.cwd();
const catalogueTargetPath = path.resolve(rootDir, 'src', 'data', 'liveCatalogue.generated.ts');
const activeIdsTargetPath = path.resolve(rootDir, 'src', 'data', 'activeProducerIds.generated.ts');
const summaryTargetPath = path.resolve(rootDir, 'src', 'data', 'catalogueSummary.generated.ts');

const CATEGORY_LABELS: Record<string, string> = {
  apiary: 'Apiaries / Honey',
  brewery: 'Breweries',
  cheese_dairy: 'Dairies / Cheesemakers',
  cidery: 'Cideries',
  confectionery: 'Confectionery Producers',
  distillery: 'Distilleries',
  farm: 'Farms',
  herb_farm: 'Herb Farms',
  mushroom_farm: 'Mushroom Farms',
  oil_mill: 'Other Oil Mills',
  olive_mill: 'Olive Mills',
  olive_oil_producer: 'Olive Oil Producers',
  winery: 'Wineries',
};

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

  const state = buildCatalogueState(producers);
  const countryNames = Array.from(
    new Set(
      producers
        .map((producer) => producer.country)
        .filter((country): country is string => Boolean(country))
    )
  ).sort((a, b) => a.localeCompare(b));
  const categoryNames = Array.from(
    new Set(producers.map((producer) => producer.category))
  )
    .map((category) => CATEGORY_LABELS[category] ?? category)
    .sort((a, b) => a.localeCompare(b));

  const summarySource = `/**
 * Generated from active rows in Supabase public.producers.
 * Do not hand-edit. Production catalogue synchronization rewrites this file.
 */
export const CATALOGUE_SUMMARY = ${JSON.stringify(
    {
      producers: state.producers,
      destinations: state.destinations,
      countries: state.countries,
      regions: state.regions,
      categories: state.categories,
      countryNames,
      categoryNames,
    },
    null,
    2
  )} as const;
`;

  fs.writeFileSync(catalogueTargetPath, catalogueSource, 'utf-8');
  fs.writeFileSync(activeIdsTargetPath, activeIdsSource, 'utf-8');
  fs.writeFileSync(summaryTargetPath, summarySource, 'utf-8');
  console.log(
    `Live catalogue synchronized: ${state.producers} active records / ${state.destinations} destinations / ${state.countries} countries / ${state.regions} regions / ${state.categories} categories / hash ${state.catalogueHash.slice(0, 12)}…`
  );
}

syncSeoCatalogue().catch((error) =>
  fail(error instanceof Error ? error.message : String(error))
);
