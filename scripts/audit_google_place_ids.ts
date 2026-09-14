import http from 'node:http';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load local development overrides first. Never print secrets.
dotenv.config({ path: '.env.local' });
dotenv.config();

type ProducerRow = {
  id: string;
  name: string;
  greek_name?: string | null;
  region?: string | null;
  village?: string | null;
  country?: string | null;
  country_code?: string | null;
  destination?: string | null;
  lat?: number | null;
  lng?: number | null;
  location_status?: string | null;
  google_place_id?: string | null;
  google_maps_url?: string | null;
};

const args = process.argv.slice(2);
const all = args.includes('--all');

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function parseIntegerArg(name: string, fallback: number, min: number, max: number): number {
  const raw = readArg(name);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`--${name} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function parseIds(): string[] {
  const raw = readArg('ids');
  if (!raw) return [];
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildAuditHtml(producers: ProducerRow[], googleApiKey: string): string {
  const producerJson = serializeForInlineScript(producers);
  const mapsScriptUrl =
    `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleApiKey)}` +
    '&v=weekly&libraries=places&callback=initAudit';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TerroirTrail — Phase 9B Google Place ID Audit</title>
  <style>
    :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color-scheme: dark; }
    body { margin: 0; background: #11100e; color: #f5f5f4; }
    main { max-width: 1120px; margin: 0 auto; padding: 28px 18px 64px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .intro { color: #c8c4bd; line-height: 1.55; max-width: 900px; }
    .guardrail { margin: 18px 0; padding: 14px 16px; border: 1px solid #7c5d20; border-radius: 12px; background: #2a2112; color: #f4d795; }
    .toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 20px 0; }
    button { border: 0; border-radius: 9px; padding: 9px 12px; font-weight: 700; cursor: pointer; background: #e8b45a; color: #20170a; }
    button.secondary { background: #292724; color: #f5f5f4; border: 1px solid #4b4843; }
    button:disabled { opacity: .45; cursor: not-allowed; }
    #status { color: #aaa59e; font-size: 13px; }
    .producer { border: 1px solid #37332f; border-radius: 14px; padding: 16px; margin: 14px 0; background: #191816; }
    .producer-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; flex-wrap: wrap; }
    .producer h2 { margin: 0; font-size: 18px; }
    .meta { color: #a8a29e; font-size: 13px; margin-top: 5px; }
    .refs { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
    a { color: #f0c97c; }
    .results { margin-top: 14px; display: grid; gap: 10px; }
    .candidate { border: 1px solid #46413a; border-radius: 11px; padding: 12px; background: #211f1c; }
    .candidate strong { display: block; margin-bottom: 4px; }
    .candidate .line { color: #c8c4bd; font-size: 13px; margin: 3px 0; word-break: break-word; }
    .candidate .place-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #fff0c9; }
    .distance-ok { color: #9fd6ad; }
    .distance-warn { color: #f5b3a7; font-weight: 700; }
    .candidate-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 9px; }
    .small { font-size: 12px; padding: 7px 9px; }
    .checklist { margin: 28px 0 0; color: #c8c4bd; line-height: 1.6; }
    code { background: #26231f; padding: 2px 5px; border-radius: 5px; }
  </style>
</head>
<body>
<main>
  <h1>Phase 9B — Google Place ID Audit</h1>
  <p class="intro">
    This localhost-only tool searches Google Places in your browser using the already restricted development key.
    It is read-only: it never writes Place IDs to Supabase or changes TerroirTrail coordinates.
  </p>
  <div class="guardrail">
    Google results are candidates, not verified data. Only persist a Place ID after checking business identity,
    locality/address, map position, and the linked Google Maps place page. A nearby result is not enough.
  </div>
  <div class="toolbar">
    <button id="run-batch" disabled>Run this batch</button>
    <span id="status">Loading Google Places library…</span>
  </div>
  <div id="producer-list"></div>
  <div class="checklist">
    <strong>Verification checklist:</strong>
    exact producer/business identity · correct locality/address · sensible distance from the existing TerroirTrail pin ·
    Google Maps page clearly represents the same producer. Do not alter trusted TerroirTrail coordinates merely to match Google.
  </div>
</main>
<script>
  const PRODUCERS = ${producerJson};
  let PlaceClass = null;

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function queryText(producer) {
    const location = [producer.village, producer.region, producer.country].filter(Boolean).join(', ');
    return location ? producer.name + ', ' + location : producer.name;
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const r = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function placeLatLng(place) {
    const location = place.location;
    if (!location) return null;
    const lat = typeof location.lat === 'function' ? location.lat() : (location.lat ?? location.latitude);
    const lng = typeof location.lng === 'function' ? location.lng() : (location.lng ?? location.longitude);
    return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;
  }

  function renderProducerList() {
    const root = document.getElementById('producer-list');
    root.innerHTML = PRODUCERS.map((producer) => {
      const mapsRef = producer.google_maps_url
        ? '<a href="' + esc(producer.google_maps_url) + '" target="_blank" rel="noreferrer">Open existing Maps reference</a>'
        : '<span>No existing Maps reference</span>';
      return '<section class="producer" id="producer-' + esc(producer.id) + '">' +
        '<div class="producer-head"><div>' +
        '<h2>' + esc(producer.name) + '</h2>' +
        '<div class="meta">' + esc(producer.id) + ' · ' + esc(producer.village || producer.region || '') + '</div>' +
        '</div><button class="secondary search-one" data-id="' + esc(producer.id) + '" disabled>Search Google</button></div>' +
        '<div class="refs">' + mapsRef + '<span>Query: <code>' + esc(queryText(producer)) + '</code></span></div>' +
        '<div class="results" id="results-' + esc(producer.id) + '"></div>' +
        '</section>';
    }).join('');
  }

  async function searchProducer(producer) {
    if (!PlaceClass) throw new Error('Google Places library is not ready.');
    const resultsEl = document.getElementById('results-' + producer.id);
    resultsEl.innerHTML = '<div class="meta">Searching…</div>';

    const request = {
      textQuery: queryText(producer),
      fields: ['id', 'displayName', 'formattedAddress', 'location', 'googleMapsURI'],
      language: 'en',
      maxResultCount: 3,
    };

    if (producer.country_code) request.region = String(producer.country_code).toLowerCase();
    if (producer.lat != null && producer.lng != null) {
      request.locationBias = {
        center: { lat: Number(producer.lat), lng: Number(producer.lng) },
        radius: 10000,
      };
    }

    try {
      const response = await PlaceClass.searchByText(request);
      const places = response.places || [];
      if (!places.length) {
        resultsEl.innerHTML = '<div class="meta">No Google Places candidates returned.</div>';
        return;
      }

      resultsEl.innerHTML = places.map((place, index) => {
        const point = placeLatLng(place);
        let distanceText = 'Distance unavailable';
        let distanceClass = '';
        if (point && producer.lat != null && producer.lng != null) {
          const km = haversineKm(Number(producer.lat), Number(producer.lng), point.lat, point.lng);
          distanceText = km.toFixed(2) + ' km from TerroirTrail pin';
          distanceClass = km <= 3 ? 'distance-ok' : 'distance-warn';
        }
        const mapsLink = place.googleMapsURI
          ? '<a href="' + esc(place.googleMapsURI) + '" target="_blank" rel="noreferrer">Open candidate on Google Maps</a>'
          : '';
        return '<div class="candidate">' +
          '<strong>[' + (index + 1) + '] ' + esc(place.displayName || '(no display name)') + '</strong>' +
          '<div class="line place-id">' + esc(place.id || '(missing Place ID)') + '</div>' +
          '<div class="line">' + esc(place.formattedAddress || '(no address returned)') + '</div>' +
          '<div class="line ' + distanceClass + '">' + esc(distanceText) + '</div>' +
          '<div class="candidate-actions">' + mapsLink +
          (place.id ? '<button class="small copy-id" data-place-id="' + esc(place.id) + '">Copy Place ID</button>' : '') +
          '</div></div>';
      }).join('');
    } catch (error) {
      resultsEl.innerHTML = '<div class="distance-warn">Search failed: ' + esc(error?.message || String(error)) + '</div>';
    }
  }

  document.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains('search-one')) {
      const producer = PRODUCERS.find((item) => item.id === target.dataset.id);
      if (producer) await searchProducer(producer);
    }

    if (target.classList.contains('copy-id')) {
      const placeId = target.dataset.placeId;
      if (placeId) {
        await navigator.clipboard.writeText(placeId);
        const old = target.textContent;
        target.textContent = 'Copied';
        setTimeout(() => { target.textContent = old; }, 1000);
      }
    }
  });

  document.getElementById('run-batch').addEventListener('click', async () => {
    if (!confirm('Run ' + PRODUCERS.length + ' Google Places searches for this audit batch?')) return;
    const button = document.getElementById('run-batch');
    button.disabled = true;
    for (const producer of PRODUCERS) {
      await searchProducer(producer);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    button.disabled = false;
  });

  window.initAudit = async function initAudit() {
    try {
      const lib = await google.maps.importLibrary('places');
      PlaceClass = lib.Place;
      document.getElementById('status').textContent = 'Google Places ready. No searches have been made yet.';
      document.getElementById('run-batch').disabled = false;
      document.querySelectorAll('.search-one').forEach((button) => { button.disabled = false; });
    } catch (error) {
      document.getElementById('status').textContent = 'Google Places failed to initialize: ' + (error?.message || String(error));
    }
  };

  renderProducerList();
</script>
<script async src="${escapeHtml(mapsScriptUrl)}"></script>
</body>
</html>`;
}

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const googleApiKey =
    process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL/key are required in .env.local or .env.');
  }
  if (!googleApiKey) {
    throw new Error(
      'Google Maps API key is required in .env.local. Keep it local; do not paste or commit it.'
    );
  }

  const destination = readArg('destination') || 'crete';
  const requestedIds = parseIds();
  const limit = parseIntegerArg('limit', 5, 1, 25);
  const port = parseIntegerArg('port', 5173, 1024, 65535);

  const supabase = createClient(supabaseUrl, supabaseKey);
  let query = supabase
    .from('producers')
    .select(
      'id,name,greek_name,region,village,country,country_code,destination,lat,lng,location_status,google_place_id,google_maps_url'
    )
    .eq('destination', destination)
    .is('google_place_id', null)
    .order('region', { ascending: true })
    .order('name', { ascending: true });

  if (requestedIds.length > 0) {
    query = query.in('id', requestedIds);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Supabase producer lookup failed: ${error.message}`);

  const eligible = ((data || []) as ProducerRow[]).filter(
    (producer) => producer.location_status !== 'unresolved'
  );
  const selected = all ? eligible : eligible.slice(0, limit);

  if (selected.length === 0) {
    console.log('No matching producers require Google Place ID review.');
    return;
  }

  const html = buildAuditHtml(selected, googleApiKey);
  const server = http.createServer((request, response) => {
    if (request.url === '/' || request.url?.startsWith('/?')) {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      });
      response.end(html);
      return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is already in use. Stop the Vite dev server first, or use --port=<allowed-localhost-port>.`
      );
      process.exit(1);
    }
    throw error;
  });

  server.listen(port, '127.0.0.1', () => {
    console.log('Phase 9B Google Place ID audit server is ready.');
    console.log(`Destination: ${destination}`);
    console.log(`Missing Place IDs available for review: ${eligible.length}`);
    console.log(`Selected this batch: ${selected.length}`);
    selected.forEach((producer) => console.log(`- ${producer.id} | ${producer.name}`));
    console.log('');
    console.log(`Open: http://localhost:${port}`);
    console.log('No Google Places search occurs until you click Search Google or Run this batch.');
    console.log('No database writes are performed by this tool.');
    console.log('Press Ctrl+C when finished.');
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
