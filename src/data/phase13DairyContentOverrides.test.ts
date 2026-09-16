import { describe, expect, it } from 'vitest';
import { AUDITED_PRODUCERS } from './auditedProducers';
import { PHASE13_DAIRY_PRODUCERS } from './phase13DairyProducers';

const PHASE13_IDS = new Set(PHASE13_DAIRY_PRODUCERS.map((producer) => producer.id));
const ENRICHED = AUDITED_PRODUCERS.filter((producer) => PHASE13_IDS.has(producer.id));

describe('Phase 13 dairy content completeness', () => {
  it('keeps all 7 retained additions in the audited bundled catalogue', () => {
    expect(PHASE13_DAIRY_PRODUCERS).toHaveLength(7);
    expect(ENRICHED).toHaveLength(7);
  });

  it('gives every retained Phase 13 dairy a substantive story and source-backed product summary', () => {
    for (const producer of ENRICHED) {
      expect(producer.tagLine.trim().length, producer.id).toBeGreaterThan(20);
      expect(producer.description.trim().length, producer.id).toBeGreaterThan(100);
      expect(producer.story.trim().length, producer.id).toBeGreaterThan(250);
      expect(producer.productSpecialties?.length ?? 0, producer.id).toBeGreaterThan(0);
    }
  });

  it('mirrors product specialties into the current legacy display field without replacing the category-neutral authority', () => {
    for (const producer of ENRICHED) {
      expect(producer.indigenousVarieties, producer.id).toEqual(
        producer.productSpecialties
      );
    }
  });
});
