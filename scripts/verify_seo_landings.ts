import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { SEO_PRODUCERS } from './seoCatalogue';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const CANONICAL_SITEMAP_URL = `${CANONICAL_HOST}/sitemap.xml`;
const PRODUCER_DIRECTORY_URL = `${CANONICAL_HOST}/producers/`;
const distDir = path.resolve(process.cwd(), 'dist');
const MIN_CATEGORY_RECORDS = 2;
const MIN_REGION_RECORDS = 2;
const MIN_DESTINATION_CATEGORY_RECORDS = 3;

const PRODUCERS: Producer[] = SEO_PRODUCERS;
const CRETE_COUNT = PRODUCERS.filter((producer) => producer.destination === 'crete').length;
const SANTORINI_COUNT = PRODUCERS.filter((producer) => producer.destination === 'santorini').length;
const OTHER_DESTINATION_COUNT = PRODUCERS.length - CRETE_COUNT - SANTORINI_COUNT;

const categorySlugs: Record<Producer['category'], string> = {
  winery: 'wineries',
  brewery: 'breweries',
  kazani: 'distilleries-rakokazana',
  olive_mill: 'olive-mills',
  olive_oil_producer: 'olive-oil-producers',
  cheese_dairy: 'dairies-cheesemakers',
  apiary: 'apiaries-honey-producers',
  farm: 'farms',
};

const destinationConfig: Record<Producer['destination'], { slug: string; countrySlug: string; label: string }> = {
  crete: { slug: 'crete', countrySlug: 'greece', label: 'Crete' },
  santorini: { slug: 'santorini', countrySlug: 'greece', label: 'Santorini' },
  peloponnese: { slug: 'peloponnese', countrySlug: 'greece', label: 'Peloponnese' },
  northern_greece: { slug: 'northern-greece', countrySlug: 'greece', label: 'Macedonia, Greece' },
  tuscany: { slug: 'tuscany', countrySlug: 'italy', label: 'Tuscany' },
};

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

const escapeHtml = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const slugify = (value: string): string =>
  value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const producerPath = (producer: Producer): string => `/producers/${producer.id}/`;
const producerUrl = (producer: Producer): string => `${CANONICAL_HOST}${producerPath(producer)}`;
const destinationPath = (destination: Producer['destination']): string => {
  const config = destinationConfig[destination];
  return `/${config.countrySlug}/${config.slug}/`;
};
const categoryPath = (category: Producer['category']): string => `/producers/${categorySlugs[category]}/`;
const regionPath = (destination: Producer['destination'], region: string): string => `${destinationPath(destination)}regions/${slugify(region)}/`;
const comboPath = (destination: Producer['destination'], category: Producer['category']): string => `${destinationPath(destination)}${categorySlugs[category]}/`;
const fileForUrlPath = (urlPath: string): string => path.join(distDir, urlPath.replace(/^\//, '').replace(/\/$/, ''), 'index.html');

const groupBy = <K extends string>(producers: Producer[], keyFn: (producer: Producer) => K): Map<K, Producer[]> => {
  const groups = new Map<K, Producer[]>();
  for (const producer of producers) {
    const key = keyFn(producer);
    const group = groups.get(key) || [];
    group.push(producer);
    groups.set(key, group);
  }
  return groups;
};

const parseJsonLd = (html: string, label: string): Record<string, unknown> => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) fail(`${label} has no JSON-LD block.`);
  try {
    return JSON.parse(match[1]) as Record<string, unknown>;
  } catch (error) {
    fail(`${label} contains invalid JSON-LD: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const getGraphNode = (jsonLd: Record<string, unknown>, type: string): Record<string, unknown> | undefined => {
  const graph = jsonLd['@graph'];
  if (!Array.isArray(graph)) return undefined;
  return graph.find((node) => typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@type'] === type) as Record<string, unknown> | undefined;
};

const verifyLandingPage = (urlPath: string, expectedCount: number, label: string): void => {
  const canonicalUrl = `${CANONICAL_HOST}${urlPath}`;
  const content = requireFile(fileForUrlPath(urlPath), label);
  requireIncludes(content, `<link rel="canonical" href="${canonicalUrl}" />`, label);
  requireIncludes(content, '<meta name="description" content="', label);
  requireIncludes(content, '<meta name="robots" content="index, follow', label);
  requireIncludes(content, '<h1>', label);
  requireIncludes(content, `${expectedCount} producer/project records.`, label);
  requireIncludes(content, 'Are visits confirmed?', label);
  requireIncludes(content, 'What is known about road access?', label);
  requireIncludes(content, 'does not imply a commercial partnership', label);

  const jsonLd = parseJsonLd(content, label);
  const collection = getGraphNode(jsonLd, 'CollectionPage');
  const breadcrumbs = getGraphNode(jsonLd, 'BreadcrumbList');
  if (!collection || collection.url !== canonicalUrl) fail(`${label} JSON-LD CollectionPage URL is incorrect.`);
  if (!breadcrumbs) fail(`${label} JSON-LD must contain a BreadcrumbList.`);
  const mainEntity = collection.mainEntity as Record<string, unknown> | undefined;
  if (!mainEntity || mainEntity.numberOfItems !== expectedCount) fail(`${label} JSON-LD ItemList count is incorrect.`);
};

const verifyIndexPage = (urlPath: string, expectedCount: number, requiredLinks: string[], label: string): void => {
  const canonicalUrl = `${CANONICAL_HOST}${urlPath}`;
  const content = requireFile(fileForUrlPath(urlPath), label);
  requireIncludes(content, `<link rel="canonical" href="${canonicalUrl}" />`, label);
  requireIncludes(content, 'keyword permutations', label);
  for (const link of requiredLinks) requireIncludes(content, `href="${link}"`, `${label} link ${link}`);

  const jsonLd = parseJsonLd(content, label);
  const collection = getGraphNode(jsonLd, 'CollectionPage');
  const breadcrumbs = getGraphNode(jsonLd, 'BreadcrumbList');
  if (!collection || collection.url !== canonicalUrl) fail(`${label} JSON-LD CollectionPage URL is incorrect.`);
  if (!breadcrumbs) fail(`${label} JSON-LD must contain a BreadcrumbList.`);
  const mainEntity = collection.mainEntity as Record<string, unknown> | undefined;
  if (!mainEntity || mainEntity.numberOfItems !== expectedCount) fail(`${label} JSON-LD ItemList count is incorrect.`);
};

function verifySeo(): void {
  if (!fs.existsSync(distDir)) fail(`dist directory does not exist at ${distDir}. Run build first.`);

  const ids = PRODUCERS.map((producer) => producer.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== PRODUCERS.length) fail(`Audited producer catalogue contains duplicate ids (${uniqueIds.size}/${PRODUCERS.length} unique).`);
  for (const id of ids) if (!/^[a-z0-9-]+$/.test(id)) fail(`Producer id is not path-safe: ${id}`);

  const destinationGroups = groupBy(PRODUCERS, (producer) => producer.destination);
  const categoryGroups = groupBy(PRODUCERS, (producer) => producer.category);
  const regionGroups = groupBy(PRODUCERS, (producer) => `${producer.destination}::${producer.region}`);
  const comboGroups = groupBy(PRODUCERS, (producer) => `${producer.destination}::${producer.category}`);
  const countryGroups = groupBy(PRODUCERS, (producer) => destinationConfig[producer.destination].countrySlug);

  const expectedLandingPaths = new Map<string, number>();
  for (const [countrySlug, producers] of countryGroups) expectedLandingPaths.set(`/${countrySlug}/`, producers.length);
  for (const [destination, producers] of destinationGroups) expectedLandingPaths.set(destinationPath(destination), producers.length);
  for (const [category, producers] of categoryGroups) if (producers.length >= MIN_CATEGORY_RECORDS) expectedLandingPaths.set(categoryPath(category), producers.length);
  for (const [key, producers] of regionGroups) {
    const [destination, region] = key.split('::') as [Producer['destination'], string];
    if (producers.length >= MIN_REGION_RECORDS) expectedLandingPaths.set(regionPath(destination, region), producers.length);
  }
  for (const [key, producers] of comboGroups) {
    const [destination, category] = key.split('::') as [Producer['destination'], Producer['category']];
    if (producers.length >= MIN_DESTINATION_CATEGORY_RECORDS) expectedLandingPaths.set(comboPath(destination, category), producers.length);
    else if (fs.existsSync(fileForUrlPath(comboPath(destination, category)))) fail(`Thin destination/category page was generated despite having only ${producers.length} records: ${comboPath(destination, category)}`);
  }

  const sitemapContent = requireFile(path.join(distDir, 'sitemap.xml'), 'dist/sitemap.xml').trim();
  if (!sitemapContent.startsWith('<?xml') || !sitemapContent.includes('<urlset') || !sitemapContent.endsWith('</urlset>')) fail('dist/sitemap.xml is not valid XML or is missing the <urlset> root.');
  const sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
  if (new Set(sitemapUrls).size !== sitemapUrls.length) fail('dist/sitemap.xml contains duplicate URLs.');
  for (const url of sitemapUrls) {
    if (!url.startsWith(`${CANONICAL_HOST}/`)) fail(`Sitemapped URL uses the wrong host: ${url}`);
    if (url.includes('?producer=')) fail(`Legacy query-state producer URL must not appear in the sitemap: ${url}`);
  }

  const baseUrls = [`${CANONICAL_HOST}/`, `${CANONICAL_HOST}/privacy.html`, PRODUCER_DIRECTORY_URL, ...PRODUCERS.map(producerUrl)];
  const landingUrls = [`${CANONICAL_HOST}/destinations/`, `${CANONICAL_HOST}/categories/`, ...[...expectedLandingPaths.keys()].map((urlPath) => `${CANONICAL_HOST}${urlPath}`)];
  const expectedSitemapUrls = [...baseUrls, ...landingUrls];
  if (sitemapUrls.length !== expectedSitemapUrls.length) fail(`Sitemap has ${sitemapUrls.length} URLs; expected ${expectedSitemapUrls.length} for the current catalogue.`);
  for (const url of expectedSitemapUrls) if (!sitemapUrls.includes(url)) fail(`Sitemap is missing expected URL: ${url}`);

  const robotsContent = requireFile(path.join(distDir, 'robots.txt'), 'dist/robots.txt');
  const sitemapDirectivePattern = new RegExp(`^Sitemap:\\s*${CANONICAL_SITEMAP_URL.replace(/\./g, '\\.')}\\s*$`, 'm');
  if (!sitemapDirectivePattern.test(robotsContent)) fail(`dist/robots.txt does not advertise Sitemap: ${CANONICAL_SITEMAP_URL}`);

  const llmsContent = requireFile(path.join(distDir, 'llms.txt'), 'dist/llms.txt');
  const requiredLlmsClaims = [
    `${PRODUCERS.length} producer/project records`,
    `Crete, Greece — ${CRETE_COUNT} audited records.`,
    `Santorini, Greece — ${SANTORINI_COUNT} audited records.`,
    `Peloponnese, Macedonia, Greece and Tuscany / Italy — ${OTHER_DESTINATION_COUNT} audited records combined.`,
    '10 published verified-stop Discovery Guides',
    '/producers/<producer-id>/',
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

  const indexContent = requireFile(path.join(distDir, 'index.html'), 'dist/index.html');
  requireIncludes(indexContent, `<link rel="canonical" href="${CANONICAL_HOST}/" />`, 'dist/index.html');
  requireIncludes(indexContent, 'TerroirTrail — Independent Producer &amp; Agritourism Guide', 'dist/index.html');
  requireIncludes(indexContent, `${PRODUCERS.length} audited producer/project records`, 'dist/index.html');
  requireIncludes(indexContent, 'Ten verified-stop guides are currently published', 'dist/index.html');
  requireIncludes(indexContent, 'Crete, Santorini, the Peloponnese, Macedonia, Greece and Tuscany', 'dist/index.html');
  requireIncludes(indexContent, 'href="/producers/"', 'dist/index.html');
  requireIncludes(indexContent, 'href="/destinations/"', 'dist/index.html');
  requireIncludes(indexContent, 'href="/categories/"', 'dist/index.html');
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
  for (const tag of ['geo.placename', '35.3387;25.1442', '35.3387, 25.1442', 'pagead2.googlesyndication.com', 'emrld.ltd', 'ca-pub-1608902378435149']) banIncludes(indexContent, tag, 'dist/index.html');

  const producerDirectoryContent = requireFile(path.join(distDir, 'producers', 'index.html'), 'Producer directory');
  requireIncludes(producerDirectoryContent, `<link rel="canonical" href="${PRODUCER_DIRECTORY_URL}" />`, 'Producer directory');
  requireIncludes(producerDirectoryContent, `${PRODUCERS.length} audited producer/project records`, 'Producer directory');
  requireIncludes(producerDirectoryContent, '"@type": "CollectionPage"', 'Producer directory');
  requireIncludes(producerDirectoryContent, `"numberOfItems": ${PRODUCERS.length}`, 'Producer directory');
  requireIncludes(producerDirectoryContent, 'href="/destinations/"', 'Producer directory');
  requireIncludes(producerDirectoryContent, 'href="/categories/"', 'Producer directory');
  requireIncludes(producerDirectoryContent, 'href="/greece/"', 'Producer directory');
  requireIncludes(producerDirectoryContent, 'href="/italy/"', 'Producer directory');
  const directoryJsonLd = parseJsonLd(producerDirectoryContent, 'Producer directory');
  if (directoryJsonLd['@type'] !== 'CollectionPage') fail('Producer directory JSON-LD must describe a CollectionPage.');

  for (const producer of PRODUCERS) {
    const canonicalUrl = producerUrl(producer);
    const pageContent = requireFile(path.join(distDir, 'producers', producer.id, 'index.html'), `Producer page ${producer.id}`);
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
    requireIncludes(pageContent, `href="${destinationPath(producer.destination)}"`, `Producer destination link ${producer.id}`);
    if ((categoryGroups.get(producer.category) || []).length >= MIN_CATEGORY_RECORDS) requireIncludes(pageContent, `href="${categoryPath(producer.category)}"`, `Producer category link ${producer.id}`);
    if ((regionGroups.get(`${producer.destination}::${producer.region}`) || []).length >= MIN_REGION_RECORDS) requireIncludes(pageContent, `href="${regionPath(producer.destination, producer.region)}"`, `Producer region link ${producer.id}`);
    if ((comboGroups.get(`${producer.destination}::${producer.category}`) || []).length >= MIN_DESTINATION_CATEGORY_RECORDS) requireIncludes(pageContent, `href="${comboPath(producer.destination, producer.category)}"`, `Producer destination/category link ${producer.id}`);
    if (!producer.description && !producer.story && !producer.tagLine) fail(`Producer ${producer.id} has no narrative source for an entity page.`);
    if (pageContent.includes(`<link rel="canonical" href="${CANONICAL_HOST}/?producer=`)) fail(`Producer page ${producer.id} canonicalizes to legacy query state.`);

    const jsonLd = parseJsonLd(pageContent, `Producer page ${producer.id}`);
    const graph = jsonLd['@graph'];
    if (!Array.isArray(graph)) fail(`Producer page ${producer.id} JSON-LD must contain an @graph.`);
    const webPage = graph.find((node) => typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@type'] === 'WebPage') as Record<string, unknown> | undefined;
    const entity = graph.find((node) => typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@id'] === `${canonicalUrl}#entity`) as Record<string, unknown> | undefined;
    if (!webPage || webPage.url !== canonicalUrl) fail(`Producer page ${producer.id} JSON-LD WebPage URL is missing or incorrect.`);
    if (!entity || entity.name !== producer.name) fail(`Producer page ${producer.id} JSON-LD entity identity is missing or incorrect.`);
    if (sitemapUrls.filter((url) => url === canonicalUrl).length !== 1) fail(`Producer ${producer.id} must appear exactly once in the sitemap.`);
    requireIncludes(producerDirectoryContent, `href="${producerPath(producer)}"`, `Producer directory link for ${producer.id}`);
  }

  verifyIndexPage('/destinations/', destinationGroups.size, [...destinationGroups.keys()].map(destinationPath), 'Destinations index');
  const eligibleCategories = [...categoryGroups.entries()].filter(([, producers]) => producers.length >= MIN_CATEGORY_RECORDS);
  verifyIndexPage('/categories/', eligibleCategories.length, eligibleCategories.map(([category]) => categoryPath(category)), 'Categories index');
  for (const [urlPath, count] of expectedLandingPaths) verifyLandingPage(urlPath, count, `Landing page ${urlPath}`);

  console.log('✓ SEO/AEO landing verification passed:');
  console.log(`  - ${PRODUCERS.length} canonical producer entities retain metadata, factual answers and JSON-LD`);
  console.log(`  - ${expectedLandingPaths.size + 2} country/destination/region/category/index pages verified`);
  console.log(`  - thin destination/category combinations remain withheld below ${MIN_DESTINATION_CATEGORY_RECORDS} records`);
  console.log('  - all producer pages link into applicable destination/category/region entities');
  console.log(`  - final sitemap contains exactly ${expectedSitemapUrls.length} canonical URLs with no duplicates or legacy producer-query URLs`);
  console.log(`  - robots.txt advertises ${CANONICAL_SITEMAP_URL}`);
  console.log('  - homepage/llms state, stale-claim bans and monetization quarantine remain enforced');
}

verifySeo();
