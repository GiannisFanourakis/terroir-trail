import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { CRETAN_PRODUCERS } from '../src/data/producers';
import { SANTORINI_PRODUCERS } from '../src/data/santoriniProducers';
import { PHASE10B_PRODUCERS } from '../src/data/phase10bProducers';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');
const homeIndexPath = path.join(distDir, 'index.html');

const PRODUCERS: Producer[] = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
];

const categoryLabels: Record<Producer['category'], string> = {
  winery: 'Winery',
  brewery: 'Brewery',
  kazani: 'Traditional distillery / rakokazano',
  olive_mill: 'Olive mill',
  olive_oil_producer: 'Olive oil producer',
  cheese_dairy: 'Dairy / cheesemaker',
  apiary: 'Apiary / honey producer',
  farm: 'Farm',
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const escapeXml = escapeHtml;
const normalizeText = (value: string): string => value.replace(/\s+/g, ' ').trim();

const truncate = (value: string, maxLength: number): string => {
  const normalized = normalizeText(value);
  if (normalized.length <= maxLength) return normalized;
  const shortened = normalized.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 80 ? lastSpace : shortened.length)}…`;
};

const producerPath = (producer: Producer): string => `/producers/${producer.id}/`;
const producerUrl = (producer: Producer): string => `${CANONICAL_HOST}${producerPath(producer)}`;

const visitAnswer = (producer: Producer): string => {
  switch (producer.visitStatus) {
    case 'public_visits':
      return producer.openingHours
        ? `Public visits are confirmed. Published visiting information: ${producer.openingHours}`
        : 'Public visits are confirmed; check the producer-controlled source for current visiting details before travel.';
    case 'seasonal_public':
      return producer.openingHours
        ? `Seasonal public visits are confirmed. Published visiting information: ${producer.openingHours}`
        : 'Seasonal public visits are confirmed; check current seasonal opening details before travel.';
    case 'appointment_only':
      return producer.openingHours
        ? `Visits are by appointment. Published visiting information: ${producer.openingHours}`
        : 'Visits are by appointment; contact the producer before travel.';
    case 'current_access_uncertain':
      return 'Current public visitor access is uncertain. TerroirTrail does not present this listing as a confirmed visitor stop.';
    case 'not_publicly_confirmed':
      return 'Public visits are not currently confirmed. A listing or map point does not imply that walk-ins, tours or tastings are available.';
    case 'unreviewed':
    default:
      return 'Public visitability is not currently verified. Contact the producer directly before planning a visit.';
  }
};

const accessAnswer = (producer: Producer): string => {
  if (producer.locationStatus === 'unresolved') {
    return 'The exact public navigation point is unresolved, so TerroirTrail does not publish normal directions for this listing.';
  }

  if (producer.roadAccessStatus !== 'verified' || !producer.roadAccess) {
    if (producer.roadAccessStatus === 'current_access_uncertain') {
      return 'Current road access is uncertain. TerroirTrail does not make a standard-car suitability claim.';
    }
    return 'Road type and standard rental-car suitability are not publicly confirmed. A location pin is not a road-safety guarantee.';
  }

  const labels: Record<string, string> = {
    paved: 'A paved-road classification is verified.',
    narrow_paved: 'A narrow paved-road classification is verified.',
    gravel_ok: 'A gravel-access classification is verified.',
    unpaved_passable: 'A passable unpaved-access classification is verified; this does not by itself establish rental-car suitability.',
    high_clearance_recommended: 'High-clearance access is recommended by the verified access classification.',
    '4x4_required': 'A 4x4-required access classification is verified.',
  };

  return labels[producer.roadAccess] || 'A road-access classification is verified; review the current listing before travel.';
};

const publicPointAnswer = (producer: Producer): string => {
  const locality = producer.locality || producer.village;
  const place = [locality, producer.region, producer.country || 'Greece'].filter(Boolean).join(', ');

  switch (producer.publicPointType) {
    case 'producer_shop':
      return `${place}. The verified public map point is a producer shop; TerroirTrail does not silently treat it as the underlying production site.`;
    case 'visitor_center':
      return `${place}. The mapped public point is a verified visitor centre.`;
    case 'production_site':
      return `${place}. The mapped public point is identified as a production site.`;
    case 'estate':
      return `${place}. The mapped public point is identified as the estate.`;
    default:
      return `${place}. Location precision and road-access confidence are tracked separately.`;
  }
};

const buildDescription = (producer: Producer): string => {
  const source = producer.tagLine
    ? `${producer.tagLine}. ${producer.description}`
    : producer.description || producer.story;
  return truncate(source || `${producer.name}, ${categoryLabels[producer.category]} in ${producer.region}.`, 158);
};

const buildJsonLd = (producer: Producer, canonicalUrl: string, pageTitle: string, description: string): string => {
  const locality = producer.locality || producer.village;
  const country = producer.country || (producer.countryCode === 'IT' ? 'Italy' : 'Greece');
  const location: Record<string, unknown> = {
    '@type': 'Place',
    name: `${producer.name} location`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressRegion: producer.region,
      addressCountry: producer.countryCode || country,
    },
  };

  if (
    producer.locationStatus !== 'unresolved' &&
    Number.isFinite(producer.coordinates?.[0]) &&
    Number.isFinite(producer.coordinates?.[1]) &&
    producer.coordinates[0] !== 0 &&
    producer.coordinates[1] !== 0
  ) {
    location.geo = {
      '@type': 'GeoCoordinates',
      latitude: producer.coordinates[0],
      longitude: producer.coordinates[1],
    };
  }

  if (producer.googleMapsUrl && producer.locationStatus !== 'unresolved') {
    location.hasMap = producer.googleMapsUrl;
  }

  const entity: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${canonicalUrl}#entity`,
    name: producer.name,
    description: normalizeText(producer.description || producer.tagLine || description),
    mainEntityOfPage: { '@id': canonicalUrl },
    location,
  };

  if (producer.greekName && producer.greekName !== producer.name) entity.alternateName = producer.greekName;
  if (producer.website) entity.sameAs = [producer.website];
  if (producer.phone) entity.telephone = producer.phone;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: pageTitle,
        description,
        inLanguage: 'en',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${CANONICAL_HOST}/#website`,
          name: 'TerroirTrail',
          url: `${CANONICAL_HOST}/`,
        },
        about: { '@id': `${canonicalUrl}#entity` },
      },
      entity,
    ],
  };

  return JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c');
};

const renderSourceLink = (label: string, url?: string): string => {
  if (!url) return '';
  return `<li><a href="${escapeHtml(url)}" rel="nofollow noopener noreferrer">${escapeHtml(label)}</a></li>`;
};

const renderProducerPage = (producer: Producer): string => {
  const canonicalUrl = producerUrl(producer);
  const interactiveUrl = `${CANONICAL_HOST}/?producer=${encodeURIComponent(producer.id)}`;
  const title = `${producer.name} — ${producer.region} | TerroirTrail`;
  const description = buildDescription(producer);
  const category = categoryLabels[producer.category];
  const location = publicPointAnswer(producer);
  const visiting = visitAnswer(producer);
  const access = accessAnswer(producer);
  const jsonLd = buildJsonLd(producer, canonicalUrl, title, description);
  const sourceLinks = [
    renderSourceLink('Official producer website', producer.website),
    renderSourceLink('Visiting source', producer.visitSourceUrl),
    renderSourceLink('Location source', producer.locationSourceUrl),
    renderSourceLink('Road-access source', producer.roadAccessSourceUrl),
  ].filter(Boolean).join('\n            ');
  const publishedItems = producer.indigenousVarieties?.length
    ? `<section><h2>Published varieties or products</h2><p>${producer.indigenousVarieties.map(escapeHtml).join(', ')}</p></section>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/logo.png" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0c0a09" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TerroirTrail" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${CANONICAL_HOST}/logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${CANONICAL_HOST}/logo.png" />
    <script type="application/ld+json">${jsonLd}</script>
    <style>
      :root{color-scheme:dark}.seo-page{box-sizing:border-box;min-height:100vh;background:#0c0a09;color:#e7e5e4;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:32px 20px}.seo-page article{max-width:820px;margin:0 auto}.seo-page a{color:#fbbf24}.seo-page h1{font-size:clamp(2rem,5vw,3.6rem);line-height:1.05;color:#fff;margin:.5rem 0 1rem}.seo-page h2{color:#fff;margin-top:2rem}.seo-page .eyebrow{color:#fbbf24;font-weight:800;text-transform:uppercase;letter-spacing:.08em;font-size:.8rem}.seo-page .lead{font-size:1.15rem;line-height:1.7}.seo-page p,.seo-page dd{line-height:1.7}.seo-page dl{display:grid;gap:1rem}.seo-page dt{font-weight:800;color:#fff}.seo-page dd{margin:.25rem 0 0;color:#d6d3d1}.seo-page .notice{border-left:3px solid #f59e0b;padding-left:1rem;color:#d6d3d1}.seo-page ul{line-height:1.9}.seo-page .actions{display:flex;gap:12px;flex-wrap:wrap;margin:1.5rem 0}.seo-page .button{display:inline-block;background:#f59e0b;color:#1c1917;text-decoration:none;font-weight:800;padding:10px 14px;border-radius:999px}.seo-page .secondary{background:#292524;color:#fbbf24}
    </style>
  </head>
  <body style="margin:0">
    <main class="seo-page">
      <article>
        <p><a href="/">← TerroirTrail</a></p>
        <p class="eyebrow">${escapeHtml(category)} · ${escapeHtml(producer.region)}</p>
        <h1>${escapeHtml(producer.name)}</h1>
        ${producer.greekName && producer.greekName !== producer.name ? `<p lang="el">${escapeHtml(producer.greekName)}</p>` : ''}
        ${producer.tagLine ? `<p class="lead">${escapeHtml(producer.tagLine)}</p>` : ''}
        <div class="actions">
          <a class="button" href="${interactiveUrl}">Open in the interactive TerroirTrail map</a>
          ${producer.website ? `<a class="button secondary" href="${escapeHtml(producer.website)}" rel="nofollow noopener noreferrer">Official website</a>` : ''}
        </div>
        ${producer.description ? `<section><h2>About</h2><p>${escapeHtml(producer.description)}</p></section>` : ''}
        ${producer.story ? `<section><h2>Story</h2><p>${escapeHtml(producer.story)}</p></section>` : ''}
        ${publishedItems}
        <section>
          <h2>Visit and location facts</h2>
          <dl>
            <div><dt>What is it?</dt><dd>${escapeHtml(category)} listed in TerroirTrail's audited catalogue.</dd></div>
            <div><dt>Where is it?</dt><dd>${escapeHtml(location)}</dd></div>
            <div><dt>Can you visit?</dt><dd>${escapeHtml(visiting)}</dd></div>
            <div><dt>What is known about road access?</dt><dd>${escapeHtml(access)}</dd></div>
          </dl>
        </section>
        <p class="notice">TerroirTrail is an independent discovery guide. A researched listing or confirmed public visit does not imply a commercial partnership, booking relationship, or road-safety guarantee.</p>
        ${sourceLinks ? `<section><h2>Sources and direct channels</h2><ul>${sourceLinks}</ul></section>` : ''}
        ${producer.phone ? `<p><strong>Published phone:</strong> ${escapeHtml(producer.phone)}</p>` : ''}
      </article>
    </main>
  </body>
</html>\n`;
};

const renderSitemap = (): string => {
  const urls = [
    `${CANONICAL_HOST}/`,
    `${CANONICAL_HOST}/privacy.html`,
    ...PRODUCERS.map(producerUrl),
  ];
  const entries = urls.map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

const replaceRequired = (html: string, from: string, to: string): string => {
  if (!html.includes(from)) {
    console.error(`[SEO Generation Failed] Expected homepage text not found: ${from.slice(0, 100)}`);
    process.exit(1);
  }
  return html.replaceAll(from, to);
};

const refreshHomepageSeoState = (sourceHtml: string): string => {
  let html = sourceHtml;
  const oldDescription = 'Independent producer and agritourism discovery guide. Explore audited producers across Crete and Santorini with clearly labeled visiting, location, imagery, and road-access status.';
  const newDescription = 'Independent producer and agritourism discovery guide. Explore 55 audited producer/project records across Greece and Tuscany with clearly labeled visiting, location, imagery, and road-access status.';
  html = replaceRequired(html, oldDescription, newDescription);

  html = replaceRequired(
    html,
    'Independent producer and agritourism discovery guide connecting travelers directly with audited wineries, craft breweries, artisanal olive mills, traditional dairies, apiaries, traditional distilleries, and farms across Crete and Santorini, with clearly labeled visiting, location, imagery, and road-access status.',
    'Independent producer and agritourism discovery guide connecting travelers directly with 55 audited producer/project records across Crete, Santorini, the Peloponnese, Northern Greece and Tuscany, with clearly labeled visiting, location, imagery, and road-access status.'
  );
  html = replaceRequired(
    html,
    'Interactive agritourism discovery map and directory with audited reference catalogues in Crete and Santorini. Discovery Guides are built from verified stops; multi-stop driving navigation remains withheld wherever road-access evidence is incomplete.',
    'Interactive agritourism discovery map and directory with 55 audited producer/project records across Crete, Santorini, the Peloponnese, Northern Greece and Tuscany. Discovery Guides are built from verified stops; multi-stop driving navigation remains withheld wherever road-access evidence is incomplete.'
  );
  html = replaceRequired(
    html,
    'TerroirTrail is an independent producer and agritourism discovery guide. It connects slow travelers and road-trippers directly with independent wineries, craft breweries, artisanal olive mills, traditional dairies, apiaries, traditional distilleries, and farms, with audited reference catalogues in Crete and Santorini and further regional expansion in progress.',
    'TerroirTrail is an independent producer and agritourism discovery guide with 55 audited producer/project records across Crete, Santorini, the Peloponnese, Northern Greece and Tuscany. It connects travelers with source-backed producer identity, visiting, location and access information while keeping unknown facts unknown.'
  );
  html = replaceRequired(html, 'Which regions are currently audited to reference quality?', 'Which regions are currently represented in the audited catalogue?');
  html = replaceRequired(
    html,
    'Crete and Santorini are the current reference-quality regions. Crete has 27 audited producer/project records and Santorini has 9 audited producer records.',
    'The audited catalogue currently covers Crete, Santorini, the Peloponnese, Northern Greece and a Tuscany / Italy foothold: 55 producer/project records in total.'
  );
  html = replaceRequired(
    html,
    'Crete and Santorini are the current reference-quality regions, with clearly labeled visiting, location, imagery, and road-access status and no commission markups.',
    'The current audited catalogue spans Crete, Santorini, the Peloponnese, Northern Greece and Tuscany, with clearly labeled visiting, location, imagery, and road-access status and no commission markups.'
  );
  html = replaceRequired(
    html,
    'TerroirTrail publishes Discovery Guides from verified producer stops. Six guides are currently published across Crete and Santorini. They are discovery stop collections, not road-safety guarantees.',
    'TerroirTrail publishes Discovery Guides from verified producer stops. Ten verified-stop guides are currently published across Crete, Santorini, the Peloponnese, Northern Greece and Tuscany. They are discovery stop collections, not road-safety guarantees.'
  );
  html = replaceRequired(
    html,
    '<h2>Verified Crete &amp; Santorini Producer Directory</h2>',
    '<p>The full audited catalogue contains 55 producer/project records, each published as a canonical producer entity page for search and answer-engine discovery.</p>\n        <h2>Audited Crete &amp; Santorini Directory — Homepage Excerpt</h2>'
  );
  return html;
};

function generateSeoPages(): void {
  if (!fs.existsSync(homeIndexPath)) {
    console.error(`[SEO Generation Failed] ${homeIndexPath} is missing. Run Vite build first.`);
    process.exit(1);
  }

  const ids = new Set<string>();
  for (const producer of PRODUCERS) {
    if (!/^[a-z0-9-]+$/.test(producer.id)) {
      console.error(`[SEO Generation Failed] Producer id is not path-safe: ${producer.id}`);
      process.exit(1);
    }
    if (ids.has(producer.id)) {
      console.error(`[SEO Generation Failed] Duplicate producer id: ${producer.id}`);
      process.exit(1);
    }
    ids.add(producer.id);
  }

  const homeHtml = fs.readFileSync(homeIndexPath, 'utf-8');
  const refreshedHomeHtml = refreshHomepageSeoState(homeHtml);
  fs.writeFileSync(homeIndexPath, refreshedHomeHtml, 'utf-8');

  const producerRoot = path.join(distDir, 'producers');
  fs.rmSync(producerRoot, { recursive: true, force: true });

  for (const producer of PRODUCERS) {
    const pageDir = path.join(producerRoot, producer.id);
    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(path.join(pageDir, 'index.html'), renderProducerPage(producer), 'utf-8');
  }

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), renderSitemap(), 'utf-8');
  console.log(`✓ SEO generation complete: homepage refreshed + ${PRODUCERS.length} canonical producer pages + sitemap.`);
}

generateSeoPages();
