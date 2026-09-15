import fs from 'fs';
import path from 'path';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const CANONICAL_SITEMAP_URL = `${CANONICAL_HOST}/sitemap.xml`;

function verifySeoAssets(): void {
  const distDir = path.resolve(process.cwd(), 'dist');

  // 1. Verify dist directory exists
  if (!fs.existsSync(distDir)) {
    console.error(`[SEO Verification Failed] dist directory does not exist at ${distDir}. Run build first.`);
    process.exit(1);
  }

  // 2. Verify dist/sitemap.xml exists
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error(`[SEO Verification Failed] dist/sitemap.xml is missing.`);
    process.exit(1);
  }

  // 3. Verify dist/robots.txt exists
  const robotsPath = path.join(distDir, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    console.error(`[SEO Verification Failed] dist/robots.txt is missing.`);
    process.exit(1);
  }

  // 4. Verify sitemap.xml format, XML structure, and canonical host
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8').trim();

  if (!sitemapContent.startsWith('<?xml') || !sitemapContent.includes('<urlset') || !sitemapContent.endsWith('</urlset>')) {
    console.error('[SEO Verification Failed] dist/sitemap.xml is not valid XML or missing <urlset> root.');
    process.exit(1);
  }

  if (!sitemapContent.includes(CANONICAL_HOST)) {
    console.error(`[SEO Verification Failed] dist/sitemap.xml does not contain canonical host ${CANONICAL_HOST}.`);
    process.exit(1);
  }

  const locMatches = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)];
  if (locMatches.length === 0) {
    console.error('[SEO Verification Failed] dist/sitemap.xml does not contain any <loc> entries.');
    process.exit(1);
  }

  for (const match of locMatches) {
    const locUrl = match[1].trim();
    if (!locUrl.startsWith(`${CANONICAL_HOST}/`)) {
      console.error(`[SEO Verification Failed] Sitemapped URL "${locUrl}" does not match canonical host ${CANONICAL_HOST}.`);
      process.exit(1);
    }
  }

  // 5. Verify robots.txt references canonical sitemap URL
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  const sitemapDirectivePattern = new RegExp(`^Sitemap:\\s*${CANONICAL_SITEMAP_URL.replace(/\./g, '\\.')}\\s*$`, 'm');

  if (!sitemapDirectivePattern.test(robotsContent)) {
    console.error(`[SEO Verification Failed] dist/robots.txt does not advertise Sitemap: ${CANONICAL_SITEMAP_URL}`);
    process.exit(1);
  }

  // 6. Verify the public machine-readable product-state file is current.
  const llmsPath = path.join(distDir, 'llms.txt');
  if (!fs.existsSync(llmsPath)) {
    console.error('[SEO Verification Failed] dist/llms.txt is missing.');
    process.exit(1);
  }

  const llmsContent = fs.readFileSync(llmsPath, 'utf-8');
  const requiredLlmsClaims = [
    '36 producer/project records',
    'Crete, Greece — 27 audited records.',
    'Santorini, Greece — 9 audited records.',
    'three published verified-stop Discovery Guides',
    'does not represent Santorini as a UNESCO Global Geopark',
    'Next regional programme: Peloponnese',
  ];

  for (const claim of requiredLlmsClaims) {
    if (!llmsContent.includes(claim)) {
      console.error(`[SEO Verification Failed] dist/llms.txt is missing current product-state claim: ${claim}`);
      process.exit(1);
    }
  }

  const staleLlmsClaims = [
    'Current reference region: Crete, Greece.',
    'Future expansion may include Santorini',
    '58+ verified producers',
    '6 turn-by-turn',
    'Santorini Complete Volcanic Caldera & Donkey Beer Trail',
  ];

  for (const claim of staleLlmsClaims) {
    if (llmsContent.includes(claim)) {
      console.error(`[SEO Verification Failed] dist/llms.txt still contains stale product-state claim: ${claim}`);
      process.exit(1);
    }
  }

  // 7. Verify dist/index.html canonical link and absence of stale/publicly quarantined claims
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const canonicalExpected = `<link rel="canonical" href="${CANONICAL_HOST}/" />`;
    if (!indexContent.includes(canonicalExpected)) {
      console.error(`[SEO Verification Failed] dist/index.html is missing expected canonical link: ${canonicalExpected}`);
      process.exit(1);
    }

    const bannedClaims = [
      '58 featured independent',
      'Curated Crete Rural Discovery Loops',
      'Heraklion Peza & Archanes Wine Loop',
      'Chania Mountain & Artisan Olive Oil Circuit',
      'Rethymno Foothills & Heritage Circuit',
      'Lasithi & Sitia Monastic Terroir Route',
      'and self-guided rural discovery routes.',
      'Curated Crete Agritourism & Local Producer Guide',
      'Curated Agritourism & Local Producer Discovery Guide',
    ];

    for (const claim of bannedClaims) {
      if (indexContent.includes(claim)) {
        console.error(`[SEO Verification Failed] dist/index.html still contains quarantined/stale claim: ${claim}`);
        process.exit(1);
      }
    }

    const bannedGlobalGeoTags = [
      'geo.placename',
      'Heraklion, Crete, Greece',
      '35.3387;25.1442',
      '35.3387, 25.1442',
    ];

    for (const tag of bannedGlobalGeoTags) {
      if (indexContent.includes(tag)) {
        console.error(`[SEO Verification Failed] dist/index.html still contains global Heraklion/Crete geo tag: ${tag}`);
        process.exit(1);
      }
    }

    if (!indexContent.includes('TerroirTrail — Independent Producer &amp; Agritourism Guide') && !indexContent.includes('TerroirTrail — Independent Producer & Agritourism Guide')) {
      console.error('[SEO Verification Failed] dist/index.html is missing expected homepage title/positioning.');
      process.exit(1);
    }

    if (!indexContent.includes('Curated Rural Routes Under Verification')) {
      console.error('[SEO Verification Failed] dist/index.html is missing the curated-route verification notice.');
      process.exit(1);
    }

    const bannedMonetizationTags = [
      'pagead2.googlesyndication.com',
      'emrld.ltd',
      'ca-pub-1608902378435149',
    ];

    for (const tag of bannedMonetizationTags) {
      if (indexContent.includes(tag)) {
        console.error(`[SEO Verification Failed] dist/index.html still contains unconsented third-party monetization script: ${tag}`);
        process.exit(1);
      }
    }
  }

  console.log(`✓ SEO verification passed:`);
  console.log(`  - dist/sitemap.xml present and valid (${locMatches.length} URLs mapped to ${CANONICAL_HOST})`);
  console.log(`  - dist/robots.txt present and advertises ${CANONICAL_SITEMAP_URL}`);
  console.log('  - dist/llms.txt reflects the current Crete + Santorini product state');
  console.log(`  - Canonical link, draft-route quarantine, and unconsented ad-script quarantine verified in dist/index.html`);
}

verifySeoAssets();
