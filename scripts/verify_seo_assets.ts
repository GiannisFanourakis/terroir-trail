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

  // 6. Verify dist/index.html canonical link and absence of stale claims
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const canonicalExpected = `<link rel="canonical" href="${CANONICAL_HOST}/" />`;
    if (!indexContent.includes(canonicalExpected)) {
      console.error(`[SEO Verification Failed] dist/index.html is missing expected canonical link: ${canonicalExpected}`);
      process.exit(1);
    }

    if (indexContent.includes('58 featured independent')) {
      console.error('[SEO Verification Failed] dist/index.html still contains stale "58 featured independent" claim.');
      process.exit(1);
    }
  }

  console.log(`✓ SEO verification passed:`);
  console.log(`  - dist/sitemap.xml present and valid (${locMatches.length} URLs mapped to ${CANONICAL_HOST})`);
  console.log(`  - dist/robots.txt present and advertises ${CANONICAL_SITEMAP_URL}`);
  console.log(`  - Canonical link verified in dist/index.html`);
}

verifySeoAssets();
