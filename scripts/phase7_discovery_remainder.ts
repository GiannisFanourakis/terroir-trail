import fs from 'node:fs';
import path from 'node:path';

type Backup = { file: string; existed: boolean; content: string };
type State = { file: string; text: string; eol: '\n' | '\r\n' };

const targetFiles = [
  'src/App.tsx',
  'src/components/Map/MapCanvas.tsx',
  'src/components/Drawer/ProducerDetailDrawer.tsx',
  'src/services/producerService.ts',
  'ROADMAP.md',
  'src/components/phase7DiscoveryReadiness.test.ts',
] as const;

const backups: Backup[] = targetFiles.map((file) => {
  const resolved = path.resolve(file);
  const existed = fs.existsSync(resolved);
  return { file, existed, content: existed ? fs.readFileSync(resolved, 'utf8') : '' };
});

const load = (file: string): State => {
  const raw = fs.readFileSync(path.resolve(file), 'utf8');
  return {
    file,
    text: raw.replace(/\r\n/g, '\n'),
    eol: raw.includes('\r\n') ? '\r\n' : '\n',
  };
};

const save = (state: State) => {
  fs.writeFileSync(path.resolve(state.file), state.text.replace(/\n/g, state.eol));
};

const replaceOnce = (state: State, label: string, before: string, after: string) => {
  const count = state.text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}. Refusing to patch.`);
  state.text = state.text.replace(before, after);
};

const removeBetween = (state: State, label: string, start: string, end: string) => {
  const startIndex = state.text.indexOf(start);
  const secondStart = startIndex >= 0 ? state.text.indexOf(start, startIndex + start.length) : -1;
  const endIndex = startIndex >= 0 ? state.text.indexOf(end, startIndex + start.length) : -1;
  if (startIndex < 0 || secondStart >= 0 || endIndex < 0) {
    throw new Error(`${label}: marker mismatch. Refusing to patch.`);
  }
  state.text = state.text.slice(0, startIndex) + state.text.slice(endIndex);
};

const rollback = () => {
  for (const backup of backups) {
    const resolved = path.resolve(backup.file);
    if (backup.existed) fs.writeFileSync(resolved, backup.content);
    else if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
  }
};

try {
  {
    const state = load('src/App.tsx');
    replaceOnce(
      state,
      'catalogue hook result',
      `  const { producers } = useProducers({\n    destination: filters.destination,\n    category: filters.category,\n    searchQuery: filters.searchQuery,\n  });`,
      `  const {\n    producers,\n    loading: catalogueLoading,\n    error: catalogueError,\n    isLive: catalogueIsLive,\n  } = useProducers({\n    destination: filters.destination,\n    category: filters.category,\n    searchQuery: filters.searchQuery,\n  });`
    );
    replaceOnce(
      state,
      'catalogue status strip',
      `        onOpenLoops={() => setActiveModal({ type: 'loops' })}\n      />\n\n      {/* 3. Main Workspace: Sidebar List + Leaflet Map Canvas */}`,
      `        onOpenLoops={() => setActiveModal({ type: 'loops' })}\n      />\n\n      {(catalogueLoading || catalogueError || !catalogueIsLive) && (\n        <div\n          role="status"\n          aria-live="polite"\n          className={\`px-3 sm:px-6 py-1.5 text-[11px] border-b shrink-0 \${\n            catalogueError\n              ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'\n              : 'bg-stone-900 border-white/10 text-stone-400'\n          }\`}\n        >\n          {catalogueLoading\n            ? 'Refreshing producer catalogue…'\n            : catalogueError || 'Offline catalogue active — showing the audited bundled Crete data.'}\n        </div>\n      )}\n\n      {/* 3. Main Workspace: Sidebar List + Leaflet Map Canvas */}`
    );
    replaceOnce(
      state,
      'lazy modal loading fallback',
      '<Suspense fallback={null}>',
      `<Suspense fallback={(\n        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" role="status" aria-live="polite">\n          <div className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-xs font-semibold text-stone-200 shadow-2xl">Loading…</div>\n        </div>\n      )}>`
    );
    save(state);
  }

  {
    const state = load('src/components/Map/MapCanvas.tsx');
    replaceOnce(
      state,
      'remove obsolete Category import',
      "import { Producer, Category, Destination } from '../../types/terroir';",
      "import { Producer, Destination } from '../../types/terroir';"
    );
    replaceOnce(
      state,
      'Peskesi marker override start',
      `    switch (producer.category) {`,
      `    if (producer.id === 'peskesi-farm-kazani') {\n      icon = '🌿';\n      iconBg = 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50';\n    } else {\n      switch (producer.category) {`
    );
    replaceOnce(
      state,
      'Peskesi marker override close',
      `      case 'apiary':\n        icon = '🍯';\n        iconBg = 'bg-orange-500/25 text-orange-200 border-orange-500/50';\n        break;\n    }\n\n    const shortVillage`,
      `      case 'apiary':\n        icon = '🍯';\n        iconBg = 'bg-orange-500/25 text-orange-200 border-orange-500/50';\n        break;\n      }\n    }\n\n    const shortVillage`
    );
    replaceOnce(
      state,
      'unresolved fly-to guard',
      `    if (!map || !selectedProducer) return;\n\n    const [lat, lng] = selectedProducer.coordinates;`,
      `    if (!map || !selectedProducer || selectedProducer.locationStatus === 'unresolved') return;\n\n    const [lat, lng] = selectedProducer.coordinates;\n    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;`
    );
    replaceOnce(
      state,
      'category formatter',
      `  const formatCategoryName = (category: Category) => {\n    switch (category) {\n      case 'winery': return 'Winery';\n      case 'brewery': return 'Microbrewery';\n      case 'kazani': return 'Rakokazano';\n      case 'olive_mill': return 'Olive Mill';\n      case 'cheese_dairy': return 'Mountain Dairy';\n      case 'apiary': return 'Honey & Herbs';\n    }\n  };`,
      `  const formatCategoryName = (producer: Producer) => {\n    if (producer.id === 'peskesi-farm-kazani') return 'Organic Farm';\n    switch (producer.category) {\n      case 'winery': return 'Winery';\n      case 'brewery': return 'Brewery';\n      case 'kazani': return 'Rakokazano';\n      case 'olive_mill': return 'Olive Mill';\n      case 'cheese_dairy': return 'Dairy';\n      case 'apiary': return 'Apiary / Honey';\n    }\n  };`
    );
    replaceOnce(state, 'category formatter call', '{formatCategoryName(selectedProducer.category)} · {selectedProducer.region}', '{formatCategoryName(selectedProducer)} · {selectedProducer.region}');
    replaceOnce(state, 'map region semantics', '<div ref={mapContainerRef} className="w-full h-full z-0" />', '<div ref={mapContainerRef} className="w-full h-full z-0" role="region" aria-label="Interactive producer map" />');
    replaceOnce(
      state,
      'quick-card rating',
      `              <span className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-md text-amber-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">\n                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />\n                <span>{selectedProducer.rating}</span>\n              </span>`,
      `              {selectedProducer.rating != null && (\n                <span className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-md text-amber-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">\n                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" aria-hidden="true" />\n                  <span>{selectedProducer.rating}</span>\n                </span>\n              )}`
    );
    replaceOnce(
      state,
      'quick-card favorite aria',
      `                      title={isFavorite(selectedProducer.id) ? 'Remove from wishlist' : 'Save to wishlist'}\n                    >`,
      `                      title={isFavorite(selectedProducer.id) ? 'Remove from saved places' : 'Save place'}\n                      aria-label={isFavorite(selectedProducer.id) ? \`Remove \${selectedProducer.name} from saved places\` : \`Save \${selectedProducer.name}\`}\n                    >`
    );
    replaceOnce(state, 'quick-card close aria', '                      className="text-stone-400 hover:text-white p-1"\n                    >\n                      <X', '                      className="text-stone-400 hover:text-white p-1"\n                      aria-label="Close producer preview"\n                    >\n                      <X');

    const labels: Array<[string, string, string]> = [
      ['location dismiss', 'title="Dismiss"', 'title="Dismiss"\n              aria-label="Dismiss location error"'],
      ['zoom in', 'title="Zoom In"', 'title="Zoom In"\n            aria-label="Zoom in"'],
      ['zoom out', 'title="Zoom Out"', 'title="Zoom Out"\n            aria-label="Zoom out"'],
      ['reset view', 'title="Reset Destination View"', 'title="Reset Destination View"\n            aria-label="Reset destination view"'],
      ['locate me', "title={isLocating ? 'Locating...' : 'My Location'}", "title={isLocating ? 'Locating...' : 'My Location'}\n            aria-label={isLocating ? 'Locating your position' : 'Locate me'}"],
      ['topographic theme', "            onClick={() => setMapTheme('topo')}\n", "            onClick={() => setMapTheme('topo')}\n            aria-pressed={mapTheme === 'topo'}\n            aria-label=\"Use topographic map\"\n"],
      ['street theme', "            onClick={() => setMapTheme('voyager')}\n", "            onClick={() => setMapTheme('voyager')}\n            aria-pressed={mapTheme === 'voyager'}\n            aria-label=\"Use street map\"\n"],
      ['dark theme', "            onClick={() => setMapTheme('dark')}\n", "            onClick={() => setMapTheme('dark')}\n            aria-pressed={mapTheme === 'dark'}\n            aria-label=\"Use dark map\"\n"],
      ['satellite theme', "            onClick={() => setMapTheme('satellite')}\n", "            onClick={() => setMapTheme('satellite')}\n            aria-pressed={mapTheme === 'satellite'}\n            aria-label=\"Use satellite map\"\n"],
    ];
    for (const [label, before, after] of labels) replaceOnce(state, label, before, after);
    replaceOnce(state, 'pin density aria', '            title={`Map Pin Density: ${', '            aria-label="Change map pin density"\n            title={`Map Pin Density: ${');
    save(state);
  }

  {
    const state = load('src/components/Drawer/ProducerDetailDrawer.tsx');
    removeBetween(state, 'synthetic VIP defaults', '  const getVipPerks = (p: Producer) => {', '  const getCategoryTerminology =');
    replaceOnce(
      state,
      'category details',
      `  const getCategoryDetails = (cat: Producer['category']) => {\n    switch (cat) {\n      case 'winery':\n        return { label: 'Boutique Winery', icon: '🍇', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };\n      case 'brewery':\n        return { label: 'Craft Microbrewery', icon: '🍺', color: 'text-amber-300 bg-amber-400/15 border-amber-400/30' };\n      case 'kazani':\n        return { label: 'Traditional Rakokazano', icon: '🏺', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };\n      case 'olive_mill':\n        return { label: 'Artisanal Olive Mill', icon: '🫒', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };\n      case 'cheese_dairy':\n        return { label: 'Mountain Shepherd Mitato', icon: '🧀', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };\n      case 'apiary':\n        return { label: 'Wild Apiary & Herbalist', icon: '🍯', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };\n      default:\n        return { label: 'Artisan Producer', icon: '🌿', color: 'text-stone-300 bg-stone-500/10 border-white/10' };\n    }\n  };`,
      `  const getCategoryDetails = (p: Producer) => {\n    if (p.id === 'peskesi-farm-kazani') {\n      return { label: 'Organic Farm', icon: '🌿', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };\n    }\n    switch (p.category) {\n      case 'winery': return { label: 'Winery', icon: '🍇', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };\n      case 'brewery': return { label: 'Brewery', icon: '🍺', color: 'text-amber-300 bg-amber-400/15 border-amber-400/30' };\n      case 'kazani': return { label: 'Rakokazano', icon: '🏺', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };\n      case 'olive_mill': return { label: 'Olive Mill', icon: '🫒', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };\n      case 'cheese_dairy': return { label: 'Dairy', icon: '🧀', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };\n      case 'apiary': return { label: 'Apiary / Honey', icon: '🍯', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };\n      default: return { label: 'Producer', icon: '🌿', color: 'text-stone-300 bg-stone-500/10 border-white/10' };\n    }\n  };`
    );
    replaceOnce(state, 'category call', '  const cat = getCategoryDetails(producer.category);', '  const cat = getCategoryDetails(producer);');
    replaceOnce(
      state,
      'neutral terminology',
      `  const term = getCategoryTerminology(producer.category, producer.name);`,
      `  const term = {\n    ...getCategoryTerminology(producer.category, producer.name),\n    ...(producer.id === 'peskesi-farm-kazani'\n      ? { tastingNotePlaceholder: 'Record your thoughts on the farm, its cultivation, products, or your visit...' }\n      : {}),\n    visitingTitle: 'Visiting & Contact',\n    callAction: 'Call Producer',\n    callShortLabel: 'Call',\n  };`
    );
    replaceOnce(state, 'what they make tab', '          Tastings & Crafts', '          What They Make');
    replaceOnce(state, 'highlights heading', '                Signature Tastings & Pours', '                Producer Highlights');
    replaceOnce(state, 'visitor notice', '                Live Estate Bulletin', '                Visitor Notice');
    replaceOnce(state, 'media wording', '                    <span>Verified Archival Media</span>', '                    <span>Source-listed media</span>');
    replaceOnce(state, 'rights wording', '                      Clear Rights', '                      Source listed');
    replaceOnce(state, 'producer prompt', '                  <span>Are you the {term.makerTitle} of {producer.name}? Log in to manage this {term.venueName}</span>', '                  <span>Represent {producer.name}? Sign in to claim or manage this producer profile</span>');
    replaceOnce(
      state,
      'dialog semantics',
      '      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] max-w-full bg-stone-950 text-stone-100 shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300 select-none">',
      `      <div\n        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] max-w-full bg-stone-950 text-stone-100 shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300 select-none"\n        role="dialog"\n        aria-modal="true"\n        aria-label={\`Producer details: \${producer.name}\`}\n      >`
    );
    replaceOnce(state, 'share aria', '              title="Copy Link"\n            >', '              title="Copy Link"\n              aria-label={copiedLink ? \'Producer link copied\' : \'Copy producer link\'}\n            >');
    save(state);
  }

  {
    const state = load('src/services/producerService.ts');
    replaceOnce(
      state,
      'fallback provenance',
      `      } catch (err) {\n        logger.warn('Catalogue', 'producers_fetch_failed', { reason: err instanceof Error ? err.message : String(err) });\n      }`,
      `      } catch (err) {\n        cacheProvenance = 'fallback';\n        logger.warn('Catalogue', 'producers_fetch_failed', { reason: err instanceof Error ? err.message : String(err) });\n      }`
    );
    save(state);
  }

  {
    const state = load('ROADMAP.md');
    replaceOnce(state, 'Phase 7 status', '**Status:** Pending — next active phase.', '**Status:** In progress — launch-readiness audit and corrective batches underway.');
    save(state);
  }

  fs.writeFileSync(
    path.resolve('src/components/phase7DiscoveryReadiness.test.ts'),
    `import { describe, expect, it } from 'vitest';\nimport { readFileSync } from 'node:fs';\n\nconst read = (file: string) => readFileSync(file, 'utf8');\n\ndescribe('Phase 7 discovery readiness boundaries', () => {\n  it('does not rank audited producers by unsupported ratings or review counts', () => {\n    const list = read('src/components/Sidebar/ProducerList.tsx');\n    expect(list).not.toContain('Top Rated');\n    expect(list).not.toContain('Most Reviewed');\n    expect(list).toContain('a.name.localeCompare(b.name)');\n  });\n\n  it('keeps legacy Peskesi taxonomy from becoming a public rakokazano claim', () => {\n    const card = read('src/components/Sidebar/ProducerCard.tsx');\n    const map = read('src/components/Map/MapCanvas.tsx');\n    const drawer = read('src/components/Drawer/ProducerDetailDrawer.tsx');\n    for (const source of [card, map, drawer]) {\n      expect(source).toContain('peskesi-farm-kazani');\n      expect(source).toContain('Organic Farm');\n    }\n  });\n\n  it('only exposes source-backed road classifications on producer cards', () => {\n    const card = read('src/components/Sidebar/ProducerCard.tsx');\n    expect(card).toContain("p.roadAccessStatus !== 'verified'");\n    expect(card).toContain("case 'narrow_paved'");\n    expect(card).toContain("case 'unpaved_passable'");\n    expect(card).toContain("case 'high_clearance_recommended'");\n  });\n\n  it('does not fly the map to unresolved producer coordinates', () => {\n    const map = read('src/components/Map/MapCanvas.tsx');\n    expect(map).toContain("selectedProducer.locationStatus === 'unresolved'");\n    expect(map).toContain('role="region" aria-label="Interactive producer map"');\n  });\n\n  it('surfaces catalogue and lazy-modal loading state instead of failing silently', () => {\n    const app = read('src/App.tsx');\n    expect(app).toContain('loading: catalogueLoading');\n    expect(app).toContain('error: catalogueError');\n    expect(app).toContain('isLive: catalogueIsLive');\n    expect(app).not.toContain('<Suspense fallback={null}>');\n  });\n\n  it('removes synthetic VIP defaults from the public producer drawer', () => {\n    const drawer = read('src/components/Drawer/ProducerDetailDrawer.tsx');\n    expect(drawer).not.toContain('const getVipPerks');\n    expect(drawer).not.toContain('Mountain Shepherd Mitato');\n    expect(drawer).not.toContain('Wild Apiary & Herbalist');\n    expect(drawer).not.toContain('Tastings & Crafts');\n    expect(drawer).toContain('What They Make');\n  });\n\n  it('marks failed live catalogue requests as fallback provenance', () => {\n    const service = read('src/services/producerService.ts');\n    expect(service).toContain("cacheProvenance = 'fallback';");\n    expect(service).toContain("logger.warn('Catalogue', 'producers_fetch_failed'");\n  });\n});\n`
  );

  console.log('✓ Phase 7 discovery remainder applied');
} catch (error) {
  rollback();
  throw error;
}
