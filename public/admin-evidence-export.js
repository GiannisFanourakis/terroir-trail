/* global Blob, URL, document, window */
const value = (input) => input == null ? '' : String(input);
const pretty = (input) => value(input)
  .replaceAll('_', ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());
const escapeHtml = (input) => value(input)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const download = (filename, content, type) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const csvCell = (input) => {
  const text = value(input);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csv = (rows) => '\uFEFF' + rows
  .map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';

const section = (title, headers, rows) => ({ title, headers, rows });

const intentSections = (m) => [
  section('Summary', ['Metric', 'Count'], [
    ['Producer views', m.totals.producer_views],
    ['Saves', m.totals.saves],
    ['Trip additions', m.totals.trip_additions],
    ['Website clicks', m.totals.website_clicks],
    ['Phone actions', m.totals.phone_clicks],
    ['Email actions', m.totals.email_clicks],
    ['Directions', m.totals.directions_clicks],
    ['Passport stamps added', m.totals.passport_stamps_added],
  ]),
  section('Producer intent',
    ['Producer', 'Destination', 'Category', 'Views', 'Saves', 'Trip adds', 'Direct actions', 'Directions'],
    m.producers.map((r) => [
      r.producer_name, pretty(r.destination), pretty(r.category), r.producer_views,
      r.saves, r.trip_additions, r.direct_producer_actions, r.directions_clicks,
    ])
  ),
  section('Regional intent',
    ['Destination', 'Producers', 'Region opens', 'Views', 'Saves', 'Trip adds', 'Direct actions', 'Directions'],
    m.regions.map((r) => [
      pretty(r.destination), r.producer_count, r.region_opens, r.producer_views,
      r.saves, r.trip_additions, r.direct_producer_actions, r.directions_clicks,
    ])
  ),
];

const regionalSections = (r) => [
  section('Regional readiness',
    ['Destination', 'Producers', 'Categories', 'Location verified', 'Booking policy',
      'Visitor hours', 'Road reviewed', 'Fresh review', 'Direct contact'],
    r.regions.map((x) => [
      pretty(x.destination), x.audited_producer_count, x.category_count,
      x.verified_location_count, x.booking_policy_count, x.visitor_hours_count,
      x.road_access_review_count, x.fresh_review_count, x.direct_contact_count,
    ])
  ),
  section('Traveler demand',
    ['Destination', 'Producer views', 'Saves', 'Trip adds', 'Direct actions', 'Directions'],
    r.regions.map((x) => [
      pretty(x.destination), x.demand.producer_views, x.demand.saves,
      x.demand.trip_additions, x.demand.direct_producer_actions,
      x.demand.directions_clicks,
    ])
  ),
  section('Category detail',
    ['Destination', 'Category', 'Producers', 'Views', 'Saves', 'Trip adds', 'Direct actions', 'Directions'],
    r.regions.flatMap((region) => region.categories.map((x) => [
      pretty(region.destination), pretty(x.category), x.producer_count,
      x.producer_views, x.saves, x.trip_additions,
      x.direct_producer_actions, x.directions_clicks,
    ]))
  ),
];

const csvReport = (title, metadata, sections) => {
  const rows = [[title], ...metadata, []];
  for (const part of sections) {
    rows.push([part.title], part.headers, ...part.rows, []);
  }
  return csv(rows);
};

const tableHtml = (part) =>
  `<h2>${escapeHtml(part.title)}</h2><table><thead><tr>` +
  part.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('') +
  '</tr></thead><tbody>' +
  part.rows.map((row) => '<tr>' +
    row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('') +
    '</tr>').join('') + '</tbody></table>';

const reportHtml = (title, subtitle, note, sections, forExcel = false) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
  ${forExcel ? '' : '@page{size:A4 landscape;margin:12mm}'}
  body{font-family:Arial,sans-serif;color:#111;font-size:11px}
  h1{font-size:20px;margin-bottom:4px}h2{font-size:14px;margin-top:20px}
  p{color:#444}table{border-collapse:collapse;width:100%;margin-bottom:18px;font-size:9px}
  th,td{border:1px solid #bbb;padding:4px 6px;text-align:left;vertical-align:top}
  th{background:#e8eef6;font-weight:bold}tr{break-inside:avoid}
  </style></head><body><h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(subtitle)}</p><p><strong>Evidence note:</strong> ${escapeHtml(note)}</p>
  ${sections.map(tableHtml).join('')}</body></html>`;

const printPdf = (markup) => {
  const frame = document.createElement('iframe');
  Object.assign(frame.style, {
    position: 'fixed', width: '1px', height: '1px',
    opacity: '0', pointerEvents: 'none',
  });
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) { frame.remove(); return; }
  doc.open();
  doc.write(markup);
  doc.close();
  window.setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 1000);
  }, 150);
};

export const downloadIntentEvidenceCsv = (filename, m) => download(
  filename,
  csvReport('TerroirTrail Intent Evidence Snapshot', [
    ['Generated', m.generated_at],
    ['Completed UTC window', `${m.start_date} to ${m.end_date}`],
    ['Aggregate watermark', m.aggregate_data_through],
    ['Reporting basis', 'Completed UTC days only; the current UTC day is excluded so evidence snapshots remain stable.'],
    ['Important', 'First-party intent signals are not bookings, visits or purchases.'],
  ], intentSections(m)),
  'text/csv;charset=utf-8'
);

export const downloadRegionalEvidenceCsv = (filename, r) => download(
  filename,
  csvReport('TerroirTrail Regional Readiness Evidence Snapshot', [
    ['Generated', r.generated_at],
    ['Completed UTC demand window', `${r.start_date} to ${r.end_date}`],
    ['Aggregate watermark', r.aggregate_data_through],
    ['Reporting basis', 'Completed UTC days only; the current UTC day is excluded so evidence snapshots remain stable.'],
    ['Coverage note', r.coverage_note],
    ['Important', 'Curated, non-exhaustive coverage. Intent signals are not bookings, visits or purchases.'],
  ], regionalSections(r)),
  'text/csv;charset=utf-8'
);

export const downloadIntentEvidenceExcel = (filename, m) => download(
  filename,
  reportHtml(
    'TerroirTrail Intent Evidence Snapshot',
    `Generated ${m.generated_at} · Window ${m.start_date} to ${m.end_date} · Data through ${m.aggregate_data_through || '—'}`,
    'First-party intent signals are not bookings, visits or purchases.',
    intentSections(m), true
  ),
  'application/vnd.ms-excel;charset=utf-8'
);

export const downloadRegionalEvidenceExcel = (filename, r) => download(
  filename,
  reportHtml(
    'TerroirTrail Regional Readiness Evidence Snapshot',
    `Generated ${r.generated_at} · Demand window ${r.start_date} to ${r.end_date} · Data through ${r.aggregate_data_through || '—'}`,
    `${r.coverage_note} Curated, non-exhaustive coverage; intent is not a booking, visit or purchase.`,
    regionalSections(r), true
  ),
  'application/vnd.ms-excel;charset=utf-8'
);

export const printIntentEvidencePdf = (m) => printPdf(reportHtml(
  'TerroirTrail Intent Evidence Snapshot',
  `Generated ${m.generated_at} · Window ${m.start_date} to ${m.end_date} · Data through ${m.aggregate_data_through || '—'}`,
  'First-party intent signals are not bookings, visits or purchases.',
  intentSections(m)
));

export const printRegionalEvidencePdf = (r) => printPdf(reportHtml(
  'TerroirTrail Regional Readiness Evidence Snapshot',
  `Generated ${r.generated_at} · Demand window ${r.start_date} to ${r.end_date} · Data through ${r.aggregate_data_through || '—'}`,
  `${r.coverage_note} Curated, non-exhaustive coverage; intent is not a booking, visit or purchase.`,
  regionalSections(r)
));
