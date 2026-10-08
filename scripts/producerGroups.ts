import type { Producer } from '../src/types/terroir';

/** A listing can belong to multiple discovery groups without becoming multiple entities. */
export function groupProducersByMembership<K extends string>(
  producers: readonly Producer[],
  keysForProducer: (producer: Producer) => readonly K[]
): Map<K, Producer[]> {
  const groups = new Map<K, Producer[]>();
  for (const producer of producers) {
    for (const key of new Set(keysForProducer(producer))) {
      const group = groups.get(key) ?? [];
      if (!group.some((member) => member.id === producer.id)) group.push(producer);
      groups.set(key, group);
    }
  }
  return groups;
}
