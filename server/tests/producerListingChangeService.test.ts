import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ProducerListingChangeError,
  sanitizeProducerListingChanges,
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
