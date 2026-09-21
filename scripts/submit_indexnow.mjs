import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://terroir-trail.web.app';
const HOST = 'terroir-trail.web.app';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const priorityPaths = [
  '/',
  '/producers/',
  '/destinations/',
  '/categories/',
  '/methodology/',
  '/greece/crete/',
  '/greece/santorini/',
  '/italy/tuscany/',
  '/greece/crete/wineries/',
  '/greece/crete/olive-mills/',
  '/greece/crete/dairies-cheesemakers/',
  '/greece/crete/apiaries-honey-producers/',
  '/greece/santorini/wineries/',
  '/italy/tuscany/wineries/',
];

function findKey() {
  const publicDir = path.resolve('public');
  const candidates = fs
    .readdirSync(publicDir)
    .filter((name) => /^[a-f0-9]{32}\.txt$/i.test(name));

  for (const name of candidates) {
    const key = name.slice(0, -4);
    const contents = fs.readFileSync(path.join(publicDir, name), 'utf8').trim();
    if (contents === key) return key;
  }

  throw new Error('No valid root IndexNow verification key file was found in public/.');
}

function assertPriorityUrlsAreCanonical(urls) {
  const sitemapPath = path.resolve('dist/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('dist/sitemap.xml is required before IndexNow submission.');
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const url of urls) {
    if (!sitemap.includes(`<loc>${url}</loc>`)) {
      throw new Error(`Priority IndexNow URL is not present in the production sitemap: ${url}`);
    }
  }
}

const key = findKey();
const urls = priorityPaths.map((pathname) => `${ORIGIN}${pathname === '/' ? '/' : pathname}`);
assertPriorityUrlsAreCanonical(urls);

const payload = {
  host: HOST,
  key,
  keyLocation: `${ORIGIN}/${key}.txt`,
  urlList: urls,
};

const response = await globalThis.fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'content-type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify(payload),
});

const body = await response.text();
globalThis.console.log(`IndexNow response: HTTP ${response.status}`);
if (body) globalThis.console.log(body);
globalThis.console.log(`IndexNow submitted ${urls.length} priority URLs.`);
globalThis.console.log(`Key location: ${payload.keyLocation}`);

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow submission failed with HTTP ${response.status}.`);
}
