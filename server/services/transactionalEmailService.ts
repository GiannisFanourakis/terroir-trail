import { randomUUID } from 'node:crypto';
import * as tls from 'node:tls';
import type { TLSSocket } from 'node:tls';
import { adminAuth, adminDb } from '../firebaseAdmin';

export type EmailDeliveryStatus =
  | 'sent'
  | 'failed'
  | 'not_configured'
  | 'already_sent'
  | 'not_new_account';

export interface EmailDeliveryResult {
  status: EmailDeliveryStatus;
  messageId?: string;
  occurredAt: string;
  reason?: string;
}

interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export type EmailSender = (email: OutgoingEmail) => Promise<{ messageId: string }>;

export interface ProducerApprovalEmailInput {
  actorUid: string;
  ownerUid: string;
  producerId: string;
}

export interface TravelerWelcomeEmailInput {
  uid: string;
  preferredName?: string;
}

class TransactionalEmailConfigurationError extends Error {}

interface SmtpReply {
  code: number;
  text: string;
}

class SmtpReplyReader {
  private buffer = '';
  private currentLines: string[] = [];
  private ready: SmtpReply[] = [];
  private waiters: Array<{
    resolve: (reply: SmtpReply) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(socket: TLSSocket) {
    socket.on('data', (chunk) => this.push(chunk.toString('utf8')));
    socket.on('error', (error) => this.fail(error instanceof Error ? error : new Error(String(error))));
  }

  private push(chunk: string) {
    this.buffer += chunk;
    let boundary = this.buffer.indexOf('\r\n');
    while (boundary >= 0) {
      const line = this.buffer.slice(0, boundary);
      this.buffer = this.buffer.slice(boundary + 2);
      if (line) {
        this.currentLines.push(line);
        const terminal = line.match(/^(\d{3})\s/);
        if (terminal) {
          const reply = {
            code: Number(terminal[1]),
            text: this.currentLines.join('\n'),
          };
          this.currentLines = [];
          const waiter = this.waiters.shift();
          if (waiter) waiter.resolve(reply);
          else this.ready.push(reply);
        }
      }
      boundary = this.buffer.indexOf('\r\n');
    }
  }

  private fail(error: Error) {
    while (this.waiters.length) this.waiters.shift()?.reject(error);
  }

  next(): Promise<SmtpReply> {
    const existing = this.ready.shift();
    if (existing) return Promise.resolve(existing);
    return new Promise<SmtpReply>((resolve, reject) => {
      this.waiters.push({ resolve, reject });
    });
  }
}

const cleanSingleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();
const encodeHeader = (value: string) =>
  `=?UTF-8?B?${Buffer.from(cleanSingleLine(value), 'utf8').toString('base64')}?=`;
const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const isSafeEmailAddress = (value: string) =>
  value.length <= 254 &&
  !/[\r\n]/.test(value) &&
  /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);

const publicAppUrl = () =>
  (process.env.APP_URL || process.env.VITE_PUBLIC_APP_URL || 'https://terroir-trail.web.app').replace(/\/$/, '');

const gmailUser = () => (process.env.TERROIRTRAIL_EMAIL_USER || 'terroirtrail@gmail.com').trim().toLowerCase();
const gmailAppPassword = () => (process.env.TERROIRTRAIL_EMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
const smtpConfigured = () => Boolean(gmailUser() && gmailAppPassword());

const buildMimeMessage = (email: OutgoingEmail, fromAddress: string) => {
  const boundary = `terroirtrail-${randomUUID()}`;
  const messageId = `${randomUUID()}@terroirtrail.app`;
  const lines = [
    `From: TerroirTrail <${fromAddress}>`,
    `Reply-To: ${fromAddress}`,
    `To: ${email.to}`,
    `Subject: ${encodeHeader(email.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${messageId}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    email.text,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    email.html,
    '',
    `--${boundary}--`,
  ];
  return { message: lines.join('\r\n'), messageId };
};

const expectReply = async (reader: SmtpReplyReader, accepted: number[], context: string) => {
  const reply = await reader.next();
  if (!accepted.includes(reply.code)) {
    throw new Error(`${context} failed with SMTP ${reply.code}.`);
  }
  return reply;
};

const writeCommand = async (
  socket: TLSSocket,
  reader: SmtpReplyReader,
  command: string,
  accepted: number[],
  context: string
) => {
  socket.write(`${command}\r\n`);
  return expectReply(reader, accepted, context);
};

export const sendViaGmailSmtp: EmailSender = async (email) => {
  const username = gmailUser();
  const password = gmailAppPassword();
  if (!username || !password) {
    throw new TransactionalEmailConfigurationError('Transactional Gmail credentials are not configured.');
  }
  if (!isSafeEmailAddress(email.to) || !isSafeEmailAddress(username)) {
    throw new Error('Transactional email address is invalid.');
  }

  const socket = tls.connect({
    host: 'smtp.gmail.com',
    port: 465,
    servername: 'smtp.gmail.com',
    rejectUnauthorized: true,
  });
  const reader = new SmtpReplyReader(socket);
  socket.setTimeout(15000, () => socket.destroy(new Error('SMTP connection timed out.')));

  try {
    await new Promise<void>((resolve, reject) => {
      const onSecure = () => {
        socket.off('error', onError);
        resolve();
      };
      const onError = (error: Error) => {
        socket.off('secureConnect', onSecure);
        reject(error);
      };
      socket.once('secureConnect', onSecure);
      socket.once('error', onError);
    });

    await expectReply(reader, [220], 'SMTP greeting');
    await writeCommand(socket, reader, 'EHLO terroir-trail.web.app', [250], 'SMTP EHLO');
    await writeCommand(socket, reader, 'AUTH LOGIN', [334], 'SMTP authentication');
    await writeCommand(
      socket,
      reader,
      Buffer.from(username, 'utf8').toString('base64'),
      [334],
      'SMTP username'
    );
    await writeCommand(
      socket,
      reader,
      Buffer.from(password, 'utf8').toString('base64'),
      [235],
      'SMTP password'
    );
    await writeCommand(socket, reader, `MAIL FROM:<${username}>`, [250], 'SMTP sender');
    await writeCommand(socket, reader, `RCPT TO:<${email.to}>`, [250, 251], 'SMTP recipient');
    await writeCommand(socket, reader, 'DATA', [354], 'SMTP data');

    const { message, messageId } = buildMimeMessage(email, username);
    const dotStuffed = message
      .replace(/\r?\n/g, '\r\n')
      .split('\r\n')
      .map((line) => (line.startsWith('.') ? `.${line}` : line))
      .join('\r\n');
    socket.write(`${dotStuffed}\r\n.\r\n`);
    await expectReply(reader, [250], 'SMTP message delivery');
    await writeCommand(socket, reader, 'QUIT', [221], 'SMTP quit');
    return { messageId };
  } finally {
    socket.destroy();
  }
};

const safeErrorReason = (error: unknown) =>
  cleanSingleLine(error instanceof Error ? error.message : String(error)).slice(0, 180);

const safeWrite = async (operation: () => Promise<unknown>) => {
  try {
    await operation();
  } catch (error) {
    console.warn('Transactional email audit write failed:', safeErrorReason(error));
  }
};

const attemptDelivery = async (
  email: OutgoingEmail,
  sender: EmailSender
): Promise<EmailDeliveryResult> => {
  const occurredAt = new Date().toISOString();
  try {
    const { messageId } = await sender(email);
    return { status: 'sent', messageId, occurredAt };
  } catch (error) {
    if (error instanceof TransactionalEmailConfigurationError) {
      return { status: 'not_configured', occurredAt, reason: 'Transactional email is not configured.' };
    }
    return { status: 'failed', occurredAt, reason: safeErrorReason(error) };
  }
};

const recordDelivery = async (
  db: any,
  input: {
    type: 'traveler_welcome' | 'producer_approval';
    result: EmailDeliveryResult;
    targetUid: string;
    producerId?: string;
  }
) => {
  await safeWrite(() =>
    db.collection('email_deliveries').doc().set({
      eventType: input.type,
      targetUid: input.targetUid,
      producerId: input.producerId || null,
      status: input.result.status,
      messageId: input.result.messageId || null,
      reason: input.result.reason || null,
      occurredAt: input.result.occurredAt,
      provider: 'gmail_smtp',
    })
  );
};

export async function sendProducerApprovalEmail(
  input: ProducerApprovalEmailInput,
  db = adminDb(),
  auth = adminAuth(),
  sender: EmailSender = sendViaGmailSmtp
): Promise<EmailDeliveryResult> {
  if (sender === sendViaGmailSmtp && !smtpConfigured()) {
    return {
      status: 'not_configured',
      occurredAt: new Date().toISOString(),
      reason: 'Transactional email is not configured.',
    };
  }

  let userRecord: any;
  let registration: any;
  try {
    [userRecord, registration] = await Promise.all([
      auth.getUser(input.ownerUid),
      db.collection('producer_registrations').doc(input.producerId).get(),
    ]);
  } catch (error) {
    const result: EmailDeliveryResult = {
      status: 'failed',
      occurredAt: new Date().toISOString(),
      reason: safeErrorReason(error),
    };
    await recordDelivery(db, {
      type: 'producer_approval',
      result,
      targetUid: input.ownerUid,
      producerId: input.producerId,
    });
    return result;
  }

  const registrationData = registration?.exists ? registration.data() || {} : {};
  const recipient = String(userRecord?.email || registrationData.officialEmail || '').trim().toLowerCase();
  if (!isSafeEmailAddress(recipient)) {
    const result: EmailDeliveryResult = {
      status: 'failed',
      occurredAt: new Date().toISOString(),
      reason: 'Approved account has no valid email address.',
    };
    await recordDelivery(db, {
      type: 'producer_approval',
      result,
      targetUid: input.ownerUid,
      producerId: input.producerId,
    });
    return result;
  }

  const producerName = cleanSingleLine(
    String(registrationData.tradeBrandName || registrationData.producerName || input.producerId)
  );
  const recipientName = cleanSingleLine(
    String(registrationData.representativeName || userRecord?.displayName || 'there')
  );
  const appUrl = publicAppUrl();
  const safeName = escapeHtml(recipientName);
  const safeProducer = escapeHtml(producerName);
  const result = await attemptDelivery(
    {
      to: recipient,
      subject: `Your TerroirTrail producer access for ${producerName} is approved`,
      text: [
        `Hi ${recipientName},`,
        '',
        `Your request to manage ${producerName} on TerroirTrail has been approved.`,
        'Your producer/host access is now active, and you can sign in to manage the listing assigned to your account.',
        '',
        `Sign in: ${appUrl}`,
        '',
        'Welcome to TerroirTrail,',
        'The TerroirTrail Team',
      ].join('\n'),
      html: `<p>Hi ${safeName},</p><p>Your request to manage <strong>${safeProducer}</strong> on TerroirTrail has been approved.</p><p>Your producer/host access is now active, and you can sign in to manage the listing assigned to your account.</p><p><a href="${escapeHtml(appUrl)}">Sign in to TerroirTrail</a></p><p>Welcome to TerroirTrail,<br>The TerroirTrail Team</p>`,
    },
    sender
  );

  await recordDelivery(db, {
    type: 'producer_approval',
    result,
    targetUid: input.ownerUid,
    producerId: input.producerId,
  });
  await safeWrite(() =>
    db.collection('admin_audit').doc().set({
      eventType:
        result.status === 'sent'
          ? 'producer_approval_email_sent'
          : 'producer_approval_email_failed',
      actorUid: input.actorUid,
      targetUid: input.ownerUid,
      producerId: input.producerId,
      occurredAt: result.occurredAt,
      emailStatus: result.status,
      source: 'transactional_email',
    })
  );
  return result;
}

export async function sendTravelerWelcomeEmail(
  input: TravelerWelcomeEmailInput,
  db = adminDb(),
  auth = adminAuth(),
  sender: EmailSender = sendViaGmailSmtp
): Promise<EmailDeliveryResult> {
  if (sender === sendViaGmailSmtp && !smtpConfigured()) {
    return {
      status: 'not_configured',
      occurredAt: new Date().toISOString(),
      reason: 'Transactional email is not configured.',
    };
  }

  let userRecord: any;
  try {
    userRecord = await auth.getUser(input.uid);
  } catch (error) {
    return {
      status: 'failed',
      occurredAt: new Date().toISOString(),
      reason: safeErrorReason(error),
    };
  }

  const creationMs = Date.parse(String(userRecord?.metadata?.creationTime || ''));
  const ageMs = Number.isFinite(creationMs) ? Date.now() - creationMs : Number.POSITIVE_INFINITY;
  if (ageMs < -5 * 60 * 1000 || ageMs > 2 * 60 * 60 * 1000) {
    return { status: 'not_new_account', occurredAt: new Date().toISOString() };
  }

  const recipient = String(userRecord?.email || '').trim().toLowerCase();
  if (!isSafeEmailAddress(recipient)) {
    return {
      status: 'failed',
      occurredAt: new Date().toISOString(),
      reason: 'New account has no valid email address.',
    };
  }

  const notificationRef = db.collection('email_notifications').doc(`${input.uid}__traveler_welcome`);
  const previous = await notificationRef.get();
  if (previous.exists && previous.data()?.status === 'sent') {
    return { status: 'already_sent', occurredAt: new Date().toISOString() };
  }

  const attemptedAt = new Date().toISOString();
  await safeWrite(() =>
    notificationRef.set(
      {
        type: 'traveler_welcome',
        targetUid: input.uid,
        status: 'sending',
        attemptedAt,
        updatedAt: attemptedAt,
      },
      { merge: true }
    )
  );

  const recipientName = cleanSingleLine(
    String(input.preferredName || userRecord?.displayName || 'traveler')
  );
  const appUrl = publicAppUrl();
  const safeName = escapeHtml(recipientName);
  const result = await attemptDelivery(
    {
      to: recipient,
      subject: 'Welcome to TerroirTrail',
      text: [
        `Hi ${recipientName},`,
        '',
        'Welcome to TerroirTrail. Your traveler account is ready.',
        '',
        'Discover independent producers, save places you want to visit, build your Terroir Passport, and keep private notes from your travels.',
        '',
        `Explore TerroirTrail: ${appUrl}`,
        '',
        'TerroirTrail is built around direct connections with local makers and practical information for independent travel, including visit status, access notes, and regional food and drink traditions.',
        '',
        'See you on the trail,',
        'The TerroirTrail Team',
      ].join('\n'),
      html: `<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#292524;line-height:1.6"><p>Hi ${safeName},</p><h2 style="margin:0 0 12px;color:#1c1917">Welcome to TerroirTrail</h2><p>Your traveler account is ready.</p><p>Discover independent producers, save places you want to visit, build your Terroir Passport, and keep private notes from your travels.</p><p style="margin:24px 0"><a href="${escapeHtml(appUrl)}" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:8px">Explore TerroirTrail</a></p><p>TerroirTrail is built around direct connections with local makers and practical information for independent travel, including visit status, access notes, and regional food and drink traditions.</p><p style="margin-top:24px">See you on the trail,<br><strong>The TerroirTrail Team</strong></p></div>`,
    },
    sender
  );

  await safeWrite(() =>
    notificationRef.set(
      {
        status: result.status,
        messageId: result.messageId || null,
        reason: result.reason || null,
        occurredAt: result.occurredAt,
        updatedAt: result.occurredAt,
      },
      { merge: true }
    )
  );
  await recordDelivery(db, {
    type: 'traveler_welcome',
    result,
    targetUid: input.uid,
  });
  return result;
}
