import { describe, expect, it, vi } from 'vitest';
import {
  captureSessionAcquisition,
  deriveSessionAcquisition,
} from './sessionAcquisition';

class MockStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

describe('session acquisition analytics', () => {
  it('derives Instagram social attribution from the tracked profile URL', () => {
    expect(
      deriveSessionAcquisition(
        'https://terroir-trail.web.app/?utm_source=instagram&utm_medium=social&utm_campaign=profile'
      )
    ).toEqual({
      source: 'instagram',
      channel: 'social',
      campaign: 'profile',
      attributionMethod: 'utm',
    });
  });

  it('classifies known referrers without retaining raw referrer data', () => {
    expect(
      deriveSessionAcquisition(
        'https://terroir-trail.web.app/',
        'https://www.google.com/search?q=crete+producers'
      )
    ).toEqual({
      source: 'google',
      channel: 'search',
      campaign: null,
      attributionMethod: 'referrer',
    });

    expect(
      deriveSessionAcquisition(
        'https://terroir-trail.web.app/',
        'https://example.com/private/path?email=test@example.com'
      )
    ).toEqual({
      source: 'other',
      channel: 'referral',
      campaign: null,
      attributionMethod: 'referrer',
    });
  });

  it('drops arbitrary campaign text that is outside the bounded slug contract', () => {
    expect(
      deriveSessionAcquisition(
        'https://terroir-trail.web.app/?utm_source=instagram&utm_medium=social&utm_campaign=John%20Smith%40example.com'
      )
    ).toEqual({
      source: 'instagram',
      channel: 'social',
      campaign: null,
      attributionMethod: 'utm',
    });
  });

  it('sends only coarse attribution plus the existing analytics session id', async () => {
    const storage = new MockStorage();
    const calls: Array<{ url: string; options: RequestInit }> = [];
    const mockFetch = vi.fn(
      async (url: string | URL | Request, options?: RequestInit) => {
        calls.push({ url: String(url), options: options! });
        return {
          ok: true,
          status: 200,
          json: async () => ({ accepted: true }),
        } as Response;
      }
    );

    const success = await captureSessionAcquisition({
      fetchImpl: mockFetch as unknown as typeof fetch,
      apiBaseUrl: 'http://localhost:4242',
      storage,
      href: 'https://terroir-trail.web.app/?utm_source=instagram&utm_medium=social&utm_campaign=profile',
      referrer: 'https://l.instagram.com/sensitive/raw/path',
    });

    expect(success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(calls[0].url).toBe(
      'http://localhost:4242/api/analytics/session-acquisition'
    );

    const body = JSON.parse(String(calls[0].options.body));
    expect(body.schemaVersion).toBe(1);
    expect(body.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(body.source).toBe('instagram');
    expect(body.channel).toBe('social');
    expect(body.campaign).toBe('profile');
    expect(body.attributionMethod).toBe('utm');
    expect(JSON.stringify(body)).not.toContain('l.instagram.com');
    expect(JSON.stringify(body)).not.toContain('sensitive');
  });
});
