import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const dataPath = path.join(ROOT, 'src/data/phase10bProducers.ts');
const taxonomyTestPath = path.join(ROOT, 'src/data/phase10bProducerTaxonomy.test.ts');
const mediaTestPath = path.join(
  ROOT,
  'src/components/GooglePlaces/GooglePlaceMediaAllowlist.test.tsx'
);

const PLACE_IDS: Record<string, string> = {
  'gaia-wines-nemea': 'ChIJ2a11wv8GoBQR1Nhkz3BBHp8',
  'domaine-karanika': 'ChIJX9l0oa5xVxMRglPJ5KpuwkU',
  'domaine-biblia-chora': 'ChIJh9l_wOcwqRQRtzn_AKprzo8',
  'thymiopoulos-naoussa': 'ChIJS3in-tOTVxMRPLSA3w4amOQ',
  'siris-craft-brewery': 'ChIJb5JrTlRRqRQRk35ZlaAr9Yo',
};

function patchProducer(source: string, producerId: string, placeId: string): string {
  const marker = `    id: '${producerId}',`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Producer block not found: ${producerId}`);

  const end = source.indexOf('\n  },', start);
  if (end < 0) throw new Error(`Producer block terminator not found: ${producerId}`);

  let block = source.slice(start, end);
  block = block.replace(/\n    googleMapsUrl: '[^']*',/g, '');
  block = block.replace(/\n    googlePlaceId: '[^']*',/g, '');

  const websiteMatch = block.match(/\n    website: '[^']*',/);
  if (!websiteMatch) throw new Error(`Website line not found: ${producerId}`);

  const canonicalMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  const insertion = `${websiteMatch[0]}\n    googleMapsUrl: '${canonicalMapsUrl}',\n    googlePlaceId: '${placeId}',`;
  block = block.replace(websiteMatch[0], insertion);

  return source.slice(0, start) + block + source.slice(end);
}

let dataSource = fs.readFileSync(dataPath, 'utf8').replace(/\r\n/g, '\n');
for (const [producerId, placeId] of Object.entries(PLACE_IDS)) {
  dataSource = patchProducer(dataSource, producerId, placeId);
}

dataSource = dataSource.replace(
  'Google Place ID remains unresolved and road access remains unreviewed.',
  'Google Place identity verified against the current GAIA Nemea listing; road access remains not publicly confirmed.'
);

fs.writeFileSync(dataPath, dataSource, 'utf8');

let taxonomy = fs.readFileSync(taxonomyTestPath, 'utf8').replace(/\r\n/g, '\n');

const expectedInsertions = [
  "      ['gaia-wines-nemea', 'ChIJ2a11wv8GoBQR1Nhkz3BBHp8'],",
  "      ['domaine-karanika', 'ChIJX9l0oa5xVxMRglPJ5KpuwkU'],",
  "      ['domaine-biblia-chora', 'ChIJh9l_wOcwqRQRtzn_AKprzo8'],",
  "      ['thymiopoulos-naoussa', 'ChIJS3in-tOTVxMRPLSA3w4amOQ'],",
  "      ['siris-craft-brewery', 'ChIJb5JrTlRRqRQRk35ZlaAr9Yo'],",
];

const mapAnchor = "      ['ktima-pavlidis', 'ChIJiVyvYCBYqRQRgo04TZknytU'],";
if (!taxonomy.includes(mapAnchor)) {
  throw new Error('Could not locate Phase 10B Place ID test map anchor.');
}
for (const insertion of expectedInsertions) {
  if (!taxonomy.includes(insertion)) {
    taxonomy = taxonomy.replace(mapAnchor, `${mapAnchor}\n${insertion}`);
  }
}

const unresolvedTestStart = taxonomy.indexOf(
  "  it('keeps unresolved Northern Greece Google identities fail-closed'"
);
if (unresolvedTestStart >= 0) {
  const nextTest = taxonomy.indexOf(
    "  it('does not turn producer-owned shop points into shop catalogue categories'",
    unresolvedTestStart
  );
  if (nextTest < 0) throw new Error('Could not locate test after unresolved identity test.');
  taxonomy = taxonomy.slice(0, unresolvedTestStart) + taxonomy.slice(nextTest);
}

fs.writeFileSync(taxonomyTestPath, taxonomy, 'utf8');

let mediaTest = fs.readFileSync(mediaTestPath, 'utf8').replace(/\r\n/g, '\n');
if (!mediaTest.includes('expect(PHASE10B_GOOGLE_MEDIA_PRODUCERS).toHaveLength(14);')) {
  throw new Error('Expected Phase 10B Google media count assertion was not found.');
}
mediaTest = mediaTest.replace(
  'expect(PHASE10B_GOOGLE_MEDIA_PRODUCERS).toHaveLength(14);',
  'expect(PHASE10B_GOOGLE_MEDIA_PRODUCERS).toHaveLength(19);'
);
fs.writeFileSync(mediaTestPath, mediaTest, 'utf8');

console.log('✓ Patched Phase 10B Google Place fallback parity for 5 producers.');
console.log('✓ Updated Phase 10B taxonomy Place ID expectations.');
console.log('✓ Updated Google media eligibility count from 14 to 19.');
console.log('Run npm run check before committing.');
