import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Phase 8 Public Positioning & SEO Synchronization', () => {
  const indexHtml = read('index.html');
  const manifestJson = read('public/manifest.json');
  const llmsTxt = read('public/llms.txt');
  const aboutFaqModal = read('src/components/About/AboutFaqModal.tsx');
  const verifySeoScript = read('scripts/verify_seo_assets.ts');

  describe('1. Global Homepage Positioning (Not Crete-Only)', () => {
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
      expect(indexHtml).not.toContain('geo.placename="Heraklion, Crete, Greece"');
      expect(indexHtml).not.toContain('Heraklion, Crete, Greece');
      expect(indexHtml).not.toContain('geo.position');
      expect(indexHtml).not.toContain('35.3387;25.1442');
      expect(indexHtml).not.toContain('35.3387, 25.1442');
      expect(indexHtml).not.toContain('name="ICBM"');
      expect(indexHtml).not.toContain('name="geo.region"');
    });

    it('uses truthful expansion-aware description without geographic fencing, overclaiming, or blanket verification claims', () => {
      const expectedDesc =
        'Independent producer and agritourism discovery guide. Explore independent wineries, craft breweries, artisanal olive mills, traditional dairies, apiaries, traditional distilleries, and farms, with transparent visiting and access status, including source-backed verification where available, starting in Greece.';

      expect(indexHtml).toContain(`meta name="description" content="${expectedDesc}"`);
      expect(indexHtml).toContain(`meta property="og:description" content="${expectedDesc}"`);
      expect(indexHtml).toContain(`meta name="twitter:description" content="${expectedDesc}"`);

      // Does not use blanket verification claims in global metadata or intro
      expect(indexHtml).not.toContain('Explore verified wineries');
      expect(indexHtml).not.toContain('connecting culinary travelers and road-trippers directly with verified wineries');
      expect(indexHtml).not.toContain('connecting travelers directly with verified wineries');

      // Does not falsely claim Europe-wide coverage
      expect(indexHtml).not.toContain('Europe-wide');
      // Manifest does not claim 58+ across Europe
      expect(manifestJson).not.toContain('58+');
      expect(manifestJson).not.toContain('Tuscany');
      expect(manifestJson).not.toContain('Discover verified independent');
    });

    it('aligns manifest.json and llms.txt with broad platform positioning', () => {
      const parsedManifest = JSON.parse(manifestJson);
      expect(parsedManifest.name).toBe('TerroirTrail — Independent Producer & Agritourism Guide');
      expect(parsedManifest.short_name).toBe('TerroirTrail');
      expect(parsedManifest.description).toContain('independent wineries, craft breweries, olive mills, dairies, apiaries, traditional distilleries, and farms');
      expect(parsedManifest.description).toContain('transparent visiting and access status');

      expect(llmsTxt).toContain('# TerroirTrail — Independent Producer & Agritourism Guide');
      expect(llmsTxt).toContain('starting in Greece and designed to expand across the Mediterranean and beyond');
    });
  });

  describe('2. Seven First-Class Categories in Public Taxonomy', () => {
    const requiredCategories = [
      'wineries',
      'craft breweries',
      'olive mills',
      'dairies',
      'apiaries',
      'traditional distilleries',
      'farms',
    ];

    it('represents all 7 categories in meta tags, JSON-LD, and noscript', () => {
      for (const cat of requiredCategories) {
        expect(indexHtml.toLowerCase()).toContain(cat);
      }

      // JSON-LD FAQ category question
      expect(indexHtml).toContain(
        'TerroirTrail curates seven first-class producer categories: Wineries, Breweries, Olive Mills, Dairies / Cheesemakers, Apiaries / Honey Producers, Rakokazana / Traditional Distilleries, and Farms.'
      );

      // Noscript FAQ category question
      expect(indexHtml).toContain(
        '<p>TerroirTrail curates seven first-class producer categories: Wineries, Breweries, Olive Mills, Dairies / Cheesemakers, Apiaries / Honey Producers, Rakokazana / Traditional Distilleries, and Farms.</p>'
      );
    });

    it('represents all 7 categories in AboutFaqModal and metric counts', () => {
      expect(aboutFaqModal).toContain('TerroirTrail curates seven first-class producer categories');
      expect(aboutFaqModal).toContain('Wineries, Breweries, Olive Mills, Dairies / Cheesemakers, Apiaries / Honey, Rakokazana / Traditional Distilleries, and Farms');
      expect(aboutFaqModal).toContain('<Metric value="7" label="Producer categories" />');
      expect(aboutFaqModal).not.toContain('<Metric value="6" label="Producer categories" />');
    });
  });

  describe('3. Regional Crete Content Retained Truthfully', () => {
    it('preserves Crete-specific producer directory and regional sections', () => {
      // Crete regional directory in noscript
      expect(indexHtml).toContain('<h2>Verified Crete Producer Directory</h2>');
      expect(indexHtml).toContain('<h3>Chania</h3>');
      expect(indexHtml).toContain('<h3>Heraklion</h3>');
      expect(indexHtml).toContain('<h3>Rethymno</h3>');
      expect(indexHtml).toContain('<h3>Lasithi</h3>');

      // Indigenous grapes of Crete FAQ is kept as legitimate regional FAQ
      expect(indexHtml).toContain('What indigenous grape varieties can I discover in Crete?');
      expect(indexHtml).toContain('Vidiano, Vilana, Dafni, Plyto, and Melissaki');
    });

    it('retains Crete as inaugural reference catalogue in offers and about text', () => {
      expect(indexHtml).toContain('with Crete as the inaugural reference catalogue');
      expect(aboutFaqModal).toContain('Crete is the current reference-quality catalogue, with 27 audited records');
      expect(aboutFaqModal).toContain('Greece first, then outward');
    });
  });

  describe('4. Trust & Conservative Visitability Model Preserved', () => {
    it('retains distinction between location and road access safety', () => {
      expect(indexHtml).toContain('a map pin is not a guarantee of safe road access for standard rental vehicles');
      expect(aboutFaqModal).toContain('Exact location confidence and road-access confidence are separate');
      expect(aboutFaqModal).toContain('Current-access uncertainty is shown rather than replaced with a guess');
    });

    it('preserves direct-to-producer and 0% commission positioning', () => {
      expect(indexHtml).toContain('Does TerroirTrail handle bookings or charge commissions?');
      expect(indexHtml).toContain('TerroirTrail is a discovery-first guide and does not charge booking fees or commissions');
      expect(indexHtml).toContain('Travelers connect directly with producers via verified producer-controlled contact channels');
    });
  });

  describe('5. Build & Verification Script Alignment', () => {
    it('bans stale Crete-only global titles, blanket verification claims, and Heraklion geo tags in verify_seo_assets.ts', () => {
      expect(verifySeoScript).toContain('Curated Crete Agritourism & Local Producer Guide');
      expect(verifySeoScript).toContain('Curated Agritourism & Local Producer Discovery Guide');
      expect(verifySeoScript).toContain('TerroirTrail — Independent Producer &amp; Agritourism Guide');
      expect(verifySeoScript).toContain('Explore verified wineries');
      expect(verifySeoScript).toContain('Discover verified independent');
      expect(verifySeoScript).toContain('geo.placename');
      expect(verifySeoScript).toContain('Heraklion, Crete, Greece');
    });

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
