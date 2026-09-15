import type { Category, Producer } from '../types/terroir';

export interface RegionCoverageRow {
  region: string;
  total: number;
  byCategory: Record<string, number>;
}

export interface AdminCatalogueMetrics {
  totalProducers: number;
  needsVerification: number;
  locationNeedsReview: number;
  visitabilityNotConfirmed: number;
  roadAccessNotConfirmed: number;
  missingGooglePlaceIds: number;
  missingBundledCoverImages: number;
  greekProducers: number;
  categories: Category[];
  coverageByRegion: RegionCoverageRow[];
}

const verifiedLocationStates = new Set(['verified_location', 'verified_entrance']);
const confirmedVisitStates = new Set(['public_visits', 'seasonal_public', 'appointment_only']);

const isGreekProducer = (producer: Producer) =>
  producer.countryCode === 'GR' ||
  producer.country === 'Greece' ||
  producer.destination !== 'tuscany';

export function buildAdminCatalogueMetrics(producers: Producer[]): AdminCatalogueMetrics {
  const locationNeedsReview = producers.filter(
    (producer) => !verifiedLocationStates.has(String(producer.locationStatus || 'unreviewed'))
  ).length;

  const missingGooglePlaceIds = producers.filter(
    (producer) => !producer.googlePlaceId?.trim()
  ).length;

  const needsVerification = producers.filter(
    (producer) =>
      !verifiedLocationStates.has(String(producer.locationStatus || 'unreviewed')) ||
      !producer.googlePlaceId?.trim()
  ).length;

  const visitabilityNotConfirmed = producers.filter(
    (producer) => !confirmedVisitStates.has(String(producer.visitStatus || 'unreviewed'))
  ).length;

  const roadAccessNotConfirmed = producers.filter(
    (producer) => String(producer.roadAccessStatus || 'unreviewed') !== 'verified'
  ).length;

  const missingBundledCoverImages = producers.filter(
    (producer) => !producer.coverImage?.trim()
  ).length;

  const greek = producers.filter(isGreekProducer);
  const categories = [...new Set(greek.map((producer) => producer.category))].sort() as Category[];
  const regionMap = new Map<string, RegionCoverageRow>();

  for (const producer of greek) {
    const region = producer.region?.trim() || 'Unspecified';
    if (!regionMap.has(region)) {
      regionMap.set(region, { region, total: 0, byCategory: {} });
    }
    const row = regionMap.get(region)!;
    row.total += 1;
    row.byCategory[producer.category] = (row.byCategory[producer.category] || 0) + 1;
  }

  return {
    totalProducers: producers.length,
    needsVerification,
    locationNeedsReview,
    visitabilityNotConfirmed,
    roadAccessNotConfirmed,
    missingGooglePlaceIds,
    missingBundledCoverImages,
    greekProducers: greek.length,
    categories,
    coverageByRegion: [...regionMap.values()].sort((a, b) => a.region.localeCompare(b.region)),
  };
}
