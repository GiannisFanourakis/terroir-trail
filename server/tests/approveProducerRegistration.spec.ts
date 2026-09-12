import { beforeEach, describe, expect, it, vi } from 'vitest';

const { collections, db } = vi.hoisted(() => {
  const collections = new Map<string, Map<string, Record<string, any>>>();

  const getCollection = (name: string) => {
    if (!collections.has(name)) {
      collections.set(name, new Map());
    }
    return collections.get(name)!;
  };

  const db = {
    collection: (colName: string) => ({
      name: colName,
      doc: (id: string) => ({ col: colName, id, path: `${colName}/${id}` }),
      where: (field: string, op: string, val: any) => {
        const filters: Array<{ field: string; op: string; val: any }> = [{ field, op, val }];
        const chain = {
          where: (f2: string, op2: string, v2: any) => {
            filters.push({ field: f2, op: op2, val: v2 });
            return chain;
          },
          _filters: filters,
          _colName: colName,
        };
        return chain;
      },
    }),
    runTransaction: async (callback: (transaction: any) => Promise<any>) => {
      const transaction = {
        get: async (target: any) => {
          if (target._filters) {
            const col = getCollection(target._colName);
            const matches: any[] = [];
            for (const [id, data] of col.entries()) {
              const match = target._filters.every((f: any) => data[f.field] === f.val);
              if (match) {
                matches.push({ id, data: () => data });
              }
            }
            return {
              empty: matches.length === 0,
              docs: matches,
            };
          }

          const col = getCollection(target.col);
          const exists = col.has(target.id);
          return {
            exists,
            id: target.id,
            data: () => col.get(target.id),
          };
        },
        set: (ref: any, data: Record<string, any>) => {
          const col = getCollection(ref.col);
          col.set(ref.id, { ...data });
        },
        update: (ref: any, data: Record<string, any>) => {
          const col = getCollection(ref.col);
          const existing = col.get(ref.id) || {};
          col.set(ref.id, { ...existing, ...data });
        },
      };
      return callback(transaction);
    },
  };

  return { collections, db };
});

vi.mock('../firebaseAdmin', () => ({
  adminDb: () => db,
}));

import { approveProducerRegistration } from '../../scripts/approveProducerRegistration';

describe('approveProducerRegistration operator routine', () => {
  beforeEach(() => {
    collections.clear();
  });

  it('successfully approves a valid pending producer registration', async () => {
    const regCol = collections.get('producer_registrations') || new Map();
    collections.set('producer_registrations', regCol);
    regCol.set('winery-alpha', {
      producerId: 'winery-alpha',
      producerName: 'Alpha Winery',
      userId: 'user_applicant_1',
      legalBusinessName: 'Alpha Winery SA',
      vatNumber: 'EL123456789',
      status: 'pending_verification',
      isVatVerified: false,
    });

    const result = await approveProducerRegistration('winery-alpha');

    expect(result.producerId).toBe('winery-alpha');
    expect(result.ownerUid).toBe('user_applicant_1');
    expect(result.status).toBe('active');
    expect(result.approvedAt).toBeDefined();

    // Verify producer_owners record
    const ownerCol = collections.get('producer_owners');
    expect(ownerCol).toBeDefined();
    const ownerRecord = ownerCol!.get('winery-alpha');
    expect(ownerRecord).toBeDefined();
    expect(ownerRecord).toMatchObject({
      producerId: 'winery-alpha',
      ownerUid: 'user_applicant_1',
      status: 'active',
      approvedAt: result.approvedAt,
    });

    // Verify producer_registrations record is updated
    const updatedReg = regCol.get('winery-alpha');
    expect(updatedReg.status).toBe('verified_active');
    expect(updatedReg.isVatVerified).toBe(true);
    expect(updatedReg.approvedAt).toBe(result.approvedAt);
  });

  it('rejects invalid or empty producerId', async () => {
    await expect(approveProducerRegistration('')).rejects.toThrow('Valid producerId is required');
    await expect(approveProducerRegistration(null as any)).rejects.toThrow('Valid producerId is required');
  });

  it('throws error if registration does not exist', async () => {
    await expect(approveProducerRegistration('non-existent')).rejects.toThrow(
      "Registration for producer 'non-existent' not found."
    );
  });

  it('throws error if registration is missing applicant userId', async () => {
    const regCol = new Map();
    collections.set('producer_registrations', regCol);
    regCol.set('winery-bad', {
      producerId: 'winery-bad',
      status: 'pending_verification',
    });

    await expect(approveProducerRegistration('winery-bad')).rejects.toThrow(
      "Registration for producer 'winery-bad' has no valid applicant userId."
    );
  });

  it('throws error if registration status is not pending_verification', async () => {
    const regCol = new Map();
    collections.set('producer_registrations', regCol);
    regCol.set('winery-active', {
      producerId: 'winery-active',
      userId: 'user_1',
      status: 'verified_active',
    });

    await expect(approveProducerRegistration('winery-active')).rejects.toThrow(
      "Registration status is 'verified_active', expected 'pending_verification'."
    );
  });

  it('rejects approval if producer already has an active owner', async () => {
    const regCol = new Map();
    collections.set('producer_registrations', regCol);
    regCol.set('winery-alpha', {
      producerId: 'winery-alpha',
      userId: 'user_applicant_2',
      status: 'pending_verification',
    });

    const ownerCol = new Map();
    collections.set('producer_owners', ownerCol);
    ownerCol.set('winery-alpha', {
      producerId: 'winery-alpha',
      ownerUid: 'user_existing_owner',
      status: 'active',
    });

    await expect(approveProducerRegistration('winery-alpha')).rejects.toThrow(
      "Ownership conflict: Producer 'winery-alpha' already has an active owner (user_existing_owner)."
    );
  });

  it('rejects approval if applicant already owns another active producer', async () => {
    const regCol = new Map();
    collections.set('producer_registrations', regCol);
    regCol.set('winery-beta', {
      producerId: 'winery-beta',
      userId: 'user_multi_applicant',
      status: 'pending_verification',
    });

    const ownerCol = new Map();
    collections.set('producer_owners', ownerCol);
    ownerCol.set('winery-alpha', {
      producerId: 'winery-alpha',
      ownerUid: 'user_multi_applicant',
      status: 'active',
    });

    await expect(approveProducerRegistration('winery-beta')).rejects.toThrow(
      "Ownership conflict: User 'user_multi_applicant' already owns producer 'winery-alpha'."
    );
  });
});
