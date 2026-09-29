import { createHash } from 'node:crypto';
import type { Auth } from 'firebase-admin/auth';
import { adminAuth, adminDb } from '../firebaseAdmin';
import { sendViaAlignedGmailSmtp } from './transactionalEmailTransport';
import type { EmailSender } from './transactionalEmailService';

export type AdminNotificationEventType =
  | 'new_account'
  | 'producer_claim_submitted'
  | 'producer_claim_verification'
  | 'producer_contact_verified'
  | 'producer_listing_change_submitted'
  | 'producer_media_submitted'
  | 'traveler_review_published'
  | 'review_report_submitted'
  | 'stripe_event';

export interface AdminNotificationInput {
  eventType: AdminNotificationEventType;
  idempotencyKey: string;
  subject: string;
  summary: string;
  details?: Array<[string, string | number | boolean | null | undefined]>;
  actorUid?: string;
  producerId?: string;
  actionUrl?: string;
}

export interface AdminNotificationResult {
  status: 'sent' | 'skipped' | 'failed' | 'not_configured';
  recipients: string[];
  occurredAt: string;
  reason?: string;
}
const cleanSingleLine = (value: unknown) =>
  String(value ?? '').replace(/[\r\n]+/g, ' ').trim();

const isSafeEmailAddress = (value: string) =>
  value.length <= 254 &&
  !/[\r\n]/.test(value) &&
  /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const configuredRecipients = () =>
  (process.env.TERROIRTRAIL_ADMIN_NOTIFICATION_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(isSafeEmailAddress);

const smtpConfigured = () =>
  Boolean(
    (process.env.TERROIRTRAIL_EMAIL_USER || '').trim() &&
    (process.env.TERROIRTRAIL_EMAIL_APP_PASSWORD || '').replace(/\s+/g, '')
  );

const publicAppUrl = () =>
  (process.env.APP_URL || 'https://terroir-trail.web.app').replace(/\/$/, '');

const notificationDocId = (input: AdminNotificationInput) =>
  createHash('sha256')
    .update(`${input.eventType}:${input.idempotencyKey}`)
    .digest('hex');
async function resolveAdminRecipients(db: any, auth: Auth): Promise<string[]> {
  const recipients = new Set(configuredRecipients());

  try {
    const snapshot = await db
      .collection('admin_users')
      .where('status', '==', 'active')
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data() || {};
      if (
        data.userId !== doc.id ||
        (data.level !== 'owner' && data.level !== 'admin')
      ) {
        continue;
      }
      try {
        const user = await auth.getUser(doc.id);
        const email = String(user.email || '').trim().toLowerCase();
        if (isSafeEmailAddress(email)) recipients.add(email);
      } catch (error) {
        console.warn('Admin notification recipient lookup failed:', doc.id, error);
      }
    }
  } catch (error) {
    console.warn('Admin notification authority lookup failed:', error);
  }

  if (recipients.size === 0) {
    const fallback = String(process.env.TERROIRTRAIL_EMAIL_USER || '')
      .trim()
      .toLowerCase();
    if (isSafeEmailAddress(fallback)) recipients.add(fallback);
  }

  return [...recipients];
}

const renderText = (input: AdminNotificationInput) => {
  const lines = [
    input.summary,
    '',
    ...(input.details || [])
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([label, value]) => `${label}: ${cleanSingleLine(value)}`),
  ];
  if (input.actionUrl) lines.push('', `Open: ${input.actionUrl}`);
  lines.push('', 'TerroirTrail admin notification');
  return lines.join('\n');
};
const renderHtml = (input: AdminNotificationInput) => {
  const details = (input.details || [])
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 10px;color:#78716c">${escapeHtml(label)}</td><td style="padding:6px 10px;color:#1c1917;font-weight:600">${escapeHtml(cleanSingleLine(value))}</td></tr>`
    )
    .join('');

  const action = input.actionUrl
    ? `<p style="margin:22px 0"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#d97706;color:#fff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:8px">Open TerroirTrail</a></p>`
    : '';

  return `<div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#292524;line-height:1.55">
    <p style="margin:0 0 6px;color:#b45309;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">TerroirTrail Admin</p>
    <h2 style="margin:0 0 14px;color:#1c1917">${escapeHtml(input.subject)}</h2>
    <p>${escapeHtml(input.summary)}</p>
    ${details ? `<table style="border-collapse:collapse;width:100%;background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px">${details}</table>` : ''}
    ${action}
    <p style="margin-top:24px;color:#78716c;font-size:12px">This message was generated automatically from a verified website event.</p>
  </div>`;
};

export async function notifyAdmins(
  input: AdminNotificationInput,
  db = adminDb(),
  auth: Auth = adminAuth(),
  sender: EmailSender = sendViaAlignedGmailSmtp
): Promise<AdminNotificationResult> {
  const occurredAt = new Date().toISOString();
  const notificationRef = db
    .collection('admin_email_notifications')
    .doc(notificationDocId(input));
  try {
    const previous = await notificationRef.get();
    if (previous.exists && previous.data()?.status === 'sent') {
      return { status: 'skipped', recipients: previous.data()?.recipients || [], occurredAt };
    }

    if (!smtpConfigured() && sender === sendViaAlignedGmailSmtp) {
      return {
        status: 'not_configured',
        recipients: [],
        occurredAt,
        reason: 'Transactional Gmail credentials are not configured.',
      };
    }

    const recipients = await resolveAdminRecipients(db, auth);
    if (recipients.length === 0) {
      return {
        status: 'failed',
        recipients: [],
        occurredAt,
        reason: 'No active admin email recipient is available.',
      };
    }

    await notificationRef.set({
      eventType: input.eventType,
      idempotencyKey: input.idempotencyKey,
      status: 'sending',
      recipients,
      actorUid: input.actorUid || null,
      producerId: input.producerId || null,
      attemptedAt: occurredAt,
      updatedAt: occurredAt,
    }, { merge: true });

    const messageIds: string[] = [];
    const failures: string[] = [];
    for (const recipient of recipients) {
      try {
        const delivery = await sender({
          to: recipient,
          subject: `[TerroirTrail Admin] ${cleanSingleLine(input.subject)}`,
          text: renderText(input),
          html: renderHtml(input),
        });
        messageIds.push(delivery.messageId);
      } catch (error) {
        failures.push(
          error instanceof Error ? cleanSingleLine(error.message).slice(0, 180) : 'Unknown email error'
        );
      }
    }

    const status = failures.length === 0 ? 'sent' : 'failed';
    const reason = failures.length ? failures.join(' | ').slice(0, 500) : undefined;
    await notificationRef.set({
      status,
      recipients,
      messageIds,
      reason: reason || null,
      occurredAt,
      updatedAt: occurredAt,
    }, { merge: true });

    return { status, recipients, occurredAt, ...(reason ? { reason } : {}) };
  } catch (error) {
    const reason = error instanceof Error
      ? cleanSingleLine(error.message).slice(0, 500)
      : 'Unknown admin notification error';
    console.error('Admin email notification failed:', reason);
    return { status: 'failed', recipients: [], occurredAt, reason };
  }
}

export const adminNotificationAppUrl = publicAppUrl;
