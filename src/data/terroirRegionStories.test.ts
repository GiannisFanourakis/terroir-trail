import { describe, expect, it } from 'vitest';
import type { Destination } from '../types/terroir';
import { TERROIR_REGIONS } from './terroirRegionCatalogue';
import { TERROIR_REGION_STORIES, withTerroirRegionStory } from './terroirRegionStories';

const destinations: Destination[] = [
  'crete',
  'santorini',
  'peloponnese',
  'northern_greece',
  'thessaly',
  'tuscany',
  'piedmont',
  'puglia',
  'sicily',
  'south_tyrol',
  'provence',
  'catalonia',
  'alentejo',
  'istria',
  'pomurska',
  'southeast_slovenia',
  'central_slovenia',
  'goriska',
  'trondelag',
  'more_og_romsdal',
  'buskerud',
  'vestland',
];

const sectionOrder = ['landscape', 'history', 'culture', 'food', 'explore'];

describe('territory Explore Story coverage', () => {
  it('provides a complete editorial story for every current destination', () => {
    expect(Object.keys(TERROIR_REGION_STORIES).sort()).toEqual([...destinations].sort());

    destinations.forEach((destination) => {
      const story = TERROIR_REGION_STORIES[destination];
      expect(story.summary.length).toBeGreaterThan(80);
      expect(story.highlights.length).toBeGreaterThanOrEqual(3);
      expect(story.sections.map((section) => section.id)).toEqual(sectionOrder);

      story.sections.forEach((section) => {
        expect(section.title.length).toBeGreaterThan(5);
        expect(section.body.length).toBeGreaterThan(120);
        expect(section.highlights?.length ?? 0).toBeGreaterThanOrEqual(3);
      });
    });
  });

  it('replaces editorial copy without changing map geometry or source attribution', () => {
    TERROIR_REGIONS.forEach((region) => {
      const editorialRegion = withTerroirRegionStory(region);
      const story = TERROIR_REGION_STORIES[region.destination];

      expect(editorialRegion.geometry).toBe(region.geometry);
      expect(editorialRegion.sources).toBe(region.sources);
      expect(editorialRegion.boundaryAttribution).toBe(region.boundaryAttribution);
      expect(editorialRegion.summary).toBe(story.summary);
      expect(editorialRegion.sections).toBe(story.sections);
    });
  });
});
