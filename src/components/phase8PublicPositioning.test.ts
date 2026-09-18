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
      expect(indexHtml).not.toContain('geo.placename" content="Heraklion, Crete, Greece');
      expect(indexHtml).not.toContain('geo.position" content="35.3387;25.1442');
      expect(indexHtml).not.toContain('ICBM" content="35.3387, 25.1442');
      expect(indexHtml).not.toContain('Heraklion, Crete, Greece');
      expect(indexHtml).not.toContain('name="ICBM"');
      expect(indexHtml).not.toContain('name="geo.region"');
    });

    it('keeps broad producer identity while reflecting the audited Crete and Santorini state', () => {
      const expectedDesc =
        'Independent producer and agritourism discovery guide. Explore audited producers across Crete and Santorini with clearly labeled visiting, location, imagery, and road-access status.';

      expect(indexHtml).toContain(`meta name="description" content="${expectedDesc}"`);
      expect(indexHtml).toContain(`meta property="og:description" content="${expectedDesc}"`);
      expect(indexHtml).toContain(`meta name="twitter:description" content="${expectedDesc}"`);

      expect(indexHtml).toContain('audited producers across Crete and Santorini');
      expect(indexHtml).toContain('clearly labeled visiting, location, imagery, and road-access status');

      // Does not imply all visiting and road access is verified for every producer
      expect(indexHtml).not.toContain('with source-backed visiting and access details');

      // Does not falsely claim Europe-wide coverage
      expect(indexHtml).not.toContain('Europe-wide');
      // Manifest does not claim 58+ across Europe
      expect(manifestJson).not.toContain('58+');
      expect(manifestJson).not.toContain('Tuscany');
    });

    it('aligns manifest.json and llms.txt with broad platform positioning', () => {
      const parsedManifest = JSON.parse(manifestJson);
      expect(parsedManifest.name).toBe('TerroirTrail — Independent Producer & Agritourism Guide');
      expect(parsedManifest.short_name).toBe('TerroirTrail');
      expect(parsedManifest.description).toContain(
        'verified independent wineries, craft breweries, olive mills, dairies, apiaries, traditional distilleries, and farms'
      );
      expect(parsedManifest.description).toContain(
        'clearly labeled visiting, location, and road-access status'
      );

      expect(llmsTxt).toContain('# TerroirTrail — Independent Producer & Agritourism Guide');
      expect(llmsTxt).toContain('62 producer/project records');
      expect(llmsTxt).toContain('Crete, Santorini, the Peloponnese, Macedonia, Greece');
      expect(llmsTxt).toContain('Tuscany / Italy');
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

  describe('2. Thirteen First-Class Categories in Public Taxonomy', () => {
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
        '<p>TerroirTrail supports 13 first-class producer categories: Wineries, Breweries, Olive Mills, Dairies / Cheesemakers, Apiaries / Honey Producers, Rakokazana / Traditional Distilleries, and Farms.</p>'
      );
    });

    it('represents all 13 categories in AboutFaqModal and metric counts', () => {
      expect(aboutFaqModal).toContain('TerroirTrail curates seven first-class producer categories');
      expect(aboutFaqModal).toContain(
        'Wineries, Breweries, Distilleries, Cideries, Olive Mills, Olive Oil Producers, Other Oil Mills, Dairies / Cheesemakers, Apiaries / Honey, Confectionery Producers, Herb Farms, Mushroom Farms, and Farms'
      );
      expect(aboutFaqModal).toContain('<Metric value="13" label="Producer categories" />');
      expect(aboutFaqModal).not.toContain('<Metric value="12" label="Producer categories" />');
    });
  });

  describe('3. Regional Coverage Presented Truthfully', () => {
    it('preserves the Crete producer directory within the combined reference catalogue', () => {
      expect(indexHtml).toContain('<h2>Verified Crete &amp; Santorini Producer Directory</h2>');
      expect(indexHtml).toContain('<h3>Crete — Chania</h3>');
      expect(indexHtml).toContain('<h3>Crete — Heraklion</h3>');
      expect(indexHtml).toContain('<h3>Crete — Rethymno</h3>');
      expect(indexHtml).toContain('<h3>Crete — Lasithi</h3>');
      expect(indexHtml).toContain('<h3>Santorini</h3>');

      // Indigenous grapes of Crete FAQ is kept as legitimate regional FAQ
      expect(indexHtml).toContain('What indigenous grape varieties can I discover in Crete?');
      expect(indexHtml).toContain('Vidiano, Vilana, Dafni, Plyto, and Melissaki');
    });

    it('keeps the About experience aligned with the current multi-region catalogue', () => {
      expect(aboutFaqModal).toContain('62 producer records');
      expect(aboutFaqModal).toContain('Crete, Santorini, the Peloponnese, Macedonia, Greece and Tuscany');
      expect(aboutFaqModal).toContain('Across Greece and into Italy');
      expect(aboutFaqModal).not.toContain('27 in Crete and 9 in Santorini');
      expect(aboutFaqModal).not.toContain('Greece first, then outward');
      expect(aboutFaqModal).not.toContain('reference-quality');
    });
  });

  describe('4. Trust & Conservative Visitability Model Preserved', () => {
    it('retains distinction between location and road access safety', () => {
      expect(indexHtml).toContain(
        'a map pin is not a guarantee of safe road access for standard rental vehicles'
      );
      expect(aboutFaqModal).toContain(
        'TerroirTrail treats location and road access as separate facts'
      );
      expect(aboutFaqModal).toContain(
        'when it is not, the site does not invent a road condition'
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

  describe('5. Build & Verification Script Alignment', () => {
    it('enforces current entity discovery and quarantines stale global claims', () => {
      expect(verifySeoScript).toContain("'36 producer/project records'");
      expect(verifySeoScript).toContain("'55 producer/project records'");
      expect(verifySeoScript).toContain("'Next regional programme: Peloponnese'");
      expect(verifySeoScript).toContain('TerroirTrail — Independent Producer &amp; Agritourism Guide');
      expect(verifySeoScript).toContain('geo.placename');
      expect(verifySeoScript).toContain("url.includes('?producer=')");
      expect(verifySeoScript).toContain('PRODUCER_DIRECTORY_URL');
      expect(verifySeoScript).toContain('CollectionPage');
      expect(verifySeoScript).toContain('What is known about road access?');
      expect(verifySeoScript).not.toContain('Explore verified wineries');
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