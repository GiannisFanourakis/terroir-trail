import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { CATALOGUE_SUMMARY } from '../data/catalogueSummary.generated';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Public Positioning & SEO Synchronization', () => {
  const indexHtml = read('index.html');
  const manifestJson = read('public/manifest.json');
  const llmsTxt = read('public/llms.txt');
  const aboutFaqModal = read('src/components/About/AboutFaqModal.tsx');

  describe('Global Homepage Positioning', () => {
    it('sets the preferred broad title on homepage and social cards', () => {
      expect(indexHtml).toContain(
        '<title>TerroirTrail — Independent Producer &amp; Agritourism Guide</title>'
      );
      expect(indexHtml).toContain(
        '<meta property="og:title" content="TerroirTrail — Independent Producer &amp; Agritourism Guide" />'
      );
      expect(indexHtml).toContain(
        '<meta name="twitter:title" content="TerroirTrail — Independent Producer &amp; Agritourism Guide" />'
      );
      expect(indexHtml).not.toContain('Curated Crete Agritourism');
      expect(indexHtml).not.toContain('Curated Agritourism & Local Producer Discovery Guide');
    });

    it('removes Crete/Heraklion geo targeting tags from global homepage', () => {
      expect(indexHtml).not.toContain('geo.placename" content="Heraklion, Crete, Greece');
      expect(indexHtml).not.toContain('geo.position" content="35.3387;25.1442');
      expect(indexHtml).not.toContain('ICBM" content="35.3387, 25.1442');
      expect(indexHtml).not.toContain('Heraklion, Crete, Greece');
      expect(indexHtml).not.toContain('name="ICBM"');
      expect(indexHtml).not.toContain('name="geo.region"');
    });


    it('aligns manifest.json and llms.txt with broad platform positioning', () => {
      const parsedManifest = JSON.parse(manifestJson);
      expect(parsedManifest.name).toBe('TerroirTrail — Independent Producer & Agritourism Guide');
      expect(parsedManifest.short_name).toBe('TerroirTrail');
      expect(parsedManifest.description).toContain(
        'independent wineries, breweries, cideries, distilleries, olive and other oil producers, dairies, apiaries, farms'
      );
      expect(parsedManifest.description).toContain(
        'clearly labeled visiting, location and road-access status'
      );

      expect(llmsTxt).toContain('# TerroirTrail — Independent Producer & Agritourism Guide');
      expect(llmsTxt).toContain('/producers/<producer-id>/');
      expect(llmsTxt).toContain('SEO, AEO and entity-discovery foundation');
      expect(llmsTxt).toContain(
        'Greek cheese and dairy expansion is now included in the audited catalogue'
      );
      expect(llmsTxt).not.toContain(
        'Greek cheese and dairy is the next planned catalogue expansion'
      );
      expect(llmsTxt).not.toContain('Next regional programme: Peloponnese');
    });
  });

  describe('Thirteen First-Class Categories in Public Taxonomy', () => {
    const requiredCategories = [
      'wineries',
      'craft breweries',
      'distilleries',
      'cideries',
      'olive mills',
      'olive oil producers',
      'oil mills',
      'dairies',
      'apiaries',
      'confectionery',
      'herb farms',
      'mushroom farms',
      'farms',
    ];

    it('represents all 13 categories in meta tags, JSON-LD, and noscript', () => {
      for (const cat of requiredCategories) {
        expect(indexHtml.toLowerCase()).toContain(cat);
      }

      // JSON-LD FAQ category question
      expect(indexHtml).toContain(
        'TerroirTrail supports 13 first-class producer categories: Wineries, Breweries, Distilleries, Cideries, Olive Mills, Olive Oil Producers, Other Oil Mills, Dairies / Cheesemakers, Apiaries / Honey Producers, Confectionery Producers, Herb Farms, Mushroom Farms, and Farms.'
      );

      // Noscript FAQ category question
      expect(indexHtml).toContain(
        '<p>TerroirTrail supports 13 first-class producer categories: Wineries, Breweries, Distilleries, Cideries, Olive Mills, Olive Oil Producers, Other Oil Mills, Dairies / Cheesemakers, Apiaries / Honey Producers, Confectionery Producers, Herb Farms, Mushroom Farms, and Farms.</p>'
      );
    });

    it('drives About/FAQ category scope from the generated active catalogue summary', () => {
      expect(CATALOGUE_SUMMARY.categories).toBe(13);
      expect(CATALOGUE_SUMMARY.categoryNames).toHaveLength(CATALOGUE_SUMMARY.categories);
      expect(aboutFaqModal).toContain('CATALOGUE_SUMMARY.categories');
      expect(aboutFaqModal).toContain('CATEGORY_SCOPE_TEXT');
      expect(aboutFaqModal).toContain('label="Producer categories"');
      expect(aboutFaqModal).not.toContain('<Metric value="13" label="Producer categories" />');
    });
  });

  describe('Trust & Conservative Visitability Model Preserved', () => {
    it('retains distinction between location and road access safety', () => {
      expect(indexHtml).toContain(
        'a map pin is not a guarantee of safe road access for standard rental vehicles'
      );
      expect(aboutFaqModal).toContain(
        'TerroirTrail treats location and road access as separate facts'
      );
      expect(aboutFaqModal).toContain(
        'the platform fails closed and does not invent a positive road condition'
      );
    });

    it('preserves direct-to-producer and 0% commission positioning', () => {
      expect(indexHtml).toContain('Does TerroirTrail handle bookings or charge commissions?');
      expect(indexHtml).toContain(
        'TerroirTrail is a discovery-first guide and does not charge booking fees or commissions'
      );
      expect(indexHtml).toContain(
        'Travelers connect directly with producers via verified producer-controlled contact channels'
      );
    });
  });

  describe('Build & Verification Script Alignment', () => {

    it('preserves valid sitemap and robots configuration', () => {
      expect(existsSync('public/sitemap.xml')).toBe(true);
      const sitemap = read('public/sitemap.xml');
      expect(sitemap).toContain('https://terroir-trail.web.app/');
      expect(sitemap).toContain('https://terroir-trail.web.app/privacy.html');

      expect(existsSync('public/robots.txt')).toBe(true);
      const robots = read('public/robots.txt');
      expect(robots).toContain('Sitemap: https://terroir-trail.web.app/sitemap.xml');
    });
  });
});