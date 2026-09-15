import { createHash, randomBytes } from 'node:crypto';
import { adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';
import { sendViaAlignedGmailSmtp } from './transactionalEmailTransport';

export type ProducerBusinessVerificationStatus =
  | 'verified'
  | 'needs_review'
  | 'failed'
  | 'manual_required'
  | 'unavailable';

export type ProducerContactVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'unavailable';

export interface ProducerVerificationResult {
  producerId: string;
  business: {
    status: ProducerBusinessVerificationStatus;
    provider: 'vies' | 'manual';
    checkedAt: string;
    vatValid: boolean | null;
    registryName?: string;
    registryAddress?: string;
    nameMatch: 'match' | 'mismatch' | 'unavailable';
    reason?: string;
  };
  contact: {
    status: ProducerContactVerificationStatus;
    email: string;
    sentAt?: string;
    expiresAt?: string;
    verifiedAt?: string;
    reason?: string;
  };
  readyForAdminReview: boolean;
}

export class ProducerVerificationError extends Error {
  constructor(
    public readonly code: 'forbidden' | 'not_found' | 'conflict' | 'bad_request',
    message: string
  ) {
    super(message);
    this.name = 'ProducerVerificationError';
  }
}

const EU_VIES_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR',
  'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI',
  'SK', 'XI',
]);

const normalizeCountryForVies = (countryCode: string) => {
  const upper = countryCode.trim().toUpperCase();
  return upper === 'GR' ? 'EL' : upper;
};

const cleanVatNumber = (value: string, viesCountry: string) => {
  let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.startsWith(viesCountry)) cleaned = cleaned.slice(viesCountry.length);
  if (viesCountry === 'EL' && cleaned.startsWith('GR')) cleaned = cleaned.slice(2);
  return cleaned;
};

const decodeXml = (value: string) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&apos;', "'")
  .trim();

const readXmlTag = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : undefined;
};

const normalizeBusinessName = (value: string) => value
  .normalize('NFKD')
  .toLocaleLowerCase('en-US')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .filter((token) => !new Set([
    'ae', 'sa', 'srl', 'ike', 'oe', 'ee', 'ltd', 'limited', 'company', 'co', 'pc',
    'spa', 'societa', 'società', 'anonymous', 'anonymi', 'etairia', 'εταιρεια', 'εταιρεία',
  ]).has(token))
  .join(' ')
  .trim();

const compareBusinessNames = (submitted: string | undefined, registry: string | undefined) => {
  const left = submitted ? normalizeBusinessName(submitted) : '';
  const right = registry && registry !== '---' ? normalizeBusinessName(registry) : '';
  if (!left || !right) return 'unavailable' as const;
  if (left === right || left.includes(right) || right.includes(left)) return 'match' as const;
  return 'mismatch' as const;
};

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export interface ViesCheckResult {
  valid: boolean;
  name?: string;
  address?: string;
  requestDate?: string;
}

export async function checkVatWithVies(
  countryCode: string,
  vatNumber: string,
  fetchImpl: typeof fetch = fetch
): Promise<ViesCheckResult> {
  const viesCountry = normalizeCountryForVies(countryCode);
  if (!EU_VIES_COUNTRIES.has(viesCountry)) {
    throw new Error('Country is not supported by VIES.');
  }
  const cleanVat = cleanVatNumber(vatNumber, viesCountry);
  if (!cleanVat) throw new Error('VAT number is required.');

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types"><soapenv:Header/><soapenv:Body><urn:checkVat><urn:countryCode>${escapeXml(viesCountry)}</urn:countryCode><urn:vatNumber>${escapeXml(cleanVat)}</urn:vatNumber></urn:checkVat></soapenv:Body></soapenv:Envelope>`;

  const response = await fetchImpl(
    'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'checkVat',
      },
      body: envelope,
      signal: AbortSignal.timeout(10000),
    }
  );

  const xml = await response.text();
  if (!response.ok || /<(?:\w+:)?Fault[\s>]/i.test(xml)) {
    const fault = readXmlTag(xml, 'faultstring') || `VIES returned HTTP ${response.status}.`;
    throw new Error(fault);
  }

  const valid = readXmlTag(xml, 'valid');
  if (valid !== 'true' && valid !== 'false') {
    throw new Error('VIES returned an unreadable response.');
  }

  return {
    valid: valid === 'true',
    name: readXmlTag(xml, 'name'),
    address: readXmlTag(xml, 'address'),
    requestDate: readXmlTag(xml, 'requestDate'),
  };
}

const appUrl = () => (process.env.APP_URL || 'https://terroir-trail.web.app').replace(/\/$/, '');
const hashToken = (token: string) => createHash('sha256').update(token, 'utf8').digest('hex');

async function canVerifyClaim(actorUid: string, registration: any, db: any) {
  if (registration?.userId === actorUid) return true;
  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  return capabilities.canReviewProducerClaims;
}

async function sendContactChallenge(
  producerId: string,
  registration: any,
  db: any,
  emailSender = sendViaAlignedGmailSmtp
) {
  const email = String(registration?.officialEmail || '').trim().toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    return {
      status: 'unavailable' as const,
      email,
      reason: 'A valid official producer email is required.',
    };
  }

  if (registration?.contactVerificationStatus === 'verified') {
    return {
      status: 'verified' as const,
      email,
      verifiedAt: registration?.contactVerifiedAt,
    };
  }

  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const sentAt = now.toISOString();
  const challengeRef = db.collection('producer_verification_challenges').doc(tokenHash);

  await challengeRef.set({
    producerId,
    userId: registration.userId,
    email,
    status: 'pending',
    createdAt: sentAt,
    expiresAt,
  });

  const verificationUrl = `${appUrl()}/api/account/producer-contact-verification?token=${encodeURIComponent(token)}`;
  try {
    await emailSender({
      to: email,
      subject: 'Verify your producer contact for TerroirTrail',
      text: `Verify that you control this producer email by opening this link within 24 hours:\n\n${verificationUrl}\n\nThis verifies control of the submitted contact address. TerroirTrail still reviews the producer claim before host access is granted.`,
      html: `<p>Verify that you control this producer email by opening the link below within 24 hours.</p><p><a href="${verificationUrl}">Verify producer email</a></p><p>This verifies control of the submitted contact address. TerroirTrail still reviews the producer claim before host access is granted.</p>`,
    });
  } catch (error) {
    await challengeRef.set({
      status: 'delivery_failed',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return {
      status: 'unavailable' as const,
      email,
      reason: error instanceof Error ? error.message : 'Verification email could not be sent.',
    };
  }

  return {
    status: 'pending' as const,
    email,
    sentAt,
    expiresAt,
  };
}

export async function runProducerVerification(
  actorUid: string,
  producerId: string,
  db = adminDb(),
  fetchImpl: typeof fetch = fetch,
  emailSender = sendViaAlignedGmailSmtp
): Promise<ProducerVerificationResult> {
  if (!producerId) throw new ProducerVerificationError('bad_request', 'Producer ID is required.');
  const registrationRef = db.collection('producer_registrations').doc(producerId);
  const registrationDoc = await registrationRef.get();
  if (!registrationDoc.exists) {
    throw new ProducerVerificationError('not_found', 'Producer request was not found.');
  }
  const registration = registrationDoc.data() || {};
  if (!(await canVerifyClaim(actorUid, registration, db))) {
    throw new ProducerVerificationError('forbidden', 'You cannot verify this producer request.');
  }
  if (registration.status !== 'pending_verification') {
    throw new ProducerVerificationError('conflict', 'This producer request is no longer pending verification.');
  }

  const checkedAt = new Date().toISOString();
  const countryCode = String(registration.countryCode || '').trim().toUpperCase();
  const vatNumber = String(registration.vatNumber || '').trim();

  let business: ProducerVerificationResult['business'];
  const viesCountry = normalizeCountryForVies(countryCode);
  if (!vatNumber || !EU_VIES_COUNTRIES.has(viesCountry)) {
    business = {
      status: 'manual_required',
      provider: 'manual',
      checkedAt,
      vatValid: null,
      nameMatch: 'unavailable',
      reason: !vatNumber
        ? 'No VAT number was supplied; manual business verification is required.'
        : 'This country is outside the VIES verification network; manual or national-registry verification is required.',
    };
  } else {
    try {
      const vies = await checkVatWithVies(countryCode, vatNumber, fetchImpl);
      const nameMatch = compareBusinessNames(registration.legalBusinessName, vies.name);
      business = {
        status: !vies.valid ? 'failed' : nameMatch === 'match' ? 'verified' : 'needs_review',
        provider: 'vies',
        checkedAt,
        vatValid: vies.valid,
        registryName: vies.name && vies.name !== '---' ? vies.name : undefined,
        registryAddress: vies.address && vies.address !== '---' ? vies.address : undefined,
        nameMatch,
        reason: !vies.valid
          ? 'VIES did not validate the supplied VAT number.'
          : nameMatch === 'mismatch'
            ? 'VAT is valid, but the submitted legal name does not match the VIES name closely enough for automatic approval.'
            : nameMatch === 'unavailable'
              ? 'VAT is valid, but VIES did not return enough legal-name data for automatic matching.'
              : undefined,
      };
    } catch (error) {
      business = {
        status: 'unavailable',
        provider: 'vies',
        checkedAt,
        vatValid: null,
        nameMatch: 'unavailable',
        reason: error instanceof Error ? error.message : 'VIES verification is temporarily unavailable.',
      };
    }
  }

  const contact = await sendContactChallenge(producerId, registration, db, emailSender);
  const readyForAdminReview = business.status === 'verified' && contact.status === 'verified';

  await registrationRef.set({
    businessVerificationStatus: business.status,
    businessVerificationProvider: business.provider,
    businessVerificationCheckedAt: business.checkedAt,
    businessVerificationVatValid: business.vatValid,
    businessVerificationRegistryName: business.registryName || null,
    businessVerificationRegistryAddress: business.registryAddress || null,
    businessVerificationNameMatch: business.nameMatch,
    businessVerificationReason: business.reason || null,
    isVatVerified: business.status === 'verified',
    vatVerificationDate: business.status === 'verified' ? business.checkedAt : null,
    contactVerificationStatus: contact.status,
    contactVerificationSentAt: contact.sentAt || null,
    contactVerificationExpiresAt: contact.expiresAt || null,
    verificationReadyForAdminReview: readyForAdminReview,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return { producerId, business, contact, readyForAdminReview };
}

export async function completeProducerContactVerification(
  token: string,
  db = adminDb()
): Promise<{ producerId: string; verifiedAt: string }> {
  const cleanToken = token.trim();
  if (cleanToken.length < 32 || cleanToken.length > 256) {
    throw new ProducerVerificationError('bad_request', 'Verification link is invalid.');
  }

  const challengeRef = db.collection('producer_verification_challenges').doc(hashToken(cleanToken));
  const verifiedAt = new Date().toISOString();

  return db.runTransaction(async (transaction: any) => {
    const challengeDoc = await transaction.get(challengeRef);
    if (!challengeDoc.exists) {
      throw new ProducerVerificationError('not_found', 'Verification link was not found.');
    }
    const challenge = challengeDoc.data() || {};
    if (challenge.status === 'verified') {
      return { producerId: String(challenge.producerId), verifiedAt: String(challenge.verifiedAt || verifiedAt) };
    }
    if (challenge.status !== 'pending') {
      throw new ProducerVerificationError('conflict', 'Verification link is no longer active.');
    }
    if (!challenge.expiresAt || Date.parse(challenge.expiresAt) < Date.now()) {
      transaction.set(challengeRef, { status: 'expired', updatedAt: verifiedAt }, { merge: true });
      throw new ProducerVerificationError('conflict', 'Verification link has expired.');
    }

    const producerId = String(challenge.producerId || '');
    const registrationRef = db.collection('producer_registrations').doc(producerId);
    const registrationDoc = await transaction.get(registrationRef);
    if (!registrationDoc.exists) {
      throw new ProducerVerificationError('not_found', 'Producer request was not found.');
    }
    const registration = registrationDoc.data() || {};
    if (
      registration.userId !== challenge.userId ||
      String(registration.officialEmail || '').trim().toLowerCase() !== String(challenge.email || '').trim().toLowerCase()
    ) {
      throw new ProducerVerificationError('conflict', 'Verification link no longer matches the producer request.');
    }

    const readyForAdminReview = registration.businessVerificationStatus === 'verified';
    transaction.set(registrationRef, {
      contactVerificationStatus: 'verified',
      contactVerifiedAt: verifiedAt,
      verificationReadyForAdminReview: readyForAdminReview,
      updatedAt: verifiedAt,
    }, { merge: true });
    transaction.set(challengeRef, {
      status: 'verified',
      verifiedAt,
      updatedAt: verifiedAt,
    }, { merge: true });

    return { producerId, verifiedAt };
  });
}
