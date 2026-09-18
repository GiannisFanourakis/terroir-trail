import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { SEO_PRODUCERS } from './seoCatalogue';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');

const categoryLabels: Record<Producer['category'], string> = {
  winery: 'Winery',
  brewery: 'Brewery',
  distillery: 'Distillery',
  cidery: 'Cidery',
  olive_mill: 'Olive mill',
  olive_oil_producer: 'Olive oil producer',
  oil_mill: 'Oil mill',
  cheese_dairy: 'Dairy / cheesemaker',
  apiary: 'Apiary / honey producer',
  confectionery: 'Confectionery producer',
  herb_farm: 'Herb farm',
  mushroom_farm: 'Mushroom farm',
  farm: 'Farm',
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const producerUrl = (producer: Producer): string => `${CANONICAL_HOST}/producers/${producer.id}/`;

const locationSummary = (producer: Producer): string => {
  const locality = producer.locality || producer.village;
  const country = producer.country || (producer.countryCode === 'IT' ? 'Italy' : 'Greece');
  return [locality, producer.region, country].filter(Boolean).join(', ');
};

const visitSummary = (producer: Producer): string => {
  switch (producer.visitStatus) {
    case 'public_visits':
      return 'Public visits confirmed';
    case 'seasonal_public':
      return 'Seasonal public visits confirmed';
    case 'appointment_only':
      return 'Appointment required';
    case 'current_access_uncertain':
      return 'Visitor access uncertain';
    case 'not_publicly_confirmed':
      return 'Public visits not confirmed';
    case 'unreviewed':
    default:
      return 'Visitability not yet verified';
  }
};

const roadSummary = (producer: Producer): string => {
  if (producer.locationStatus === 'unresolved') return 'Navigation point unresolved';
  if (producer.roadAccessStatus === 'current_access_uncertain') return 'Road access uncertain';
  if (producer.roadAccessStatus !== 'verified' || !producer.roadAccess) return 'Road suitability not confirmed';

  const labels: Record<string, string> = {
    paved: 'Paved road verified',
    narrow_paved: 'Narrow paved road verified',
    gravel_ok: 'Gravel access verified',
    unpaved_passable: 'Passable unpaved access verified',
    high_clearance_recommended: 'High-clearance vehicle recommended',
    '4x4_required': '4x4 access required',
  };

  return labels[producer.roadAccess] || 'Road classification verified';
};

const publicPointSummary = (producer: Producer): string | null => {
  switch (producer.publicPointType) {
    case 'producer_shop':
      return 'Producer shop';
    case 'visitor_center':
      return 'Visitor centre';
    case 'production_site':
      return 'Production site';
    case 'estate':
      return 'Estate';
    case 'other_verified_point':
      return 'Other verified public point';
    default:
      return null;
  }
};

const publishedProducts = (producer: Producer): string[] =>
  producer.productSpecialties?.length ? producer.productSpecialties : producer.indigenousVarieties || [];

const quickFacts = (producer: Producer): string => {
  const products = publishedProducts(producer);
  const productSummary = products.length > 0
    ? products.slice(0, 5).join(', ') + (products.length > 5 ? ` +${products.length - 5} more` : '')
    : null;
  const mappedPoint = publicPointSummary(producer);

  const facts: Array<[string, string]> = [
    ['Type', categoryLabels[producer.category]],
    ['Location', locationSummary(producer)],
    ['Visitor access', visitSummary(producer)],
    ['Road access', roadSummary(producer)],
  ];

  if (mappedPoint) facts.push(['Mapped public point', mappedPoint]);
  if (productSummary) facts.push(['Published specialties', productSummary]);

  return `<section class="answer-card" data-aeo="quick-facts" aria-labelledby="quick-facts">
          <h2 id="quick-facts">Quick facts</h2>
          <dl class="fact-grid">
            ${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('\n            ')}
          </dl>
        </section>`;
};

const injectAfterActions = (html: string, producer: Producer): string => {
  if (html.includes('data-aeo="quick-facts"')) {
    throw new Error(`Producer ${producer.id} already contains the AEO quick-facts block.`);
  }

  const start = html.indexOf('<div class="actions">');
  if (start < 0) throw new Error(`Producer ${producer.id} is missing the actions block.`);
  const end = html.indexOf('</div>', start);
  if (end < 0) throw new Error(`Producer ${producer.id} has an unterminated actions block.`);
  const insertionPoint = end + '</div>'.length;
  return `${html.slice(0, insertionPoint)}\n        ${quickFacts(producer)}${html.slice(insertionPoint)}`;
};

const replaceRequired = (html: string, from: string, to: string, producer: Producer): string => {
  if (!html.includes(from)) throw new Error(`Producer ${producer.id} is missing expected AEO marker: ${from}`);
  return html.replace(from, to);
};

const enrichVisibleAnswers = (html: string, producer: Producer): string => {
  const name = escapeHtml(producer.name);

  html = replaceRequired(
    html,
    '<section>\n          <h2>Visit and location facts</h2>',
    '<section data-aeo="direct-answers" aria-labelledby="direct-answers">\n          <h2 id="direct-answers">Direct answers for travelers</h2>',
    producer
  );
  html = replaceRequired(html, '<dt>What is it?</dt>', `<dt>What is ${name}?</dt>`, producer);
  html = replaceRequired(html, '<dt>Where is it?</dt>', `<dt>Where is ${name}?</dt>`, producer);
  html = replaceRequired(html, '<dt>Can you visit?</dt>', `<dt>Can you visit ${name}?</dt>`, producer);
  html = replaceRequired(
    html,
    '<dt>What is known about road access?</dt>',
    `<dt>What is known about road access to ${name}?</dt>`,
    producer
  );

  if (html.includes('<section><h2>Sources and direct channels</h2><ul>')) {
    html = html.replace(
      '<section><h2>Sources and direct channels</h2><ul>',
      '<section data-aeo="evidence" aria-labelledby="evidence-sources"><h2 id="evidence-sources">Evidence and direct sources</h2><p>TerroirTrail keeps producer identity, visitability, location and road access as separate evidence fields. These links are the published sources or direct channels available for this record.</p><ul>'
    );
  }

  return html;
};

const enrichStyles = (html: string, producer: Producer): string => {
  const extraStyles = `.seo-page .answer-card{border:1px solid #44403c;background:#1c1917;border-radius:18px;padding:18px 20px;margin:1.5rem 0 2rem}.seo-page .answer-card h2{margin-top:0}.seo-page .fact-grid{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.seo-page .fact-grid>div{border:1px solid #292524;border-radius:12px;padding:12px;background:#0c0a09}.seo-page .fact-grid dt{font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:#fbbf24}.seo-page .fact-grid dd{margin-top:.35rem;color:#f5f5f4}`;
  if (!html.includes('</style>')) throw new Error(`Producer ${producer.id} is missing its style block.`);
  return html.replace('</style>', `${extraStyles}</style>`);
};

const enrichJsonLd = (html: string, producer: Producer): string => {
  const canonicalUrl = producerUrl(producer);
  const scriptPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
  const match = html.match(scriptPattern);
  if (!match) throw new Error(`Producer ${producer.id} has no JSON-LD block.`);

  const jsonLd = JSON.parse(match[1]) as Record<string, unknown>;
  const graph = jsonLd['@graph'];
  if (!Array.isArray(graph)) throw new Error(`Producer ${producer.id} JSON-LD has no @graph array.`);

  const webPage = graph.find((node) =>
    typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@type'] === 'WebPage'
  ) as Record<string, unknown> | undefined;
  if (!webPage) throw new Error(`Producer ${producer.id} JSON-LD has no WebPage node.`);

  const entityId = `${canonicalUrl}#entity`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  webPage.mainEntity = { '@id': entityId };
  webPage.breadcrumb = { '@id': breadcrumbId };

  const existingBreadcrumb = graph.find((node) =>
    typeof node === 'object' && node !== null && (node as Record<string, unknown>)['@id'] === breadcrumbId
  );
  if (!existingBreadcrumb) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'TerroirTrail',
          item: `${CANONICAL_HOST}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Producer directory',
          item: `${CANONICAL_HOST}/producers/`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: producer.name,
          item: canonicalUrl,
        },
      ],
    });
  }

  const serialized = JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c');
  return html.replace(scriptPattern, `<script type="application/ld+json">${serialized}</script>`);
};

function enrichProducerAeo(): void {
  const producerRoot = path.join(distDir, 'producers');
  if (!fs.existsSync(producerRoot)) {
    console.error(`[AEO Enrichment Failed] ${producerRoot} is missing. Run generate_seo_pages first.`);
    process.exit(1);
  }

  let enriched = 0;
  try {
    for (const producer of SEO_PRODUCERS) {
      const pagePath = path.join(producerRoot, producer.id, 'index.html');
      if (!fs.existsSync(pagePath)) throw new Error(`Producer page is missing: ${pagePath}`);

      let html = fs.readFileSync(pagePath, 'utf-8');
      html = injectAfterActions(html, producer);
      html = enrichVisibleAnswers(html, producer);
      html = enrichStyles(html, producer);
      html = enrichJsonLd(html, producer);
      fs.writeFileSync(pagePath, html, 'utf-8');
      enriched += 1;
    }
  } catch (error) {
    console.error(`[AEO Enrichment Failed] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  console.log(`Producer AEO enrichment complete: ${enriched} pages now expose quick facts, named direct answers, evidence context and breadcrumb/main-entity schema.`);
}

enrichProducerAeo();
