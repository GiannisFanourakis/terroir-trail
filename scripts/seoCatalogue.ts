import type { Producer } from '../src/types/terroir';
import { DESTINATION_GEOGRAPHY, SUPPORTED_COUNTRIES, SUPPORTED_COUNTRY_CODES } from '../src/config/geography';
import { CATALOGUE_REVIEWED_AT } from '../src/data/catalogueMetadata';
import { SEO_LIVE_PRODUCERS } from './seoLiveCatalogue.generated';

/**
 * Static, deterministic catalogue used by SEO/AEO generation and verification.
 * Production deployment refreshes this snapshot from the same live Supabase
 * public.producers catalogue consumed by the application.
 */
export const SEO_PRODUCERS: Producer[] = SEO_LIVE_PRODUCERS;

const countBy = (values: readonly string[]): Record<string, number> =>
  values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});

const activeCountries = SEO_PRODUCERS
  .map((producer) => producer.country)
  .filter((country): country is string => Boolean(country));
const activeCountryCodes = SEO_PRODUCERS
  .map((producer) => producer.countryCode)
  .filter((countryCode): countryCode is string => Boolean(countryCode));

const countryCounts = countBy(activeCountries);
const countryCodeCounts = countBy(activeCountryCodes);
const destinationCounts = countBy(SEO_PRODUCERS.map((producer) => producer.destination));
const regionCounts = countBy(SEO_PRODUCERS.map((producer) => producer.region));
const categoryCounts = countBy(SEO_PRODUCERS.map((producer) => producer.category));

export const LIVE_CATALOGUE_METRICS = {
  verifiedAt: CATALOGUE_REVIEWED_AT,
  totalProducers: SEO_PRODUCERS.length,
  destinationCount: Object.keys(destinationCounts).length,
  countryCount: Object.keys(countryCodeCounts).length,
  regionCount: Object.keys(regionCounts).length,
  categoryCount: Object.keys(categoryCounts).length,
  countryCounts,
  countryCodeCounts,
  destinationCounts,
  regionCounts,
  categoryCounts,
} as const;

export const SEO_DESTINATION_LABELS: Record<Producer['destination'], string> = {
  crete: 'Crete',
  santorini: 'Santorini',
  peloponnese: 'Peloponnese',
  thessaly: 'Thessaly',
  northern_greece: 'Macedonia, Greece',
  tuscany: 'Tuscany',
  piedmont: 'Piedmont',
  puglia: 'Puglia',
  sicily: 'Sicily',
  south_tyrol: 'South Tyrol',
  provence: "Provence-Alpes-Côte d'Azur",
  catalonia: 'Catalonia',
  alentejo: 'Alentejo',
  istria: 'Istria',
  pomurska: 'Pomurska',
  southeast_slovenia: 'Southeast Slovenia',
  central_slovenia: 'Central Slovenia',
  goriska: 'Goriška',
  trondelag: 'Trøndelag',
  more_og_romsdal: 'Møre og Romsdal',
  buskerud: 'Buskerud',
  vestland: 'Vestland',
};

export const LIVE_COUNTRY_NAMES = SUPPORTED_COUNTRY_CODES
  .filter((code) => (LIVE_CATALOGUE_METRICS.countryCodeCounts[code] ?? 0) > 0)
  .map((code) => SUPPORTED_COUNTRIES[code].name);

export const buildCatalogueCountryBreakdownLines = (): string[] =>
  SUPPORTED_COUNTRY_CODES.flatMap((code) => {
    const countryProducers = SEO_PRODUCERS.filter((producer) => producer.countryCode === code);
    if (countryProducers.length === 0) return [];

    const destinations = Array.from(
      new Set(countryProducers.map((producer) => producer.destination))
    ).sort((a, b) => SEO_DESTINATION_LABELS[a].localeCompare(SEO_DESTINATION_LABELS[b]));

    const destinationSummary = destinations
      .map((destination) => {
        const count = countryProducers.filter((producer) => producer.destination === destination).length;
        return `${SEO_DESTINATION_LABELS[destination]} ${count}`;
      })
      .join(', ');

    const label = countryProducers.length === 1 ? 'record' : 'records';
    return [`- ${SUPPORTED_COUNTRIES[code].name} — ${countryProducers.length} ${label}: ${destinationSummary}.`];
  });

for (const producer of SEO_PRODUCERS) {
  if (!DESTINATION_GEOGRAPHY[producer.destination]) {
    throw new Error(`Missing DESTINATION_GEOGRAPHY metadata for ${producer.destination}.`);
  }
}
