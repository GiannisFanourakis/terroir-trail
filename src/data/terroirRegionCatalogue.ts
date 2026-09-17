import { TERROIR_REGIONS as BASE_TERROIR_REGIONS } from './terroirRegions';
import { THESSALY_TERROIR_REGION } from './thessalyRegion';
import { PIEDMONT_TERROIR_REGION } from './piedmontRegion';

export type {
  TerroirRegion,
  TerroirRegionSection,
  TerroirRegionSource,
} from './terroirRegions';

/**
 * App-facing region catalogue. New regions can be added without touching the
 * large legacy boundary bundle in terroirRegions.ts.
 */
export const TERROIR_REGIONS = [
  ...BASE_TERROIR_REGIONS,
  THESSALY_TERROIR_REGION,
  PIEDMONT_TERROIR_REGION,
];
