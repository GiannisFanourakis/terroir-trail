import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Phase 7 traveler state boundaries', () => {
  it('scopes browser-local favorites to the authenticated account', () => {
    const app = read('src/App.tsx');
    const favorites = read('src/hooks/useFavorites.ts');

    expect(app).toContain('useFavorites(user?.id)');
    expect(app).not.toContain('useFavorites();');
    expect(favorites).toContain('const getFavoritesStorageKey = (ownerId?: string | null) =>');
    expect(favorites).toContain('GUEST_FAVORITES_KEY');
  });

  it('does not claim that local favorites sync across devices', () => {
    const authModal = read('src/components/Auth/AuthModal.tsx');

    expect(authModal).not.toContain('favorites and personal notes across devices');
    expect(authModal).toContain('Saved favorites remain on this device.');
  });

  it('propagates tasting-note deletions from the authoritative cloud profile', () => {
    const authHook = read('src/hooks/useAuth.ts');

    expect(authHook).toContain('personalNotes: cloudData.personalNotes ?? prev.personalNotes');
    expect(authHook).not.toContain('personalNotes: { ...prev.personalNotes, ...(cloudData.personalNotes || {}) }');
  });

  it('builds Passport progress from the stable producer catalogue', () => {
    const passport = read('src/components/Auth/PassportModal.tsx');

    expect(passport).toContain('producerService.getCachedProducers()');
    expect(passport).toContain('const totalCount = passportProducers.length;');
    expect(passport).toContain('totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0');
  });
});
