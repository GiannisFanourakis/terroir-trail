import fs from 'node:fs';
import path from 'node:path';
import { LIVE_CATALOGUE_PRODUCERS } from '../src/data/liveCatalogue.generated';

/**
 * Preserve the full audited fallback catalogue outside the JS bundle.
 * The file is public by design: the identical records were already distributed
 * to browsers via the liveCatalogue.generated JavaScript chunk.
 * No API credentials, admin records or private operational notes are loaded.
 */
const ids = LIVE_CATALOGUE_PRODUCERS.map((producer) => producer.id);
if (
  ids.length < 100 ||
  new Set(ids).size !== ids.length ||
  ids.some((id) => typeof id !== 'string' || !id)
) {
  throw new Error('Invalid audited fallback catalogue; refusing to export.');
}

const outputPath = path.resolve('public', 'catalogue-fallback.json');
fs.writeFileSync(outputPath, JSON.stringify(LIVE_CATALOGUE_PRODUCERS) + '\n');
console.log('Public fallback catalogue: ' + ids.length + ' unique audited producers.');
