import path from 'path';
import { pathToFileURL } from 'url';
import { PHASE10B_PRODUCERS } from '../src/data/phase10bProducers';
import { PHASE13_DAIRY_PRODUCERS } from '../src/data/phase13DairyProducers';

const existingIds = new Set(PHASE10B_PRODUCERS.map((producer) => producer.id));
for (const producer of PHASE13_DAIRY_PRODUCERS) {
  if (!existingIds.has(producer.id)) {
    PHASE10B_PRODUCERS.push(producer);
    existingIds.add(producer.id);
  }
}

const target = process.argv[2];
if (!target) {
  console.error('[Phase 13 SEO] Missing target script.');
  process.exit(1);
}

const resolved = path.resolve(process.cwd(), target);
await import(pathToFileURL(resolved).href);
