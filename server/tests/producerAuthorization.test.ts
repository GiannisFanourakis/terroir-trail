import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isActiveProducerOwner } from '../services/producerAuthorization';

test('active producer authorization queries trusted ownership by Firebase UID', async () => {
  const queryArgs: unknown[] = [];
  const db = {
    collection: (name: string) => {
      assert.equal(name, 'producer_owners');
      return {
        where: (...args: unknown[]) => {
          queryArgs.push(...args);
          return {
            get: async () => ({
              docs: [
                { data: () => ({ ownerUid: 'host-uid', status: 'inactive' }) },
                { data: () => ({ ownerUid: 'host-uid', status: 'active' }) },
              ],
            }),
          };
        },
      };
    },
  };

  assert.equal(await isActiveProducerOwner('host-uid', db as any), true);
  assert.deepEqual(queryArgs, ['ownerUid', '==', 'host-uid']);
});

test('producer authorization rejects inactive or mismatched ownership and propagates lookup failures', async () => {
  const inactiveDb = {
    collection: () => ({
      where: () => ({
        get: async () => ({ docs: [
          { data: () => ({ ownerUid: 'host-uid', status: 'inactive' }) },
          { data: () => ({ ownerUid: 'another-uid', status: 'active' }) },
        ] }),
      }),
    }),
  };
  const failingDb = {
    collection: () => ({
      where: () => ({ get: async () => { throw new Error('firestore unavailable'); } }),
    }),
  };

  assert.equal(await isActiveProducerOwner('host-uid', inactiveDb as any), false);
  await assert.rejects(isActiveProducerOwner('host-uid', failingDb as any), /firestore unavailable/);
});
