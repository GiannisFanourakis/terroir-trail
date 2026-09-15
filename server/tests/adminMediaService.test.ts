import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AdminMediaError,
  listPendingProducerMedia,
  moderateProducerMedia,
} from '../services/adminMediaService';

const makeHarness = () => {
  const collections = new Map<string, Map<string, Record<string, any>>>();
  let generated = 0;
  const getCollection = (name: string) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name)!;
  };

  const readDoc = (collectionName: string, id: string) => {
    const data = getCollection(collectionName).get(id);
    return { exists: Boolean(data), id, data: () => data };
  };

  const readCollection = (collectionName: string) => ({
    docs: [...getCollection(collectionName).entries()].map(([id, data]) => ({
      id,
      data: () => data,
    })),
  });

  const readQuery = (collectionName: string, filters: Array<{ field: string; value: unknown }>) => ({
    docs: [...getCollection(collectionName).entries()]
      .filter(([, data]) => filters.every((filter) => data[filter.field] === filter.value))
      .map(([id, data]) => ({ id, data: () => data })),
  });

  const db = {
    collection: (name: string) => ({
      doc: (id?: string) => ({
        collectionName: name,
        id: id || `generated-${++generated}`,
        get: async function () {
          return readDoc(this.collectionName, this.id);
        },
      }),
      get: async () => readCollection(name),
      where: (field: string, _operator: string, value: unknown) => {
        const filters = [{ field, value }];
        const chain: any = {
          where: (nextField: string, _nextOperator: string, nextValue: unknown) => {
            filters.push({ field: nextField, value: nextValue });
            return chain;
          },
          get: async () => readQuery(name, filters),
        };
        return chain;
      },
    }),
    runTransaction: async (callback: (transaction: any) => Promise<any>) => {
      const transaction = {
        get: async (ref: any) => readDoc(ref.collectionName, ref.id),
        update: (ref: any, data: Record<string, any>) => {
          const current = getCollection(ref.collectionName).get(ref.id) || {};
          getCollection(ref.collectionName).set(ref.id, { ...current, ...data });
        },
        set: (ref: any, data: Record<string, any>) => {
          getCollection(ref.collectionName).set(ref.id, { ...data });
        },
      };
      return callback(transaction);
    },
  };

  const seedAdmin = (uid: string) => {
    getCollection('admin_users').set(uid, {
      userId: uid,
      level: 'admin',
      status: 'active',
    });
  };

  return { db, getCollection, seedAdmin };
};

const pendingImage = {
  id: 'image-1',
  producerId: 'producer-a',
  url: 'https://firebasestorage.googleapis.com/example/image-1.jpg',
  thumbnailUrl: 'https://firebasestorage.googleapis.com/example/image-1.jpg',
  storagePath: 'producer-media/producer-a/image-1.jpg',
  type: 'cover',
  status: 'pending_review',
  uploadedAt: '2026-09-15T18:30:00.000Z',
  rightsConfirmed: true,
  source: 'host_upload',
};

test('admin can list only pending producer-uploaded photos', async () => {
  const { db, getCollection, seedAdmin } = makeHarness();
  seedAdmin('admin-uid');
  getCollection('producer_registrations').set('producer-a', {
    tradeBrandName: 'Producer A',
  });
  getCollection('producer_overrides').set('producer-a', {
    producerId: 'producer-a',
    uploadedImages: [
      pendingImage,
      { ...pendingImage, id: 'approved', status: 'approved' },
      { ...pendingImage, id: 'other-source', source: 'curated' },
    ],
  });

  const media = await listPendingProducerMedia('admin-uid', db as any);

  assert.equal(media.length, 1);
  assert.equal(media[0].producerName, 'Producer A');
  assert.equal(media[0].imageId, 'image-1');
  assert.equal(media[0].rightsConfirmed, true);
});

test('traveler cannot list or moderate producer photos', async () => {
  const { db } = makeHarness();

  await assert.rejects(
    listPendingProducerMedia('traveler-uid', db as any),
    (error: unknown) => error instanceof AdminMediaError && error.code === 'forbidden'
  );
  await assert.rejects(
    moderateProducerMedia('traveler-uid', 'producer-a', 'image-1', 'approve', '', db as any),
    (error: unknown) => error instanceof AdminMediaError && error.code === 'forbidden'
  );
});

test('admin approval changes only the selected pending photo and writes an audit event', async () => {
  const { db, getCollection, seedAdmin } = makeHarness();
  seedAdmin('admin-uid');
  getCollection('producer_overrides').set('producer-a', {
    producerId: 'producer-a',
    uploadedImages: [pendingImage, { ...pendingImage, id: 'image-2', type: 'gallery' }],
  });

  const result = await moderateProducerMedia(
    'admin-uid',
    'producer-a',
    'image-1',
    'approve',
    '',
    db as any
  );

  assert.equal(result.status, 'approved');
  const images = getCollection('producer_overrides').get('producer-a')?.uploadedImages;
  assert.equal(images[0].status, 'approved');
  assert.equal(images[0].reviewedBy, 'admin-uid');
  assert.equal(images[0].moderationNotes, undefined);
  assert.equal(images[1].status, 'pending_review');
  assert.equal(getCollection('admin_audit').size, 1);
  assert.equal([...getCollection('admin_audit').values()][0].eventType, 'producer_media_approved');
});

test('admin rejection requires a reason and records it on the photo and audit event', async () => {
  const { db, getCollection, seedAdmin } = makeHarness();
  seedAdmin('admin-uid');
  getCollection('producer_overrides').set('producer-a', {
    producerId: 'producer-a',
    uploadedImages: [pendingImage],
  });

  await assert.rejects(
    moderateProducerMedia('admin-uid', 'producer-a', 'image-1', 'reject', 'no', db as any),
    (error: unknown) => error instanceof AdminMediaError && error.code === 'bad_request'
  );

  const result = await moderateProducerMedia(
    'admin-uid',
    'producer-a',
    'image-1',
    'reject',
    'Image does not clearly represent this producer.',
    db as any
  );

  assert.equal(result.status, 'rejected');
  const reviewed = getCollection('producer_overrides').get('producer-a')?.uploadedImages[0];
  assert.equal(reviewed.status, 'rejected');
  assert.equal(reviewed.moderationNotes, 'Image does not clearly represent this producer.');
  assert.equal([...getCollection('admin_audit').values()][0].eventType, 'producer_media_rejected');
});

test('already-reviewed photos cannot be decided twice', async () => {
  const { db, getCollection, seedAdmin } = makeHarness();
  seedAdmin('admin-uid');
  getCollection('producer_overrides').set('producer-a', {
    producerId: 'producer-a',
    uploadedImages: [{ ...pendingImage, status: 'approved' }],
  });

  await assert.rejects(
    moderateProducerMedia('admin-uid', 'producer-a', 'image-1', 'approve', '', db as any),
    (error: unknown) => error instanceof AdminMediaError && error.code === 'conflict'
  );
});
