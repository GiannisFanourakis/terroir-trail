import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

describe('Firestore Security Rules Suite', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-terroir-trail',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  const makeValidBooking = (id: string, userId: string, producerId: string) => ({
    id,
    producerId,
    producerName: 'Estate Alpha',
    producerCategory: 'winery',
    producerLocation: 'Crete, Greece',
    userId,
    userName: 'Traveler One',
    userEmail: 'traveler@example.com',
    userPhone: '+30 690 000 0000',
    date: '2026-06-15',
    timeSlot: '11:00 AM',
    experienceId: 'tasting-1',
    experienceTitle: 'Classic Wine Tasting',
    pricePerPerson: 25,
    guestsCount: 2,
    totalEstimated: 50,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  });

  // 1. Traveler A own booking: allowed
  it('Traveler A own booking: allowed', async () => {
    const travelerA = testEnv.authenticatedContext('traveler-a');
    const db = travelerA.firestore();
    const bookingRef = doc(db, 'bookings', 'booking-a1');

    await assertSucceeds(
      setDoc(bookingRef, makeValidBooking('booking-a1', 'traveler-a', 'producer-a'))
    );

    await assertSucceeds(getDoc(bookingRef));
  });

  // 1b. Injecting arbitrary new fields on booking create: denied
  it('injecting arbitrary new fields on booking create: denied', async () => {
    const travelerA = testEnv.authenticatedContext('traveler-a');
    const db = travelerA.firestore();

    // Injected unknown field 'adminBypass'
    await assertFails(
      setDoc(doc(db, 'bookings', 'booking-arb1'), {
        ...makeValidBooking('booking-arb1', 'traveler-a', 'producer-a'),
        adminBypass: true,
      })
    );

    // Injected unknown field 'isPaid'
    await assertFails(
      setDoc(doc(db, 'bookings', 'booking-arb2'), {
        ...makeValidBooking('booking-arb2', 'traveler-a', 'producer-a'),
        isPaid: true,
      })
    );

    // Injected premature lifecycle field 'confirmedAt'
    await assertFails(
      setDoc(doc(db, 'bookings', 'booking-arb3'), {
        ...makeValidBooking('booking-arb3', 'traveler-a', 'producer-a'),
        confirmedAt: new Date().toISOString(),
      })
    );

    // Mismatched document ID and embedded booking ID
    await assertFails(
      setDoc(doc(db, 'bookings', 'doc-id-differs'), {
        ...makeValidBooking('booking-embedded-id', 'traveler-a', 'producer-a'),
      })
    );
  });

  // 2. Traveler A → Traveler B booking: denied
  it('Traveler A → Traveler B booking: denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(
        doc(adminDb, 'bookings', 'booking-b1'),
        makeValidBooking('booking-b1', 'traveler-b', 'producer-a')
      );
    });

    const travelerA = testEnv.authenticatedContext('traveler-a');
    const db = travelerA.firestore();
    const bDoc = doc(db, 'bookings', 'booking-b1');

    await assertFails(getDoc(bDoc));
    await assertFails(updateDoc(bDoc, { status: 'cancelled' }));
  });

  // 3. anonymous booking: denied
  it('anonymous booking: denied', async () => {
    const anon = testEnv.unauthenticatedContext();
    const db = anon.firestore();
    const bookingRef = doc(db, 'bookings', 'booking-anon');

    await assertFails(
      setDoc(bookingRef, makeValidBooking('booking-anon', 'anon-uid', 'producer-a'))
    );
  });

  // 4. forged booking UID: denied
  it('forged booking UID: denied', async () => {
    const travelerA = testEnv.authenticatedContext('traveler-a');
    const db = travelerA.firestore();
    const bookingRef = doc(db, 'bookings', 'booking-forged');

    await assertFails(
      setDoc(bookingRef, makeValidBooking('booking-forged', 'traveler-b', 'producer-a'))
    );
  });

  // 5. collection-wide booking query: denied
  it('collection-wide booking query: denied', async () => {
    const travelerA = testEnv.authenticatedContext('traveler-a');
    const db = travelerA.firestore();

    await assertFails(getDocs(collection(db, 'bookings')));
  });

  // 6. traveler confirmation/completion or protected-field change: denied
  it('traveler confirmation/completion or protected-field change: denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(
        doc(adminDb, 'bookings', 'booking-t1'),
        makeValidBooking('booking-t1', 'traveler-a', 'producer-a')
      );
    });

    const travelerA = testEnv.authenticatedContext('traveler-a');
    const db = travelerA.firestore();
    const bDoc = doc(db, 'bookings', 'booking-t1');

    // Attempt status escalation
    await assertFails(updateDoc(bDoc, { status: 'confirmed' }));
    await assertFails(updateDoc(bDoc, { status: 'completed' }));

    // Attempt modifying totalEstimated or price during cancellation
    await assertFails(updateDoc(bDoc, { status: 'cancelled', totalEstimated: 0 }));
    await assertFails(updateDoc(bDoc, { status: 'cancelled', userName: 'Hacker' }));

    // Attempt injecting arbitrary new fields during cancellation
    await assertFails(updateDoc(bDoc, { status: 'cancelled', refundRequested: true }));
    await assertFails(updateDoc(bDoc, { status: 'cancelled', customNote: 'please refund' }));
  });

  // 7. traveler pending cancellation: allowed
  it('traveler pending cancellation: allowed', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(
        doc(adminDb, 'bookings', 'booking-t2'),
        makeValidBooking('booking-t2', 'traveler-a', 'producer-a')
      );
    });

    const travelerA = testEnv.authenticatedContext('traveler-a');
    const db = travelerA.firestore();
    const bDoc = doc(db, 'bookings', 'booking-t2');

    await assertSucceeds(updateDoc(bDoc, { status: 'cancelled' }));
  });

  // 8. Host A → Producer A booking query/status transition: allowed
  it('Host A → Producer A booking query/status transition: allowed', async () => {
    // Seed trusted ownership in producer_owners
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'producer_owners', 'producer-a'), {
        producerId: 'producer-a',
        ownerUid: 'host-a',
        status: 'active',
        approvedAt: new Date().toISOString(),
      });
      await setDoc(
        doc(adminDb, 'bookings', 'booking-host1'),
        makeValidBooking('booking-host1', 'traveler-x', 'producer-a')
      );
    });

    const hostA = testEnv.authenticatedContext('host-a');
    const db = hostA.firestore();

    // Host A queries bookings for producer-a
    const q = query(collection(db, 'bookings'), where('producerId', '==', 'producer-a'));
    await assertSucceeds(getDocs(q));

    // Host A transitions pending -> confirmed
    const bDoc = doc(db, 'bookings', 'booking-host1');
    await assertSucceeds(
      updateDoc(bDoc, {
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      })
    );

    // Host A transitions confirmed -> completed
    await assertSucceeds(updateDoc(bDoc, { status: 'completed' }));
  });

  // 8b. Host attempting to inject arbitrary fields or alter booking terms: denied
  it('host injecting arbitrary fields or altering booking terms: denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'producer_owners', 'producer-a'), {
        producerId: 'producer-a',
        ownerUid: 'host-a',
        status: 'active',
        approvedAt: new Date().toISOString(),
      });
      await setDoc(
        doc(adminDb, 'bookings', 'booking-host-tamper'),
        makeValidBooking('booking-host-tamper', 'traveler-x', 'producer-a')
      );
    });

    const hostA = testEnv.authenticatedContext('host-a');
    const db = hostA.firestore();
    const bDoc = doc(db, 'bookings', 'booking-host-tamper');

    // Host attempts to inject arbitrary field 'hostNotes'
    await assertFails(
      updateDoc(bDoc, {
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        hostNotes: 'VIP guest table 4',
      })
    );

    // Host attempts to modify price or guestsCount
    await assertFails(
      updateDoc(bDoc, {
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        pricePerPerson: 999,
      })
    );

    // Host attempts to modify traveler contact info
    await assertFails(
      updateDoc(bDoc, {
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        userEmail: 'hijacked@example.com',
      })
    );
  });

  // 9. Host A → Producer B booking/read/update: denied
  it('Host A → Producer B booking/read/update: denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      // host-a owns producer-a; host-b owns producer-b
      await setDoc(doc(adminDb, 'producer_owners', 'producer-a'), {
        producerId: 'producer-a',
        ownerUid: 'host-a',
        status: 'active',
        approvedAt: new Date().toISOString(),
      });
      await setDoc(doc(adminDb, 'producer_owners', 'producer-b'), {
        producerId: 'producer-b',
        ownerUid: 'host-b',
        status: 'active',
        approvedAt: new Date().toISOString(),
      });
      await setDoc(
        doc(adminDb, 'bookings', 'booking-host-b'),
        makeValidBooking('booking-host-b', 'traveler-x', 'producer-b')
      );
    });

    const hostA = testEnv.authenticatedContext('host-a');
    const db = hostA.firestore();

    // Query for producer-b is denied
    const q = query(collection(db, 'bookings'), where('producerId', '==', 'producer-b'));
    await assertFails(getDocs(q));

    // Direct read or update of producer-b booking is denied
    const bDoc = doc(db, 'bookings', 'booking-host-b');
    await assertFails(getDoc(bDoc));
    await assertFails(updateDoc(bDoc, { status: 'confirmed' }));
  });

  // 10. authorized Producer A override: allowed
  it('authorized Producer A override: allowed', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'producer_owners', 'producer-a'), {
        producerId: 'producer-a',
        ownerUid: 'host-a',
        status: 'active',
        approvedAt: new Date().toISOString(),
      });
    });

    const hostA = testEnv.authenticatedContext('host-a');
    const db = hostA.firestore();
    const ovRef = doc(db, 'producer_overrides', 'producer-a');

    await assertSucceeds(
      setDoc(ovRef, {
        producerId: 'producer-a',
        customNotice: 'Cellar open for harvest!',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
      })
    );

    // Public read is also allowed
    const publicUser = testEnv.unauthenticatedContext();
    await assertSucceeds(getDoc(doc(publicUser.firestore(), 'producer_overrides', 'producer-a')));
  });

  // 11. arbitrary authenticated override: denied
  it('arbitrary authenticated override: denied', async () => {
    const unauthProducer = testEnv.authenticatedContext('random-user');
    const db = unauthProducer.firestore();
    const ovRef = doc(db, 'producer_overrides', 'producer-a');

    await assertFails(
      setDoc(ovRef, {
        producerId: 'producer-a',
        customNotice: 'Hacked notice',
        isAcceptingBookings: false,
        updatedAt: new Date().toISOString(),
      })
    );
  });

  // 12. producerId/document-ID mismatch: denied
  it('producerId/document-ID mismatch: denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'producer_owners', 'producer-a'), {
        producerId: 'producer-a',
        ownerUid: 'host-a',
        status: 'active',
        approvedAt: new Date().toISOString(),
      });
    });

    const hostA = testEnv.authenticatedContext('host-a');
    const db = hostA.firestore();
    const ovRef = doc(db, 'producer_overrides', 'producer-a');

    await assertFails(
      setDoc(ovRef, {
        producerId: 'producer-mismatch',
        customNotice: 'Mismatch notice',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
      })
    );
  });

  // 13. client isProTier mutation: denied
  it('client isProTier mutation: denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'producer_owners', 'producer-a'), {
        producerId: 'producer-a',
        ownerUid: 'host-a',
        status: 'active',
        approvedAt: new Date().toISOString(),
      });
    });

    const hostA = testEnv.authenticatedContext('host-a');
    const db = hostA.firestore();
    const ovRef = doc(db, 'producer_overrides', 'producer-a');

    // Attempt creation with isProTier
    await assertFails(
      setDoc(ovRef, {
        producerId: 'producer-a',
        isAcceptingBookings: true,
        isProTier: true,
        updatedAt: new Date().toISOString(),
      })
    );

    // Create valid override
    await assertSucceeds(
      setDoc(ovRef, {
        producerId: 'producer-a',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
      })
    );

    // Attempt update with isProTier
    await assertFails(updateDoc(ovRef, { isProTier: true }));
  });

  // 14. own pending producer registration: allowed
  it('own pending producer registration: allowed', async () => {
    const applicant = testEnv.authenticatedContext('applicant-1');
    const db = applicant.firestore();
    const regRef = doc(db, 'producer_registrations', 'new-producer');

    await assertSucceeds(
      setDoc(regRef, {
        id: 'new-producer',
        producerId: 'new-producer',
        userId: 'applicant-1',
        tradeBrandName: 'New Producer Winery',
        legalBusinessName: 'New Producer Ltd',
        status: 'pending_verification',
        isVatVerified: false,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  });

  // 15. forged applicant UID: denied
  it('forged applicant UID: denied', async () => {
    const applicant = testEnv.authenticatedContext('applicant-1');
    const db = applicant.firestore();
    const regRef = doc(db, 'producer_registrations', 'forged-producer');

    await assertFails(
      setDoc(regRef, {
        id: 'forged-producer',
        producerId: 'forged-producer',
        userId: 'other-user', // Forged applicant UID
        status: 'pending_verification',
        isVatVerified: false,
        submittedAt: new Date().toISOString(),
      })
    );
  });

  // 16. producer self-approval/status escalation: denied
  it('producer self-approval/status escalation: denied', async () => {
    const applicant = testEnv.authenticatedContext('applicant-1');
    const db = applicant.firestore();
    const regRef = doc(db, 'producer_registrations', 'self-approved-producer');

    // Self-approval on creation is denied
    await assertFails(
      setDoc(regRef, {
        id: 'self-approved-producer',
        producerId: 'self-approved-producer',
        userId: 'applicant-1',
        status: 'verified_active',
        isVatVerified: true,
        submittedAt: new Date().toISOString(),
      })
    );

    // Seed pending registration
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'producer_registrations', 'pending-producer'), {
        id: 'pending-producer',
        producerId: 'pending-producer',
        userId: 'applicant-1',
        status: 'pending_verification',
        isVatVerified: false,
      });
    });

    const pendingRef = doc(db, 'producer_registrations', 'pending-producer');
    // Escalation on update is denied
    await assertFails(updateDoc(pendingRef, { status: 'verified_active' }));
    await assertFails(updateDoc(pendingRef, { isVatVerified: true }));
  });

  // 17. unauthorized registration read: denied
  it('unauthorized registration read: denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'producer_registrations', 'confidential-reg'), {
        id: 'confidential-reg',
        producerId: 'confidential-reg',
        userId: 'applicant-1',
        status: 'pending_verification',
        isVatVerified: false,
        banking: { iban: 'GR123456789' },
      });
    });

    const eavesdropper = testEnv.authenticatedContext('user-2');
    const db = eavesdropper.firestore();
    const regRef = doc(db, 'producer_registrations', 'confidential-reg');

    await assertFails(getDoc(regRef));

    // But the applicant can read their own submission
    const applicant = testEnv.authenticatedContext('applicant-1');
    await assertSucceeds(getDoc(doc(applicant.firestore(), 'producer_registrations', 'confidential-reg')));
  });

  // 18. client ownership-record write: denied
  it('client ownership-record write: denied', async () => {
    const maliciousUser = testEnv.authenticatedContext('malicious-user');
    const db = maliciousUser.firestore();
    const ownerRef = doc(db, 'producer_owners', 'producer-a');

    await assertFails(
      setDoc(ownerRef, {
        producerId: 'producer-a',
        ownerUid: 'malicious-user',
        status: 'active',
        approvedAt: new Date().toISOString(),
      })
    );
  });

  // 19. client user role/isProducer/claimedProducerId/claimStatus escalation: denied
  it('client user role/isProducer/claimedProducerId/claimStatus escalation: denied', async () => {
    const traveler = testEnv.authenticatedContext('traveler-1');
    const db = traveler.firestore();
    const userRef = doc(db, 'users', 'traveler-1');

    // Attempt creation with role: 'producer'
    await assertFails(setDoc(userRef, { name: 'Traveler', role: 'producer' }));
    await assertFails(setDoc(userRef, { name: 'Traveler', isProducer: true }));
    await assertFails(setDoc(userRef, { name: 'Traveler', claimedProducerId: 'producer-a' }));
    await assertFails(setDoc(userRef, { name: 'Traveler', claimStatus: 'verified_host' }));
    await assertFails(setDoc(userRef, { name: 'Traveler', hasExplorerPass: true }));

    // Valid traveler profile creation
    await assertSucceeds(
      setDoc(userRef, {
        name: 'Traveler',
        email: 'traveler@example.com',
        travelerType: 'culinary_nomad',
      })
    );

    // Attempt escalation on update
    await assertFails(updateDoc(userRef, { role: 'producer' }));
    await assertFails(updateDoc(userRef, { isProducer: true }));
    await assertFails(updateDoc(userRef, { claimedProducerId: 'producer-a' }));
    await assertFails(updateDoc(userRef, { claimStatus: 'verified_host' }));
    await assertFails(updateDoc(userRef, { taxDetails: { vatNumber: 'EL123' } }));
    await assertFails(updateDoc(userRef, { hasExplorerPass: true }));

    // Ordinary traveler fields update succeeds
    await assertSucceeds(updateDoc(userRef, { hometown: 'Heraklion', visitedProducers: ['producer-a'] }));
  });

  // 20. explorerPasses client read/write: denied
  it('explorerPasses client read/write: denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'explorerPasses', 'pass-123'), {
        passId: 'pass-123',
        ownerUid: 'traveler-1',
        plan: 'holiday',
      });
    });

    const traveler = testEnv.authenticatedContext('traveler-1');
    const db = traveler.firestore();
    const passRef = doc(db, 'explorerPasses', 'pass-123');

    await assertFails(getDoc(passRef));
    await assertFails(setDoc(doc(db, 'explorerPasses', 'pass-forged'), { plan: 'annual' }));
  });
});
