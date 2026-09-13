import fs from 'node:fs';
import path from 'node:path';

type Backup = { file: string; existed: boolean; content: string };

type FileState = {
  file: string;
  text: string;
  eol: '\n' | '\r\n';
};

const files = [
  'src/App.tsx',
  'src/components/Auth/AuthModal.tsx',
  'src/components/Auth/PassportModal.tsx',
  'src/hooks/useAuth.ts',
  'src/components/phase7TravelerState.test.ts',
];

const backups: Backup[] = files.map((file) => {
  const resolved = path.resolve(file);
  const existed = fs.existsSync(resolved);
  return {
    file,
    existed,
    content: existed ? fs.readFileSync(resolved, 'utf8') : '',
  };
});

const load = (file: string): FileState => {
  const raw = fs.readFileSync(path.resolve(file), 'utf8');
  return {
    file,
    text: raw.replace(/\r\n/g, '\n'),
    eol: raw.includes('\r\n') ? '\r\n' : '\n',
  };
};

const save = (state: FileState) => {
  fs.writeFileSync(path.resolve(state.file), state.text.replace(/\n/g, state.eol));
};

const replaceOnce = (state: FileState, label: string, before: string, after: string) => {
  const count = state.text.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${count}. Refusing to patch.`);
  }
  state.text = state.text.replace(before, after);
};

const rollback = () => {
  for (const backup of backups) {
    const resolved = path.resolve(backup.file);
    if (backup.existed) {
      fs.writeFileSync(resolved, backup.content);
    } else if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
    }
  }
};

try {
  // App: favorites remain browser-local but are isolated per authenticated account.
  {
    const state = load('src/App.tsx');
    replaceOnce(
      state,
      'remove unscoped favorites hook',
      '  const { favorites, toggleFavorite, isFavorite } = useFavorites();\n',
      ''
    );
    replaceOnce(
      state,
      'insert account-scoped favorites hook',
      '  } = useAuth();\n',
      "  } = useAuth();\n\n  const { favorites, toggleFavorite, isFavorite } = useFavorites(user?.id);\n"
    );
    save(state);
  }

  // Auth copy: do not imply browser-local favorites are cross-device account data.
  {
    const state = load('src/components/Auth/AuthModal.tsx');
    replaceOnce(
      state,
      'traveler persistence copy',
      'Sign in to save stamps, favorites and personal notes across devices.',
      'Sign in to sync passport stamps and personal notes. Saved favorites remain on this device.'
    );
    save(state);
  }

  // Cloud note map is authoritative when present so remote deletions propagate.
  {
    const state = load('src/hooks/useAuth.ts');
    replaceOnce(
      state,
      'authoritative personal notes sync',
      '          personalNotes: { ...prev.personalNotes, ...(cloudData.personalNotes || {}) },',
      '          personalNotes: cloudData.personalNotes ?? prev.personalNotes,'
    );
    save(state);
  }

  // Passport: use the stable producer cache rather than the active discovery query result.
  {
    const state = load('src/components/Auth/PassportModal.tsx');
    replaceOnce(
      state,
      'passport producer service import',
      "import { getCategoryFallbackImage } from '../../utils/imageFallbacks';\n",
      "import { getCategoryFallbackImage } from '../../utils/imageFallbacks';\nimport { producerService } from '../../services/producerService';\n"
    );
    replaceOnce(
      state,
      'passport catalogue and progress',
      "  const visitedCount = user.visitedProducers?.length ?? 0;\n  const progressPercent = Math.round((visitedCount / producers.length) * 100);\n\n  const filteredProducers = producers.filter((p) => {",
      "  const cachedCatalogue = producerService.getCachedProducers();\n  const passportProducers = cachedCatalogue.length > 0 ? cachedCatalogue : producers;\n  const passportProducerIds = new Set(passportProducers.map((producer) => producer.id));\n  const visitedCount = user.visitedProducers?.filter((id) => passportProducerIds.has(id)).length ?? 0;\n  const totalCount = passportProducers.length;\n  const progressPercent = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;\n\n  const filteredProducers = passportProducers.filter((p) => {"
    );
    replaceOnce(
      state,
      'passport header total',
      '{visitedCount} of {producers.length} places stamped',
      '{visitedCount} of {totalCount} places stamped'
    );
    replaceOnce(
      state,
      'passport all total',
      'All ({producers.length})',
      'All ({totalCount})'
    );
    replaceOnce(
      state,
      'passport remaining total',
      'Remaining ({producers.length - visitedCount})',
      'Remaining ({totalCount - visitedCount})'
    );
    save(state);
  }

  fs.writeFileSync(
    path.resolve('src/components/phase7TravelerState.test.ts'),
    `import { describe, expect, it } from 'vitest';\nimport { readFileSync } from 'node:fs';\n\nconst read = (file: string) => readFileSync(file, 'utf8');\n\ndescribe('Phase 7 traveler state boundaries', () => {\n  it('scopes browser-local favorites to the authenticated account', () => {\n    const app = read('src/App.tsx');\n    const favorites = read('src/hooks/useFavorites.ts');\n\n    expect(app).toContain('useFavorites(user?.id)');\n    expect(app).not.toContain('useFavorites();');\n    expect(favorites).toContain('const getFavoritesStorageKey = (ownerId?: string | null) =>');\n    expect(favorites).toContain('GUEST_FAVORITES_KEY');\n  });\n\n  it('does not claim that local favorites sync across devices', () => {\n    const authModal = read('src/components/Auth/AuthModal.tsx');\n\n    expect(authModal).not.toContain('favorites and personal notes across devices');\n    expect(authModal).toContain('Saved favorites remain on this device.');\n  });\n\n  it('propagates tasting-note deletions from the authoritative cloud profile', () => {\n    const authHook = read('src/hooks/useAuth.ts');\n\n    expect(authHook).toContain('personalNotes: cloudData.personalNotes ?? prev.personalNotes');\n    expect(authHook).not.toContain('personalNotes: { ...prev.personalNotes, ...(cloudData.personalNotes || {}) }');\n  });\n\n  it('builds Passport progress from the stable producer catalogue', () => {\n    const passport = read('src/components/Auth/PassportModal.tsx');\n\n    expect(passport).toContain('producerService.getCachedProducers()');\n    expect(passport).toContain('const totalCount = passportProducers.length;');\n    expect(passport).toContain('totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0');\n  });\n});\n`
  );

  console.log('✓ Phase 7 traveler state patch applied');
} catch (error) {
  rollback();
  throw error;
}
