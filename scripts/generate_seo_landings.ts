import fs from 'fs';
import path from 'path';
import type { Producer } from '../src/types/terroir';
import { SEO_PRODUCERS } from './seoCatalogue';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');

const PRODUCERS: Producer[] = SEO_PRODUCERS;

type CategoryConfig = { slug: string; singular: string; plural: string };
type DestinationConfig = { label: string; slug: string; countryLabel: string; countrySlug: string };
type LandingPage = {
  path: string;
  title: string;
  heading: string;
  description: string;
  eyebrow: string;
  producers: Producer[];
  breadcrumbs: Array<{ name: string; path: string }>;
  relatedLinks: Array<{ label: string; path: string }>;
  answerLabel: string;
};

const MIN_CATEGORY_RECORDS = 2;
const MIN_REGION_RECORDS = 2;
const MIN_DESTINATION_CATEGORY_RECORDS = 3;

const categoryConfig: Record<Producer['category'], CategoryConfig> = {
  winery: { slug: 'wineries', singular: 'Winery', plural: 'Wineries' },
  brewery: { slug: 'breweries', singular: 'Brewery', plural: 'Breweries' },
  distillery: { slug: 'distilleries', singular: 'Distillery', plural: 'Distilleries' },
  cidery: { slug: 'cideries', singular: 'Cidery', plural: 'Cideries' },
  olive_mill: { slug: 'olive-mills', singular: 'Olive mill', plural: 'Olive mills' },
  olive_oil_producer: { slug: 'olive-oil-producers', singular: 'Olive oil producer', plural: 'Olive oil producers' },
  oil_mill: { slug: 'oil-mills', singular: 'Oil mill', plural: 'Oil mills' },
  cheese_dairy: { slug: 'dairies-cheesemakers', singular: 'Dairy / cheesemaker', plural: 'Dairies / cheesemakers' },
  apiary: { slug: 'apiaries-honey-producers', singular: 'Apiary / honey producer', plural: 'Apiaries / honey producers' },
  confectionery: { slug: 'confectionery-producers', singular: 'Confectionery producer', plural: 'Confectionery producers' },
  herb_farm: { slug: 'herb-farms', singular: 'Herb farm', plural: 'Herb farms' },
  mushroom_farm: { slug: 'mushroom-farms', singular: 'Mushroom farm', plural: 'Mushroom farms' },
  farm: { slug: 'farms', singular: 'Farm', plural: 'Farms' },
};

const destinationConfig: Record<Producer['destination'], DestinationConfig> = {
  crete: { label: 'Crete', slug: 'crete', countryLabel: 'Greece', countrySlug: 'greece' },
  santorini: { label: 'Santorini', slug: 'santorini', countryLabel: 'Greece', countrySlug: 'greece' },
  peloponnese: { label: 'Peloponnese', slug: 'peloponnese', countryLabel: 'Greece', countrySlug: 'greece' },
  northern_greece: { label: 'Macedonia, Greece', slug: 'northern-greece', countryLabel: 'Greece', countrySlug: 'greece' },
  thessaly: { label: 'Thessaly', slug: 'thessaly', countryLabel: 'Greece', countrySlug: 'greece' },
  tuscany: { label: 'Tuscany', slug: 'tuscany', countryLabel: 'Italy', countrySlug: 'italy' },
  piedmont: { label: 'Piedmont', slug: 'piedmont', countryLabel: 'Italy', countrySlug: 'italy' },
  puglia: { label: 'Puglia', slug: 'puglia', countryLabel: 'Italy', countrySlug: 'italy' },
  sicily: { label: 'Sicily', slug: 'sicily', countryLabel: 'Italy', countrySlug: 'italy' },
  south_tyrol: { label: 'South Tyrol', slug: 'south-tyrol', countryLabel: 'Italy', countrySlug: 'italy' },
  provence: { label: "Provence-Alpes-Côte d'Azur", slug: 'provence', countryLabel: 'France', countrySlug: 'france' },
  catalonia: { label: 'Catalonia', slug: 'catalonia', countryLabel: 'Spain', countrySlug: 'spain' },
  alentejo: { label: 'Alentejo', slug: 'alentejo', countryLabel: 'Portugal', countrySlug: 'portugal' },
  istria: { label: 'Istria', slug: 'istria', countryLabel: 'Croatia', countrySlug: 'croatia' },
  pomurska: { label: 'Pomurska', slug: 'pomurska', countryLabel: 'Slovenia', countrySlug: 'slovenia' },
  southeast_slovenia: { label: 'Southeast Slovenia', slug: 'southeast-slovenia', countryLabel: 'Slovenia', countrySlug: 'slovenia' },
  central_slovenia: { label: 'Central Slovenia', slug: 'central-slovenia', countryLabel: 'Slovenia', countrySlug: 'slovenia' },
  goriska: { label: 'Goriška', slug: 'goriska', countryLabel: 'Slovenia', countrySlug: 'slovenia' },
  trondelag: { label: 'Trøndelag', slug: 'trondelag', countryLabel: 'Norway', countrySlug: 'norway' },
  more_og_romsdal: { label: 'Møre og Romsdal', slug: 'more-og-romsdal', countryLabel: 'Norway', countrySlug: 'norway' },
  buskerud: { label: 'Buskerud', slug: 'buskerud', countryLabel: 'Norway', countrySlug: 'norway' },
  vestland: { label: 'Vestland', slug: 'vestland', countryLabel: 'Norway', countrySlug: 'norway' },
};

const escapeHtml = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const escapeXml = escapeHtml;
const normalizeText = (value: string): string => value.replace(/\s+/g, ' ').trim();
const truncate = (value: string, maxLength: number): string => {
  const normalized = normalizeText(value);
  if (normalized.length <= maxLength) return normalized;
  const shortened = normalized.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 80 ? lastSpace : shortened.length)}…`;
};
const slugify = (value: string): string =>
  value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const producerPath = (producer: Producer): string => `/producers/${producer.id}/`;
const producerUrl = (producer: Producer): string => `${CANONICAL_HOST}${producerPath(producer)}`;
const destinationPath = (destination: Producer['destination']): string => {
  const config = destinationConfig[destination];
  return `/${config.countrySlug}/${config.slug}/`;
};
const categoryPath = (category: Producer['category']): string => `/producers/${categoryConfig[category].slug}/`;
const regionPath = (destination: Producer['destination'], region: string): string => `${destinationPath(destination)}regions/${slugify(region)}/`;
const destinationCategoryPath = (destination: Producer['destination'], category: Producer['category']): string => `${destinationPath(destination)}${categoryConfig[category].slug}/`;
const countryForProducer = (producer: Producer): { label: string; slug: string } => {
  const config = destinationConfig[producer.destination];
  return { label: config.countryLabel, slug: config.countrySlug };
};

const groupBy = <K extends string>(producers: Producer[], keyFn: (producer: Producer) => K): Map<K, Producer[]> => {
  const groups = new Map<K, Producer[]>();
  for (const producer of producers) {
    const key = keyFn(producer);
    const group = groups.get(key) || [];
    group.push(producer);
    groups.set(key, group);
  }
  return groups;
};
const sortProducers = (producers: Producer[]): Producer[] =>
  [...producers].sort((a, b) => a.region.localeCompare(b.region) || a.village.localeCompare(b.village) || a.name.localeCompare(b.name));
const representedCategories = (producers: Producer[]): string[] =>
  [...new Set(producers.map((producer) => producer.category))].map((category) => categoryConfig[category].plural).sort((a, b) => a.localeCompare(b));
const representedDestinations = (producers: Producer[]): string[] =>
  [...new Set(producers.map((producer) => producer.destination))].map((destination) => destinationConfig[destination].label).sort((a, b) => a.localeCompare(b));
const visitSummary = (producers: Producer[]): string => {
  const confirmed = producers.filter((producer) => ['public_visits', 'seasonal_public', 'appointment_only'].includes(producer.visitStatus || '')).length;
  const other = producers.length - confirmed;
  return `${confirmed} of ${producers.length} records have a currently confirmed public, seasonal, or appointment-based visit pathway. ${other} do not currently have a confirmed visitor pathway or remain uncertain/unreviewed.`;
};
const roadSummary = (producers: Producer[]): string => {
  const verified = producers.filter((producer) => producer.roadAccessStatus === 'verified' && Boolean(producer.roadAccess)).length;
  return `${verified} of ${producers.length} records have a verified road-access classification. A map point alone is never treated as a road-safety guarantee.`;
};

const pageStyles = `
      :root{color-scheme:dark}.seo-page{box-sizing:border-box;min-height:100vh;background:#0c0a09;color:#e7e5e4;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:32px 20px}.seo-page article{max-width:980px;margin:0 auto}.seo-page a{color:#fbbf24}.seo-page h1{font-size:clamp(2rem,5vw,3.6rem);line-height:1.05;color:#fff;margin:.5rem 0 1rem}.seo-page h2{color:#fff;margin-top:2rem}.seo-page .eyebrow{color:#fbbf24;font-weight:800;text-transform:uppercase;letter-spacing:.08em;font-size:.8rem}.seo-page .lead{font-size:1.15rem;line-height:1.7}.seo-page p,.seo-page dd,.seo-page li{line-height:1.7}.seo-page dl{display:grid;gap:1rem}.seo-page dt{font-weight:800;color:#fff}.seo-page dd{margin:.25rem 0 0;color:#d6d3d1}.seo-page .notice{border-left:3px solid #f59e0b;padding-left:1rem;color:#d6d3d1}.seo-page .directory{display:grid;gap:10px;padding:0;list-style:none}.seo-page .directory a{display:block;border:1px solid #292524;border-radius:14px;padding:12px 14px;text-decoration:none;background:#1c1917}.seo-page .directory small{display:block;color:#a8a29e;margin-top:3px}.seo-page .related{display:flex;gap:8px;flex-wrap:wrap;padding:0;list-style:none}.seo-page .related a{display:inline-block;border:1px solid #44403c;border-radius:999px;padding:7px 11px;text-decoration:none}.seo-page nav ol{display:flex;gap:7px;flex-wrap:wrap;padding:0;list-style:none;color:#a8a29e}.seo-page nav li:not(:last-child)::after{content:" /";color:#57534e;margin-left:7px}
`;

const buildJsonLd = (page: LandingPage, canonicalUrl: string): string => {
  const breadcrumbs = page.breadcrumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.name, item: `${CANONICAL_HOST}${crumb.path}` }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage', '@id': canonicalUrl, url: canonicalUrl, name: page.title, description: page.description, inLanguage: 'en',
        isPartOf: { '@type': 'WebSite', '@id': `${CANONICAL_HOST}/#website`, name: 'TerroirTrail', url: `${CANONICAL_HOST}/` },
        mainEntity: {
          '@type': 'ItemList', numberOfItems: page.producers.length,
          itemListElement: page.producers.map((producer, index) => ({ '@type': 'ListItem', position: index + 1, url: producerUrl(producer), name: producer.name })),
        },
      },
      { '@type': 'BreadcrumbList', itemListElement: breadcrumbs },
    ],
  }, null, 2).replace(/</g, '\\u003c');
};

const renderBreadcrumbs = (breadcrumbs: LandingPage['breadcrumbs']): string =>
  `<nav aria-label="Breadcrumb"><ol>${breadcrumbs.map((crumb, index) => {
    const isLast = index === breadcrumbs.length - 1;
    return `<li>${isLast ? escapeHtml(crumb.name) : `<a href="${crumb.path}">${escapeHtml(crumb.name)}</a>`}</li>`;
  }).join('')}</ol></nav>`;
const renderProducerList = (producers: Producer[]): string =>
  `<ul class="directory">${sortProducers(producers).map((producer) => {
    const category = categoryConfig[producer.category].singular;
    return `<li><a href="${producerPath(producer)}"><strong>${escapeHtml(producer.name)}</strong><small>${escapeHtml(category)} · ${escapeHtml(producer.village)}, ${escapeHtml(producer.region)}</small></a></li>`;
  }).join('\n')}</ul>`;
const renderRelatedLinks = (links: LandingPage['relatedLinks']): string => {
  const unique = [...new Map(links.map((link) => [link.path, link])).values()];
  if (unique.length === 0) return '';
  return `<section><h2>Explore related pages</h2><ul class="related">${unique.map((link) => `<li><a href="${link.path}">${escapeHtml(link.label)}</a></li>`).join('')}</ul></section>`;
};

const renderLandingPage = (page: LandingPage): string => {
  const canonicalUrl = `${CANONICAL_HOST}${page.path}`;
  const categories = representedCategories(page.producers);
  const destinations = representedDestinations(page.producers);
  const jsonLd = buildJsonLd(page, canonicalUrl);
  const representation = page.answerLabel === 'category' ? destinations.join(', ') : categories.join(', ');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TerroirTrail" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:image" content="${CANONICAL_HOST}/logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <script type="application/ld+json">${jsonLd}</script>
    <style>${pageStyles}</style>
  </head>
  <body style="margin:0">
    <main class="seo-page"><article>
      ${renderBreadcrumbs(page.breadcrumbs)}
      <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
      <h1>${escapeHtml(page.heading)}</h1>
      <p class="lead">${escapeHtml(page.description)}</p>
      <section><h2>At a glance</h2><dl>
        <div><dt>How many audited records are here?</dt><dd>${page.producers.length} producer/project records.</dd></div>
        <div><dt>What is represented?</dt><dd>${escapeHtml(representation || 'No additional grouping is published.')}</dd></div>
        <div><dt>Are visits confirmed?</dt><dd>${escapeHtml(visitSummary(page.producers))}</dd></div>
        <div><dt>What is known about road access?</dt><dd>${escapeHtml(roadSummary(page.producers))}</dd></div>
      </dl></section>
      <section><h2>Producer directory</h2>${renderProducerList(page.producers)}</section>
      ${renderRelatedLinks(page.relatedLinks)}
      <p class="notice">TerroirTrail publishes evidence-backed discovery pages from its audited catalogue. Inclusion does not imply a commercial partnership, booking relationship, guaranteed visitor access, or road-safety guarantee.</p>
    </article></main>
  </body>
</html>\n`;
};

const renderIndexPage = (pathValue: string, title: string, heading: string, description: string, groups: Array<{ label: string; path: string; count: number; detail: string }>): string => {
  const canonicalUrl = `${CANONICAL_HOST}${pathValue}`;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': canonicalUrl, url: canonicalUrl, name: title, description,
    mainEntity: { '@type': 'ItemList', numberOfItems: groups.length, itemListElement: groups.map((group, index) => ({ '@type': 'ListItem', position: index + 1, url: `${CANONICAL_HOST}${group.path}`, name: group.label })) },
  }, null, 2).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TerroirTrail" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <script type="application/ld+json">${jsonLd}</script>
    <style>${pageStyles}</style>
  </head>
  <body style="margin:0"><main class="seo-page"><article>
    <p><a href="/">← TerroirTrail</a> · <a href="/producers/">Producer directory</a></p>
    <p class="eyebrow">Entity discovery</p>
    <h1>${escapeHtml(heading)}</h1>
    <p class="lead">${escapeHtml(description)}</p>
    <ul class="directory">${groups.map((group) => `<li><a href="${group.path}"><strong>${escapeHtml(group.label)}</strong><small>${group.count} audited records · ${escapeHtml(group.detail)}</small></a></li>`).join('\n')}</ul>
    <p class="notice">Pages are created from audited catalogue groupings, not from keyword permutations. Thin destination/category combinations are intentionally withheld.</p>
  </article></main></body>
</html>\n`;
};

const writeHtmlPage = (urlPath: string, html: string): void => {
  const relative = urlPath.replace(/^\//, '').replace(/\/$/, '');
  const pageDir = path.join(distDir, relative);
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf-8');
};
const replaceRequired = (html: string, from: string, to: string, label: string): string => {
  if (!html.includes(from)) {
    console.error(`[SEO Landing Generation Failed] ${label} marker was not found.`);
    process.exit(1);
  }
  return html.replace(from, to);
};

const buildLandingPages = (): { pages: LandingPage[]; categoryGroups: Map<Producer['category'], Producer[]>; regionGroups: Map<string, Producer[]>; comboGroups: Map<string, Producer[]> } => {
  const pages: LandingPage[] = [];
  const categoryGroups = groupBy(PRODUCERS, (producer) => producer.category);
  const regionGroups = groupBy(PRODUCERS, (producer) => `${producer.destination}::${producer.region}`);
  const comboGroups = groupBy(PRODUCERS, (producer) => `${producer.destination}::${producer.category}`);
  const countryGroups = groupBy(PRODUCERS, (producer) => countryForProducer(producer).slug);
  const destinationGroups = groupBy(PRODUCERS, (producer) => producer.destination);

  for (const [countrySlug, producers] of countryGroups) {
    const country = countryForProducer(producers[0]);
    const relatedLinks = [...new Set(producers.map((producer) => producer.destination))].map((destination) => ({ label: destinationConfig[destination].label, path: destinationPath(destination) }));
    pages.push({
      path: `/${countrySlug}/`, title: `${country.label} Producer Discovery | TerroirTrail`, heading: `${country.label} producer discovery`,
      description: truncate(`Browse ${producers.length} audited TerroirTrail producer/project records in ${country.label}, grouped into source-backed destinations and producer categories.`, 158),
      eyebrow: 'Country catalogue', producers,
      breadcrumbs: [{ name: 'TerroirTrail', path: '/' }, { name: country.label, path: `/${countrySlug}/` }],
      relatedLinks, answerLabel: 'country',
    });
  }

  for (const [destination, producers] of destinationGroups) {
    const config = destinationConfig[destination];
    const relatedLinks: LandingPage['relatedLinks'] = [];
    for (const category of [...new Set(producers.map((producer) => producer.category))]) {
      const combo = comboGroups.get(`${destination}::${category}`) || [];
      if (combo.length >= MIN_DESTINATION_CATEGORY_RECORDS) relatedLinks.push({ label: `${config.label} ${categoryConfig[category].plural}`, path: destinationCategoryPath(destination, category) });
      else if ((categoryGroups.get(category) || []).length >= MIN_CATEGORY_RECORDS) relatedLinks.push({ label: categoryConfig[category].plural, path: categoryPath(category) });
    }
    for (const region of [...new Set(producers.map((producer) => producer.region))]) {
      const regionProducers = regionGroups.get(`${destination}::${region}`) || [];
      if (regionProducers.length >= MIN_REGION_RECORDS) relatedLinks.push({ label: region, path: regionPath(destination, region) });
    }
    pages.push({
      path: destinationPath(destination), title: `${config.label} Producers & Makers | TerroirTrail`, heading: `${config.label} producers and makers`,
      description: truncate(`Browse ${producers.length} audited producer/project records in ${config.label}, ${config.countryLabel}, with source-backed visitability, location and access status.`, 158),
      eyebrow: `${config.countryLabel} destination`, producers,
      breadcrumbs: [{ name: 'TerroirTrail', path: '/' }, { name: config.countryLabel, path: `/${config.countrySlug}/` }, { name: config.label, path: destinationPath(destination) }],
      relatedLinks, answerLabel: 'destination',
    });
  }

  for (const [category, producers] of categoryGroups) {
    if (producers.length < MIN_CATEGORY_RECORDS) continue;
    const config = categoryConfig[category];
    const relatedLinks: LandingPage['relatedLinks'] = [];
    for (const destination of [...new Set(producers.map((producer) => producer.destination))]) {
      const combo = comboGroups.get(`${destination}::${category}`) || [];
      if (combo.length >= MIN_DESTINATION_CATEGORY_RECORDS) relatedLinks.push({ label: `${destinationConfig[destination].label} ${config.plural}`, path: destinationCategoryPath(destination, category) });
      else relatedLinks.push({ label: destinationConfig[destination].label, path: destinationPath(destination) });
    }
    pages.push({
      path: categoryPath(category), title: `${config.plural} in the TerroirTrail Catalogue | TerroirTrail`, heading: config.plural,
      description: truncate(`Browse ${producers.length} audited ${config.plural.toLowerCase()} across the current TerroirTrail catalogue, with source-backed identity, visitability and access status.`, 158),
      eyebrow: 'Producer category', producers,
      breadcrumbs: [{ name: 'TerroirTrail', path: '/' }, { name: 'Producers', path: '/producers/' }, { name: config.plural, path: categoryPath(category) }],
      relatedLinks, answerLabel: 'category',
    });
  }

  for (const [key, producers] of comboGroups) {
    if (producers.length < MIN_DESTINATION_CATEGORY_RECORDS) continue;
    const [destinationKey, categoryKey] = key.split('::') as [Producer['destination'], Producer['category']];
    const destination = destinationConfig[destinationKey];
    const category = categoryConfig[categoryKey];
    pages.push({
      path: destinationCategoryPath(destinationKey, categoryKey), title: `${destination.label} ${category.plural} | TerroirTrail`, heading: `${destination.label} ${category.plural.toLowerCase()}`,
      description: truncate(`Browse ${producers.length} audited ${category.plural.toLowerCase()} in ${destination.label}, with source-backed producer identity, visitability, location and access status.`, 158),
      eyebrow: `${destination.label} · ${category.plural}`, producers,
      breadcrumbs: [{ name: 'TerroirTrail', path: '/' }, { name: destination.countryLabel, path: `/${destination.countrySlug}/` }, { name: destination.label, path: destinationPath(destinationKey) }, { name: category.plural, path: destinationCategoryPath(destinationKey, categoryKey) }],
      relatedLinks: [{ label: `All ${destination.label} producers`, path: destinationPath(destinationKey) }, { label: `All ${category.plural}`, path: categoryPath(categoryKey) }],
      answerLabel: 'category',
    });
  }

  for (const [key, producers] of regionGroups) {
    if (producers.length < MIN_REGION_RECORDS) continue;
    const [destinationKey, region] = key.split('::') as [Producer['destination'], string];
    const destination = destinationConfig[destinationKey];
    const relatedLinks: LandingPage['relatedLinks'] = [{ label: `All ${destination.label} producers`, path: destinationPath(destinationKey) }];
    for (const category of [...new Set(producers.map((producer) => producer.category))]) {
      if ((categoryGroups.get(category) || []).length >= MIN_CATEGORY_RECORDS) relatedLinks.push({ label: categoryConfig[category].plural, path: categoryPath(category) });
    }
    pages.push({
      path: regionPath(destinationKey, region), title: `${region} Producers — ${destination.label} | TerroirTrail`, heading: `${region} producers and makers`,
      description: truncate(`Browse ${producers.length} audited producer/project records in ${region}, within TerroirTrail's ${destination.label} catalogue.`, 158),
      eyebrow: `${destination.label} region`, producers,
      breadcrumbs: [{ name: 'TerroirTrail', path: '/' }, { name: destination.countryLabel, path: `/${destination.countrySlug}/` }, { name: destination.label, path: destinationPath(destinationKey) }, { name: region, path: regionPath(destinationKey, region) }],
      relatedLinks, answerLabel: 'region',
    });
  }

  const pathSet = new Set<string>();
  for (const page of pages) {
    if (pathSet.has(page.path)) {
      console.error(`[SEO Landing Generation Failed] Duplicate landing path: ${page.path}`);
      process.exit(1);
    }
    pathSet.add(page.path);
  }
  return { pages, categoryGroups, regionGroups, comboGroups };
};

const updateProducerPages = (categoryGroups: Map<Producer['category'], Producer[]>, regionGroups: Map<string, Producer[]>, comboGroups: Map<string, Producer[]>): void => {
  for (const producer of PRODUCERS) {
    const pagePath = path.join(distDir, 'producers', producer.id, 'index.html');
    if (!fs.existsSync(pagePath)) {
      console.error(`[SEO Landing Generation Failed] Producer page missing: ${pagePath}`);
      process.exit(1);
    }
    let html = fs.readFileSync(pagePath, 'utf-8');
    const links: Array<{ label: string; path: string }> = [{ label: destinationConfig[producer.destination].label, path: destinationPath(producer.destination) }];
    if ((categoryGroups.get(producer.category) || []).length >= MIN_CATEGORY_RECORDS) links.push({ label: categoryConfig[producer.category].plural, path: categoryPath(producer.category) });
    if ((regionGroups.get(`${producer.destination}::${producer.region}`) || []).length >= MIN_REGION_RECORDS) links.push({ label: producer.region, path: regionPath(producer.destination, producer.region) });
    if ((comboGroups.get(`${producer.destination}::${producer.category}`) || []).length >= MIN_DESTINATION_CATEGORY_RECORDS) links.push({ label: `${destinationConfig[producer.destination].label} ${categoryConfig[producer.category].plural}`, path: destinationCategoryPath(producer.destination, producer.category) });
    const related = `<section><h2>Explore related TerroirTrail pages</h2><ul>${links.map((link) => `<li><a href="${link.path}">${escapeHtml(link.label)}</a></li>`).join('')}</ul></section>\n        `;
    html = replaceRequired(html, '<p class="notice">TerroirTrail is an independent discovery guide.', `${related}<p class="notice">TerroirTrail is an independent discovery guide.`, `Producer ${producer.id}`);
    fs.writeFileSync(pagePath, html, 'utf-8');
  }
};

const updateProducerDirectory = (): void => {
  const directoryPath = path.join(distDir, 'producers', 'index.html');
  let html = fs.readFileSync(directoryPath, 'utf-8');
  const navigation = `<section><h2>Explore by place or category</h2><ul><li><a href="/destinations/">Destinations</a></li><li><a href="/categories/">Producer categories</a></li><li><a href="/greece/">Greece</a></li><li><a href="/italy/">Italy</a></li></ul></section>\n        `;
  html = replaceRequired(html, '<p class="notice">Listings are independent researched records.', `${navigation}<p class="notice">Listings are independent researched records.`, 'Producer directory');
  fs.writeFileSync(directoryPath, html, 'utf-8');
};

const updateHomepage = (): void => {
  const homePath = path.join(distDir, 'index.html');
  let html = fs.readFileSync(homePath, 'utf-8');

  // Use a structural marker rather than catalogue copy so live-count wording
  // changes cannot break landing generation. Keep the insertion idempotent.
  const navigationMarker = 'data-seo-landing-nav="true"';
  if (html.includes(navigationMarker)) return;

  const marker = '<h2>Audited Producer Directory — Homepage Excerpt</h2>';
  const navigation = '<p data-seo-landing-nav="true">Explore canonical catalogue pages by <a href="/destinations/">destination</a>, <a href="/categories/">producer category</a>, <a href="/greece/">Greece</a>, or <a href="/italy/">Italy</a>.</p>';
  html = replaceRequired(html, marker, `${navigation}\n        ${marker}`, 'Homepage structural');
  fs.writeFileSync(homePath, html, 'utf-8');
};

const updateSitemap = (landingPaths: string[]): void => {
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('[SEO Landing Generation Failed] dist/sitemap.xml is missing.');
    process.exit(1);
  }
  const existing = fs.readFileSync(sitemapPath, 'utf-8');
  const currentUrls = [...existing.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
  const addedUrls = landingPaths.map((urlPath) => `${CANONICAL_HOST}${urlPath}`);
  const urls = [...new Set([...currentUrls, ...addedUrls])];
  const entries = urls.map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`).join('\n');
  fs.writeFileSync(sitemapPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`, 'utf-8');
};

function generateSeoLandings(): void {
  if (!fs.existsSync(distDir)) {
    console.error(`[SEO Landing Generation Failed] ${distDir} is missing. Run the base build first.`);
    process.exit(1);
  }
  const { pages, categoryGroups, regionGroups, comboGroups } = buildLandingPages();
  const destinations = [...new Set(PRODUCERS.map((producer) => producer.destination))];
  const destinationIndexGroups = destinations.map((destination) => {
    const config = destinationConfig[destination];
    const producers = PRODUCERS.filter((producer) => producer.destination === destination);
    return { label: `${config.label}, ${config.countryLabel}`, path: destinationPath(destination), count: producers.length, detail: representedCategories(producers).join(', ') };
  }).sort((a, b) => a.label.localeCompare(b.label));
  const categoryIndexGroups = [...categoryGroups.entries()].filter(([, producers]) => producers.length >= MIN_CATEGORY_RECORDS).map(([category, producers]) => ({ label: categoryConfig[category].plural, path: categoryPath(category), count: producers.length, detail: representedDestinations(producers).join(', ') })).sort((a, b) => a.label.localeCompare(b.label));

  writeHtmlPage('/destinations/', renderIndexPage('/destinations/', 'Producer Destinations | TerroirTrail', 'Producer destinations', 'Browse the current audited TerroirTrail catalogue by destination. Each destination page is built from real producer records and their verified or explicitly unknown trust data.', destinationIndexGroups));
  writeHtmlPage('/categories/', renderIndexPage('/categories/', 'Producer Categories | TerroirTrail', 'Producer categories', `Browse producer categories with at least ${MIN_CATEGORY_RECORDS} audited records. Thin categories and keyword-only pages are intentionally withheld until the catalogue supports them.`, categoryIndexGroups));
  for (const page of pages) writeHtmlPage(page.path, renderLandingPage(page));

  updateProducerPages(categoryGroups, regionGroups, comboGroups);
  updateProducerDirectory();
  updateHomepage();
  updateSitemap(['/destinations/', '/categories/', ...pages.map((page) => page.path)]);

  const regionCount = pages.filter((page) => page.eyebrow.endsWith(' region')).length;
  const comboCount = pages.filter((page) => page.eyebrow.includes(' · ')).length;
  const categoryCount = pages.filter((page) => page.eyebrow === 'Producer category').length;
  const destinationCount = pages.filter((page) => page.eyebrow.endsWith(' destination')).length;
  const countryCount = pages.filter((page) => page.eyebrow === 'Country catalogue').length;
  console.log(`SEO/AEO landing generation complete (${PRODUCERS.length} audited producer/project records):`);
  console.log(`  - ${countryCount} country pages`);
  console.log(`  - ${destinationCount} destination pages`);
  console.log(`  - ${regionCount} region pages (minimum ${MIN_REGION_RECORDS} records)`);
  console.log(`  - ${categoryCount} category pages (minimum ${MIN_CATEGORY_RECORDS} records)`);
  console.log(`  - ${comboCount} destination/category pages (minimum ${MIN_DESTINATION_CATEGORY_RECORDS} records)`);
  console.log('  - producer pages, directory, homepage and sitemap linked into the current entity architecture');
}

generateSeoLandings();
