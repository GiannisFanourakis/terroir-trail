import fs from 'fs';
import path from 'path';
import { SEO_PRODUCERS } from './seoCatalogue';

const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');
const stale =
  'TerroirTrail is an independent producer and agritourism discovery guide connecting culinary travelers and road-trippers directly with independent wineries, craft breweries, artisanal olive mills, traditional dairies, apiaries, traditional distilleries, and farms. Crete and Santorini are the current reference-quality regions.';
const current =
  `TerroirTrail is an independent producer and agritourism discovery guide connecting culinary travelers and road-trippers with ${SEO_PRODUCERS.length} audited producer/project records across Crete, Santorini, the Peloponnese, Northern Greece and Tuscany.`;

if (!fs.existsSync(indexPath)) {
  console.error(`[SEO Homepage Finalization Failed] ${indexPath} is missing.`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf-8');
if (!html.includes(stale)) {
  console.error('[SEO Homepage Finalization Failed] Expected legacy noscript FAQ sentence was not found.');
  process.exit(1);
}

const normalized = html.replaceAll(stale, current);
if (normalized.includes('Crete and Santorini are the current reference-quality regions')) {
  console.error('[SEO Homepage Finalization Failed] A stale reference-region claim remains after normalization.');
  process.exit(1);
}

fs.writeFileSync(indexPath, normalized, 'utf-8');
console.log(`✓ Homepage FAQ normalization complete (${SEO_PRODUCERS.length} audited records).`);
