from pathlib import Path
import re

PRODUCERS = Path('src/data/phase10bProducers.ts')
REPORT = Path('reports/phase10b_peloponnese_northern_greece_tuscany.md')
TEST = Path('src/data/phase10bProducerTaxonomy.test.ts')

AUDITED_IDENTITIES = {
    'monemvasia-winery': 'ChIJwU0GkC4-nhQRlcJGAJ6fbWk',
    'propator-sknipa-brewery': 'ChIJHSyH3VFAqBQRdF-4PVdW8f8',
    'alpha-estate': 'ChIJq_TNZHdzVxMRrY3Giv0bikM',
    'ktima-pavlidis': 'ChIJiVyvYCBYqRQRgo04TZknytU',
}

UNRESOLVED_NORTHERN_GREECE = (
    'domaine-biblia-chora',
    'domaine-karanika',
    'siris-craft-brewery',
    'thymiopoulos-naoussa',
)

MIGRATIONS = (
    '20260915123444_phase10b_persist_monemvasia_google_place_id',
    '20260915125512_phase10b_persist_sknipa_google_place_id',
    '20260915125656_phase10b_persist_northern_greece_google_place_ids_batch2',
)


def patch_producer_identity(text: str, producer_id: str, place_id: str) -> str:
    pattern = re.compile(
        rf"  \{{\n    id: '{re.escape(producer_id)}',.*?\n  \}},",
        re.S,
    )
    match = pattern.search(text)
    if not match:
        raise RuntimeError(f'Could not find fallback record: {producer_id}')

    block = match.group(0)
    map_url = f'https://www.google.com/maps/place/?q=place_id:{place_id}'

    if 'googleMapsUrl:' in block:
        block = re.sub(
            r"    googleMapsUrl: '.*?',\n",
            f"    googleMapsUrl: '{map_url}',\n",
            block,
            count=1,
        )
    else:
        block, count = re.subn(
            r"(    website: '.*?',\n)",
            rf"\1    googleMapsUrl: '{map_url}',\n",
            block,
            count=1,
        )
        if count != 1:
            raise RuntimeError(f'Could not insert Google Maps URL: {producer_id}')

    if 'googlePlaceId:' in block:
        block = re.sub(
            r"    googlePlaceId: '.*?',\n",
            f"    googlePlaceId: '{place_id}',\n",
            block,
            count=1,
        )
    else:
        block, count = re.subn(
            r"(    googleMapsUrl: '.*?',\n)",
            rf"\1    googlePlaceId: '{place_id}',\n",
            block,
            count=1,
        )
        if count != 1:
            raise RuntimeError(f'Could not insert Google Place ID: {producer_id}')

    return text[: match.start()] + block + text[match.end() :]


producer_text = PRODUCERS.read_text(encoding='utf-8')
for producer_id, place_id in AUDITED_IDENTITIES.items():
    producer_text = patch_producer_identity(producer_text, producer_id, place_id)
PRODUCERS.write_text(producer_text, encoding='utf-8')

report = REPORT.read_text(encoding='utf-8')
report = re.sub(
    r'accepted persistent Google Place IDs: \*\*\d+ / 19\*\*',
    'accepted persistent Google Place IDs: **14 / 19**',
    report,
)
report = re.sub(
    r'Google-media eligible Phase 10B records: \*\*\d+ / 19\*\*',
    'Google-media eligible Phase 10B records: **14 / 19**',
    report,
)

for migration in MIGRATIONS:
    report = report.replace(f'- `{migration}`\n', '')
anchor = '- `20260915105042_phase10b_separate_producer_identity_from_public_point`\n'
if anchor not in report:
    raise RuntimeError('Could not find Phase 10B migration-list anchor')
report = report.replace(
    anchor,
    anchor + ''.join(f'- `{migration}`\n' for migration in MIGRATIONS),
    1,
)

report = report.replace(
    'The next gate is the **remaining Google identity and road/access audit**:',
    'The next gate is the **remaining Google identity and Discovery Guide audit**:',
)
report = report.replace(
    '3. run the full automated quality gate after the taxonomy/fallback release;\n'
    '4. perform a separate road-evidence review; location verification alone must not classify a road;\n'
    '5. design candidate Discovery Guides only from verified stops, with multi-stop navigation withheld wherever access evidence remains incomplete;\n'
    '6. complete a production smoke before any Phase 10B regional reference-quality claim.',
    '3. preserve the completed road-evidence audit as a separate safety gate; do not upgrade reviewed-but-unconfirmed approaches without new evidence;\n'
    '4. design candidate Discovery Guides only from verified stops, with multi-stop navigation withheld wherever access evidence remains incomplete;\n'
    '5. run the full automated quality gate after fallback parity is synchronized;\n'
    '6. complete a production smoke before any Phase 10B regional reference-quality claim.',
)
REPORT.write_text(report, encoding='utf-8')

test = TEST.read_text(encoding='utf-8')
# Remove the earlier one-off Monemvasia test if this script is run after the previous patch version.
test = re.sub(
    r"  it\('persists the audited Monemvasia Google Place identity', \(\) => \{.*?^  \}\);\n\n",
    '',
    test,
    flags=re.S | re.M,
)

anchor = "  it('does not turn producer-owned shop points into shop catalogue categories', () => {"
if "persists the audited Phase 10B Google Place identities" not in test:
    addition = """  it('persists the audited Phase 10B Google Place identities', () => {\n    const expected = new Map([\n      ['monemvasia-winery', 'ChIJwU0GkC4-nhQRlcJGAJ6fbWk'],\n      ['propator-sknipa-brewery', 'ChIJHSyH3VFAqBQRdF-4PVdW8f8'],\n      ['alpha-estate', 'ChIJq_TNZHdzVxMRrY3Giv0bikM'],\n      ['ktima-pavlidis', 'ChIJiVyvYCBYqRQRgo04TZknytU'],\n    ]);\n\n    for (const [producerId, placeId] of expected) {\n      const producer = PHASE10B_PRODUCERS.find((item) => item.id === producerId);\n      expect(producer?.googlePlaceId).toBe(placeId);\n      expect(['verified_location', 'verified_entrance']).toContain(\n        producer?.locationStatus\n      );\n      expect(isGooglePlacesEligible(producerId)).toBe(true);\n    }\n  });\n\n  it('keeps unresolved Northern Greece Google identities fail-closed', () => {\n    const unresolved = [\n      'domaine-biblia-chora',\n      'domaine-karanika',\n      'siris-craft-brewery',\n      'thymiopoulos-naoussa',\n    ];\n\n    for (const producerId of unresolved) {\n      const producer = PHASE10B_PRODUCERS.find((item) => item.id === producerId);\n      expect(producer?.googlePlaceId).toBeUndefined();\n      expect(isGooglePlacesEligible(producerId)).toBe(false);\n    }\n  });\n\n"""
    if anchor not in test:
        raise RuntimeError('Could not find taxonomy test insertion anchor')
    test = test.replace(anchor, addition + anchor, 1)
TEST.write_text(test, encoding='utf-8')

print('Phase 10B Google Place fallback parity patched: 14/19 eligible; 5/9 Northern Greece.')
