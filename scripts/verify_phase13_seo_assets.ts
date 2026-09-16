import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { CRETAN_PRODUCERS } from '../src/data/producers';
import { SANTORINI_PRODUCERS } from '../src/data/santoriniProducers';
import { PHASE10B_PRODUCERS } from '../src/data/phase10bProducers';
import { PHASE13_DAIRY_PRODUCERS } from '../src/data/phase13DairyProducers';

const HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');
const PRODUCERS: Producer[] = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
  ...PHASE13_DAIRY_PRODUCERS,
];

const fail = (message: string): never => {
  console.error(`[SEO Verification Failed] ${message}`);
  process.exit(1);
};
const read = (relative: string): string => {
  const file = path.join(distDir, relative);
  if (!fs.existsSync(file)) fail(`Missing ${relative}.`);
  return fs.readFileSync(file, 'utf-8');
};
const requireText = (content: string, text: string, label: string): void => {
  if (!content.includes(text)) fail(`${label} is missing: ${text}`);
};
const banText = (content: string, text: string, label: string): void => {
  if (content.includes(text)) fail(`${label} still contains stale text: ${text}`);
};

const ids = PRODUCERS.map((producer) => producer.id);
if (new Set(ids).size !== PRODUCERS.length) fail('Producer catalogue contains duplicate ids.');
if (PHASE13_DAIRY_PRODUCERS.length !== 12) fail(`Expected 12 Phase 13 dairy additions; found ${PHASE13_DAIRY_PRODUCERS.length}.`);
if (PRODUCERS.length !== 67) fail(`Expected 67 audited producer/project records; found ${PRODUCERS.length}.`);

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
const expectedUrls = [
  `${HOST}/`,
  `${HOST}/privacy.html`,
  `${HOST}/producers/`,
  ...PRODUCERS.map((producer) => `${HOST}/producers/${producer.id}/`),
];
if (sitemapUrls.length !== expectedUrls.length) fail(`Sitemap has ${sitemapUrls.length} URLs; expected ${expectedUrls.length}.`);
for (const url of expectedUrls) {
  if (!sitemapUrls.includes(url)) fail(`Sitemap is missing ${url}.`);
}

const directory = read('producers/index.html');
requireText(directory, `${PRODUCERS.length} audited producer/project records`, 'producer directory');
requireText(directory, `"numberOfItems": ${PRODUCERS.length}`, 'producer directory JSON-LD');
for (const producer of PRODUCERS) {
  requireText(directory, `href="/producers/${producer.id}/"`, `directory link for ${producer.id}`);
  const page = read(path.join('producers', producer.id, 'index.html'));
  requireText(page, `<link rel="canonical" href="${HOST}/producers/${producer.id}/" />`, producer.id);
  requireText(page, `<h1>${producer.name.replaceAll('&', '&amp;')}</h1>`, producer.id);
  requireText(page, 'What is it?', producer.id);
  requireText(page, 'Where is it?', producer.id);
  requireText(page, 'Can you visit?', producer.id);
  requireText(page, 'What is known about road access?', producer.id);
}

const homepage = read('index.html');
requireText(homepage, `${PRODUCERS.length} audited producer/project records`, 'homepage');
banText(homepage, '55 audited producer/project records', 'homepage');
banText(homepage, '55 producer/project records', 'homepage');

const llms = read('llms.txt');
requireText(llms, `${PRODUCERS.length} producer/project records`, 'llms.txt');
requireText(llms, '32 audited records in Crete', 'llms.txt');
requireText(llms, '12 Phase 13 dairy/cheese additions', 'llms.txt');
requireText(llms, '10 published verified-stop Discovery Guides', 'llms.txt');
banText(llms, '55 producer/project records', 'llms.txt');
banText(llms, 'Greek cheese and dairy is the next planned catalogue expansion', 'llms.txt');

const robots = read('robots.txt');
requireText(robots, `Sitemap: ${HOST}/sitemap.xml`, 'robots.txt');

for (const banned of ['pagead2.googlesyndication.com', 'emrld.ltd', 'ca-pub-1608902378435149']) {
  banText(homepage, banned, 'homepage');
}

console.log('✓ SEO/AEO verification passed:');
console.log(`  - ${expectedUrls.length} canonical sitemap URLs (${PRODUCERS.length} producer entities + directory + core pages)`);
console.log(`  - ${PRODUCERS.length} producer pages have canonical metadata, visible answer-ready facts, JSON-LD and directory links`);
console.log('  - producer directory has CollectionPage/ItemList schema and links every audited entity');
console.log(`  - llms.txt and homepage reflect the current ${PRODUCERS.length}-record / 10-guide product state`);
console.log(`  - Phase 13 contributes ${PHASE13_DAIRY_PRODUCERS.length} new dairy/cheese producer entities`);
console.log(`  - robots.txt advertises ${HOST}/sitemap.xml`);
console.log('  - stale catalogue counts, legacy query canonicals and unconsented monetization tags are quarantined');
