import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notifyAdmins } from '../services/adminNotificationService';

function fakeDb() {
  const notifications = new Map<string, any>();
  const adminUsers = [
    {
      id: 'owner-uid',
      data: () => ({ userId: 'owner-uid', level: 'owner', status: 'active' }),
    },
    {
      id: 'revoked-uid',
      data: () => ({ userId: 'revoked-uid', level: 'admin', status: 'revoked' }),
    },
  ];

  return {
    notifications,
    collection(name: string) {
      if (name === 'admin_users') {
        return {
          where() {
            return {
              async get() {
                return { docs: adminUsers.filter((item) => item.data().status === 'active') };
              },
            };
          },
        };
      }
      if (name === 'admin_email_notifications') {
        return {
          doc(id: string) {
            return {
              async get() {
                const value = notifications.get(id);
                return {
                  exists: Boolean(value),
                  data: () => value,
                };
              },
              async set(value: any, options?: { merge?: boolean }) {
                const current = options?.merge ? notifications.get(id) || {} : {};
                notifications.set(id, { ...current, ...value });
              },
            };
          },
        };
      }
      throw new Error(`Unexpected collection: ${name}`);
    },
  };
}

test('admin notifications email active admins once per idempotency key', async () => {
  const db = fakeDb();
  const sent: any[] = [];
  const auth = {
    async getUser(uid: string) {
      if (uid !== 'owner-uid') throw new Error('unexpected uid');
      return { email: 'owner@example.com' };
    },
  } as any;
  const sender = async (email: any) => {
    sent.push(email);
    return { messageId: `message-${sent.length}` };
  };

  const input = {
    eventType: 'producer_listing_change_submitted' as const,
    idempotencyKey: 'listing-change:request-1',
    subject: 'Listing update requested: Producer A',
    summary: 'A Host submitted a listing change.',
    details: [['Producer', 'Producer A']] as Array<[string, string]>,
    producerId: 'producer-a',
  };

  const first = await notifyAdmins(input, db as any, auth, sender);
  assert.equal(first.status, 'sent');
  assert.deepEqual(first.recipients, ['owner@example.com']);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'owner@example.com');
  assert.match(sent[0].subject, /TerroirTrail Admin/);

  const second = await notifyAdmins(input, db as any, auth, sender);
  assert.equal(second.status, 'skipped');
  assert.equal(sent.length, 1);

  const stored = [...db.notifications.values()][0];
  assert.equal(stored.status, 'sent');
  assert.equal(stored.eventType, 'producer_listing_change_submitted');
});
