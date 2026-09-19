import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('map-first discovery layout', () => {
  it('keeps mobile and tablet discovery map-only', () => {
    const app = readFileSync('src/App.tsx', 'utf8');

    expect(app).not.toContain('Show List');
    expect(app).not.toContain('Show Map');
    expect(app).not.toContain('viewMode');
    expect(app).toContain('className="hidden lg:flex h-full shrink-0 z-10"');
  });

  it('keeps desktop producer results compact and text-only', () => {
    const card = readFileSync(
      'src/components/Sidebar/ProducerCard.tsx',
      'utf8'
    );

    expect(card).not.toContain('<img');
    expect(card).not.toContain('GooglePlaceMedia');
    expect(card).not.toContain('resolveProducerCover');
    expect(card).toContain('ProducerCategoryIcon');
  });

  it('removes obsolete map/list mode plumbing from Header and MapCanvas', () => {
    const header = readFileSync('src/components/Header/Header.tsx', 'utf8');
    const map = readFileSync('src/components/Map/MapCanvas.tsx', 'utf8');

    expect(header).not.toContain('viewMode');
    expect(header).not.toContain('onToggleViewMode');
    expect(map).not.toContain('viewMode');
  });
});
