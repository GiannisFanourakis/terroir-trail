import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { CRETAN_PRODUCERS } from '../src/data/producers';
import { SANTORINI_PRODUCERS } from '../src/data/santoriniProducers';
import { PHASE10B_PRODUCERS } from '../src/data/phase10bProducers';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');
const MIN_CATEGORY_RECORDS = 2;
const MIN_REGION_RECORDS = 2;
const MIN_DESTINATION_CATEGORY_RECORDS = 3;

const PRODUCERS: Producer[] = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
];

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
  northern_greece: { slug: 'northern-greece', countrySlug: 'greece', label: 'Northern Greece' },
  tuscany: { slug: 'tuscany', countrySlug: 'italy', label: 'Tuscany' },
};

const fail = (message: string): never => {
  console.error(`[SEO Landing Verification Failed] ${message}`);
  process.exit(1);
};
const requireFile = (filePath: string, label: string): string => {
  if (!fs.existsSync(filePath)) fail(`${label} is missing at ${filePath}.`);
  return fs.readFileSync(filePath, 'utf-8');
};
const requireIncludes = (content: string, value: string, label: string): void => {
  if (!content.includes(value)) fail(`${label} is missing required value: ${value}`);
};
const slugify = (value: string): string =>
  value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const producerPath = (producer: Producer): string => `/producers/${producer.id}/`;
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
  const graph = jsonLd['@graph'];
  if (!Array.isArray(graph)) fail(`${label} JSON-LD must contain an @graph.`);
  const collection = graph.find((node) => typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@type'] === 'CollectionPage') as Record<string, unknown> | undefined;
  if (!collection || collection.url !== canonicalUrl) fail(`${label} JSON-LD CollectionPage URL is incorrect.`);
  const mainEntity = collection.mainEntity as Record<string, unknown> | undefined;
  if (!mainEntity || mainEntity.numberOfItems !== expectedCount) fail(`${label} JSON-LD ItemList count is incorrect.`);
};

function verifySeoLandings(): void {
  if (!fs.existsSync(distDir)) fail(`dist directory does not exist at ${distDir}. Run build first.`);

  const destinationGroups = groupBy(PRODUCERS, (producer) => producer.destination);
  const categoryGroups = groupBy(PRODUCERS, (producer) => producer.category);
  const regionGroups = groupBy(PRODUCERS, (producer) => `${producer.destination}::${producer.region}`);
  const comboGroups = groupBy(PRODUCERS, (producer) => `${producer.destination}::${producer.category}`);
  const countryGroups = groupBy(PRODUCERS, (producer) => destinationConfig[producer.destination].countrySlug);

  const expectedLandingPaths = new Map<string, number>();
  expectedLandingPaths.set('/destinations/', destinationGroups.size);
  expectedLandingPaths.set('/categories/', [...categoryGroups.values()].filter((producers) => producers.length >= MIN_CATEGORY_RECORDS).length);
  for (const [countrySlug, producers] of countryGroups) expectedLandingPaths.set(`/${countrySlug}/`, producers.length);
  for (const [destination, producers] of destinationGroups) expectedLandingPaths.set(destinationPath(destination), producers.length);
  for (const [category, producers] of categoryGroups) {
    if (producers.length >= MIN_CATEGORY_RECORDS) expectedLandingPaths.set(categoryPath(category), producers.length);
  }
  for (const [key, producers] of regionGroups) {
    const [destination, region] = key.split('::') as [Producer['destination'], string];
    if (producers.length >= MIN_REGION_RECORDS) expectedLandingPaths.set(regionPath(destination, region), producers.length);
  }
  for (const [key, producers] of comboGroups) {
    const [destination, category] = key.split('::') as [Producer['destination'], Producer['category']];
    if (producers.length >= MIN_DESTINATION_CATEGORY_RECORDS) expectedLandingPaths.set(comboPath(destination, category), producers.length);
    else if (fs.existsSync(fileForUrlPath(comboPath(destination, category)))) fail(`Thin destination/category page was generated despite having only ${producers.length} records: ${comboPath(destination, category)}`);
  }

  const destinationsIndex = requireFile(fileForUrlPath('/destinations/'), 'Destinations index');
  requireIncludes(destinationsIndex, '<link rel="canonical" href="https://terroir-trail.web.app/destinations/" />', 'Destinations index');
  requireIncludes(destinationsIndex, 'keyword permutations', 'Destinations index');
  for (const destination of destinationGroups.keys()) requireIncludes(destinationsIndex, `href="${destinationPath(destination)}"`, `Destination index link for ${destination}`);

  const categoriesIndex = requireFile(fileForUrlPath('/categories/'), 'Categories index');
  requireIncludes(categoriesIndex, '<link rel="canonical" href="https://terroir-trail.web.app/categories/" />', 'Categories index');
  for (const [category, producers] of categoryGroups) {
    if (producers.length >= MIN_CATEGORY_RECORDS) requireIncludes(categoriesIndex, `href="${categoryPath(category)}"`, `Category index link for ${category}`);
  }

  for (const [urlPath, count] of expectedLandingPaths) {
    if (urlPath === '/destinations/' || urlPath === '/categories/') continue;
    verifyLandingPage(urlPath, count, `Landing page ${urlPath}`);
  }

  const producerDirectory = requireFile(path.join(distDir, 'producers', 'index.html'), 'Producer directory');
  requireIncludes(producerDirectory, 'href="/destinations/"', 'Producer directory');
  requireIncludes(producerDirectory, 'href="/categories/"', 'Producer directory');
  requireIncludes(producerDirectory, 'href="/greece/"', 'Producer directory');
  requireIncludes(producerDirectory, 'href="/italy/"', 'Producer directory');

  const homepage = requireFile(path.join(distDir, 'index.html'), 'Homepage');
  requireIncludes(homepage, 'href="/destinations/"', 'Homepage');
  requireIncludes(homepage, 'href="/categories/"', 'Homepage');

  for (const producer of PRODUCERS) {
    const pageContent = requireFile(path.join(distDir, 'producers', producer.id, 'index.html'), `Producer page ${producer.id}`);
    requireIncludes(pageContent, `href="${destinationPath(producer.destination)}"`, `Producer destination link ${producer.id}`);
    if ((categoryGroups.get(producer.category) || []).length >= MIN_CATEGORY_RECORDS) requireIncludes(pageContent, `href="${categoryPath(producer.category)}"`, `Producer category link ${producer.id}`);
    if ((regionGroups.get(`${producer.destination}::${producer.region}`) || []).length >= MIN_REGION_RECORDS) requireIncludes(pageContent, `href="${regionPath(producer.destination, producer.region)}"`, `Producer region link ${producer.id}`);
    if ((comboGroups.get(`${producer.destination}::${producer.category}`) || []).length >= MIN_DESTINATION_CATEGORY_RECORDS) requireIncludes(pageContent, `href="${comboPath(producer.destination, producer.category)}"`, `Producer destination/category link ${producer.id}`);
  }

  const sitemapContent = requireFile(path.join(distDir, 'sitemap.xml'), 'Sitemap');
  const sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
  if (new Set(sitemapUrls).size !== sitemapUrls.length) fail('Sitemap contains duplicate URLs after Phase 12B generation.');
  const baseUrls = [`${CANONICAL_HOST}/`, `${CANONICAL_HOST}/privacy.html`, `${CANONICAL_HOST}/producers/`, ...PRODUCERS.map((producer) => `${CANONICAL_HOST}${producerPath(producer)}`)];
  const landingUrls = [...expectedLandingPaths.keys()].map((urlPath) => `${CANONICAL_HOST}${urlPath}`);
  const expectedSitemapUrls = [...baseUrls, ...landingUrls];
  if (sitemapUrls.length !== expectedSitemapUrls.length) fail(`Sitemap has ${sitemapUrls.length} URLs; expected ${expectedSitemapUrls.length} after Phase 12B.`);
  for (const url of expectedSitemapUrls) if (!sitemapUrls.includes(url)) fail(`Sitemap is missing Phase 12B URL: ${url}`);

  console.log('✓ Phase 12B SEO/AEO verification passed:');
  console.log(`  - ${expectedLandingPaths.size} destination/category/region/country landing URLs + indexes verified`);
  console.log(`  - thin destination/category combinations remain withheld below ${MIN_DESTINATION_CATEGORY_RECORDS} records`);
  console.log(`  - all ${PRODUCERS.length} producer pages link into applicable destination/category/region entities`);
  console.log(`  - final sitemap contains exactly ${expectedSitemapUrls.length} canonical URLs with no duplicates`);
  console.log('  - homepage and producer directory expose ordinary crawlable links into the landing-page architecture');
}

verifySeoLandings();
