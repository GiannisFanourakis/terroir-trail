import { createHash } from 'node:crypto';
import type { Producer } from '../src/types/terroir';

export type CatalogueState = {
  schemaVersion: 1;
  catalogueHash: string;
  producers: number;
  destinations: number;
  countries: number;
  regions: number;
  categories: number;
};

export function sortCatalogue(producers: readonly Producer[]): Producer[] {
  return [...producers].sort((a, b) => a.id.localeCompare(b.id));
}

export function computeCatalogueHash(producers: readonly Producer[]): string {
  const canonical = JSON.stringify(sortCatalogue(producers));
  return createHash('sha256').update(canonical).digest('hex');
}

export function buildCatalogueState(producers: readonly Producer[]): CatalogueState {
  const sorted = sortCatalogue(producers);
  return {
    schemaVersion: 1,
    catalogueHash: computeCatalogueHash(sorted),
    producers: sorted.length,
    destinations: new Set(sorted.map((producer) => producer.destination)).size,
    countries: new Set(sorted.map((producer) => producer.countryCode).filter(Boolean)).size,
    regions: new Set(sorted.map((producer) => producer.region)).size,
    categories: new Set(sorted.map((producer) => producer.category)).size,
  };
}
