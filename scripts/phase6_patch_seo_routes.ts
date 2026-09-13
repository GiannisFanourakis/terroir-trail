import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('index.html');
const originalSource = fs.readFileSync(target, 'utf8');
const originalEol = originalSource.includes('\r\n') ? '\r\n' : '\n';
let source = originalSource.replace(/\r\n/g, '\n');

function replaceExactly(label: string, before: string, after: string) {
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${occurrences}. Refusing to patch.`);
  }
  source = source.replace(before, after);
}

replaceExactly(
  'JSON-LD route offer claim',
  '            "description": "Interactive curated agritourism discovery map, directory of verified local producers in Crete, and self-guided rural discovery routes."',
  '            "description": "Interactive curated agritourism discovery map and directory of audited local producers and agricultural projects in Crete. Curated driving routes are published only after location and road-access verification."'
);

replaceExactly(
  'noscript draft route catalogue',
  `        <h2>Curated Crete Rural Discovery Loops</h2>
        <ul>
          <li><strong>Heraklion Peza & Archanes Wine Loop (Heraklion, Crete):</strong> Indigenous Vidiano, Kotsifali, Mandilari, and Dafni grape varieties across rolling vineyard hills. Stops include Domaine Paterianakis, Lyrarakis Winery, Douloufakis Winery, and Stilianou Winery.</li>
          <li><strong>Chania Mountain & Artisan Olive Oil Circuit (Chania, Crete):</strong> Single-estate Kolymvari PDO extra virgin olive oil, unfiltered craft beer, and organic mountain vineyards. Stops include Manousakis Winery, Biolea Astrikas Estate, Karavitakis Winery, and Cretan Brewery (Charma Beer).</li>
          <li><strong>Rethymno Foothills & Heritage Circuit (Rethymno, Crete):</strong> Traditional stone olive pressing, heritage cheese production, and artisan workshops. Stops include Paraschakis Family Olive Oil Factory and Tzourmpakis Dairy.</li>
          <li><strong>Lasithi & Sitia Monastic Terroir Route (Lasithi, Crete):</strong> Monastic viticulture, Sitia PDO olive oil, and coastal olive groves. Stops include Ktima Toplou and Spiridi Olive Oil Farm.</li>
        </ul>`,
  `        <h2>Curated Rural Routes Under Verification</h2>
        <p>TerroirTrail is auditing route stops, exact navigation points, and road-access evidence before publishing self-guided driving loops. Draft routes are not exposed as turn-by-turn itineraries.</p>`
);

const banned = [
  'Curated Crete Rural Discovery Loops',
  'Heraklion Peza & Archanes Wine Loop',
  'Chania Mountain & Artisan Olive Oil Circuit',
  'Rethymno Foothills & Heritage Circuit',
  'Lasithi & Sitia Monastic Terroir Route',
  'and self-guided rural discovery routes.',
];

for (const text of banned) {
  if (source.includes(text)) {
    throw new Error(`Draft route SEO claim still present after patch: ${text}`);
  }
}

if (!source.includes('Curated Rural Routes Under Verification')) {
  throw new Error('Expected route verification notice was not added.');
}

fs.writeFileSync(target, source.replace(/\n/g, originalEol), 'utf8');
console.log('✓ Phase 6 SEO route quarantine patch applied');
