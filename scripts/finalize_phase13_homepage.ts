import fs from 'fs';
import path from 'path';
import { CRETAN_PRODUCERS } from '../src/data/producers';
import { SANTORINI_PRODUCERS } from '../src/data/santoriniProducers';
import { PHASE10B_PRODUCERS } from '../src/data/phase10bProducers';
import { PHASE13_DAIRY_PRODUCERS } from '../src/data/phase13DairyProducers';

const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');
const total =
  CRETAN_PRODUCERS.length +
  SANTORINI_PRODUCERS.length +
  PHASE10B_PRODUCERS.length +
  PHASE13_DAIRY_PRODUCERS.length;

if (!fs.existsSync(indexPath)) {
  console.error(`[SEO Homepage Finalization Failed] ${indexPath} is missing.`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

const legacyReferenceSentence =
  'TerroirTrail is an independent producer and agritourism discovery guide connecting culinary travelers and road-trippers directly with independent wineries, craft breweries, artisanal olive mills, traditional dairies, apiaries, traditional distilleries, and farms. Crete and Santorini are the current reference-quality regions.';
const currentSentence =
  `TerroirTrail is an independent producer and agritourism discovery guide connecting culinary travelers and road-trippers with ${total} audited producer/project records across Crete, Santorini, the Peloponnese, Northern Greece and Tuscany.`;

html = html.replaceAll(legacyReferenceSentence, currentSentence);
html = html.replaceAll('55 audited producer/project records', `${total} audited producer/project records`);
html = html.replaceAll('55 producer/project records', `${total} producer/project records`);
html = html.replaceAll('The audited catalogue currently covers Crete, Santorini, the Peloponnese, Northern Greece and a Tuscany / Italy foothold: 55 producer/project records in total.', `The audited catalogue currently covers Crete, Santorini, the Peloponnese, Northern Greece and a Tuscany / Italy foothold: ${total} producer/project records in total.`);

if (html.includes('55 audited producer/project records') || html.includes('55 producer/project records')) {
  console.error('[SEO Homepage Finalization Failed] A stale 55-record claim remains.');
  process.exit(1);
}
if (!html.includes(`${total} audited producer/project records`)) {
  console.error(`[SEO Homepage Finalization Failed] ${total}-record catalogue claim was not written.`);
  process.exit(1);
}

fs.writeFileSync(indexPath, html, 'utf-8');
console.log(`✓ Phase 13 homepage SEO normalization complete (${total} audited records).`);
