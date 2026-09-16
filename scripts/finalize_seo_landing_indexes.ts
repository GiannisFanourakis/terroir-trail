import fs from 'fs';
import path from 'path';

const CANONICAL_HOST = 'https://terroir-trail.web.app';
const distDir = path.resolve(process.cwd(), 'dist');

type IndexConfig = {
  path: string;
  name: string;
};

const INDEXES: IndexConfig[] = [
  { path: '/destinations/', name: 'Producer destinations' },
  { path: '/categories/', name: 'Producer categories' },
];

const fail = (message: string): never => {
  console.error(`[SEO Index Finalization Failed] ${message}`);
  process.exit(1);
};

const finalizeIndex = ({ path: urlPath, name }: IndexConfig): void => {
  const relativePath = urlPath.replace(/^\//, '').replace(/\/$/, '');
  const filePath = path.join(distDir, relativePath, 'index.html');
  if (!fs.existsSync(filePath)) fail(`Missing generated index: ${filePath}`);

  const html = fs.readFileSync(filePath, 'utf-8');
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) fail(`${urlPath} has no JSON-LD block.`);

  let collection: Record<string, unknown>;
  try {
    collection = JSON.parse(match[1]) as Record<string, unknown>;
  } catch (error) {
    fail(`${urlPath} contains invalid JSON-LD: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (collection['@type'] !== 'CollectionPage') fail(`${urlPath} JSON-LD is not a CollectionPage.`);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      collection,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'TerroirTrail', item: `${CANONICAL_HOST}/` },
          { '@type': 'ListItem', position: 2, name, item: `${CANONICAL_HOST}${urlPath}` },
        ],
      },
    ],
  };

  const replacement = `<script type="application/ld+json">${JSON.stringify(graph, null, 2).replace(/</g, '\\u003c')}</script>`;
  fs.writeFileSync(filePath, html.replace(match[0], replacement), 'utf-8');
};

for (const index of INDEXES) finalizeIndex(index);
console.log('✓ Phase 12B destination/category index BreadcrumbList JSON-LD finalized.');
