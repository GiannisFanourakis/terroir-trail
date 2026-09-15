from pathlib import Path
import re

PRODUCERS = Path('src/data/phase10bProducers.ts')
REPORT = Path('reports/phase10b_peloponnese_northern_greece_tuscany.md')
TEST = Path('src/data/phase10bProducerTaxonomy.test.ts')

PLACE_ID = 'ChIJwU0GkC4-nhQRlcJGAJ6fbWk'
MAP_URL = f'https://www.google.com/maps/place/?q=place_id:{PLACE_ID}'

text = PRODUCERS.read_text(encoding='utf-8')
pattern = re.compile(r"(\{\n    id: 'monemvasia-winery',.*?)(    googleMapsUrl: '.*?',\n)(.*?\n  \},)", re.S)
match = pattern.search(text)
if not match:
    raise RuntimeError('Could not find Monemvasia fallback record')
block = match.group(0)
if 'googlePlaceId:' not in block:
    replacement = rf"\1    googleMapsUrl: '{MAP_URL}',\n    googlePlaceId: '{PLACE_ID}',\n\3"
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise RuntimeError('Could not patch Monemvasia fallback identity')
PRODUCERS.write_text(text, encoding='utf-8')

report = REPORT.read_text(encoding='utf-8')
report = report.replace('accepted persistent Google Place IDs: **10 / 19**', 'accepted persistent Google Place IDs: **11 / 19**')
report = report.replace('Google-media eligible Phase 10B records: **10 / 19**', 'Google-media eligible Phase 10B records: **11 / 19**')
needle = '- `20260915105042_phase10b_separate_producer_identity_from_public_point`\n'
if needle in report and '20260915123444_phase10b_persist_monemvasia_google_place_id' not in report:
    report = report.replace(needle, needle + '- `20260915123444_phase10b_persist_monemvasia_google_place_id`\n', 1)
REPORT.write_text(report, encoding='utf-8')

test = TEST.read_text(encoding='utf-8')
anchor = "  it('does not turn producer-owned shop points into shop catalogue categories', () => {"
if "persists the audited Monemvasia Google Place identity" not in test:
    addition = """  it('persists the audited Monemvasia Google Place identity', () => {\n    const monemvasia = PHASE10B_PRODUCERS.find(\n      (producer) => producer.id === 'monemvasia-winery'\n    );\n\n    expect(monemvasia?.googlePlaceId).toBe('ChIJwU0GkC4-nhQRlcJGAJ6fbWk');\n    expect(monemvasia?.locationStatus).toBe('verified_location');\n    expect(isGooglePlacesEligible('monemvasia-winery')).toBe(true);\n  });\n\n"""
    if anchor not in test:
        raise RuntimeError('Could not find taxonomy test insertion anchor')
    test = test.replace(anchor, addition + anchor, 1)
TEST.write_text(test, encoding='utf-8')

print('Monemvasia Place ID fallback parity patched.')
