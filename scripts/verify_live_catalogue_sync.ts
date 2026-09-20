import { SEO_PRODUCERS } from './seoCatalogue';
import { buildCatalogueState } from './catalogueState';
import { fetchActiveProducerRows } from './liveCatalogueSource';
import { CATALOGUE_SUMMARY } from '../src/data/catalogueSummary.generated';

const fail = (message: string): never => {
  console.error(`[Live catalogue verification failed] ${message}`);
  process.exit(1);
};

async function verify(): Promise<void> {
  const rows = await fetchActiveProducerRows();
  const { mapRowToProducer } = await import('../src/services/producerService');
  const liveProducers = rows.map((row) => mapRowToProducer(row)).sort((a, b) => a.id.localeCompare(b.id));
  const snapshotProducers = [...SEO_PRODUCERS].sort((a, b) => a.id.localeCompare(b.id));

  const liveIds = liveProducers.map((producer) => producer.id);
  const snapshotIds = snapshotProducers.map((producer) => producer.id);
  const liveIdSet = new Set(liveIds);
  const snapshotIdSet = new Set(snapshotIds);

  const onlyLive = liveIds.filter((id) => !snapshotIdSet.has(id));
  const onlySnapshot = snapshotIds.filter((id) => !liveIdSet.has(id));

  if (onlyLive.length || onlySnapshot.length) {
    fail(
      `Producer ID drift detected. Only live: [${onlyLive.join(', ')}]. Only snapshot: [${onlySnapshot.join(', ')}].`
    );
  }

  const liveState = buildCatalogueState(liveProducers);
  const snapshotState = buildCatalogueState(snapshotProducers);

  if (liveState.catalogueHash !== snapshotState.catalogueHash) {
    fail(
      `Producer content drift detected with identical IDs. Live hash ${liveState.catalogueHash}; snapshot hash ${snapshotState.catalogueHash}.`
    );
  }

  const summaryMetrics = {
    producers: CATALOGUE_SUMMARY.producers,
    destinations: CATALOGUE_SUMMARY.destinations,
    countries: CATALOGUE_SUMMARY.countries,
    regions: CATALOGUE_SUMMARY.regions,
    categories: CATALOGUE_SUMMARY.categories,
  };
  const liveMetrics = {
    producers: liveState.producers,
    destinations: liveState.destinations,
    countries: liveState.countries,
    regions: liveState.regions,
    categories: liveState.categories,
  };

  if (JSON.stringify(summaryMetrics) !== JSON.stringify(liveMetrics)) {
    fail(
      `Public catalogue summary drift detected. Summary ${JSON.stringify(summaryMetrics)}; live ${JSON.stringify(liveMetrics)}.`
    );
  }

  const liveCountryNames = Array.from(
    new Set(liveProducers.map((producer) => producer.country).filter(Boolean))
  ).sort((a, b) => String(a).localeCompare(String(b)));
  if (JSON.stringify(CATALOGUE_SUMMARY.countryNames) !== JSON.stringify(liveCountryNames)) {
    fail('Public catalogue country-name summary is out of sync with the active catalogue.');
  }

  console.log(
    `Live catalogue synchronized exactly: ${liveState.producers} producers / ${liveState.destinations} destinations / ${liveState.countries} countries / ${liveState.regions} regions / ${liveState.categories} categories / hash ${liveState.catalogueHash.slice(0, 12)}…`
  );
}

verify().catch((error) => fail(error instanceof Error ? error.message : String(error)));
