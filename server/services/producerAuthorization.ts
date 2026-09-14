import { adminDb } from '../firebaseAdmin';

export async function isActiveProducerOwner(uid: string, db = adminDb()): Promise<boolean> {
  const ownerships = await db
    .collection('producer_owners')
    .where('ownerUid', '==', uid)
    .get();

  return ownerships.docs.some((doc) => {
    const ownership = doc.data();
    return ownership.ownerUid === uid && ownership.status === 'active';
  });
}
