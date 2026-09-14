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

type PlaceCandidate = {
  id?: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  googleMapsUri?: string;
};

type TextSearchResponse = {
  places?: PlaceCandidate[];
  error?: { message?: string; status?: string };
};

const args = process.argv.slice(2);
const execute = args.includes('--execute');
const all = args.includes('--all');

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function parseLimit(): number {
  const raw = readArg('limit');
  if (!raw) return 5;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 25) {
    throw new Error('--limit must be an integer between 1 and 25.');
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

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildTextQuery(producer: ProducerRow): string {
  const locationBits = [producer.village, producer.region, producer.country]
    .filter(Boolean)
    .join(', ');
  return locationBits ? `${producer.name}, ${locationBits}` : producer.name;
}

async function searchGooglePlaces(
  apiKey: string,
  producer: ProducerRow
): Promise<PlaceCandidate[]> {
  const body: Record<string, unknown> = {
    textQuery: buildTextQuery(producer),
    maxResultCount: 3,
    languageCode: 'en',
  };

  if (producer.country_code) {
    body.regionCode = producer.country_code;
  }

  if (producer.lat != null && producer.lng != null) {
    body.locationBias = {
      circle: {
        center: {
          latitude: Number(producer.lat),
          longitude: Number(producer.lng),
        },
        radius: 10000,
      },
    };
  }

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as TextSearchResponse;
  if (!response.ok) {
    const reason = payload.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(reason);
  }

  return payload.places || [];
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

  const destination = readArg('destination') || 'crete';
  const requestedIds = parseIds();
  const limit = parseLimit();

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

  console.log(`Phase 9B Google Place ID audit`);
  console.log(`Destination: ${destination}`);
  console.log(`Missing Place IDs available for review: ${eligible.length}`);
  console.log(`Selected this run: ${selected.length}`);
  console.log('');

  if (selected.length === 0) {
    console.log('No matching producers require Google Place ID review.');
    return;
  }

  if (!execute) {
    console.log('DRY RUN — no Google Places requests were made.');
    console.log('Candidates queued for manual verification:');
    for (const producer of selected) {
      console.log(`- ${producer.id} | ${producer.name} | ${producer.village || producer.region || ''}`);
    }
    console.log('');
    console.log('To query Google Places, rerun with --execute.');
    console.log('This is read-only: the script never writes Place IDs to Supabase.');
    return;
  }

  if (!googleApiKey) {
    throw new Error(
      'Google Maps API key is required for --execute. Keep it only in .env.local; do not paste or commit it.'
    );
  }

  console.log('Google Places requests enabled for this audit run.');
  console.log('Results are candidates only and MUST be manually verified before persistence.');
  console.log('');

  for (const producer of selected) {
    console.log(`=== ${producer.id} | ${producer.name} ===`);
    console.log(`Query: ${buildTextQuery(producer)}`);
    if (producer.google_maps_url) {
      console.log(`Existing Maps reference: ${producer.google_maps_url}`);
    }

    try {
      const candidates = await searchGooglePlaces(googleApiKey, producer);
      if (candidates.length === 0) {
        console.log('No Google Places candidates returned.');
        console.log('');
        continue;
      }

      candidates.forEach((candidate, index) => {
        const candidateLat = candidate.location?.latitude;
        const candidateLng = candidate.location?.longitude;
        const distanceKm =
          producer.lat != null &&
          producer.lng != null &&
          candidateLat != null &&
          candidateLng != null
            ? haversineKm(
                Number(producer.lat),
                Number(producer.lng),
                candidateLat,
                candidateLng
              )
            : undefined;

        console.log(`  [${index + 1}] ${candidate.displayName?.text || '(no display name)'}`);
        console.log(`      Place ID: ${candidate.id || '(missing)'}`);
        console.log(`      Address: ${candidate.formattedAddress || '(missing)'}`);
        if (distanceKm != null) {
          console.log(`      Distance from TerroirTrail pin: ${distanceKm.toFixed(2)} km`);
        }
        if (candidate.googleMapsUri) {
          console.log(`      Google Maps: ${candidate.googleMapsUri}`);
        }
      });
    } catch (err) {
      console.log(`Google Places lookup failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    console.log('');
  }

  console.log('Audit complete. No database changes were made.');
  console.log(
    'Only persist a Place ID after checking business name, locality/address, map position, and Google Maps page identity.'
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
