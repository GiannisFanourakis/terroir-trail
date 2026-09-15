import { randomUUID } from 'node:crypto';
import * as tls from 'node:tls';
import type { TLSSocket } from 'node:tls';
import {
  sendProducerApprovalEmail as sendProducerApprovalEmailBase,
  sendTravelerWelcomeEmail as sendTravelerWelcomeEmailBase,
  type EmailDeliveryResult,
  type EmailSender,
  type ProducerApprovalEmailInput,
  type TravelerWelcomeEmailInput,
} from './transactionalEmailService';

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
const gmailUser = () =>
  (process.env.TERROIRTRAIL_EMAIL_USER || 'terroirtrail@gmail.com').trim().toLowerCase();
const gmailAppPassword = () =>
  (process.env.TERROIRTRAIL_EMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
const smtpConfigured = () => Boolean(gmailUser() && gmailAppPassword());

const isSafeEmailAddress = (value: string) =>
  value.length <= 254 &&
  !/[\r\n]/.test(value) &&
  /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);

export const buildGmailAlignedMimeMessage = (
  email: { to: string; subject: string; text: string; html: string },
  fromAddress: string
) => {
  const boundary = `terroirtrail-${randomUUID()}`;
  const senderDomain = fromAddress.split('@')[1]?.toLowerCase();
  const messageIdDomain =
    senderDomain && /^[a-z0-9.-]+$/.test(senderDomain) ? senderDomain : 'gmail.com';
  const messageId = `${randomUUID()}@${messageIdDomain}`;
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

export const sendViaAlignedGmailSmtp: EmailSender = async (email) => {
  const username = gmailUser();
  const password = gmailAppPassword();
  if (!username || !password) {
    throw new Error('Transactional Gmail credentials are not configured.');
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

    const { message, messageId } = buildGmailAlignedMimeMessage(email, username);
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

const notConfiguredResult = (): EmailDeliveryResult => ({
  status: 'not_configured',
  occurredAt: new Date().toISOString(),
  reason: 'Transactional email is not configured.',
});

export async function sendProducerApprovalEmail(
  input: ProducerApprovalEmailInput
): Promise<EmailDeliveryResult> {
  if (!smtpConfigured()) return notConfiguredResult();
  return sendProducerApprovalEmailBase(input, undefined, undefined, sendViaAlignedGmailSmtp);
}

export async function sendTravelerWelcomeEmail(
  input: TravelerWelcomeEmailInput
): Promise<EmailDeliveryResult> {
  if (!smtpConfigured()) return notConfiguredResult();
  return sendTravelerWelcomeEmailBase(input, undefined, undefined, sendViaAlignedGmailSmtp);
}
