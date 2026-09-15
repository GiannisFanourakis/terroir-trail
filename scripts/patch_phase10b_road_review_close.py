from pathlib import Path
import re

PRODUCERS = Path('src/data/phase10bProducers.ts')
TEST = Path('src/data/phase10bProducerTaxonomy.test.ts')
REPORT = Path('reports/phase10b_peloponnese_northern_greece_tuscany.md')

VERIFIED = {
    'tetramythos-winery': 'narrow_paved',
    'ktima-tselepos': 'paved',
    'siris-craft-brewery': 'paved',
    'monemvasia-winery': 'paved',
    'propator-sknipa-brewery': 'paved',
    'monteraponi-tuscany': 'unpaved_passable',
}

NEW_VERIFIED = {
    'propator-sknipa-brewery': (
        'paved',
        'https://www.pkm.gov.gr/ergasies-syntirisis-stin-16i-ethniki-odo-thessalonikis-polygyrou-apo-tin-perifereia-kentrikis-makedonia/',
        'Verified for the mapped brewery approach. Sknipa publishes its facilities at the 17th km Thessaloniki-Polygyros road; the Region of Central Macedonia identifies this corridor as National Road 16 and publishes active road-maintenance and traffic works on it. Classification applies to the mapped public brewery point and public-road approach, not internal service lanes.',
    ),
    'monteraponi-tuscany': (
        'unpaved_passable',
        'https://www.slowfood.it/slowine/grande-viaggio-del-vino-italiano-villa-venti-corzano-paterno-luoghi-monteraponi-tabarrini/',
        'Verified unpaved approach to the mapped estate. Slow Wine describes Monteraponi as reachable by an unpaved road from the Radda-Castellina road; later route material continues to identify gravel sectors in the Monteraponi area. This classification confirms passable unpaved access only and does not imply rental-car suitability.',
    ),
}

REVIEWED_UNKNOWN = {
    'alpha-estate',
    'domaine-biblia-chora',
    'domaine-karanika',
    'ktima-gerovassiliou',
    'kir-yianni-naoussa',
    'ktima-pavlidis',
    'thymiopoulos-naoussa',
    'domaine-mercouri',
    'skouras-winery-nemea',
    'gaia-wines-nemea',
    'kykao-handcrafted-beers',
    'liokareas-olive-estate',
    'semeli-estate-nemea',
}

UNKNOWN_NOTE = 'Phase 10B road-evidence review completed. No sufficiently specific current public evidence was found to classify the mapped public-point approach road. No road-surface or normal-rental-car suitability claim is exposed.'


def patch_record(text: str, producer_id: str, replacement_lines: str) -> str:
    pattern = re.compile(
        rf"(\{{\n    id: '{re.escape(producer_id)}',.*?)(    roadAccessStatus: '(?:unreviewed|not_publicly_confirmed)',(?:\n    roadAccessNotes: '.*?',)?)(.*?\n  \}},)",
        re.S,
    )
    replacement = rf"\1{replacement_lines}\3"
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise RuntimeError(f'Could not patch road record: {producer_id}')
    return text


def patch_producers() -> None:
    text = PRODUCERS.read_text(encoding='utf-8')
    for producer_id, (road, source, notes) in NEW_VERIFIED.items():
        lines = (
            f"    roadAccess: '{road}',\n"
            "    roadAccessStatus: 'verified',\n"
            f"    roadAccessSourceUrl: '{source}',\n"
            f"    roadAccessNotes: '{notes}',"
        )
        text = patch_record(text, producer_id, lines)

    for producer_id in REVIEWED_UNKNOWN:
        lines = (
            "    roadAccessStatus: 'not_publicly_confirmed',\n"
            f"    roadAccessNotes: '{UNKNOWN_NOTE}',"
        )
        text = patch_record(text, producer_id, lines)

    PRODUCERS.write_text(text, encoding='utf-8')


def patch_test() -> None:
    text = TEST.read_text(encoding='utf-8')
    text = text.replace(
        "    expect(liokareas?.roadAccessStatus).toBe('unreviewed');",
        "    expect(liokareas?.roadAccessStatus).toBe('not_publicly_confirmed');",
    )
    old = '''  it('exposes only independently verified Phase 10B road classifications', () => {
    const expectedVerifiedRoads = new Map([
      ['tetramythos-winery', 'narrow_paved'],
      ['ktima-tselepos', 'paved'],
      ['siris-craft-brewery', 'paved'],
      ['monemvasia-winery', 'paved'],
    ] as const);

    const verified = PHASE10B_PRODUCERS.filter(
      (producer) => producer.roadAccessStatus === 'verified'
    );
    expect(verified).toHaveLength(4);

    for (const producer of PHASE10B_PRODUCERS) {
      const expectedRoad = expectedVerifiedRoads.get(producer.id);
      if (expectedRoad) {
        expect(producer.roadAccess).toBe(expectedRoad);
        expect(producer.roadAccessStatus).toBe('verified');
        expect(producer.roadAccessSourceUrl).toBeTruthy();
        expect(producer.roadAccessNotes).toBeTruthy();
      } else {
        expect(producer.roadAccess).toBeUndefined();
        expect(producer.roadAccessStatus).toBe('unreviewed');
      }
    }

    expect(
      PHASE10B_PRODUCERS.find((producer) => producer.id === 'liokareas-olive-estate')
        ?.roadAccessStatus
    ).toBe('unreviewed');
  });
'''
    new = '''  it('exposes only independently verified Phase 10B road classifications', () => {
    const expectedVerifiedRoads = new Map([
      ['tetramythos-winery', 'narrow_paved'],
      ['ktima-tselepos', 'paved'],
      ['siris-craft-brewery', 'paved'],
      ['monemvasia-winery', 'paved'],
      ['propator-sknipa-brewery', 'paved'],
      ['monteraponi-tuscany', 'unpaved_passable'],
    ] as const);

    const verified = PHASE10B_PRODUCERS.filter(
      (producer) => producer.roadAccessStatus === 'verified'
    );
    expect(verified).toHaveLength(6);

    const reviewedUnknown = PHASE10B_PRODUCERS.filter(
      (producer) => producer.roadAccessStatus === 'not_publicly_confirmed'
    );
    expect(reviewedUnknown).toHaveLength(13);

    for (const producer of PHASE10B_PRODUCERS) {
      const expectedRoad = expectedVerifiedRoads.get(producer.id);
      if (expectedRoad) {
        expect(producer.roadAccess).toBe(expectedRoad);
        expect(producer.roadAccessStatus).toBe('verified');
        expect(producer.roadAccessSourceUrl).toBeTruthy();
        expect(producer.roadAccessNotes).toBeTruthy();
      } else {
        expect(producer.roadAccess).toBeUndefined();
        expect(producer.roadAccessStatus).toBe('not_publicly_confirmed');
        expect(producer.roadAccessNotes).toBeTruthy();
      }
    }

    expect(
      PHASE10B_PRODUCERS.find((producer) => producer.id === 'liokareas-olive-estate')
        ?.roadAccessStatus
    ).toBe('not_publicly_confirmed');
  });
'''
    if old not in text:
        raise RuntimeError('Could not find batch-1 road guard test')
    TEST.write_text(text.replace(old, new, 1), encoding='utf-8')


def patch_report() -> None:
    text = REPORT.read_text(encoding='utf-8')
    old = '''### Road-access state

The separate road-evidence audit is now in progress. Batch 1 verified only records with sufficiently specific approach-road evidence:

- verified/classified roads: **4 / 19**;
- `tetramythos-winery`: `narrow_paved`;
- `ktima-tselepos`: `paved`;
- `siris-craft-brewery`: `paved`;
- `monemvasia-winery`: `paved`;
- remaining unreviewed roads: **15 / 19**;
- vineyard, orchard, agricultural and unrelated service tracks are not inferred from the public-point classification;
- no Phase 10B multi-stop driving navigation is enabled merely because individual stops have passed road review.

Applied road migration:

- `20260915121803_phase10b_road_access_audit_batch1`
'''
    new = '''### Road-access state

The Phase 10B public road-evidence review is complete. Classifications are exposed only where sufficiently specific evidence exists:

- verified/classified roads: **6 / 19**;
- reviewed but not publicly confirmed: **13 / 19**;
- unreviewed roads: **0 / 19**;
- `tetramythos-winery`: `narrow_paved`;
- `ktima-tselepos`: `paved`;
- `siris-craft-brewery`: `paved`;
- `monemvasia-winery`: `paved`;
- `propator-sknipa-brewery`: `paved`;
- `monteraponi-tuscany`: `unpaved_passable` and therefore not treated as normal rental-car route evidence;
- vineyard, orchard, agricultural and unrelated service tracks are never inferred from the public-point classification;
- no Phase 10B multi-stop driving navigation is enabled merely because individual stops have passed road review.

Applied road migrations:

- `20260915121803_phase10b_road_access_audit_batch1`
- `20260915123105_phase10b_road_access_audit_batch2_and_review_close`
'''
    if old not in text:
        raise RuntimeError('Could not find batch-1 road report block')
    text = text.replace(old, new, 1)
    text = text.replace(
        'remaining Google identity, road/access, Discovery Guide, and production-reference gates remain open.',
        'remaining Google identity, Discovery Guide, and production-reference gates remain open; 13 road approaches remain explicitly reviewed-but-unconfirmed.',
        1,
    )
    REPORT.write_text(text, encoding='utf-8')


patch_producers()
patch_test()
patch_report()
print('Phase 10B road review close parity patched.')
