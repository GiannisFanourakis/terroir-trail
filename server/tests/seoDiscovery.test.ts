import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = path.resolve(process.cwd());

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');

test('SEO/AEO manifests publish live scope and canonical snapshot distinctly', () => {
  const llms = read('public/llms.txt');

  assert.match(llms, /148 producer\/project records/);
  assert.match(llms, /22 destinations in 8 countries/);
  assert.match(
    llms,
    /Deterministic canonical SEO\/AEO producer snapshot — 148 records, synchronized with the live catalogue\./
  );
  assert.match(llms, /## Search and answer-engine discovery/);
  assert.match(llms, /## Answer-engine interpretation rules/);
});

test('robots explicitly allows search and answer-engine crawlers', () => {
  const robots = read('public/robots.txt');

  for (const crawler of [
    'Googlebot',
    'Bingbot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'GPTBot',
    'PerplexityBot',
    'ClaudeBot',
    'Applebot-Extended',
    'Google-Extended',
  ]) {
    assert.match(robots, new RegExp(`User-agent: ${crawler}`));
  }

  assert.match(
    robots,
    /Sitemap: https:\/\/terroir-trail\.web\.app\/sitemap\.xml/
  );
  assert.match(robots, /https:\/\/terroir-trail\.web\.app\/llms\.txt/);
});

test('SEO landing generation uses a structural idempotent homepage marker', () => {
  const generator = read('scripts/generate_seo_landings.ts');

  assert.match(generator, /data-seo-landing-nav="true"/);
  assert.match(
    generator,
    /<h2>Audited Producer Directory — Homepage Excerpt<\/h2>/
  );
  assert.doesNotMatch(
    generator,
    /Browse the full audited producer directory\.<\/a><\/p>/
  );
});


test('checked-in sitemap covers the synchronized canonical catalogue', () => {
  const sitemap = read('public/sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  assert.equal(urls.length, 235);
  assert.equal(new Set(urls).size, 235);
  assert.ok(urls.includes('https://terroir-trail.web.app/producers/adega-de-borba-alentejo/'));
  assert.ok(urls.includes('https://terroir-trail.web.app/producers/tingvollost-more-og-romsdal/'));
  assert.ok(urls.includes('https://terroir-trail.web.app/france/provence/'));
  assert.ok(urls.includes('https://terroir-trail.web.app/norway/vestland/'));
  assert.ok(urls.includes('https://terroir-trail.web.app/slovenia/goriska/'));
  assert.ok(urls.includes('https://terroir-trail.web.app/producers/wineries/'));
});
