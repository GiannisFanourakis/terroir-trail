import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/services/producerService.test.ts');
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
  'stale all-road-access-undefined assertion',
  `      // Verify NO synthetic road access claims exist
      expect(CRETAN_PRODUCERS.every((p) => p.roadAccess === undefined)).toBe(true);`,
  `      // Only source-backed verified road classifications may exist in fallback data.
      const roadClassified = CRETAN_PRODUCERS.filter((p) => p.roadAccess !== undefined);
      expect(roadClassified).toHaveLength(1);
      expect(roadClassified[0].id).toBe('peskesi-farm-kazani');
      expect(roadClassified[0].roadAccess).toBe('unpaved_passable');
      expect(roadClassified[0].roadAccessStatus).toBe('verified');

      // Every Crete road-access record has now been reviewed; unknown remains explicit.
      expect(
        CRETAN_PRODUCERS.every(
          (p) => p.roadAccessStatus !== undefined && p.roadAccessStatus !== 'unreviewed'
        )
      ).toBe(true);`
);

replaceExactly(
  'wild herbs road status assertion',
  `      expect(wildHerbs?.locationStatus).toBe('verified_location');
      expect(wildHerbs?.visitStatus).toBe('seasonal_public');`,
  `      expect(wildHerbs?.locationStatus).toBe('verified_location');
      expect(wildHerbs?.visitStatus).toBe('seasonal_public');
      expect(wildHerbs?.roadAccess).toBeUndefined();
      expect(wildHerbs?.roadAccessStatus).toBe('current_access_uncertain');`
);

replaceExactly(
  'peskesi verified road assertion',
  `      expect(peskesi?.name).toBe('Peskesi Organic Farm');
      expect(peskesi?.greekName).toBe('Αγρόκτημα Πεσκέσι');
      expect(peskesi?.category).toBe('kazani');`,
  `      expect(peskesi?.name).toBe('Peskesi Organic Farm');
      expect(peskesi?.greekName).toBe('Αγρόκτημα Πεσκέσι');
      expect(peskesi?.category).toBe('kazani');
      expect(peskesi?.roadAccess).toBe('unpaved_passable');
      expect(peskesi?.roadAccessStatus).toBe('verified');
      expect(peskesi?.roadAccessSourceUrl).toBe(
        'https://peskesicrete.gr/en/experiences/explore-the-farm'
      );`
);

const banned = [
  'expect(CRETAN_PRODUCERS.every((p) => p.roadAccess === undefined)).toBe(true);',
];
for (const text of banned) {
  if (source.includes(text)) {
    throw new Error(`Stale fallback assertion still present after patch: ${text}`);
  }
}

fs.writeFileSync(target, source.replace(/\n/g, originalEol), 'utf8');
console.log('✓ Phase 6 fallback integrity test expectations updated');
