import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  trackIntent,
  getAnalyticsSessionId,
  rotateAnalyticsSessionId,
  SESSION_ID_STORAGE_KEY,
} from './intentAnalytics';

class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
}

describe('intentAnalytics client', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
  });

  describe('session management', () => {
    it('creates and persists a valid UUID v4 session ID in storage', () => {
      const sid = getAnalyticsSessionId(mockStorage);
      expect(sid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(mockStorage.getItem(SESSION_ID_STORAGE_KEY)).toBe(sid);

      // Subsequent call returns same session ID
      expect(getAnalyticsSessionId(mockStorage)).toBe(sid);
    });

    it('rotates session ID to a new UUID v4 on demand', () => {
      const initialSid = getAnalyticsSessionId(mockStorage);
      const rotatedSid = rotateAnalyticsSessionId(mockStorage);

      expect(rotatedSid).not.toBe(initialSid);
      expect(mockStorage.getItem(SESSION_ID_STORAGE_KEY)).toBe(rotatedSid);
      expect(getAnalyticsSessionId(mockStorage)).toBe(rotatedSid);
    });
  });

  describe('trackIntent', () => {
    it('emits compliant payload with generated clientEventId and active sessionId', async () => {
      const calls: Array<{ url: string; options: RequestInit }> = [];
      const mockFetch = vi.fn(async (url: string | URL | Request, options?: RequestInit) => {
        calls.push({ url: String(url), options: options! });
        return {
          ok: true,
          status: 200,
          json: async () => ({ accepted: true }),
        } as Response;
      });

      const sid = getAnalyticsSessionId(mockStorage);
      const result = await trackIntent(
        {
          event: 'producer_website_click',
          sourceSurface: 'producer_drawer',
          producerId: 'producer-1',
        },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
          apiBaseUrl: 'http://localhost:4242',
        }
      );

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const request = calls[0];
      expect(request.url).toBe('http://localhost:4242/api/analytics/events');
      expect(request.options.method).toBe('POST');
      expect((request.options.headers as Record<string, string>)['Content-Type']).toBe('application/json');

      const parsedBody = JSON.parse(String(request.options.body));
      expect(parsedBody.schemaVersion).toBe(1);
      expect(parsedBody.event).toBe('producer_website_click');
      expect(parsedBody.clientEventId).toBe(result.clientEventId);
      expect(parsedBody.sessionId).toBe(sid);
      expect(parsedBody.producerId).toBe('producer-1');
      expect(parsedBody.destination).toBeNull();
      expect(parsedBody.sourceSurface).toBe('producer_drawer');
      expect(parsedBody.affiliateCampaignId).toBeNull();
    });

    it('attaches authorization header when auth token provider returns a token', async () => {
      const calls: Array<{ url: string; options: RequestInit }> = [];
      const mockFetch = vi.fn(async (url: string | URL | Request, options?: RequestInit) => {
        calls.push({ url: String(url), options: options! });
        return {
          ok: true,
          status: 200,
          json: async () => ({ accepted: true }),
        } as Response;
      });

      await trackIntent(
        {
          event: 'producer_save',
          sourceSurface: 'producer_drawer',
          producerId: 'producer-1',
        },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
          getAuthToken: async () => 'test-firebase-token',
        }
      );

      expect(calls[0].options.headers).toMatchObject({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-firebase-token',
      });
    });

    it('retries on 500 error reusing the same clientEventId for idempotency', async () => {
      const payloads: any[] = [];
      let callCount = 0;
      const mockFetch = vi.fn(async (_url: string | URL | Request, options?: RequestInit) => {
        callCount++;
        payloads.push(JSON.parse(String(options?.body)));
        if (callCount < 2) {
          return {
            ok: false,
            status: 503,
            json: async () => ({ error: 'unavailable' }),
          } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ accepted: true }),
        } as Response;
      });

      const result = await trackIntent(
        {
          event: 'producer_view',
          sourceSurface: 'map_quick_card',
          producerId: 'producer-1',
        },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
          maxRetries: 2,
        }
      );

      expect(result.success).toBe(true);
      expect(callCount).toBe(2);
      expect(payloads[0].clientEventId).toBe(payloads[1].clientEventId);
    });

    it('does not retry on 400 Bad Request error', async () => {
      let callCount = 0;
      const mockFetch = vi.fn(async () => {
        callCount++;
        return {
          ok: false,
          status: 400,
          json: async () => ({ error: 'bad request' }),
        } as Response;
      });

      const result = await trackIntent(
        {
          event: 'producer_view',
          sourceSurface: 'map_quick_card',
          producerId: 'producer-1',
        },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
          maxRetries: 2,
        }
      );

      expect(result.success).toBe(false);
      expect(callCount).toBe(1);
    });

    it('rejects an event/source combination outside the frozen contract without sending a request', async () => {
      const mockFetch = vi.fn();

      const result = await trackIntent(
        {
          event: 'producer_view',
          sourceSurface: 'my_trips',
          producerId: 'producer-1',
        },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
        }
      );

      expect(result.success).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('never throws even when network fetch completely rejects', async () => {
      const mockFetch = vi.fn(async () => {
        throw new Error('Network error: Connection refused');
      });

      const result = await trackIntent(
        {
          event: 'producer_view',
          sourceSurface: 'map_quick_card',
          producerId: 'producer-1',
        },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
          maxRetries: 1,
        }
      );

      expect(result.success).toBe(false);
      expect(result.clientEventId).toBeDefined();
    });
  });

    it('allows frozen My Trips event surfaces and rejects invalid trip surfaces', async () => {
      const mockFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ accepted: true }),
      }) as Response);

      const created = await trackIntent(
        { event: 'trip_created', sourceSurface: 'my_trips' },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
          getAuthToken: async () => 'token',
        }
      );
      expect(created.success).toBe(true);

      const added = await trackIntent(
        {
          event: 'trip_producer_added',
          sourceSurface: 'trip_add_flow',
          producerId: 'producer-1',
        },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
          getAuthToken: async () => 'token',
        }
      );
      expect(added.success).toBe(true);

      const invalid = await trackIntent(
        { event: 'trip_item_reordered', sourceSurface: 'my_trips' },
        {
          fetchImpl: mockFetch as unknown as typeof fetch,
          storage: mockStorage,
          getAuthToken: async () => 'token',
        }
      );
      expect(invalid.success).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

});
