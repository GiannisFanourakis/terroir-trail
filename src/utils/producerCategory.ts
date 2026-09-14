import { Category, Producer } from '../types/terroir';

export const LEGACY_PESKESI_FARM_ID = 'peskesi-farm-kazani';

/**
 * Returns the category the discovery UI should use while legacy catalogue rows
 * are being migrated to first-class taxonomy.
 *
 * Peskesi is a farm, not a rakokazano. The compatibility mapping can be removed
 * once every live and bundled data source stores it as `farm`.
 */
export function getEffectiveProducerCategory(
  producer: Pick<Producer, 'id' | 'category'>
): Category {
  if (
    producer.id === LEGACY_PESKESI_FARM_ID &&
    producer.category === 'kazani'
  ) {
    return 'farm';
  }

  return producer.category;
}
