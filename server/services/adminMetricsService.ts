import { adminAuth, adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export class AdminMetricsError extends Error {
  constructor(
    public readonly code: 'forbidden',
    message: string
  ) {
    super(message);
    this.name = 'AdminMetricsError';
  }
}

export interface AdminAuditSummary {
  eventType: string;
  occurredAt: string;
  actorUid?: string;
  targetUid?: string;
  producerId?: string;
}

export interface AdminDashboardMetrics {
  generatedAt: string;
  requests: {
    pending: number;
    oldestPendingAt: string | null;
    oldestPendingAgeDays: number | null;
    approved30d: number;
    rejected30d: number;
    averageReviewHours30d: number | null;
  };
  accounts: {
    total: number;
    new30d: number;
    disabled: number;
    activeProducerHosts: number;
    activeAdmins: number;
  };
  audit: {
    recent: AdminAuditSummary[];
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseTime(value: unknown): number | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

async function listAllUsers(auth: any) {
  const users: any[] = [];
  let pageToken: string | undefined;

  do {
    const page = await auth.listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);

  return users;
}

export async function getAdminDashboardMetrics(
  actorUid: string,
  db = adminDb(),
  auth = adminAuth(),
  now = new Date()
): Promise<AdminDashboardMetrics> {
  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.isAdmin) {
    throw new AdminMetricsError('forbidden', 'Admin authority is required to view operational metrics.');
  }

  const [registrationsSnapshot, ownershipsSnapshot, adminsSnapshot, auditSnapshot, users] =
    await Promise.all([
      db.collection('producer_registrations').get(),
      db.collection('producer_owners').get(),
      db.collection('admin_users').get(),
      db.collection('admin_audit').get(),
      listAllUsers(auth),
    ]);

  const nowMs = now.getTime();
  const cutoff30d = nowMs - 30 * DAY_MS;
  const registrations = registrationsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() || {}) }));

  const pending = registrations.filter((registration: any) => registration.status === 'pending_verification');
  const pendingTimes = pending
    .map((registration: any) => parseTime(registration.submittedAt))
    .filter((value: number | null): value is number => value !== null);
  const oldestPendingMs = pendingTimes.length > 0 ? Math.min(...pendingTimes) : null;

  const decided30d = registrations.filter((registration: any) => {
    const decisionAt = parseTime(registration.approvedAt) ?? parseTime(registration.rejectedAt);
    return decisionAt !== null && decisionAt >= cutoff30d && decisionAt <= nowMs;
  });

  const reviewHours = decided30d
    .map((registration: any) => {
      const submittedAt = parseTime(registration.submittedAt);
      const decisionAt = parseTime(registration.approvedAt) ?? parseTime(registration.rejectedAt);
      if (submittedAt === null || decisionAt === null || decisionAt < submittedAt) return null;
      return (decisionAt - submittedAt) / (60 * 60 * 1000);
    })
    .filter((value: number | null): value is number => value !== null);

  const activeProducerHosts = new Set(
    ownershipsSnapshot.docs
      .map((doc: any) => doc.data() || {})
      .filter((data: any) => data.status === 'active' && typeof data.ownerUid === 'string')
      .map((data: any) => data.ownerUid)
  ).size;

  const activeAdmins = new Set(
    adminsSnapshot.docs
      .map((doc: any) => ({ id: doc.id, data: doc.data() || {} }))
      .filter(({ data }: any) =>
        data.status === 'active' &&
        (data.level === 'admin' || data.level === 'owner')
      )
      .map(({ id, data }: any) => String(data.userId || id))
  ).size;

  const recentAudit = auditSnapshot.docs
    .map((doc: any) => doc.data() || {})
    .filter((data: any) => typeof data.eventType === 'string' && typeof data.occurredAt === 'string')
    .sort((a: any, b: any) => String(b.occurredAt).localeCompare(String(a.occurredAt)))
    .slice(0, 12)
    .map((data: any) => ({
      eventType: String(data.eventType),
      occurredAt: String(data.occurredAt),
      ...(typeof data.actorUid === 'string' ? { actorUid: data.actorUid } : {}),
      ...(typeof data.targetUid === 'string' ? { targetUid: data.targetUid } : {}),
      ...(typeof data.producerId === 'string' ? { producerId: data.producerId } : {}),
    }));

  const newUsers30d = users.filter((user: any) => {
    const createdAt = parseTime(user.metadata?.creationTime);
    return createdAt !== null && createdAt >= cutoff30d && createdAt <= nowMs;
  }).length;

  return {
    generatedAt: now.toISOString(),
    requests: {
      pending: pending.length,
      oldestPendingAt: oldestPendingMs === null ? null : new Date(oldestPendingMs).toISOString(),
      oldestPendingAgeDays:
        oldestPendingMs === null ? null : Math.max(0, Math.floor((nowMs - oldestPendingMs) / DAY_MS)),
      approved30d: decided30d.filter((registration: any) => registration.status === 'verified_active').length,
      rejected30d: decided30d.filter((registration: any) => registration.status === 'rejected').length,
      averageReviewHours30d:
        reviewHours.length === 0
          ? null
          : Math.round((reviewHours.reduce((sum, hours) => sum + hours, 0) / reviewHours.length) * 10) / 10,
    },
    accounts: {
      total: users.length,
      new30d: newUsers30d,
      disabled: users.filter((user: any) => user.disabled === true).length,
      activeProducerHosts,
      activeAdmins,
    },
    audit: {
      recent: recentAudit,
    },
  };
}
