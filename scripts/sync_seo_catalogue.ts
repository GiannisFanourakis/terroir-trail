import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Producer } from '../src/types/terroir';

const rootDir = process.cwd();
const targetPath = path.resolve(rootDir, 'scripts', 'seoLiveCatalogue.generated.ts');

const loadProductionEnv = (): void => {
  for (const file of ['.env.production.local', '.env.production', '.env.local', '.env']) {
    const filePath = path.resolve(rootDir, file);
    if (fs.existsSync(filePath)) dotenv.config({ path: filePath, override: false });
  }
};

const fail = (message: string): never => {
  console.error(`[SEO catalogue sync failed] ${message}`);
  process.exit(1);
};

async function syncSeoCatalogue(): Promise<void> {
  loadProductionEnv();
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    fail('Supabase public URL/key are unavailable. Production SEO sync requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL / SUPABASE_ANON_KEY).');
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  // "Active" currently means every row published through public.producers,
  // matching producerService.getProducers(). There is no producer is_active
  // column today; if publication status is added later, filter both paths together.
  const { data, error } = await supabase.from('producers').select('*').order('id', { ascending: true });
  if (error) fail(error.message);
  if (!data || data.length === 0) fail('The live public.producers catalogue returned no rows.');

  const { mapRowToProducer } = await import('../src/services/producerService');
  const producers: Producer[] = data.map((row) => mapRowToProducer(row)).sort((a, b) => a.id.localeCompare(b.id));
  const ids = new Set(producers.map((producer) => producer.id));
  if (ids.size !== producers.length) fail('Duplicate producer IDs were returned by the live catalogue.');

  const invalid = producers.filter((producer) => !producer.id || !producer.destination || !producer.countryCode || !producer.region || !producer.category);
  if (invalid.length > 0) fail(`Live catalogue contains ${invalid.length} row(s) missing required SEO geography/category fields.`);

  const latestUpdatedAt = data
    .map((row) => (typeof row.updated_at === 'string' ? row.updated_at : null))
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) || 'unknown';

  const source = `import type { Producer } from '../src/types/terroir';

/**
 * Deterministic SEO/AEO producer snapshot generated from the live Supabase
 * public.producers catalogue.
 *
 * Runtime Supabase remains authoritative. This file is refreshed automatically
 * before production SEO generation; do not hand-edit producer records here.
 * Latest source row update: ${latestUpdatedAt}
 */
export const SEO_LIVE_PRODUCERS = ${JSON.stringify(producers, null, 2)} as Producer[];
`;

  fs.writeFileSync(targetPath, source, 'utf-8');

  const destinations = new Set(producers.map((producer) => producer.destination)).size;
  const countries = new Set(producers.map((producer) => producer.countryCode).filter(Boolean)).size;
  const regions = new Set(producers.map((producer) => producer.region)).size;
  const categories = new Set(producers.map((producer) => producer.category)).size;
  console.log(`SEO live catalogue synchronized: ${producers.length} active records / ${destinations} destinations / ${countries} countries / ${regions} regions / ${categories} categories.`);
}

syncSeoCatalogue().catch((error) => fail(error instanceof Error ? error.message : String(error)));
