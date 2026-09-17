import fs from 'fs';
import path from 'path';
import type { Destination } from '../src/types/terroir';
import { TERROIR_REGION_STORIES } from '../src/data/terroirRegionStories';

const distDir = path.resolve(process.cwd(), 'dist');

const destinationPages: Record<Destination, { label: string; path: string }> = {
  crete: { label: 'Crete', path: '/greece/crete/' },
  santorini: { label: 'Santorini', path: '/greece/santorini/' },
  peloponnese: { label: 'Peloponnese', path: '/greece/peloponnese/' },
  northern_greece: { label: 'Macedonia, Greece', path: '/greece/northern-greece/' },
  thessaly: { label: 'Thessaly', path: '/greece/thessaly/' },
  tuscany: { label: 'Tuscany', path: '/italy/tuscany/' },
  piedmont: { label: 'Piedmont', path: '/italy/piedmont/' },
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const fileForUrlPath = (urlPath: string): string =>
  path.join(distDir, urlPath.replace(/^\//, '').replace(/\/$/, ''), 'index.html');

const renderStorySection = (destination: Destination, label: string): string => {
  const story = TERROIR_REGION_STORIES[destination];
  const editorialSections = story.sections.filter((section) => section.id !== 'explore');

  return `<section data-terroir-story="${destination}">
        <h2>A sense of ${escapeHtml(label)}</h2>
        <p>${escapeHtml(story.summary)}</p>
        ${editorialSections
          .map(
            (section) => `<section>
          <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
          <h3>${escapeHtml(section.title)}</h3>
          <p>${escapeHtml(section.body)}</p>
        </section>`
          )
          .join('\n        ')}
      </section>`;
};

for (const [destination, config] of Object.entries(destinationPages) as Array<
  [Destination, { label: string; path: string }]
>) {
  const filePath = fileForUrlPath(config.path);
  if (!fs.existsSync(filePath)) {
    // Destination has no published producers yet, so no landing page was generated. Skip cleanly.
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf-8');
  if (html.includes(`data-terroir-story="${destination}"`)) {
    console.error(`[SEO Destination Story Enrichment Failed] Duplicate story block on ${config.path}`);
    process.exit(1);
  }

  const marker = /(<p class="lead">[\s\S]*?<\/p>)(\s*<section><h2>At a glance<\/h2>)/i;
  if (!marker.test(html)) {
    console.error(`[SEO Destination Story Enrichment Failed] Could not locate landing-page intro on ${config.path}`);
    process.exit(1);
  }

  html = html.replace(marker, `$1\n      ${renderStorySection(destination, config.label)}$2`);

  const story = TERROIR_REGION_STORIES[destination];
  const requiredSnippets = [story.summary, ...story.sections.filter((section) => section.id !== 'explore').map((section) => section.title)];
  for (const snippet of requiredSnippets) {
    if (!html.includes(escapeHtml(snippet))) {
      console.error(`[SEO Destination Story Enrichment Failed] Story content missing from ${config.path}: ${snippet}`);
      process.exit(1);
    }
  }

  fs.writeFileSync(filePath, html, 'utf-8');
}

console.log('✓ SEO destination pages enriched with human-written territory stories for all five destinations.');
