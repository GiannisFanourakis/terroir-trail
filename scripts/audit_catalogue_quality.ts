import fs from 'node:fs';
import { SEO_PRODUCERS } from './seoCatalogue';
import { getDestinationCountry } from '../src/config/geography';

type AuditLevel = 'error' | 'warning';
type Finding = { level: AuditLevel; producerId?: string; message: string };

const findings: Finding[] = [];
const error = (message: string, producerId?: string) =>
  findings.push({ level: 'error', message, producerId });
const warn = (message: string, producerId?: string) =>
  findings.push({ level: 'warning', message, producerId });

const isHttpUrl = (value?: string): boolean => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const ids = new Set<string>();
const placeIds = new Map<string, string>();
const coordinateBuckets = new Map<string, string[]>();

for (const producer of SEO_PRODUCERS) {
  if (!producer.id || !/^[a-z0-9-]+$/.test(producer.id)) {
    error('Producer id must be non-empty and URL-safe.', producer.id);
  }
  if (ids.has(producer.id)) error('Duplicate producer id.', producer.id);
  ids.add(producer.id);

  const [lat, lng] = producer.coordinates || [];
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    error('Coordinates are missing or outside valid latitude/longitude bounds.', producer.id);
  } else {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    const bucket = coordinateBuckets.get(key) || [];
    bucket.push(producer.id);
    coordinateBuckets.set(key, bucket);
  }

  for (const [label, value] of [
    ['website', producer.website],
    ['googleMapsUrl', producer.googleMapsUrl],
    ['locationSourceUrl', producer.locationSourceUrl],
    ['visitSourceUrl', producer.visitSourceUrl],
    ['roadAccessSourceUrl', producer.roadAccessSourceUrl],
    ['photoCredit.url', producer.photoCredit?.url],
  ] as const) {
    if (!isHttpUrl(value)) {
      error(`${label} must be an http(s) URL when provided.`, producer.id);
    }
  }

  const expectedCountry = getDestinationCountry(producer.destination);
  if (
    producer.countryCode &&
    producer.countryCode.toUpperCase() !== expectedCountry
  ) {
    error(
      `countryCode ${producer.countryCode} does not match destination country ${expectedCountry}.`,
      producer.id
    );
  }

  if (producer.googlePlaceId) {
    const existing = placeIds.get(producer.googlePlaceId);
    if (existing && existing !== producer.id) {
      error(
        `Google Place ID is duplicated with producer ${existing}.`,
        producer.id
      );
    }
    placeIds.set(producer.googlePlaceId, producer.id);
  }

  if (
    producer.roadAccessStatus === 'verified' &&
    (!producer.roadAccess || !producer.roadAccessSourceUrl)
  ) {
    warn(
      'Verified road access should include both a classification and a source URL.',
      producer.id
    );
  }

  if (
    ['public_visits', 'seasonal_public', 'appointment_only'].includes(
      String(producer.visitStatus)
    ) &&
    !producer.visitSourceUrl
  ) {
    warn('Confirmed visitability has no visitSourceUrl.', producer.id);
  }

  if (
    ['verified_location', 'verified_entrance'].includes(
      String(producer.locationStatus)
    ) &&
    !producer.locationSourceUrl &&
    !producer.googleMapsUrl &&
    !producer.googlePlaceId
  ) {
    warn('Verified location has no retained public source identity.', producer.id);
  }

  if (
    producer.rating !== undefined ||
    producer.reviewCount !== undefined ||
    producer.priceLevel !== undefined
  ) {
    error(
      'Synthetic/third-party rating, review-count or price-level fields must not ship in the audited catalogue.',
      producer.id
    );
  }

  if (!producer.name.trim() || !producer.region.trim() || !producer.village.trim()) {
    error('Name, region and village/locality are required.', producer.id);
  }

  if (!producer.tagLine?.trim() && !producer.description?.trim() && !producer.story?.trim()) {
    error('Producer has no narrative content.', producer.id);
  }
}

for (const [coordinates, producerIds] of coordinateBuckets) {
  if (producerIds.length > 1) {
    warn(
      `Exact coordinates are shared by ${producerIds.length} records: ${producerIds.join(', ')} (${coordinates}). Confirm that these are intentionally the same public point.`
    );
  }
}

const sourceIndex = fs.readFileSync('index.html', 'utf8');
if (
  /\b\d+\s+(?:live\s+|researched\s+)?producer\/project records across \d+ destinations in \d+ European countries/i.test(
    sourceIndex
  )
) {
  error(
    'Source index contains hard-coded catalogue totals. Build-time SEO generation must own changing record/destination/country counts.'
  );
}

const errors = findings.filter((finding) => finding.level === 'error');
const warnings = findings.filter((finding) => finding.level === 'warning');

console.log(
  `Catalogue quality audit: ${SEO_PRODUCERS.length} records, ${errors.length} errors, ${warnings.length} warnings.`
);

for (const finding of findings) {
  const prefix = finding.level === 'error' ? 'ERROR' : 'WARN';
  console.log(
    `[${prefix}] ${finding.producerId ? `${finding.producerId}: ` : ''}${finding.message}`
  );
}

if (errors.length > 0) {
  process.exitCode = 1;
}
