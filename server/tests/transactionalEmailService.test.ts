import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sendProducerApprovalEmail,
  sendTravelerWelcomeEmail,
  type EmailSender,
} from '../services/transactionalEmailService';

const makeDb = () => {
  const collections = new Map<string, Map<string, Record<string, any>>>();
  let generated = 0;
  const getCollection = (name: string) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name)!;
  };

  const db = {
    collection: (name: string) => ({
      doc: (id?: string) => {
        const docId = id || `generated-${++generated}`;
        return {
          id: docId,
          get: async () => {
            const data = getCollection(name).get(docId);
            return { exists: Boolean(data), data: () => data };
          },
          set: async (data: Record<string, any>, options?: { merge?: boolean }) => {
            const current = getCollection(name).get(docId) || {};
            getCollection(name).set(docId, options?.merge ? { ...current, ...data } : { ...data });
          },
        };
      },
    }),
  };

  return { db, getCollection };
};

test('producer approval email goes to the approved account and records delivery/audit events', async () => {
  const { db, getCollection } = makeDb();
  getCollection('producer_registrations').set('producer-a', {
    producerId: 'producer-a',
    tradeBrandName: 'Producer A',
    representativeName: 'Maria Producer',
    officialEmail: 'office@example.com',
  });

  const auth = {
    getUser: async () => ({
      uid: 'owner-uid',
      email: 'owner@example.com',
      displayName: 'Maria Producer',
    }),
  };
  const sent: any[] = [];
  const sender: EmailSender = async (email) => {
    sent.push(email);
    return { messageId: 'message-1' };
  };

  const result = await sendProducerApprovalEmail(
    { actorUid: 'admin-uid', ownerUid: 'owner-uid', producerId: 'producer-a' },
    db as any,
    auth as any,
    sender
  );

  assert.equal(result.status, 'sent');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'owner@example.com');
  assert.match(sent[0].subject, /Producer A/);
  assert.equal(getCollection('email_deliveries').size, 1);
  assert.equal(getCollection('admin_audit').size, 1);
  assert.equal([...getCollection('admin_audit').values()][0].eventType, 'producer_approval_email_sent');
});

test('traveler welcome email is sent once for a newly created account', async () => {
  const { db, getCollection } = makeDb();
  const auth = {
    getUser: async () => ({
      uid: 'traveler-uid',
      email: 'traveler@example.com',
      displayName: 'Nikos Traveler',
      metadata: { creationTime: new Date().toISOString() },
    }),
  };
  let sendCount = 0;
  const sent: any[] = [];
  const sender: EmailSender = async (email) => {
    sendCount += 1;
    sent.push(email);
    return { messageId: `welcome-${sendCount}` };
  };

  const first = await sendTravelerWelcomeEmail(
    { uid: 'traveler-uid', preferredName: 'Nikos' },
    db as any,
    auth as any,
    sender
  );
  const second = await sendTravelerWelcomeEmail(
    { uid: 'traveler-uid', preferredName: 'Nikos' },
    db as any,
    auth as any,
    sender
  );

  assert.equal(first.status, 'sent');
  assert.equal(second.status, 'already_sent');
  assert.equal(sendCount, 1);
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /Discover independent producers/);
  assert.match(sent[0].text, /visit status, access notes/);
  assert.match(sent[0].html, /Explore TerroirTrail/);
  assert.doesNotMatch(sent[0].text, /Discovery Guides/);
  assert.doesNotMatch(sent[0].html, /Discovery Guides/);
  assert.equal(getCollection('email_notifications').get('traveler-uid__traveler_welcome')?.status, 'sent');
});

test('existing accounts are not sent a late traveler welcome email', async () => {
  const { db } = makeDb();
  const auth = {
    getUser: async () => ({
      uid: 'old-uid',
      email: 'old@example.com',
      metadata: { creationTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    }),
  };
  let sendCount = 0;
  const sender: EmailSender = async () => {
    sendCount += 1;
    return { messageId: 'should-not-send' };
  };

  const result = await sendTravelerWelcomeEmail(
    { uid: 'old-uid' },
    db as any,
    auth as any,
    sender
  );

  assert.equal(result.status, 'not_new_account');
  assert.equal(sendCount, 0);
});
