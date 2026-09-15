from pathlib import Path
import re

PRODUCERS = Path('src/data/phase10bProducers.ts')
REPORT = Path('reports/phase10b_peloponnese_northern_greece_tuscany.md')
TEST = Path('src/data/phase10bProducerTaxonomy.test.ts')

AUDITS = {
    'tetramythos-winery': (
        'narrow_paved',
        'https://visit-achaia.gr/en/see-and-do/routes/202-route5',
        'Verified for the mapped winery approach, not vineyard tracks. Tetramythos publishes its winery at the 8th km of the Pounta-Kalavryta road; the Achaia regional route guide describes this ascending road through Ano Diakopto as good but a little narrow and winding.',
    ),
    'ktima-tselepos': (
        'paved',
        'https://www.climbagiospetros.gr/en/getting-to-agios-petros/',
        'Verified for the mapped winery approach. Ktima Tselepos publishes its address at the 14th km Tripoli-Kastri road; the Tripoli-Kastri-Agios Petros corridor is documented as a paved mountain road. No claim is made about vineyard tracks beyond the visitor site.',
    ),
    'siris-craft-brewery': (
        'paved',
        'https://www.ia.ihu.gr/en/howtogetthere/',
        'Verified for the mapped brewery point. Siris publishes its brewery at the 6th km of the Serres-Thessaloniki National Road; International Hellenic University documents the Thessaloniki-Serres National Highway as the road approach into Serres. Classification applies to the public brewery point, not any unrelated service tracks.',
    ),
    'monemvasia-winery': (
        'paved',
        'https://www.monemvasiawinery.gr/privacy-policy/',
        'Verified for the mapped winery point from the producer legal premises address, which explicitly places the business on the Tarapsa-Monemvasia National Road. This does not classify vineyard or agricultural tracks.',
    ),
}


def patch_producers() -> None:
    text = PRODUCERS.read_text(encoding='utf-8')
    old_header = (
        ' * Road access intentionally remains unclassified for every record until the\n'
        ' * separate road-evidence audit. Producer visitability remains independent from\n'
        ' * the role of a mapped public point.\n'
    )
    new_header = (
        ' * Road access reflects the Phase 10B evidence audit. Verified classifications are\n'
        ' * exposed only where explicit supporting evidence exists; remaining records stay\n'
        ' * unreviewed. Producer visitability remains independent from mapped-point role.\n'
    )
    if old_header in text:
        text = text.replace(old_header, new_header, 1)

    for producer_id, (road, source, notes) in AUDITS.items():
        pattern = re.compile(
            rf"(\{{\n    id: '{re.escape(producer_id)}',.*?)(    roadAccessStatus: 'unreviewed',)(.*?\n  \}},)",
            re.S,
        )
        replacement = (
            rf"\1    roadAccess: '{road}',\n"
            rf"    roadAccessStatus: 'verified',\n"
            rf"    roadAccessSourceUrl: '{source}',\n"
            rf"    roadAccessNotes: '{notes}',\3"
        )
        text, count = pattern.subn(replacement, text, count=1)
        if count != 1:
            raise RuntimeError(f'Could not patch fallback road record: {producer_id}')

    PRODUCERS.write_text(text, encoding='utf-8')


def patch_report() -> None:
    text = REPORT.read_text(encoding='utf-8')
    old = '''### Road-access state

Road access remains fully fail-closed for Phase 10B:

- verified/classified roads: **0 / 19**
- no producer currently receives a paved/unpaved/rental-car-suitability claim;
- no Phase 10B multi-stop driving navigation may be enabled from the current evidence state.
'''
    new = '''### Road-access state

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
    if old not in text:
        raise RuntimeError('Could not find Phase 10B road-state report block')
    REPORT.write_text(text.replace(old, new, 1), encoding='utf-8')


def patch_test() -> None:
    text = TEST.read_text(encoding='utf-8')
    old = '''  it('keeps all Phase 10B road classifications fail-closed', () => {
    for (const producer of PHASE10B_PRODUCERS) {
      expect(producer.roadAccess).toBeUndefined();
      expect(producer.roadAccessStatus).toBe('unreviewed');
    }
  });
'''
    new = '''  it('exposes only independently verified Phase 10B road classifications', () => {
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
    if old not in text:
        raise RuntimeError('Could not find stale Phase 10B road guard test')
    TEST.write_text(text.replace(old, new, 1), encoding='utf-8')


patch_producers()
patch_report()
patch_test()
print('Phase 10B road fallback parity patched.')
