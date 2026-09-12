import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './apiOrigin';

describe('resolveApiBaseUrl', () => {
  it('returns empty string for web when VITE_API_BASE_URL is undefined or empty', () => {
    expect(resolveApiBaseUrl(undefined, false)).toBe('');
    expect(resolveApiBaseUrl('', false)).toBe('');
    expect(resolveApiBaseUrl('   ', false)).toBe('');
  });

  it('returns trimmed base URL without trailing slash for web when explicitly set', () => {
    expect(resolveApiBaseUrl('https://api.example.com', false)).toBe('https://api.example.com');
    expect(resolveApiBaseUrl('https://api.example.com/', false)).toBe('https://api.example.com');
    expect(resolveApiBaseUrl('https://api.example.com///', false)).toBe('https://api.example.com');
  });

  it('falls back to public HTTPS TerroirTrail gateway on native platforms when VITE_API_BASE_URL is unset', () => {
    expect(resolveApiBaseUrl(undefined, true)).toBe('https://terroir-trail.web.app');
    expect(resolveApiBaseUrl('', true)).toBe('https://terroir-trail.web.app');
    expect(resolveApiBaseUrl('   ', true)).toBe('https://terroir-trail.web.app');
  });

  it('uses explicitly configured VITE_API_BASE_URL on native platforms when provided', () => {
    expect(resolveApiBaseUrl('https://custom-gateway.terroirtrail.com', true)).toBe(
      'https://custom-gateway.terroirtrail.com'
    );
    expect(resolveApiBaseUrl('https://custom-gateway.terroirtrail.com/', true)).toBe(
      'https://custom-gateway.terroirtrail.com'
    );
  });
});
