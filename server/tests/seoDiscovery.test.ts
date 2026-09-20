import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = path.resolve(process.cwd());

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');

test('SEO/AEO manifests publish live scope and canonical snapshot distinctly', () => {
  const llms = read('public/llms.txt');

  assert.match(llms, /\{\{LIVE_PRODUCER_COUNT\}\} producer\/project records/);
  assert.match(
    llms,
    /\{\{LIVE_DESTINATION_COUNT\}\} destinations in \{\{LIVE_COUNTRY_COUNT\}\} countries/
  );
  assert.match(
    llms,
    /Deterministic canonical SEO\/AEO producer snapshot — \{\{LIVE_PRODUCER_COUNT\}\} records, synchronized with the live catalogue\./
  );
  assert.match(llms, /\{\{LIVE_GEO_SCOPE_LINES\}\}/);
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


test('checked-in sitemap is only a stable seed; build generation owns live catalogue URLs', () => {
  const sitemap = read('public/sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  assert.equal(new Set(urls).size, urls.length);
  assert.deepEqual(urls, [
    'https://terroir-trail.web.app/',
    'https://terroir-trail.web.app/producers/',
  ]);
  assert.doesNotMatch(sitemap, /\?producer=/);
});
