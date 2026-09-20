import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Phase 7 discovery readiness boundaries', () => {
  it('does not rank map discovery by unsupported ratings or review counts', () => {
    const app = read('src/App.tsx');
    const map = read('src/components/Map/MapCanvas.tsx');
    for (const source of [app, map]) {
      expect(source).not.toContain('Top Rated');
      expect(source).not.toContain('Most Reviewed');
      expect(source).not.toContain('.sort((a, b) => b.rating');
      expect(source).not.toContain('.sort((a, b) => b.reviewCount');
    }
  });

  it('keeps Peskesi taxonomy aligned with farm rather than distillery', () => {
    const helper = read('src/utils/producerCategory.ts');
    expect(helper).toContain('getEffectiveProducerCategory');

    const map = read('src/components/Map/MapCanvas.tsx');
    const drawer = read('src/components/Drawer/ProducerDetailDrawer.tsx');
    for (const source of [map, drawer]) {
      expect(source).toContain('getEffectiveProducerCategory');
      expect(source).toContain("'farm'");
    }
    expect(drawer).toContain('Farm & Visiting');
    expect(drawer).toContain('Call Farm');
  });

  it('only exposes source-backed road classifications in producer details', () => {
    const drawer = read('src/components/Drawer/ProducerDetailDrawer.tsx');
    expect(drawer).toContain("p.roadAccessStatus !== 'verified'");
    expect(drawer).toContain("narrow_paved:");
    expect(drawer).toContain("unpaved_passable:");
    expect(drawer).toContain("high_clearance_recommended:");
  });

  it('does not fly the map to unresolved producer coordinates', () => {
    const map = read('src/components/Map/MapCanvas.tsx');
    expect(map).toContain("selectedProducer.locationStatus === 'unresolved'");
    expect(map).toContain(
      'role="region" aria-label="Interactive producer map"'
    );
  });

  it('surfaces catalogue and lazy-modal loading state instead of failing silently', () => {
    const app = read('src/App.tsx');
    expect(app).toContain('loading: catalogueLoading');
    expect(app).toContain('error: catalogueError');
    expect(app).toContain('isLive: catalogueIsLive');
    expect(app).not.toContain('<Suspense fallback={null}>');
    const hook = read('src/hooks/useProducers.ts');
    expect(hook).toContain('const [loading, setLoading] = useState<boolean>(true);');
  });

  it('removes synthetic VIP defaults from the public producer drawer', () => {
    const drawer = read('src/components/Drawer/ProducerDetailDrawer.tsx');
    expect(drawer).not.toContain('const getVipPerks');
    expect(drawer).not.toContain('Mountain Shepherd Mitato');
    expect(drawer).not.toContain('Wild Apiary & Herbalist');
    expect(drawer).not.toContain('Tastings & Crafts');
    expect(drawer).toContain('What They Make');
  });

  it('marks failed live catalogue requests as fallback provenance', () => {
    const service = read('src/services/producerService.ts');
    expect(service).toContain("cacheProvenance = 'fallback';");
    expect(service).toContain("logger.warn('Catalogue', 'producers_fetch_failed'");
  });
});
