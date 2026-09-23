import { getSupabaseAdmin } from './analyticsIngestionService';
import { getTrip, TripServiceError, type TripWithItems } from './tripService';

export type TripPackFormat = 'html' | 'ics';

export interface TripPackOutput {
  body: string;
  contentType: string;
  filename: string;
}

export interface TripPackProducerRow {
  id: string;
  name: string;
  category: string | null;
  destination: string | null;
  region: string | null;
  village: string | null;
  locality: string | null;
  phone: string | null;
  website: string | null;
  google_maps_url: string | null;
  opening_hours: string | null;
  visit_status: string | null;
  visit_booking_requirement: string | null;
  walk_in_status: string | null;
  parking_status: string | null;
  typical_visit_minutes: number | null;
  seasonal_visit_notes: string | null;
  visitor_languages: string[] | null;
  road_access: string | null;
  road_access_status: string | null;
  road_access_notes: string | null;
  visitability_reviewed_at: string | null;
}

const PRODUCER_FIELDS = [
  'id',
  'name',
  'category',
  'destination',
  'region',
  'village',
  'locality',
  'phone',
  'website',
  'google_maps_url',
  'opening_hours',
  'visit_status',
  'visit_booking_requirement',
  'walk_in_status',
  'parking_status',
  'typical_visit_minutes',
  'seasonal_visit_notes',
  'visitor_languages',
  'road_access',
  'road_access_status',
  'road_access_notes',
  'visitability_reviewed_at',
].join(', ');

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const safeHttpUrl = (value: string | null | undefined): string | null => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};
const label = (value: string | null | undefined) =>
  value
    ? value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Not publicly confirmed';

const dayDate = (
  startDate: string | null,
  dayNumber: number | null
): string | null => {
  if (!startDate || !dayNumber || dayNumber < 1) return null;
  const date = new Date(`${startDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dayNumber - 1);
  return date.toISOString().slice(0, 10);
};

const longDate = (dateOnly: string | null): string | null => {
  if (!dateOnly) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateOnly}T00:00:00Z`));
};

const formatGeneratedAt = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(date);

const htmlFact = (name: string, value: string | null | undefined) =>
  value
    ? `<div class="fact"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(value)}</span></div>`
    : '';
function buildHtml(
  trip: TripWithItems,
  rows: TripPackProducerRow[],
  generatedAt: Date
): TripPackOutput {
  const rowMap = new Map(rows.map((row) => [row.id, row]));
  const sorted = [...trip.items].sort((a, b) => a.position - b.position);
  const stopCards = sorted
    .map((item) => {
      const producer = rowMap.get(item.producerId);
      const date = dayDate(trip.startDate, item.dayNumber);
      if (!producer) {
        return `<section class="stop unavailable">
        <div class="stop-heading"><div><span class="eyebrow">${item.dayNumber ? `Day ${item.dayNumber}` : 'Unassigned'}</span><h2>Previously saved producer</h2></div></div>
        <p>This producer is not currently available in the live TerroirTrail catalogue. No stale producer facts are included in this snapshot.</p>
      </section>`;
      }

      const website = safeHttpUrl(producer.website);
      const maps = safeHttpUrl(producer.google_maps_url);
      const verifiedRoad =
        producer.road_access_status === 'verified'
          ? label(producer.road_access)
          : 'Road classification not publicly verified';
      const languages =
        Array.isArray(producer.visitor_languages) &&
        producer.visitor_languages.length
          ? producer.visitor_languages.join(', ')
          : null;
      const location = [producer.locality || producer.village, producer.region]
        .filter(Boolean)
        .join(', ');
      return `<section class="stop">
      <div class="stop-heading">
        <div>
          <span class="eyebrow">${item.dayNumber ? `Day ${item.dayNumber}${date ? ` · ${escapeHtml(longDate(date))}` : ''}` : 'Unassigned'}</span>
          <h2>${escapeHtml(producer.name)}</h2>
          <p class="meta">${escapeHtml([label(producer.category), location].filter(Boolean).join(' · '))}</p>
        </div>
        <span class="number">${item.position}</span>
      </div>
      <div class="facts">
        ${htmlFact('Visit status', label(producer.visit_status))}
        ${htmlFact('Booking', label(producer.visit_booking_requirement))}
        ${htmlFact('Walk-ins', label(producer.walk_in_status))}
        ${htmlFact('Parking', label(producer.parking_status))}
        ${htmlFact('Typical visit', producer.typical_visit_minutes ? `${producer.typical_visit_minutes} min` : null)}
        ${htmlFact('Visitor languages', languages)}
        ${htmlFact('Road access', verifiedRoad)}
        ${htmlFact('Opening information', producer.opening_hours)}
      </div>
      ${producer.road_access_notes ? `<div class="note"><strong>Road/access note</strong><p>${escapeHtml(producer.road_access_notes)}</p></div>` : ''}
      ${producer.seasonal_visit_notes ? `<div class="note"><strong>Seasonal note</strong><p>${escapeHtml(producer.seasonal_visit_notes)}</p></div>` : ''}
      <div class="links">
        ${producer.phone ? `<span>Phone: ${escapeHtml(producer.phone)}</span>` : ''}
        ${website ? `<a href="${escapeHtml(website)}">Website</a>` : ''}
        ${maps ? `<a href="${escapeHtml(maps)}">Directions</a>` : ''}
      </div>
    </section>`;
    })
    .join('\n');
  const dateText = trip.startDate
    ? trip.endDate
      ? `${longDate(trip.startDate)} – ${longDate(trip.endDate)}`
      : `From ${longDate(trip.startDate)}`
    : 'Dates not set';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(trip.title)} · TerroirTrail Trip Pack</title>
<style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1c1917;background:#f7f5f2}
*{box-sizing:border-box}body{margin:0;background:#f7f5f2}main{max-width:880px;margin:0 auto;padding:40px 28px 56px}
header{border-bottom:3px solid #d97706;padding-bottom:22px;margin-bottom:24px}.brand{font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#92400e;font-size:13px}
h1{margin:8px 0 6px;font-size:32px;line-height:1.12}.summary,.generated{color:#57534e;font-size:13px}
.warning{margin:20px 0 28px;padding:14px 16px;border:1px solid #f59e0b;background:#fffbeb;border-radius:12px;font-size:12px;line-height:1.5}
.stop{background:#fff;border:1px solid #e7e5e4;border-radius:16px;padding:20px;margin:0 0 16px;break-inside:avoid}.unavailable{background:#fafaf9}
.stop-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.stop h2{margin:3px 0 4px;font-size:20px}
.eyebrow{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#b45309}.meta{margin:0;color:#78716c;font-size:12px}
.number{min-width:30px;height:30px;border-radius:999px;display:grid;place-items:center;background:#1c1917;color:#fff;font-weight:800;font-size:12px}
`;
  const htmlTail = `
.facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px;margin-top:16px}.fact{display:flex;gap:8px;justify-content:space-between;border-bottom:1px solid #f0eeeb;padding:7px 0;font-size:12px}
.fact strong{color:#57534e}.fact span{text-align:right}.note{margin-top:14px;padding:11px 13px;background:#f5f5f4;border-radius:10px;font-size:12px}.note p{margin:4px 0 0;line-height:1.45}
.links{display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;font-size:12px}a{color:#92400e;font-weight:700}footer{margin-top:28px;color:#78716c;font-size:11px;line-height:1.5}
@media(max-width:620px){main{padding:24px 16px 40px}.facts{grid-template-columns:1fr}}@media print{body{background:#fff}main{max-width:none;padding:0}.stop{box-shadow:none}a{color:#1c1917;text-decoration:none}}
</style></head><body><main>
<header><div class="brand">TerroirTrail · Explorer Trip Pack</div><h1>${escapeHtml(trip.title)}</h1>
<div class="summary">${escapeHtml(dateText)} · ${trip.itemCount} saved ${trip.itemCount === 1 ? 'stop' : 'stops'}</div>
<div class="generated">Snapshot generated ${escapeHtml(formatGeneratedAt(generatedAt))}</div></header>
<div class="warning"><strong>Use this as a planning snapshot.</strong> Producer hours, visitability, booking requirements, seasonal conditions and road/access information can change. Re-check the live TerroirTrail listing and contact the producer before travel. Paying for Explorer conveniences never changes TerroirTrail verification or safety/access facts.</div>
${stopCards || '<p>No producer stops have been added to this trip yet.</p>'}
<footer>TerroirTrail organizes current catalogue facts for trip planning. It is not a navigation, booking, transport or road-safety service. This downloaded snapshot may become outdated after it is generated.</footer>
</main></body></html>`;

  return {
    body: html + htmlTail,
    contentType: 'text/html; charset=utf-8',
    filename: 'terroirtrail-trip-pack.html',
  };
}
const icsEscape = (value: unknown) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;');

const icsDate = (dateOnly: string) => dateOnly.replaceAll('-', '');

const addDays = (dateOnly: string, days: number) => {
  const date = new Date(`${dateOnly}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

function buildIcs(
  trip: TripWithItems,
  rows: TripPackProducerRow[],
  generatedAt: Date
): TripPackOutput {
  if (!trip.startDate) {
    throw new TripServiceError(
      'bad_request',
      'Add a trip start date before exporting a calendar.'
    );
  }
  const rowMap = new Map(rows.map((row) => [row.id, row]));
  const stamp = generatedAt
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  const events: string[] = [];
  const tripEndExclusive = addDays(trip.endDate || trip.startDate, 1);
  events.push(
    [
      'BEGIN:VEVENT',
      `UID:trip-${icsEscape(trip.id)}@terroirtrail`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(trip.startDate)}`,
      `DTEND;VALUE=DATE:${icsDate(tripEndExclusive)}`,
      `SUMMARY:${icsEscape(trip.title)} · TerroirTrail`,
      'DESCRIPTION:TerroirTrail trip plan. Re-check live producer facts before travel.',
      'END:VEVENT',
    ].join('\r\n')
  );

  for (const item of [...trip.items].sort((a, b) => a.position - b.position)) {
    if (!item.dayNumber) continue;
    const producer = rowMap.get(item.producerId);
    if (!producer) continue;
    const date = dayDate(trip.startDate, item.dayNumber);
    if (!date) continue;
    const nextDate = addDays(date, 1);
    const location = [producer.locality || producer.village, producer.region]
      .filter(Boolean)
      .join(', ');
    const url =
      safeHttpUrl(producer.google_maps_url) || safeHttpUrl(producer.website);
    const description = [
      label(producer.visit_booking_requirement),
      producer.phone ? `Phone: ${producer.phone}` : null,
      'Planning snapshot only. Re-check the live TerroirTrail listing before travel.',
    ]
      .filter(Boolean)
      .join(' · ');
    events.push(
      [
        'BEGIN:VEVENT',
        `UID:trip-${icsEscape(trip.id)}-${icsEscape(producer.id)}@terroirtrail`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${icsDate(date)}`,
        `DTEND;VALUE=DATE:${icsDate(nextDate)}`,
        `SUMMARY:${icsEscape(producer.name)}`,
        location ? `LOCATION:${icsEscape(location)}` : null,
        `DESCRIPTION:${icsEscape(description)}`,
        url ? `URL:${icsEscape(url)}` : null,
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\r\n')
    );
  }

  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TerroirTrail//Explorer Trip Pack//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n');

  return {
    body,
    contentType: 'text/calendar; charset=utf-8',
    filename: 'terroirtrail-trip-calendar.ics',
  };
}
export function buildTripPackFromData(
  trip: TripWithItems,
  producers: TripPackProducerRow[],
  format: TripPackFormat,
  generatedAt = new Date()
): TripPackOutput {
  return format === 'ics'
    ? buildIcs(trip, producers, generatedAt)
    : buildHtml(trip, producers, generatedAt);
}

export async function createTripPack(
  uid: string,
  tripId: string,
  format: TripPackFormat
): Promise<TripPackOutput> {
  if (format !== 'html' && format !== 'ics') {
    throw new TripServiceError('bad_request', 'Unsupported Trip Pack format.');
  }
  const trip = await getTrip(uid, tripId);
  const producerIds = [...new Set(trip.items.map((item) => item.producerId))];
  if (!producerIds.length) return buildTripPackFromData(trip, [], format);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new TripServiceError(
      'service_unavailable',
      'Live producer facts are temporarily unavailable.'
    );
  }
  const { data, error } = await supabase
    .from('producers')
    .select(PRODUCER_FIELDS)
    .in('id', producerIds)
    .eq('is_active', true);
  if (error) {
    throw new TripServiceError(
      'service_unavailable',
      'Live producer facts are temporarily unavailable.'
    );
  }

  return buildTripPackFromData(
    trip,
    (data || []) as unknown as TripPackProducerRow[],
    format
  );
}
