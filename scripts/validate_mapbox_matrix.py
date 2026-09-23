import json, math, os, sys, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
catalogue = ROOT / 'src' / 'data' / 'liveCatalogue.generated.ts'
text = catalogue.read_text(encoding='utf-8')
start = text.index('[')
end = text.rindex('] as Producer[];') + 1
producers = {p['id']: p for p in json.loads(text[start:end])}

SAMPLES = {
    'western_crete': [
        'biolea-estate',
        'anoskeli-estate',
        'cretan-brewery-charma',
        'baladinos-dairy-varipetro',
    ],
    'tuscany_chianti': [
        'fattoria-corzano-e-paterno-tuscany',
        'monteraponi-tuscany',
        'tenuta-cantagallo-tuscany',
    ],
    'istria': [
        'brist-olive-oil-istria',
        'chiavalon-istria',
        'grubic-olive-oil-istria',
        'ipsa-istria',
    ],
}

token = os.environ.get('MAPBOX_ACCESS_TOKEN', '').strip()
if not token:
    raise SystemExit('MAPBOX_ACCESS_TOKEN is not set')

def haversine_km(a, b):
    lat1, lon1 = map(math.radians, a)
    lat2, lon2 = map(math.radians, b)
    dlat, dlon = lat2-lat1, lon2-lon1
    x = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    return 6371.0088 * 2 * math.asin(math.sqrt(x))

failed = False
for label, ids in SAMPLES.items():
    rows = [producers[i] for i in ids]
    coords = ';'.join(f"{p['coordinates'][1]},{p['coordinates'][0]}" for p in rows)
    params = urllib.parse.urlencode({'annotations':'duration,distance','access_token':token})
    url = f'https://api.mapbox.com/directions-matrix/v1/mapbox/driving/{coords}?{params}'
    with urllib.request.urlopen(url, timeout=15) as response:
        body = json.load(response)

    if body.get('code') != 'Ok':
        print(f'{label}: FAIL provider code={body.get("code")}')
        failed = True
        continue

    durations, distances = body['durations'], body['distances']
    nulls = sum(v is None for row in durations for v in row)
    bad_diag = any(durations[i][i] != 0 or distances[i][i] != 0 for i in range(len(ids)))
    print(f'\n{label}: {len(ids)} stops, null_legs={nulls}, diagonal_ok={not bad_diag}')
    for i in range(len(ids)):
        for j in range(i+1, len(ids)):
            road_km = distances[i][j] / 1000 if distances[i][j] is not None else None
            minutes = durations[i][j] / 60 if durations[i][j] is not None else None
            straight = haversine_km(rows[i]['coordinates'], rows[j]['coordinates'])
            ratio = road_km / straight if road_km is not None and straight > 0 else None
            print(f"  {rows[i]['name']} -> {rows[j]['name']}: {road_km:.1f} km, {minutes:.0f} min, road/straight={ratio:.2f}")
            if road_km is None or minutes is None or road_km < straight * 0.95 or ratio > 4.0 or minutes <= 0:
                failed = True
    if nulls or bad_diag:
        failed = True

print('\nRESULT=' + ('FAIL' if failed else 'PASS'))
sys.exit(1 if failed else 0)