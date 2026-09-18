import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { DESTINATION_GEOGRAPHY } from '../src/config/geography';
import { LIVE_CATALOGUE_METRICS, SEO_PRODUCERS } from './seoCatalogue';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');
const homeIndexPath = path.join(distDir, 'index.html');

const PRODUCERS: Producer[] = SEO_PRODUCERS;

const categoryLabels: Record<Producer['category'], string> = {
  winery: 'Winery',
  brewery: 'Brewery',
  distillery: 'Distillery',
  cidery: 'Cidery',
  olive_mill: 'Olive mill',
  olive_oil_producer: 'Olive oil producer',
  oil_mill: 'Oil mill',
  cheese_dairy: 'Dairy / cheesemaker',
  apiary: 'Apiary / honey producer',
  confectionery: 'Confectionery producer',
  herb_farm: 'Herb farm',
  mushroom_farm: 'Mushroom farm',
  farm: 'Farm',
};

const destinationLabels: Record<Producer['destination'], string> = {
  crete: 'Crete',
  santorini: 'Santorini',
  peloponnese: 'Peloponnese',
  thessaly: 'Thessaly',
  northern_greece: 'Macedonia, Greece',
  tuscany: 'Tuscany',
  piedmont: 'Piedmont',
  puglia: 'Puglia',
  sicily: 'Sicily',
  south_tyrol: 'South Tyrol',
  provence: "Provence-Alpes-Côte d'Azur",
  catalonia: 'Catalonia',
  alentejo: 'Alentejo',
  istria: 'Istria',
  pomurska: 'Pomurska',
  southeast_slovenia: 'Southeast Slovenia',
  central_slovenia: 'Central Slovenia',
  goriska: 'Goriška',
  trondelag: 'Trøndelag',
  more_og_romsdal: 'Møre og Romsdal',
  buskerud: 'Buskerud',
  vestland: 'Vestland',
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
  const country = producer.country || DESTINATION_GEOGRAPHY[producer.destination]?.country || 'Greece';
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

const pageStyles = `
      :root{color-scheme:dark}.seo-page{box-sizing:border-box;min-height:100vh;background:#0c0a09;color:#e7e5e4;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:32px 20px}.seo-page article{max-width:900px;margin:0 auto}.seo-page a{color:#fbbf24}.seo-page h1{font-size:clamp(2rem,5vw,3.6rem);line-height:1.05;color:#fff;margin:.5rem 0 1rem}.seo-page h2{color:#fff;margin-top:2rem}.seo-page h3{color:#f5f5f4;margin-top:1.5rem}.seo-page .eyebrow{color:#fbbf24;font-weight:800;text-transform:uppercase;letter-spacing:.08em;font-size:.8rem}.seo-page .lead{font-size:1.15rem;line-height:1.7}.seo-page p,.seo-page dd,.seo-page li{line-height:1.7}.seo-page dl{display:grid;gap:1rem}.seo-page dt{font-weight:800;color:#fff}.seo-page dd{margin:.25rem 0 0;color:#d6d3d1}.seo-page .notice{border-left:3px solid #f59e0b;padding-left:1rem;color:#d6d3d1}.seo-page ul{line-height:1.9}.seo-page .actions{display:flex;gap:12px;flex-wrap:wrap;margin:1.5rem 0}.seo-page .button{display:inline-block;background:#f59e0b;color:#1c1917;text-decoration:none;font-weight:800;padding:10px 14px;border-radius:999px}.seo-page .secondary{background:#292524;color:#fbbf24}.seo-page .directory{display:grid;gap:10px;padding:0;list-style:none}.seo-page .directory a{display:block;border:1px solid #292524;border-radius:14px;padding:12px 14px;text-decoration:none;background:#1c1917}.seo-page .directory small{display:block;color:#a8a29e;margin-top:3px}
`;

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
  const publishedProducts = producer.productSpecialties?.length
    ? producer.productSpecialties
    : producer.indigenousVarieties;
  const publishedItems = publishedProducts?.length
    ? `<section><h2>Published varieties or products</h2><p>${publishedProducts.map(escapeHtml).join(', ')}</p></section>`
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
    <style>${pageStyles}</style>
  </head>
  <body style="margin:0">
    <main class="seo-page">
      <article>
        <p><a href="/">TerroirTrail</a> · <a href="/producers/">Producer directory</a></p>
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

const renderProducerDirectory = (): string => {
  const canonicalUrl = `${CANONICAL_HOST}/producers/`;
  const title = 'Audited Producer Directory | TerroirTrail';
  const description = `Browse ${PRODUCERS.length} canonical producer/project records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} countries.`;
  const grouped = Object.keys(destinationLabels).map((destinationKey) => {
    const destination = destinationKey as Producer['destination'];
    const producers = PRODUCERS
      .filter((producer) => producer.destination === destination)
      .sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name));
    if (producers.length === 0) return '';
    const items = producers.map((producer) =>
      `<li><a href="${producerPath(producer)}"><strong>${escapeHtml(producer.name)}</strong><small>${escapeHtml(categoryLabels[producer.category])} · ${escapeHtml(producer.village)}, ${escapeHtml(producer.region)}</small></a></li>`
    ).join('\n');
    return `<section><h2>${escapeHtml(destinationLabels[destination])}</h2><ul class="directory">${items}</ul></section>`;
  }).join('\n');

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonicalUrl,
    url: canonicalUrl,
    name: title,
    description,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: PRODUCERS.length,
      itemListElement: PRODUCERS.map((producer, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: producerUrl(producer),
        name: producer.name,
      })),
    },
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TerroirTrail" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <script type="application/ld+json">${JSON.stringify(itemList, null, 2).replace(/</g, '\\u003c')}</script>
    <style>${pageStyles}</style>
  </head>
  <body style="margin:0">
    <main class="seo-page">
      <article>
        <p><a href="/">← TerroirTrail</a></p>
        <p class="eyebrow">Evidence-first catalogue</p>
        <h1>Audited Producer Directory</h1>
        <p class="lead">${escapeHtml(description)}</p>
        <p class="notice">Listings are independent researched records. Inclusion does not imply a TerroirTrail partnership, public visitor access, or verified road suitability. Each entity page states the evidence available for that producer or project.</p>
        ${grouped}
      </article>
    </main>
  </body>
</html>\n`;
};

const renderSitemap = (): string => {
  const urls = [
    `${CANONICAL_HOST}/`,
    `${CANONICAL_HOST}/privacy.html`,
    `${CANONICAL_HOST}/producers/`,
    ...PRODUCERS.map(producerUrl),
  ];
  const entries = urls.map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

const refreshHomepageSeoState = (sourceHtml: string): string => {
  let html = sourceHtml;

  // Legacy source templates may still contain older regional copy. Normalize it
  // when present, but never fail a build merely because the source template has
  // already been updated to the current catalogue state.
  const legacyReplacements: Array<[string, string]> = [
    [
      'Independent producer and agritourism discovery guide. Explore audited producers across Crete and Santorini with clearly labeled visiting, location, imagery, and road-access status.',
      `Independent producer and agritourism discovery guide. Explore ${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries, with clearly labeled visiting, location, imagery, and road-access status.`,
    ],
    [
      'Independent producer and agritourism discovery guide connecting travelers directly with audited wineries, craft breweries, artisanal olive mills, traditional dairies, apiaries, traditional distilleries, and farms across Crete and Santorini, with clearly labeled visiting, location, imagery, and road-access status.',
      `Independent producer and agritourism discovery guide connecting travelers directly with ${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries, with clearly labeled visiting, location, imagery, and road-access status.`,
    ],
    [
      'Interactive agritourism discovery map and directory with audited reference catalogues in Crete and Santorini. Discovery Guides are built from verified stops; multi-stop driving navigation remains withheld wherever road-access evidence is incomplete.',
      `Interactive agritourism discovery map and directory with ${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries. Discovery Guides are built from verified stops; multi-stop driving navigation remains withheld wherever road-access evidence is incomplete.`,
    ],
    [
      'TerroirTrail is an independent producer and agritourism discovery guide. It connects slow travelers and road-trippers directly with independent wineries, craft breweries, artisanal olive mills, traditional dairies, apiaries, traditional distilleries, and farms, with audited reference catalogues in Crete and Santorini and further regional expansion in progress.',
      `TerroirTrail is an independent producer and agritourism discovery guide with ${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries. It connects travelers with source-backed producer identity, visiting, location and access information while keeping unknown facts unknown.`,
    ],
    [
      'Which regions are currently audited to reference quality?',
      'Which regions are currently represented in the audited catalogue?',
    ],
    [
      'Crete and Santorini are the current reference-quality regions. Crete has 27 audited producer/project records and Santorini has 9 audited producer records.',
      `The live catalogue currently contains ${LIVE_CATALOGUE_METRICS.totalProducers} producer/project records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries.`,
    ],
    [
      'Crete and Santorini are the current reference-quality regions, with clearly labeled visiting, location, imagery, and road-access status and no commission markups.',
      `The live catalogue spans ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries, with clearly labeled visiting, location, imagery, and road-access status and no commission markups.`,
    ],
    [
      'TerroirTrail publishes Discovery Guides from verified producer stops. Six guides are currently published across Crete and Santorini. They are discovery stop collections, not road-safety guarantees.',
      'TerroirTrail publishes Discovery Guides from verified producer stops. Ten verified-stop guides are currently published. They are discovery stop collections, not road-safety guarantees.',
    ],
  ];

  for (const [legacy, current] of legacyReplacements) {
    html = html.replaceAll(legacy, current);
  }

  const sourceHeading = '<h2>Producer Directory — Selected Catalogue Excerpt</h2>';
  const generatedHeading = '<h2>Audited Producer Directory — Homepage Excerpt</h2>';
  const catalogueSummary = `<p>The live catalogue and deterministic SEO/AEO snapshot are synchronized at ${PRODUCERS.length} producer/project records. <a href="/producers/">Browse the canonical producer directory.</a></p>`;

  if (html.includes(sourceHeading)) {
    html = html.replace(sourceHeading, `${catalogueSummary}\n        ${generatedHeading}`);
  } else if (html.includes(generatedHeading)) {
    if (!html.includes(catalogueSummary)) {
      html = html.replace(generatedHeading, `${catalogueSummary}\n        ${generatedHeading}`);
    }
  } else {
    console.error('[SEO Generation Failed] Homepage producer-directory heading was not found.');
    process.exit(1);
  }

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
  fs.writeFileSync(homeIndexPath, refreshHomepageSeoState(homeHtml), 'utf-8');

  const producerRoot = path.join(distDir, 'producers');
  fs.rmSync(producerRoot, { recursive: true, force: true });
  fs.mkdirSync(producerRoot, { recursive: true });
  fs.writeFileSync(path.join(producerRoot, 'index.html'), renderProducerDirectory(), 'utf-8');

  for (const producer of PRODUCERS) {
    const pageDir = path.join(producerRoot, producer.id);
    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(path.join(pageDir, 'index.html'), renderProducerPage(producer), 'utf-8');
  }

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), renderSitemap(), 'utf-8');
  console.log(`✓ SEO generation complete: ${PRODUCERS.length} synchronized canonical producer pages across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations / ${LIVE_CATALOGUE_METRICS.countryCount} countries + sitemap.`);
}

generateSeoPages();
