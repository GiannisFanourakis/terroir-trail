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
    /Deterministic canonical\/offline producer snapshot — 62 records pending synchronization with the full live catalogue\./
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
