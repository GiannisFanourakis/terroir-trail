import fs from 'fs';
import path from 'path';
import { LIVE_CATALOGUE_METRICS, SEO_PRODUCERS } from './seoCatalogue';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');

const destinationCounts = {
  crete: SEO_PRODUCERS.filter((producer) => producer.destination === 'crete').length,
  santorini: SEO_PRODUCERS.filter((producer) => producer.destination === 'santorini').length,
  peloponnese: SEO_PRODUCERS.filter((producer) => producer.destination === 'peloponnese').length,
  northernGreece: SEO_PRODUCERS.filter((producer) => producer.destination === 'northern_greece').length,
  thessaly: SEO_PRODUCERS.filter((producer) => producer.destination === 'thessaly').length,
  tuscany: SEO_PRODUCERS.filter((producer) => producer.destination === 'tuscany').length,
  piedmont: SEO_PRODUCERS.filter((producer) => producer.destination === 'piedmont').length,
};

const pageTitle = 'TerroirTrail — Independent Agritourism & Producer Guide';
const pageDescription =
  `Independent agritourism guide to ${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries, with visit and road-access context.`;
const homepageSummary =
  `TerroirTrail is an independent producer and agritourism discovery guide with ${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries.`;

const replaceRequired = (html: string, pattern: RegExp, replacement: string, label: string): string => {
  if (!pattern.test(html)) {
    console.error(`[SEO Homepage Finalization Failed] Could not locate ${label}.`);
    process.exit(1);
  }
  return html.replace(pattern, replacement);
};

if (!fs.existsSync(indexPath)) {
  console.error(`[SEO Homepage Finalization Failed] ${indexPath} is missing.`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

html = replaceRequired(html, /<title>[\s\S]*?<\/title>/i, `<title>${pageTitle.replace('&', '&amp;')}</title>`, 'homepage title');
html = replaceRequired(
  html,
  /<meta\s+name="description"\s+content="[^"]*"\s*\/>/i,
  `<meta name="description" content="${pageDescription}" />`,
  'meta description'
);
html = replaceRequired(
  html,
  /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,
  `<meta property="og:title" content="${pageTitle.replace('&', '&amp;')}" />`,
  'Open Graph title'
);
html = replaceRequired(
  html,
  /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i,
  `<meta property="og:description" content="${pageDescription}" />`,
  'Open Graph description'
);
html = replaceRequired(
  html,
  /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,
  `<meta name="twitter:title" content="${pageTitle.replace('&', '&amp;')}" />`,
  'Twitter title'
);
html = replaceRequired(
  html,
  /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i,
  `<meta name="twitter:description" content="${pageDescription}" />`,
  'Twitter description'
);

// Google Search no longer uses the FAQ rich-result feature. Keep the homepage
// schema focused on the site, operator, application and travel-guide entities.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${CANONICAL_HOST}/#website`,
      name: 'TerroirTrail',
      url: `${CANONICAL_HOST}/`,
      description: pageDescription,
      inLanguage: 'en',
      publisher: { '@id': `${CANONICAL_HOST}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${CANONICAL_HOST}/#organization`,
      name: 'TerroirTrail',
      url: `${CANONICAL_HOST}/`,
      logo: `${CANONICAL_HOST}/logo.png`,
      founder: {
        '@type': 'Person',
        '@id': `${CANONICAL_HOST}/#founder`,
        name: 'Ioannis Fanourakis',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${CANONICAL_HOST}/#app`,
      name: 'TerroirTrail',
      url: `${CANONICAL_HOST}/`,
      applicationCategory: 'TravelApplication',
      operatingSystem: 'Web, Android, iOS',
      description: pageDescription,
      inLanguage: 'en',
      publisher: { '@id': `${CANONICAL_HOST}/#organization` },
    },
    {
      '@type': 'TouristGuide',
      '@id': `${CANONICAL_HOST}/#guide`,
      name: 'TerroirTrail — Independent Agritourism & Producer Guide',
      url: `${CANONICAL_HOST}/`,
      description: homepageSummary,
      inLanguage: 'en',
      touristType: ['Agritourism', 'Culinary Travel', 'Wine Tourism', 'Slow Travel'],
      about: [
        { '@type': 'Place', name: 'Crete', url: `${CANONICAL_HOST}/greece/crete/` },
        { '@type': 'Place', name: 'Santorini', url: `${CANONICAL_HOST}/greece/santorini/` },
        { '@type': 'Place', name: 'Peloponnese', url: `${CANONICAL_HOST}/greece/peloponnese/` },
        { '@type': 'Place', name: 'Macedonia, Greece', url: `${CANONICAL_HOST}/greece/northern-greece/` },
        { '@type': 'Place', name: 'Tuscany', url: `${CANONICAL_HOST}/italy/tuscany/` },
      ],
    },
  ],
};

html = replaceRequired(
  html,
  /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
  `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2).replace(/</g, '\\u003c')}\n    </script>`,
  'homepage JSON-LD'
);

// Normalize legacy copy that may still be present in the Vite source template.
const legacyReplacements: Array<[string, string]> = [
  [
    'TerroirTrail is an independent producer and agritourism discovery guide connecting culinary travelers and road-trippers directly with independent wineries, craft breweries, artisanal olive mills, traditional dairies, apiaries, traditional distilleries, and farms. Crete and Santorini are the current reference-quality regions.',
    homepageSummary,
  ],
  [
    'Crete and Santorini are the current reference-quality regions, with clearly labeled visiting, location, imagery, and road-access status and no commission markups.',
    `${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records are published across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries, with visiting, location and road-access status kept explicit.`,
  ],
  ['Verified Crete &amp; Santorini Producer Directory', 'Audited Producer Directory'],
];

for (const [legacy, current] of legacyReplacements) {
  html = html.replaceAll(legacy, current);
}

const destinationDirectory = `
        <nav aria-label="Explore TerroirTrail destinations">
          <p><strong>Explore destinations:</strong>
            <a href="/greece/crete/">Crete (${destinationCounts.crete})</a> ·
            <a href="/greece/santorini/">Santorini (${destinationCounts.santorini})</a> ·
            <a href="/greece/peloponnese/">Peloponnese (${destinationCounts.peloponnese})</a> ·
            <a href="/greece/northern-greece/">Macedonia, Greece (${destinationCounts.northernGreece})</a> ·
            <a href="/italy/tuscany/">Tuscany (${destinationCounts.tuscany})</a> ·
            <a href="/producers/">All producers</a> ·
            <a href="/categories/">Producer categories</a>
          </p>
        </nav>`;

if (!html.includes('aria-label="Explore TerroirTrail destinations"')) {
  const noscriptMarker = '<h2>TerroirTrail — Independent Producer &amp; Agritourism Guide</h2>';
  if (html.includes(noscriptMarker)) {
    html = html.replace(noscriptMarker, `${noscriptMarker}${destinationDirectory}`);
  }
}

const staleClaims = [
  'Crete and Santorini are the current reference-quality regions',
  'Six guides are currently published across Crete and Santorini',
  'Ten verified-stop Discovery Guides',
  '"@type": "FAQPage"',
];
for (const stale of staleClaims) {
  if (html.includes(stale)) {
    console.error(`[SEO Homepage Finalization Failed] Stale homepage claim remains: ${stale}`);
    process.exit(1);
  }
}

for (const required of [
  `${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records`,
  '/greece/crete/',
  '/greece/santorini/',
  '/greece/peloponnese/',
  '/greece/northern-greece/',
  '/italy/tuscany/',
  '"@type": "WebSite"',
  '"@type": "Organization"',
]) {
  if (!html.includes(required)) {
    console.error(`[SEO Homepage Finalization Failed] Required current SEO value is missing: ${required}`);
    process.exit(1);
  }
}

fs.writeFileSync(indexPath, html, 'utf-8');
console.log(`Homepage Google SEO finalized (${LIVE_CATALOGUE_METRICS.totalProducers} live records; ${SEO_PRODUCERS.length} bundled canonical records; current schema).`);
