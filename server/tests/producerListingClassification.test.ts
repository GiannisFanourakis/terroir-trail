import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ProducerListingChangeError, sanitizeProducerListingChanges, validateListingClassification,
  type ProducerListingChanges,
  submitProducerListingChanges, reviewProducerListingChange,
} from '../services/producerListingChangeService';
import { applyTripPackClassification } from '../services/tripPackService';

const changes: Required<Pick<ProducerListingChanges, 'additionalCategories' | 'productSections' | 'classificationSourceUrl'>> = {
  additionalCategories: ['olive_mill'],
  productSections: [
    { category: 'winery', specialties: ['Estate wine'] },
    { category: 'olive_mill', specialties: ['Estate oil'] },
  ],
  classificationSourceUrl: 'https://example.test/estate-products',
};

function memoryDb() {
  const records = new Map<string, Record<string, any>>([
    ['admin_users/admin', { userId: 'admin', level: 'admin', status: 'active' }],
    ['producer_owners/producer-a', { producerId: 'producer-a', ownerUid: 'host', status: 'active' }],
    ['producer_registrations/producer-a', { tradeBrandName: 'Estate A' }],
  ]);
  let count = 0;
  const snapshot = (path: string) => ({
    id: path.split('/').at(-1)!, exists: records.has(path),
    data: () => records.get(path),
  });
  const query = (name: string, filters: Array<[string, unknown]> = []): any => ({
    where: (field: string, _operator: string, value: unknown) => query(name, [...filters, [field, value]]),
    get: async () => ({
      docs: [...records.keys()].filter(path => path.startsWith(name + '/') &&
        filters.every(([field, value]) => records.get(path)?.[field] === value)).map(snapshot),
    }),
  });
  const db: any = {
    collection: (name: string) => ({
      ...query(name),
      doc: (id = 'auto-' + (++count)) => ({ id, path: name + '/' + id, get: async () => snapshot(name + '/' + id) }),
    }),
    runTransaction: async (callback: any) => {
      const writes: Array<() => void> = [];
      const result = await callback({
        get: async (ref: any) => snapshot(ref.path),
        set: (ref: any, value: any, options?: any) => writes.push(() =>
          records.set(ref.path, { ...(options?.merge ? records.get(ref.path) : {}), ...value })),
        update: (ref: any, value: any) => writes.push(() =>
          records.set(ref.path, { ...records.get(ref.path), ...value })),
      });
      writes.forEach(write => write());
      return result;
    },
  };
  return { db, records };
}

test('structured listing sanitizer accepts bounded maker groups and requires an official source', () => {
  assert.deepEqual(sanitizeProducerListingChanges(changes), changes);
  for (const input of [
    { ...changes, classificationSourceUrl: '' },
    { ...changes, classificationSourceUrl: 'javascript:alert(1)' },
    { ...changes, additionalCategories: ['museum'] },
    { ...changes, productSections: [{ category: 'museum', specialties: ['Artifacts'] }] },
    { ...changes, productSections: [{ category: 'olive_mill', specialties: [''] }] },
    { ...changes, productSections: [{ category: 'olive_mill', specialties: Array(21).fill('Oil') }] },
    { ...changes, productSections: [changes.productSections[0], changes.productSections[0]] },
    { ...changes, category: 'farm' },
  ]) assert.throws(() => sanitizeProducerListingChanges(input), ProducerListingChangeError);
});

test('group membership is checked against the immutable primary and proposed extra categories', () => {
  validateListingClassification(sanitizeProducerListingChanges(changes), 'winery');
  assert.throws(() => validateListingClassification({ additionalCategories: ['winery'], productSections: [] }, 'winery'), ProducerListingChangeError);
  assert.throws(() => validateListingClassification({ additionalCategories: [], productSections: changes.productSections }, 'winery'), ProducerListingChangeError);
});

test('pending Host categories stay private; only trusted Admin approval publishes them atomically', async () => {
  const { db, records } = memoryDb();
  const request = await submitProducerListingChanges('host', 'host@example.test', 'producer-a', changes, db, async () => 'winery');
  assert.equal(request.status, 'pending_review');
  assert.equal(request.classificationPrimaryCategory, 'winery');
  assert.equal(records.has('producer_overrides/producer-a'), false);
  await assert.rejects(
    reviewProducerListingChange('host', request.id, 'approve', '', db, async () => 'winery'),
    (error: unknown) => error instanceof ProducerListingChangeError && error.code === 'forbidden'
  );
  await reviewProducerListingChange('admin', request.id, 'approve', '', db, async () => 'winery');
  const override = records.get('producer_overrides/producer-a')!;
  assert.deepEqual(override.additionalCategories, ['olive_mill']);
  assert.deepEqual(override.productSections, changes.productSections);
  assert.equal(override.classificationPrimaryCategory, 'winery');
  assert.equal(records.get('producer_listing_change_requests/' + request.id)?.status, 'approved');
  assert.equal([...records.values()].filter(value => value.eventType === 'producer_listing_change_approved').length, 1);
  await assert.rejects(reviewProducerListingChange('admin', request.id, 'approve', '', db, async () => 'winery'), ProducerListingChangeError);
});

test('a primary-category change after submission blocks approval without publishing any field', async () => {
  const { db, records } = memoryDb();
  const request = await submitProducerListingChanges('host', undefined, 'producer-a', changes, db, async () => 'winery');
  await assert.rejects(
    reviewProducerListingChange('admin', request.id, 'approve', '', db, async () => 'farm'),
    (error: unknown) => error instanceof ProducerListingChangeError && error.code === 'conflict'
  );
  assert.equal(records.has('producer_overrides/producer-a'), false);
  assert.equal(records.get('producer_listing_change_requests/' + request.id)?.status, 'pending_review');
});

test('rejection needs no live classification lookup and leaves the public listing untouched', async () => {
  const { db, records } = memoryDb();
  const request = await submitProducerListingChanges('host', undefined, 'producer-a', changes, db, async () => 'winery');
  await reviewProducerListingChange('admin', request.id, 'reject', 'Official source does not support this activity.', db,
    async () => { throw new Error('must not query on rejection'); });
  assert.equal(records.has('producer_overrides/producer-a'), false);
  assert.equal(records.get('producer_listing_change_requests/' + request.id)?.status, 'rejected');
});

test('a non-owner cannot submit categories or trigger live catalogue lookups', async () => {
  const { db } = memoryDb();
  await assert.rejects(submitProducerListingChanges('traveler', undefined, 'producer-a', changes, db,
    async () => { throw new Error('must not query before authorization'); }), ProducerListingChangeError);
});

test('trip export projects approved categories and ignores pending or stale classifications', () => {
  const row = { id: 'producer-a', category: 'winery', additional_categories: [] } as any;
  const override = {
    producerId: 'producer-a', classificationPrimaryCategory: 'winery', ...changes,
    listingContentReviewedAt: '2026-10-09T00:00:00Z', updatedAt: '2026-10-09T00:00:00Z', isAcceptingBookings: false,
  } as any;
  assert.deepEqual(applyTripPackClassification([row], { 'producer-a': override })[0].additional_categories, ['olive_mill']);
  assert.deepEqual(applyTripPackClassification([row], { 'producer-a': { ...override, listingContentReviewedAt: undefined } })[0].additional_categories, []);
  assert.deepEqual(applyTripPackClassification([row], { 'producer-a': { ...override, classificationPrimaryCategory: 'farm' } })[0].additional_categories, []);
});
