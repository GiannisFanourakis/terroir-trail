import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ProducerListingChangeError,
  sanitizeProducerListingChanges,
  submitProducerListingChanges,
} from '../services/producerListingChangeService';

test('producer listing change sanitizer accepts only review-controlled public fields', () => {
  assert.deepEqual(sanitizeProducerListingChanges({
    tagLine: '  Family olive oil since 1952  ',
    tastingHighlights: [' Koroneiki EVOO ', ' Table olives '],
    website: 'https://example.com/visits',
    foodOption: 'tasting_board',
    dogFriendly: true,
    walkIn: false,
  }), {
    tagLine: 'Family olive oil since 1952',
    website: 'https://example.com/visits',
    tastingHighlights: ['Koroneiki EVOO', 'Table olives'],
    foodOption: 'tasting_board',
    dogFriendly: true,
    walkIn: false,
  });
});

test('producer listing change sanitizer rejects protected identity and verification fields', () => {
  assert.throws(
    () => sanitizeProducerListingChanges({ name: 'Replacement identity', coordinates: [0, 0] }),
    (error: unknown) => error instanceof ProducerListingChangeError && error.code === 'bad_request'
  );
});

test('producer listing change sanitizer rejects invalid website and blank change sets', () => {
  assert.throws(() => sanitizeProducerListingChanges({ website: 'javascript:alert(1)' }), ProducerListingChangeError);
  assert.throws(() => sanitizeProducerListingChanges({}), ProducerListingChangeError);
});

test('frozen Host cannot submit reviewed public listing changes even with active ownership', async () => {
  const db = {
    collection: (name: string) => {
      if (name === 'admin_users') {
        return { doc: () => ({ get: async () => ({ exists: false, data: () => undefined }) }) };
      }
      if (name === 'account_controls') {
        return {
          doc: () => ({
            get: async () => ({ exists: true, data: () => ({ hostEditingFrozen: true }) }),
          }),
        };
      }
      if (name === 'producer_owners') {
        return {
          where: () => ({
            get: async () => ({
              docs: [{
                id: 'producer-a',
                data: () => ({ producerId: 'producer-a', ownerUid: 'host-a', status: 'active' }),
              }],
            }),
          }),
        };
      }
      throw new Error(`Unexpected collection after freeze guard: ${name}`);
    },
  };

  await assert.rejects(
    submitProducerListingChanges(
      'host-a',
      'host@example.com',
      'producer-a',
      { tagLine: 'Attempted change' },
      db as any
    ),
    (error: unknown) =>
      error instanceof ProducerListingChangeError &&
      error.code === 'forbidden' &&
      /temporarily unavailable/.test(error.message)
  );
});
