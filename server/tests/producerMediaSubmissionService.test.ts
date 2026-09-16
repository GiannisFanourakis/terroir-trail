import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ProducerMediaSubmissionError,
  replaceOwnedProducerMedia,
} from '../services/producerMediaSubmissionService';

test('frozen Host cannot submit producer media metadata even with active ownership', async () => {
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
    replaceOwnedProducerMedia(
      'host-a',
      'producer-a',
      [{
        id: 'image-a',
        producerId: 'producer-a',
        url: 'https://firebasestorage.googleapis.com/v0/b/test/o/image.jpg',
        storagePath: 'producer-media/producer-a/image.jpg',
        type: 'cover',
        uploadedAt: '2026-09-16T05:00:00.000Z',
        rightsConfirmed: true,
        source: 'host_upload',
      }],
      db as any
    ),
    (error: unknown) =>
      error instanceof ProducerMediaSubmissionError &&
      error.code === 'forbidden' &&
      /temporarily unavailable/.test(error.message)
  );
});
