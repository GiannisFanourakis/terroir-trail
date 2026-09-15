import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';

export type AccountEmailDeliveryStatus =
  | 'sent'
  | 'failed'
  | 'not_configured'
  | 'already_sent'
  | 'not_new_account';

export interface AccountEmailDeliveryResult {
  status: AccountEmailDeliveryStatus;
  messageId?: string;
  occurredAt: string;
  reason?: string;
}

export async function requestTravelerWelcomeEmail(name?: string) {
  await auth?.authStateReady();
  if (!auth?.currentUser) {
    throw new Error('Sign in before requesting account email delivery.');
  }

  const response = await fetch(`${resolveApiBaseUrl()}/api/account/welcome-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: name?.trim() || undefined }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Welcome email service is temporarily unavailable.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Welcome email delivery failed.');
  }
  return data as { delivery: AccountEmailDeliveryResult };
}
