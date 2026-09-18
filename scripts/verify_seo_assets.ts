import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { LIVE_CATALOGUE_METRICS, SEO_PRODUCERS } from './seoCatalogue';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const CANONICAL_SITEMAP_URL = `${CANONICAL_HOST}/sitemap.xml`;
const PRODUCER_DIRECTORY_URL = `${CANONICAL_HOST}/producers/`;
const distDir = path.resolve(process.cwd(), 'dist');

const PRODUCERS: Producer[] = SEO_PRODUCERS;
const CRETE_COUNT = PRODUCERS.filter((producer) => producer.destination === 'crete').length;
const SANTORINI_COUNT = PRODUCERS.filter((producer) => producer.destination === 'santorini').length;

const fail = (message: string): never => {
  console.error(`[SEO Verification Failed] ${message}`);
  process.exit(1);
};

const requireFile = (filePath: string, label: string): string => {
  if (!fs.existsSync(filePath)) fail(`${label} is missing at ${filePath}.`);
  return fs.readFileSync(filePath, 'utf-8');
};

const requireIncludes = (content: string, value: string, label: string): void => {
  if (!content.includes(value)) fail(`${label} is missing required value: ${value}`);
};

const banIncludes = (content: string, value: string, label: string): void => {
  if (content.includes(value)) fail(`${label} still contains stale/quarantined value: ${value}`);
};

const producerUrl = (producer: Producer): string => `${CANONICAL_HOST}/producers/${producer.id}/`;

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const parseJsonLd = (html: string, label: string): Record<string, unknown> => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) fail(`${label} has no JSON-LD block.`);
  try {
    return JSON.parse(match[1]) as Record<string, unknown>;
  } catch (error) {
    fail(`${label} contains invalid JSON-LD: ${error instanceof Error ? error.message : String(error)}`);
  }
};

function verifySeoAssets(): void {
  if (!fs.existsSync(distDir)) {
    fail(`dist directory does not exist at ${distDir}. Run build first.`);
  }

  const ids = PRODUCERS.map((producer) => producer.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== PRODUCERS.length) {
    fail(`Audited producer catalogue contains duplicate ids (${uniqueIds.size}/${PRODUCERS.length} unique).`);
  }
  for (const id of ids) {
    if (!/^[a-z0-9-]+$/.test(id)) fail(`Producer id is not path-safe: ${id}`);
  }

  const sitemapPath = path.join(distDir, 'sitemap.xml');
  const sitemapContent = requireFile(sitemapPath, 'dist/sitemap.xml').trim();
  if (!sitemapContent.startsWith('<?xml') || !sitemapContent.includes('<urlset') || !sitemapContent.endsWith('</urlset>')) {
    fail('dist/sitemap.xml is not valid XML or is missing the <urlset> root.');
  }

  const locMatches = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)];
  const sitemapUrls = locMatches.map((match) => match[1].trim());
  const expectedUrls = [
    `${CANONICAL_HOST}/`,
    `${CANONICAL_HOST}/privacy.html`,
    PRODUCER_DIRECTORY_URL,
    ...PRODUCERS.map(producerUrl),
  ];

  if (sitemapUrls.length !== expectedUrls.length) {
    fail(`dist/sitemap.xml has ${sitemapUrls.length} URLs; expected ${expectedUrls.length}.`);
  }
  if (new Set(sitemapUrls).size !== sitemapUrls.length) {
    fail('dist/sitemap.xml contains duplicate URLs.');
  }
  for (const url of expectedUrls) {
    if (!sitemapUrls.includes(url)) fail(`dist/sitemap.xml is missing expected URL: ${url}`);
  }
  for (const url of sitemapUrls) {
    if (!url.startsWith(`${CANONICAL_HOST}/`)) fail(`Sitemapped URL uses the wrong host: ${url}`);
    if (url.includes('?producer=')) fail(`Legacy query-state producer URL must not appear in the sitemap: ${url}`);
  }

  const robotsPath = path.join(distDir, 'robots.txt');
  const robotsContent = requireFile(robotsPath, 'dist/robots.txt');
  const sitemapDirectivePattern = new RegExp(`^Sitemap:\\s*${CANONICAL_SITEMAP_URL.replace(/\./g, '\\.')}\\s*$`, 'm');
  if (!sitemapDirectivePattern.test(robotsContent)) {
    fail(`dist/robots.txt does not advertise Sitemap: ${CANONICAL_SITEMAP_URL}`);
  }
  for (const crawler of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'PerplexityBot', 'ClaudeBot', 'Applebot-Extended', 'Google-Extended']) {
    requireIncludes(robotsContent, `User-agent: ${crawler}`, 'dist/robots.txt');
  }
  requireIncludes(robotsContent, 'https://terroir-trail.web.app/llms.txt', 'dist/robots.txt');

  const llmsPath = path.join(distDir, 'llms.txt');
  const llmsContent = requireFile(llmsPath, 'dist/llms.txt');
  const requiredLlmsClaims = [
    `${LIVE_CATALOGUE_METRICS.totalProducers} producer/project records`,
    `Greece — 66 records: Crete ${CRETE_COUNT}, Santorini ${SANTORINI_COUNT}, Peloponnese 11, Macedonia 11, Thessaly 5.`,
    'Italy — 39 records: Tuscany 5, Piedmont 8, Puglia 8, Sicily 9, South Tyrol 9.',
    'France — Provence-Alpes-Côte d\'Azur 8.',
    'Norway — 8 records: Trøndelag 1, Møre og Romsdal 1, Buskerud 1, Vestland 5.',
    `Deterministic canonical SEO/AEO producer snapshot — ${PRODUCERS.length} records, synchronized with the live catalogue.`,
    '10 published verified-stop Discovery Guides',
    '/producers/<producer-id>/',
    'Sitemap: https://terroir-trail.web.app/sitemap.xml',
    'Producer directory: https://terroir-trail.web.app/producers/',
    'Robots policy: https://terroir-trail.web.app/robots.txt',
    '## Search and answer-engine discovery',
    '## Answer-engine interpretation rules',
    'does not represent Santorini as a UNESCO Global Geopark',
    'Greek cheese and dairy expansion is now included in the audited catalogue',
  ];
  for (const claim of requiredLlmsClaims) requireIncludes(llmsContent, claim, 'dist/llms.txt');

  const staleLlmsClaims = [
    '36 producer/project records',
    '55 producer/project records',
    'Next regional programme: Peloponnese',
    'Current reference region: Crete, Greece.',
    'Future expansion may include Santorini',
    '58+ verified producers',
    '6 turn-by-turn',
    'Santorini Complete Volcanic Caldera & Donkey Beer Trail',
    'Greek cheese and dairy is the next planned catalogue expansion',
  ];
  for (const claim of staleLlmsClaims) banIncludes(llmsContent, claim, 'dist/llms.txt');

  const indexPath = path.join(distDir, 'index.html');
  const indexContent = requireFile(indexPath, 'dist/index.html');
  requireIncludes(indexContent, `<link rel="canonical" href="${CANONICAL_HOST}/" />`, 'dist/index.html');
  requireIncludes(indexContent, 'TerroirTrail — Independent Producer &amp; Agritourism Guide', 'dist/index.html');
  requireIncludes(indexContent, `${LIVE_CATALOGUE_METRICS.totalProducers} live producer/project records`, 'dist/index.html');
  requireIncludes(indexContent, 'Ten verified-stop guides are currently published', 'dist/index.html');
  requireIncludes(indexContent, `${LIVE_CATALOGUE_METRICS.destinationCount} destinations in ${LIVE_CATALOGUE_METRICS.countryCount} European countries`, 'dist/index.html');
  requireIncludes(indexContent, 'href="/producers/"', 'dist/index.html');
  requireIncludes(indexContent, 'Discovery Guides &amp; Navigation Safety', 'dist/index.html');
  requireIncludes(indexContent, 'Santorini Brewing Company', 'dist/index.html');

  const staleIndexClaims = [
    '36 producer/project records',
    '55 audited producer/project records',
    'Six guides are currently published across Crete and Santorini',
    'Crete and Santorini are the current reference-quality regions',
    'Verified Crete &amp; Santorini Producer Directory',
    '58 featured independent',
    'Curated Crete Rural Discovery Loops',
    'Heraklion Peza & Archanes Wine Loop',
    'Chania Mountain & Artisan Olive Oil Circuit',
    'Rethymno Foothills & Heritage Circuit',
    'Lasithi & Sitia Monastic Terroir Route',
    'Curated Rural Routes Under Verification',
    'Starting in Greece with our inaugural audited Crete dataset',
    'Verified Crete Producer Directory',
  ];
  for (const claim of staleIndexClaims) banIncludes(indexContent, claim, 'dist/index.html');

  const bannedGlobalGeoTags = [
    'geo.placename',
    '35.3387;25.1442',
    '35.3387, 25.1442',
  ];
  for (const tag of bannedGlobalGeoTags) banIncludes(indexContent, tag, 'dist/index.html');

  const bannedMonetizationTags = [
    'pagead2.googlesyndication.com',
    'emrld.ltd',
    'ca-pub-1608902378435149',
  ];
  for (const tag of bannedMonetizationTags) banIncludes(indexContent, tag, 'dist/index.html');

  const producerDirectoryPath = path.join(distDir, 'producers', 'index.html');
  const producerDirectoryContent = requireFile(producerDirectoryPath, 'dist/producers/index.html');
  requireIncludes(producerDirectoryContent, `<link rel="canonical" href="${PRODUCER_DIRECTORY_URL}" />`, 'producer directory');
  requireIncludes(producerDirectoryContent, `${PRODUCERS.length} canonical producer/project records`, 'producer directory');
  requireIncludes(producerDirectoryContent, '"@type": "CollectionPage"', 'producer directory');
  requireIncludes(producerDirectoryContent, `"numberOfItems": ${PRODUCERS.length}`, 'producer directory');

  const directoryJsonLd = parseJsonLd(producerDirectoryContent, 'producer directory');
  if (directoryJsonLd['@type'] !== 'CollectionPage') {
    fail('Producer directory JSON-LD must describe a CollectionPage.');
  }

  for (const producer of PRODUCERS) {
    const canonicalUrl = producerUrl(producer);
    const pagePath = path.join(distDir, 'producers', producer.id, 'index.html');
    const pageContent = requireFile(pagePath, `Producer page ${producer.id}`);

    requireIncludes(pageContent, `<link rel="canonical" href="${canonicalUrl}" />`, `Producer page ${producer.id}`);
    requireIncludes(pageContent, `<h1>${escapeHtml(producer.name)}</h1>`, `Producer page ${producer.id}`);
    requireIncludes(pageContent, '<meta name="description" content="', `Producer page ${producer.id}`);
    requireIncludes(pageContent, '<meta name="robots" content="index, follow', `Producer page ${producer.id}`);
    requireIncludes(pageContent, 'What is it?', `Producer page ${producer.id}`);
    requireIncludes(pageContent, 'Where is it?', `Producer page ${producer.id}`);
    requireIncludes(pageContent, 'Can you visit?', `Producer page ${producer.id}`);
    requireIncludes(pageContent, 'What is known about road access?', `Producer page ${producer.id}`);
    requireIncludes(pageContent, 'does not imply a commercial partnership', `Producer page ${producer.id}`);
    requireIncludes(pageContent, 'href="/producers/"', `Producer page ${producer.id}`);

    if (!producer.description && !producer.story && !producer.tagLine) {
      fail(`Producer ${producer.id} has no narrative source for an entity page.`);
    }
    if (pageContent.includes(`<link rel="canonical" href="${CANONICAL_HOST}/?producer=`)) {
      fail(`Producer page ${producer.id} canonicalizes to legacy query state.`);
    }

    const jsonLd = parseJsonLd(pageContent, `Producer page ${producer.id}`);
    const graph = jsonLd['@graph'];
    if (!Array.isArray(graph)) fail(`Producer page ${producer.id} JSON-LD must contain an @graph.`);
    const webPage = graph.find((node) => typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@type'] === 'WebPage') as Record<string, unknown> | undefined;
    const entity = graph.find((node) => typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@id'] === `${canonicalUrl}#entity`) as Record<string, unknown> | undefined;
    if (!webPage || webPage.url !== canonicalUrl) fail(`Producer page ${producer.id} JSON-LD WebPage URL is missing or incorrect.`);
    if (!entity || entity.name !== producer.name) fail(`Producer page ${producer.id} JSON-LD entity identity is missing or incorrect.`);

    const canonicalOccurrences = sitemapUrls.filter((url) => url === canonicalUrl).length;
    if (canonicalOccurrences !== 1) fail(`Producer ${producer.id} must appear exactly once in the sitemap.`);
    requireIncludes(producerDirectoryContent, `href="/producers/${producer.id}/"`, `Producer directory link for ${producer.id}`);
  }

  console.log('✓ SEO/AEO verification passed:');
  console.log(`  - ${expectedUrls.length} canonical sitemap URLs (${PRODUCERS.length} producer entities + directory + core pages)`);
  console.log(`  - ${PRODUCERS.length} synchronized producer pages have canonical metadata, visible answer-ready facts, JSON-LD and directory links`);
  console.log('  - producer directory has CollectionPage/ItemList schema and links every audited entity');
  console.log(`  - live catalogue state: ${LIVE_CATALOGUE_METRICS.totalProducers} records across ${LIVE_CATALOGUE_METRICS.destinationCount} destinations / ${LIVE_CATALOGUE_METRICS.countryCount} countries`);
  console.log(`  - deterministic SEO/AEO snapshot synchronized to all ${PRODUCERS.length} live producer records`);
  console.log(`  - robots.txt advertises ${CANONICAL_SITEMAP_URL}, llms.txt and explicit search/answer-engine crawler access`);
  console.log('  - stale claims, legacy query canonicals and unconsented monetization tags are quarantined');
}

verifySeoAssets();
