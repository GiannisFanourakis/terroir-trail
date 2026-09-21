import fs from 'fs';
import path from 'path';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');

const fail = (message: string): never => {
  console.error(`[SEO Link Graph Verification Failed] ${message}`);
  process.exit(1);
};

const fileForUrl = (urlString: string): string => {
  const url = new URL(urlString);
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') return path.join(distDir, 'index.html');
  if (pathname.endsWith('/')) return path.join(distDir, pathname.replace(/^\/+|\/+$/g, ''), 'index.html');
  return path.join(distDir, pathname.replace(/^\/+/, ''));
};

const extractInternalLinks = (html: string, sourceUrl: string): string[] => {
  const links: string[] = [];
  const pattern = /<a\b[^>]*\bhref=(?:"([^"]+)"|'([^']+)')[^>]*>/gi;
  for (const match of html.matchAll(pattern)) {
    const href = match[1] || match[2];
    if (!href) continue;
    let resolved: URL;
    try { resolved = new URL(href, sourceUrl); } catch { continue; }
    if (resolved.origin !== CANONICAL_HOST) continue;
    links.push(`${CANONICAL_HOST}${resolved.pathname}`);
  }
  return [...new Set(links)];
};

const sitemapPath = path.join(distDir, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) fail('dist/sitemap.xml is missing.');
const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
if (sitemapUrls.length === 0) fail('No sitemap URLs were found.');
const sitemapSet = new Set(sitemapUrls);
const adjacency = new Map<string, string[]>();

for (const url of sitemapUrls) {
  const filePath = fileForUrl(url);
  if (!fs.existsSync(filePath)) fail(`Sitemapped URL has no built file: ${url}`);
  const html = fs.readFileSync(filePath, 'utf-8');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/>/i)?.[1];
  if (!canonical || canonical !== url) fail(`Canonical mismatch for ${url}: ${canonical || 'missing'}`);
  const links = extractInternalLinks(html, url);
  adjacency.set(url, links.filter((link) => sitemapSet.has(link)));
  for (const link of links) {
    const targetPath = new URL(link).pathname;
    if (/\.(?:png|jpe?g|webp|svg|ico|css|js|json|xml|txt|woff2?)$/i.test(targetPath)) continue;
    if (!fs.existsSync(fileForUrl(link))) fail(`Broken crawlable internal link from ${url}: ${link}`);
  }
}

const root = `${CANONICAL_HOST}/`;
const visited = new Set<string>();
const queue = [root];
while (queue.length) {
  const current = queue.shift()!;
  if (visited.has(current)) continue;
  visited.add(current);
  for (const next of adjacency.get(current) || []) if (!visited.has(next)) queue.push(next);
}
const orphans = sitemapUrls.filter((url) => !visited.has(url));
if (orphans.length) fail(`Orphaned sitemap URLs:\n${orphans.join('\n')}`);

const homepage = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
const fallbackStart = homepage.indexOf('data-seo-home-fallback="true"');
const noscriptStart = homepage.indexOf('<noscript>');
if (fallbackStart < 0 || (noscriptStart >= 0 && fallbackStart > noscriptStart)) fail('Homepage crawlable fallback must exist outside <noscript>.');
for (const href of ['/producers/', '/destinations/', '/categories/', '/methodology/', '/greece/crete/', '/greece/santorini/']) {
  if (!homepage.includes(`href="${href}"`)) fail(`Homepage fallback missing ${href}`);
}

console.log('SEO internal-link graph verification passed:');
console.log(`  - ${sitemapUrls.length} sitemap URLs have canonical built files`);
console.log('  - 0 orphaned sitemap URLs');
console.log('  - crawlable homepage discovery hub is outside <noscript>');
