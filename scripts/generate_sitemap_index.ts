import fs from 'fs';
import path from 'path';
import { SEO_PRODUCERS } from './seoCatalogue';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');
const sourceSitemapPath = path.join(distDir, 'sitemap.xml');

const childSitemaps = [
  'sitemap-core.xml',
  'sitemap-producers.xml',
  'sitemap-destinations.xml',
  'sitemap-categories.xml',
] as const;

const categorySlugs = new Set([
  'wineries',
  'breweries',
  'distilleries',
  'cideries',
  'olive-mills',
  'olive-oil-producers',
  'oil-mills',
  'dairies-cheesemakers',
  'apiaries-honey-producers',
  'confectionery-producers',
  'herb-farms',
  'mushroom-farms',
  'farms',
]);

const corePaths = new Set([
  '/',
  '/privacy.html',
  '/methodology/',
  '/producers/',
  '/destinations/',
  '/categories/',
]);

const producerUrls = new Set(
  SEO_PRODUCERS.map((producer) => `${CANONICAL_HOST}/producers/${producer.id}/`),
);

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const renderUrlSet = (urls: string[]): string => {
  const entries = urls
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

const renderIndex = (): string => {
  const entries = childSitemaps
    .map(
      (fileName) =>
        `  <sitemap>\n    <loc>${CANONICAL_HOST}/${fileName}</loc>\n  </sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
};

const readCanonicalUrls = (): string[] => {
  if (!fs.existsSync(sourceSitemapPath)) {
    throw new Error('dist/sitemap.xml is missing. Run the SEO landing generation first.');
  }
  const source = fs.readFileSync(sourceSitemapPath, 'utf-8');
  const urls = [...source.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
    match[1].trim(),
  );
  if (urls.length === 0) throw new Error('dist/sitemap.xml contains no URLs.');
  if (new Set(urls).size !== urls.length) {
    throw new Error('dist/sitemap.xml contains duplicate URLs.');
  }
  return urls;
};

function generateSitemapIndex(): void {
  const urls = readCanonicalUrls();
  const groups = {
    core: [] as string[],
    producers: [] as string[],
    destinations: [] as string[],
    categories: [] as string[],
  };

  for (const url of urls) {
    if (!url.startsWith(`${CANONICAL_HOST}/`)) {
      throw new Error(`Unexpected sitemap host: ${url}`);
    }

    const pathname = new URL(url).pathname;
    if (corePaths.has(pathname)) {
      groups.core.push(url);
      continue;
    }
    if (producerUrls.has(url)) {
      groups.producers.push(url);
      continue;
    }

    const segments = pathname.split('/').filter(Boolean);
    const finalSegment = segments.at(-1);
    if (finalSegment && categorySlugs.has(finalSegment)) {
      groups.categories.push(url);
    } else {
      groups.destinations.push(url);
    }
  }

  const partitioned = [
    ...groups.core,
    ...groups.producers,
    ...groups.destinations,
    ...groups.categories,
  ];
  if (partitioned.length !== urls.length || new Set(partitioned).size !== urls.length) {
    throw new Error(
      `Split sitemap partition mismatch: ${partitioned.length} partitioned / ${urls.length} canonical URLs.`,
    );
  }
  for (const url of urls) {
    if (!partitioned.includes(url)) throw new Error(`Split sitemaps missed URL: ${url}`);
  }
  if (groups.producers.length !== SEO_PRODUCERS.length) {
    throw new Error(
      `Producer sitemap has ${groups.producers.length} URLs; expected ${SEO_PRODUCERS.length}.`,
    );
  }

  fs.writeFileSync(path.join(distDir, childSitemaps[0]), renderUrlSet(groups.core), 'utf-8');
  fs.writeFileSync(path.join(distDir, childSitemaps[1]), renderUrlSet(groups.producers), 'utf-8');
  fs.writeFileSync(path.join(distDir, childSitemaps[2]), renderUrlSet(groups.destinations), 'utf-8');
  fs.writeFileSync(path.join(distDir, childSitemaps[3]), renderUrlSet(groups.categories), 'utf-8');
  fs.writeFileSync(path.join(distDir, 'sitemap-index.xml'), renderIndex(), 'utf-8');

  console.log(
    `Sitemap index generated: ${urls.length} canonical URLs -> core ${groups.core.length}, producers ${groups.producers.length}, destinations ${groups.destinations.length}, categories ${groups.categories.length}.`,
  );
}

generateSitemapIndex();
