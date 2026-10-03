import type { AdminIntentMetrics, AdminRegionalIntelligence } from '../services/adminApi';

type Cell = string | number | null | undefined;

const safe = (value: Cell): string =>
  String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');

const table = (headers: string[], rows: Cell[][]): string => [
  `| ${headers.join(' | ')} |`,
  `| ${headers.map((_, index) => index ? '---:' : '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map(safe).join(' | ')} |`),
].join('\n');

export const buildIntentEvidenceMarkdown = (m: AdminIntentMetrics): string => {
  const totals = [
    ['Producer views', m.totals.producer_views],
    ['Saves', m.totals.saves],
    ['Trip additions', m.totals.trip_additions],
    ['Website clicks', m.totals.website_clicks],
    ['Phone actions', m.totals.phone_clicks],
    ['Email actions', m.totals.email_clicks],
    ['Directions', m.totals.directions_clicks],
    ['Passport stamps added', m.totals.passport_stamps_added],
  ] satisfies Cell[][];

  return [
    '# TerroirTrail Intent Evidence Snapshot',
    `Generated: ${m.generated_at} · Window: ${m.start_date} → ${m.end_date} · Data through: ${m.aggregate_data_through || '—'}`,
    '',
    '> First-party intent evidence. These signals are not bookings, visits or purchases.',
    '',
    '## Totals',
    table(['Metric', 'Count'], totals),
    '',
    '## Producer-level intent',
    table(
      ['Producer', 'Destination', 'Category', 'Views', 'Saves', 'Trip adds', 'Direct actions', 'Directions'],
      m.producers.map((r) => [r.producer_name, r.destination, r.category, r.producer_views, r.saves, r.trip_additions, r.direct_producer_actions, r.directions_clicks])
    ),
    '',
    '## Regional intent',
    table(
      ['Destination', 'Producers', 'Region opens', 'Views', 'Saves', 'Trip adds', 'Direct actions', 'Directions'],
      m.regions.map((r) => [r.destination, r.producer_count, r.region_opens, r.producer_views, r.saves, r.trip_additions, r.direct_producer_actions, r.directions_clicks])
    ),
  ].join('\n') + '\n';
};
export const buildRegionalEvidenceMarkdown = (r: AdminRegionalIntelligence): string => [
  '# TerroirTrail Regional Readiness Evidence Snapshot',
  `Generated: ${r.generated_at} · Demand window: ${r.start_date} → ${r.end_date} · Data through: ${r.aggregate_data_through || '—'}`,
  '',
  `> ${r.coverage_note}`,
  '',
  table(
    ['Destination', 'Producers', 'Categories', 'Verified location', 'Booking policy', 'Visitor hours', 'Road review', 'Fresh review', 'Direct contact', 'Views', 'Saves', 'Trip adds'],
    r.regions.map((x) => [
      x.destination, x.audited_producer_count, x.category_count, x.verified_location_count,
      x.booking_policy_count, x.visitor_hours_count, x.road_access_review_count,
      x.fresh_review_count, x.direct_contact_count, x.demand.producer_views,
      x.demand.saves, x.demand.trip_additions,
    ])
  ),
  '',
  '> Curated, non-exhaustive coverage. Demand values are intent signals, not bookings, visits or purchases. Unknown operational facts remain unknown.',
  '',
].join('\n');

export const downloadEvidenceMarkdown = (filename: string, markdown: string): void => {
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
