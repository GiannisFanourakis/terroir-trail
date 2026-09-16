import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

describe('Traveler profile isolation and community review rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-terroir-trail-review-rules',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', 'traveler-a'), {
        name: 'Traveler A',
        visitedProducers: ['producer-a'],
        personalNotes: { 'producer-a': 'Private A note' },
        favoriteProducerIds: ['producer-a'],
      });
      await setDoc(doc(db, 'users', 'traveler-b'), {
        name: 'Traveler B',
        visitedProducers: ['producer-b'],
        personalNotes: { 'producer-b': 'Private B note' },
        favoriteProducerIds: ['producer-b'],
      });
      await setDoc(doc(db, 'producer_reviews', 'server-review'), {
        producerId: 'producer-a',
        travelerUid: 'traveler-a',
        travelerName: 'Traveler A',
        rating: 5,
        comment: 'Server-created review',
        status: 'published',
      });
      await setDoc(doc(db, 'review_reports', 'server-report'), {
        reviewId: 'server-review',
        reporterUid: 'traveler-b',
        reason: 'other',
        status: 'pending',
      });
    });
  });

  it('traveler can read and update only their own private profile state', async () => {
    const travelerA = testEnv.authenticatedContext('traveler-a').firestore();

    await assertSucceeds(getDoc(doc(travelerA, 'users', 'traveler-a')));
    await assertSucceeds(updateDoc(doc(travelerA, 'users', 'traveler-a'), {
      favoriteProducerIds: ['producer-a', 'producer-c'],
      visitedProducers: ['producer-a', 'producer-c'],
      personalNotes: { 'producer-c': 'My own note' },
    }));

    await assertFails(getDoc(doc(travelerA, 'users', 'traveler-b')));
    await assertFails(updateDoc(doc(travelerA, 'users', 'traveler-b'), {
      favoriteProducerIds: ['producer-a'],
    }));
  });

  it('anonymous clients cannot read traveler Passport, notes or favorites', async () => {
    const anonymous = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anonymous, 'users', 'traveler-a')));
  });

  it('favorites field must remain a bounded list', async () => {
    const travelerA = testEnv.authenticatedContext('traveler-a').firestore();

    await assertFails(updateDoc(doc(travelerA, 'users', 'traveler-a'), {
      favoriteProducerIds: 'producer-a',
    }));

    await assertFails(updateDoc(doc(travelerA, 'users', 'traveler-a'), {
      favoriteProducerIds: Array.from({ length: 501 }, (_, index) => `producer-${index}`),
    }));
  });

  it('review and report collections are inaccessible directly from browser clients', async () => {
    const travelerA = testEnv.authenticatedContext('traveler-a').firestore();
    const hostA = testEnv.authenticatedContext('host-a').firestore();
    const anonymous = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(travelerA, 'producer_reviews', 'server-review')));
    await assertFails(getDoc(doc(anonymous, 'producer_reviews', 'server-review')));
    await assertFails(setDoc(doc(travelerA, 'producer_reviews', 'forged-review'), {
      producerId: 'producer-a',
      travelerUid: 'traveler-a',
      rating: 5,
      comment: 'Direct write attempt',
    }));
    await assertFails(updateDoc(doc(hostA, 'producer_reviews', 'server-review'), {
      hostReply: { comment: 'Direct Host reply attempt' },
    }));
    await assertFails(getDoc(doc(travelerA, 'review_reports', 'server-report')));
    await assertFails(setDoc(doc(travelerA, 'review_reports', 'forged-report'), {
      reviewId: 'server-review',
      reporterUid: 'traveler-a',
      reason: 'spam',
    }));
  });
});
