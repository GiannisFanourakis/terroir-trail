import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('map-first discovery layout', () => {
  it('uses the interactive map as the discovery surface at every breakpoint', () => {
    const app = readFileSync('src/App.tsx', 'utf8');

    expect(app).not.toContain('ProducerList');
    expect(app).not.toContain('Show List');
    expect(app).not.toContain('Show Map');
    expect(app).not.toContain('viewMode');
  });

  it('has no dormant sidebar producer-card implementation in App', () => {
    const app = readFileSync('src/App.tsx', 'utf8');

    expect(app).not.toContain('./components/Sidebar/');
  });

  it('keeps tablet map preview and producer drawer touch-friendly', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    const map = readFileSync('src/components/Map/MapCanvas.tsx', 'utf8');
    const drawer = readFileSync(
      'src/components/Drawer/ProducerDetailDrawer.tsx',
      'utf8'
    );
    const filters = readFileSync(
      'src/components/FilterBar/FilterBar.tsx',
      'utf8'
    );

    expect(map).toContain('md:w-[560px]');
    expect(map).toContain('md:min-h-[44px]');
    expect(drawer).toContain('md:w-[560px]');
    expect(drawer).toContain('w-11 h-11 sm:w-10 sm:h-10');
    expect(filters).toContain('min-h-[44px] lg:min-h-[32px]');
    expect(app).toMatch(
      /setIsDrawerOpen\(false\);\s+setSelectedProducer\(producer\);/
    );
  });

  it('keeps obsolete map/list mode plumbing removed', () => {
    const header = readFileSync('src/components/Header/Header.tsx', 'utf8');
    const map = readFileSync('src/components/Map/MapCanvas.tsx', 'utf8');

    expect(header).not.toContain('viewMode');
    expect(header).not.toContain('onToggleViewMode');
    expect(map).not.toContain('viewMode');
  });
});
