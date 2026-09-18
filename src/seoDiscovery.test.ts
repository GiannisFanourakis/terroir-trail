import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(process.cwd());

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');

describe('SEO/AEO discovery contract', () => {
  it('publishes the current live catalogue scope while distinguishing the canonical snapshot', () => {
    const llms = read('public/llms.txt');

    expect(llms).toContain('148 producer/project records');
    expect(llms).toContain('22 destinations in 8 countries');
    expect(llms).toContain(
      'Deterministic canonical/offline producer snapshot — 62 records pending synchronization with the full live catalogue.'
    );
    expect(llms).toContain('## Search and answer-engine discovery');
    expect(llms).toContain('## Answer-engine interpretation rules');
  });

  it('keeps search and answer-engine crawlers explicitly allowed', () => {
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
      expect(robots).toContain(`User-agent: ${crawler}`);
    }

    expect(robots).toContain(
      'Sitemap: https://terroir-trail.web.app/sitemap.xml'
    );
    expect(robots).toContain('https://terroir-trail.web.app/llms.txt');
  });

  it('uses a structural, idempotent homepage marker for SEO landing navigation', () => {
    const generator = read('scripts/generate_seo_landings.ts');

    expect(generator).toContain('data-seo-landing-nav="true"');
    expect(generator).toContain(
      '<h2>Audited Producer Directory — Homepage Excerpt</h2>'
    );
    expect(generator).not.toContain(
      'Browse the full audited producer directory.</a></p>'
    );
  });
});
