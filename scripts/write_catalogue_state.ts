import fs from 'fs';
import path from 'path';
import { SEO_PRODUCERS } from './seoCatalogue';
import { buildCatalogueState } from './catalogueState';

const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  throw new Error('dist/ is missing. Build the application before writing catalogue-state.json.');
}

const state = buildCatalogueState(SEO_PRODUCERS);
const target = path.join(distDir, 'catalogue-state.json');
fs.writeFileSync(target, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');

console.log(
  `Catalogue state written: ${state.producers} producers / ${state.destinations} destinations / ${state.countries} countries / hash ${state.catalogueHash.slice(0, 12)}…`
);
