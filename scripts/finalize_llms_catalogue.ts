import fs from 'fs';
import path from 'path';
import {
  LIVE_CATALOGUE_METRICS,
  LIVE_COUNTRY_NAMES,
  buildCatalogueCountryBreakdownLines,
} from './seoCatalogue';

const llmsPath = path.resolve(process.cwd(), 'dist', 'llms.txt');
const fail = (message: string): never => {
  console.error(`[llms.txt finalization failed] ${message}`);
  process.exit(1);
};

if (!fs.existsSync(llmsPath)) fail(`${llmsPath} is missing. Run Vite build before llms.txt finalization.`);

const replacements: Record<string, string> = {
  '{{LIVE_PRODUCER_COUNT}}': String(LIVE_CATALOGUE_METRICS.totalProducers),
  '{{LIVE_DESTINATION_COUNT}}': String(LIVE_CATALOGUE_METRICS.destinationCount),
  '{{LIVE_COUNTRY_COUNT}}': String(LIVE_CATALOGUE_METRICS.countryCount),
  '{{LIVE_REGION_COUNT}}': String(LIVE_CATALOGUE_METRICS.regionCount),
  '{{LIVE_CATEGORY_COUNT}}': String(LIVE_CATALOGUE_METRICS.categoryCount),
  '{{LIVE_COUNTRY_NAMES}}': LIVE_COUNTRY_NAMES.join(', '),
  '{{LIVE_GEO_SCOPE_LINES}}': buildCatalogueCountryBreakdownLines().join('\n'),
};

let content = fs.readFileSync(llmsPath, 'utf-8');
for (const [token, value] of Object.entries(replacements)) content = content.replaceAll(token, value);
if (content.includes('{{LIVE_')) fail('Unresolved live-catalogue placeholder remains in dist/llms.txt.');
fs.writeFileSync(llmsPath, content, 'utf-8');
console.log(`llms.txt catalogue state finalized from ${LIVE_CATALOGUE_METRICS.totalProducers} synchronized active records.`);
