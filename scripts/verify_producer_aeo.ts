import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { SEO_PRODUCERS } from './seoCatalogue';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');

const fail = (message: string): never => {
  console.error(`[AEO Verification Failed] ${message}`);
  process.exit(1);
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const producerUrl = (producer: Producer): string => `${CANONICAL_HOST}/producers/${producer.id}/`;

const parseJsonLd = (html: string, producer: Producer): Record<string, unknown> => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) fail(`Producer ${producer.id} has no JSON-LD block.`);
  try {
    return JSON.parse(match[1]) as Record<string, unknown>;
  } catch (error) {
    fail(`Producer ${producer.id} has invalid JSON-LD: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const requireIncludes = (html: string, value: string, producer: Producer): void => {
  if (!html.includes(value)) fail(`Producer ${producer.id} is missing required AEO output: ${value}`);
};

function verifyProducerAeo(): void {
  let evidencePages = 0;

  for (const producer of SEO_PRODUCERS) {
    const pagePath = path.join(distDir, 'producers', producer.id, 'index.html');
    if (!fs.existsSync(pagePath)) fail(`Producer page is missing: ${pagePath}`);
    const html = fs.readFileSync(pagePath, 'utf-8');
    const name = escapeHtml(producer.name);
    const canonicalUrl = producerUrl(producer);

    requireIncludes(html, 'data-aeo="quick-facts"', producer);
    requireIncludes(html, '<h2 id="quick-facts">Quick facts</h2>', producer);
    requireIncludes(html, '<dt>Type</dt>', producer);
    requireIncludes(html, '<dt>Location</dt>', producer);
    requireIncludes(html, '<dt>Visitor access</dt>', producer);
    requireIncludes(html, '<dt>Road access</dt>', producer);
    requireIncludes(html, 'data-aeo="direct-answers"', producer);
    requireIncludes(html, `<dt>What is ${name}?</dt>`, producer);
    requireIncludes(html, `<dt>Where is ${name}?</dt>`, producer);
    requireIncludes(html, `<dt>Can you visit ${name}?</dt>`, producer);
    requireIncludes(html, `<dt>What is known about road access to ${name}?</dt>`, producer);

    if (html.includes('<dt>What is it?</dt>') || html.includes('<dt>Where is it?</dt>')) {
      fail(`Producer ${producer.id} still contains generic, entity-ambiguous direct-answer questions.`);
    }
    if (html.includes('"@type": "FAQPage"')) {
      fail(`Producer ${producer.id} should not use FAQPage schema for AEO.`);
    }

    const quickFactsIndex = html.indexOf('data-aeo="quick-facts"');
    const aboutIndex = html.indexOf('<h2>About</h2>');
    const storyIndex = html.indexOf('<h2>Story</h2>');
    const narrativeIndex = [aboutIndex, storyIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0];
    if (narrativeIndex !== undefined && quickFactsIndex > narrativeIndex) {
      fail(`Producer ${producer.id} quick facts must appear before long-form narrative content.`);
    }

    const hasPublishedSource = Boolean(
      producer.website || producer.visitSourceUrl || producer.locationSourceUrl || producer.roadAccessSourceUrl
    );
    if (hasPublishedSource) {
      requireIncludes(html, 'data-aeo="evidence"', producer);
      requireIncludes(html, 'Evidence and direct sources', producer);
      evidencePages += 1;
    }

    const jsonLd = parseJsonLd(html, producer);
    const graph = jsonLd['@graph'];
    if (!Array.isArray(graph)) fail(`Producer ${producer.id} JSON-LD must contain an @graph.`);

    const webPage = graph.find((node) =>
      typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@type'] === 'WebPage'
    ) as Record<string, unknown> | undefined;
    if (!webPage) fail(`Producer ${producer.id} JSON-LD is missing its WebPage node.`);

    const mainEntity = webPage.mainEntity as Record<string, unknown> | undefined;
    if (!mainEntity || mainEntity['@id'] !== `${canonicalUrl}#entity`) {
      fail(`Producer ${producer.id} WebPage must point at the producer entity with mainEntity.`);
    }

    const breadcrumbRef = webPage.breadcrumb as Record<string, unknown> | undefined;
    if (!breadcrumbRef || breadcrumbRef['@id'] !== `${canonicalUrl}#breadcrumb`) {
      fail(`Producer ${producer.id} WebPage must reference its breadcrumb schema.`);
    }

    const breadcrumb = graph.find((node) =>
      typeof node === 'object' &&
      node !== null &&
      (node as Record<string, unknown>)['@type'] === 'BreadcrumbList' &&
      (node as Record<string, unknown>)['@id'] === `${canonicalUrl}#breadcrumb`
    ) as Record<string, unknown> | undefined;
    if (!breadcrumb) fail(`Producer ${producer.id} JSON-LD is missing BreadcrumbList schema.`);

    const items = breadcrumb.itemListElement;
    if (!Array.isArray(items) || items.length !== 3) {
      fail(`Producer ${producer.id} breadcrumb must contain exactly three levels.`);
    }
    const finalItem = items[2] as Record<string, unknown>;
    if (finalItem.item !== canonicalUrl || finalItem.name !== producer.name) {
      fail(`Producer ${producer.id} breadcrumb does not terminate at the canonical producer entity.`);
    }
  }

  console.log('Producer AEO verification passed:');
  console.log(`  - ${SEO_PRODUCERS.length} bundled canonical producer pages expose answer-first quick facts before narrative content`);
  console.log(`  - ${SEO_PRODUCERS.length} bundled canonical producer pages use entity-specific traveler questions rather than ambiguous pronouns`);
  console.log(`  - ${SEO_PRODUCERS.length} bundled canonical producer pages connect WebPage → mainEntity and BreadcrumbList in JSON-LD`);
  console.log(`  - ${evidencePages} producer pages expose published evidence/direct-source context`);
  console.log('  - no producer page relies on FAQPage schema for answer-engine optimization');
}

verifyProducerAeo();
