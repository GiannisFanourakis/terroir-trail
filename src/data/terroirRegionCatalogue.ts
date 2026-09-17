import { TERROIR_REGIONS as BASE_TERROIR_REGIONS } from './terroirRegions';
import { THESSALY_TERROIR_REGION } from './thessalyRegion';
import { PIEDMONT_TERROIR_REGION } from './piedmontRegion';
import { PUGLIA_TERROIR_REGION } from './regions/pugliaRegion';
import { SICILY_TERROIR_REGION } from './regions/sicilyRegion';
import { SOUTH_TYROL_TERROIR_REGION } from './regions/southTyrolRegion';
import { PROVENCE_TERROIR_REGION } from './regions/provenceRegion';
import { CATALONIA_TERROIR_REGION } from './regions/cataloniaRegion';
import { ALENTEJO_TERROIR_REGION } from './regions/alentejoRegion';
import { ISTRIA_TERROIR_REGION } from './regions/istriaRegion';
import { POMURSKA_TERROIR_REGION } from './regions/pomurskaRegion';
import { SOUTHEAST_SLOVENIA_TERROIR_REGION } from './regions/southeastSloveniaRegion';
import { CENTRAL_SLOVENIA_TERROIR_REGION } from './regions/centralSloveniaRegion';
import { GORISKA_TERROIR_REGION } from './regions/goriskaRegion';
import { TRONDELAG_TERROIR_REGION } from './regions/trondelagRegion';
import { MORE_OG_ROMSDAL_TERROIR_REGION } from './regions/moreOgRomsdalRegion';
import { BUSKERUD_TERROIR_REGION } from './regions/buskerudRegion';
import { VESTLAND_TERROIR_REGION } from './regions/vestlandRegion';

export type {
  TerroirRegion,
  TerroirRegionSection,
  TerroirRegionSource,
} from './terroirRegions';

/**
 * App-facing region catalogue. Integrates all 22 first-class TerroirTrail destinations:
 * - 5 Greece: Crete, Santorini, Peloponnese, Northern Greece, Thessaly
 * - 5 Italy: Tuscany, Piedmont, Puglia, Sicily, South Tyrol
 * - 1 France: Provence-Alpes-Côte d'Azur
 * - 1 Spain: Catalonia
 * - 1 Portugal: Alentejo
 * - 1 Croatia: Istria
 * - 4 Slovenia: Pomurska, Southeast Slovenia, Central Slovenia, Goriška
 * - 4 Norway: Trøndelag, Møre og Romsdal, Buskerud, Vestland
 */
export const TERROIR_REGIONS = [
  ...BASE_TERROIR_REGIONS,
  THESSALY_TERROIR_REGION,
  PIEDMONT_TERROIR_REGION,
  PUGLIA_TERROIR_REGION,
  SICILY_TERROIR_REGION,
  SOUTH_TYROL_TERROIR_REGION,
  PROVENCE_TERROIR_REGION,
  CATALONIA_TERROIR_REGION,
  ALENTEJO_TERROIR_REGION,
  ISTRIA_TERROIR_REGION,
  POMURSKA_TERROIR_REGION,
  SOUTHEAST_SLOVENIA_TERROIR_REGION,
  CENTRAL_SLOVENIA_TERROIR_REGION,
  GORISKA_TERROIR_REGION,
  TRONDELAG_TERROIR_REGION,
  MORE_OG_ROMSDAL_TERROIR_REGION,
  BUSKERUD_TERROIR_REGION,
  VESTLAND_TERROIR_REGION,
];
