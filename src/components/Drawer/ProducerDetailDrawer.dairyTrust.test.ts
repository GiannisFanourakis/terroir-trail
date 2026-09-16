import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DRAWER_SOURCE = readFileSync(
  resolve(process.cwd(), 'src/components/Drawer/ProducerDetailDrawer.tsx'),
  'utf8'
);

function dairyTerminologyBlock(): string {
  const start = DRAWER_SOURCE.indexOf("case 'cheese_dairy':");
  const end = DRAWER_SOURCE.indexOf("case 'apiary':", start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return DRAWER_SOURCE.slice(start, end);
}

describe('ProducerDetailDrawer — Phase 13 dairy trust guard', () => {
  it('renders category-neutral product specialties instead of the legacy variety field', () => {
    expect(DRAWER_SOURCE).toContain(
      "import { getProducerDisplaySpecialties } from '../../utils/producerSpecialties';"
    );
    expect(DRAWER_SOURCE).toContain(
      'const displaySpecialties = getProducerDisplaySpecialties(producer);'
    );
    expect(DRAWER_SOURCE).toContain('displaySpecialties.map((v, i) => (');
    expect(DRAWER_SOURCE).not.toContain('producer.indigenousVarieties.map((v, i) => (');
  });

  it('keeps dairy language neutral unless an individual producer record supplies the evidence', () => {
    const dairy = dairyTerminologyBlock();

    expect(dairy).toContain("whatTheyMakeTitle: 'Cheeses & Dairy Products'");
    expect(dairy).toContain("specialtiesLabel: 'Products & Specialties'");
    expect(dairy).toContain("highlightsLabel: 'Dairy Highlights'");
    expect(dairy).toContain("hasDeliveryBoxes: false");

    for (const unsupportedGenericClaim of [
      'mitato',
      'mountain cheeses',
      'mountain milk',
      'Cave-Aged',
      'Vacuum Sealed',
      'cave-cured',
      'shepherd pantry',
    ]) {
      expect(dairy.toLowerCase()).not.toContain(unsupportedGenericClaim.toLowerCase());
    }
  });

  it('does not render empty specialty or highlight sections as if unknown were a fact', () => {
    expect(DRAWER_SOURCE).toContain('{displaySpecialties.length > 0 && (');
    expect(DRAWER_SOURCE).toContain('{producer.tastingHighlights.length > 0 && (');
  });
});
