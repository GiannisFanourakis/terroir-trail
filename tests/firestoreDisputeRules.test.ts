import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

describe('Firestore host dispute freeze rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-terroir-trail-disputes',
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
  });

  const seedHost = async (frozen: boolean) => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      await setDoc(doc(db, 'producer_owners', 'producer-a'), {
        producerId: 'producer-a',
        ownerUid: 'host-a',
        status: 'active',
      });
      if (frozen) {
        await setDoc(doc(db, 'account_controls', 'host-a'), {
          userId: 'host-a',
          hostEditingFrozen: true,
          freezeReason: 'Ownership dispute under review',
        });
      }
      await setDoc(doc(db, 'producer_overrides', 'producer-a'), {
        producerId: 'producer-a',
        customNotice: 'Current visitor notice',
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'bookings', 'booking-a'), {
        id: 'booking-a',
        producerId: 'producer-a',
        producerName: 'Producer A',
        producerCategory: 'winery',
        producerLocation: 'Crete, Greece',
        userId: 'traveler-a',
        userName: 'Traveler',
        userEmail: 'traveler@example.com',
        userPhone: '+30 690 000 0000',
        date: '2026-09-20',
        timeSlot: '11:00',
        experienceId: 'experience-a',
        experienceTitle: 'Visit',
        pricePerPerson: 0,
        guestsCount: 2,
        totalEstimated: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    });
  };

  it('frozen Host keeps read visibility but cannot write operational listing or booking state', async () => {
    await seedHost(true);
    const host = testEnv.authenticatedContext('host-a').firestore();

    await assertSucceeds(getDoc(doc(host, 'producer_owners', 'producer-a')));
    await assertSucceeds(getDoc(doc(host, 'producer_overrides', 'producer-a')));
    await assertSucceeds(getDoc(doc(host, 'bookings', 'booking-a')));

    await assertFails(updateDoc(doc(host, 'producer_overrides', 'producer-a'), {
      customNotice: 'Attempted disputed edit',
      updatedAt: new Date().toISOString(),
    }));
    await assertFails(updateDoc(doc(host, 'bookings', 'booking-a'), {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
    }));
  });

  it('account control records remain server-only even for the affected Host', async () => {
    await seedHost(true);
    const host = testEnv.authenticatedContext('host-a').firestore();

    await assertFails(getDoc(doc(host, 'account_controls', 'host-a')));
    await assertFails(updateDoc(doc(host, 'account_controls', 'host-a'), {
      hostEditingFrozen: false,
    }));
  });

  it('active Host without a dispute freeze retains approved operational write access', async () => {
    await seedHost(false);
    const host = testEnv.authenticatedContext('host-a').firestore();

    await assertSucceeds(updateDoc(doc(host, 'producer_overrides', 'producer-a'), {
      customNotice: 'Harvest visits by appointment',
      updatedAt: new Date().toISOString(),
    }));
    await assertSucceeds(updateDoc(doc(host, 'bookings', 'booking-a'), {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
    }));
  });
});
