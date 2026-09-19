import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('first-run onboarding persistence', () => {
  it('persists completion and shares one PWA install controller', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    const header = readFileSync('src/components/Header/Header.tsx', 'utf8');

    expect(app).toContain('STORAGE_KEYS.FIRST_RUN_WELCOME');
    expect(app).toContain('writeStorage(STORAGE_KEYS.FIRST_RUN_WELCOME, true');
    expect(app).toContain('const pwaInstall = usePwaInstall();');
    expect(app).toContain('pwaInstall={pwaInstall}');
    expect(header).not.toContain('usePwaInstall();');
  });
});
