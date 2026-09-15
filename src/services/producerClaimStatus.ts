import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

export type ProducerClaimBusinessStatus =
  | 'verified'
  | 'needs_review'
  | 'failed'
  | 'manual_required'
  | 'unavailable';

export type ProducerClaimContactStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'unavailable';

export interface OwnProducerClaimStatus {
  producerId: string;
  tradeBrandName: string;
  status: string;
  officialEmail?: string;
  legalBusinessName?: string;
  vatNumber?: string;
  countryCode?: string;
  submittedAt?: string;
  businessVerificationStatus?: ProducerClaimBusinessStatus;
  businessVerificationProvider?: 'vies' | 'manual';
  businessVerificationReason?: string;
  businessVerificationRegistryName?: string;
  businessVerificationNameMatch?: 'match' | 'mismatch' | 'unavailable';
  contactVerificationStatus?: ProducerClaimContactStatus;
  contactVerifiedAt?: string;
  verificationReadyForAdminReview?: boolean;
}

export async function fetchOwnProducerClaimStatus(): Promise<OwnProducerClaimStatus | null> {
  if (!isFirebaseConfigured || !db) return null;
  await auth?.authStateReady();
  const uid = auth?.currentUser?.uid;
  if (!uid) return null;

  const snapshot = await getDocs(
    query(collection(db, 'producer_registrations'), where('userId', '==', uid))
  );

  if (snapshot.empty) return null;

  const registrations = snapshot.docs
    .map(document => {
      const data = document.data();
      return {
        producerId: String(data.producerId || document.id),
        tradeBrandName: String(data.tradeBrandName || data.producerName || 'Producer'),
        status: String(data.status || 'pending_verification'),
        officialEmail: data.officialEmail ? String(data.officialEmail) : undefined,
        legalBusinessName: data.legalBusinessName ? String(data.legalBusinessName) : undefined,
        vatNumber: data.vatNumber ? String(data.vatNumber) : undefined,
        countryCode: data.countryCode ? String(data.countryCode) : undefined,
        submittedAt: data.submittedAt ? String(data.submittedAt) : undefined,
        businessVerificationStatus: data.businessVerificationStatus as ProducerClaimBusinessStatus | undefined,
        businessVerificationProvider: data.businessVerificationProvider as 'vies' | 'manual' | undefined,
        businessVerificationReason: data.businessVerificationReason ? String(data.businessVerificationReason) : undefined,
        businessVerificationRegistryName: data.businessVerificationRegistryName ? String(data.businessVerificationRegistryName) : undefined,
        businessVerificationNameMatch: data.businessVerificationNameMatch as 'match' | 'mismatch' | 'unavailable' | undefined,
        contactVerificationStatus: data.contactVerificationStatus as ProducerClaimContactStatus | undefined,
        contactVerifiedAt: data.contactVerifiedAt ? String(data.contactVerifiedAt) : undefined,
        verificationReadyForAdminReview: data.verificationReadyForAdminReview === true,
      } satisfies OwnProducerClaimStatus;
    })
    .sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));

  return registrations[0] || null;
}
