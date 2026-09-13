import fs from 'node:fs';
import path from 'node:path';

const targetFiles = [
  'src/App.tsx',
  'src/components/Map/MapCanvas.tsx',
  'src/components/Drawer/ProducerDetailDrawer.tsx',
  'src/services/producerService.ts',
  'ROADMAP.md',
  'src/components/phase7DiscoveryReadiness.test.ts',
] as const;

const backups = new Map<string, { existed: boolean; content: string }>();
for (const file of targetFiles) {
  const resolved = path.resolve(file);
  const existed = fs.existsSync(resolved);
  backups.set(file, { existed, content: existed ? fs.readFileSync(resolved, 'utf8') : '' });
}

const restore = () => {
  for (const [file, backup] of backups) {
    const resolved = path.resolve(file);
    if (backup.existed) fs.writeFileSync(resolved, backup.content);
    else if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
  }
};

const replaceExactlyOnce = (file: string, label: string, before: string, after: string) => {
  const resolved = path.resolve(file);
  const raw = fs.readFileSync(resolved, 'utf8');
  const count = raw.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}. Refusing to patch.`);
  fs.writeFileSync(resolved, raw.replace(before, after));
};

async function run() {
  try {
    await import('./phase7_patch_discovery_readiness');

    replaceExactlyOnce(
      'src/components/Map/MapCanvas.tsx',
      'remove obsolete Category import',
      "import { Producer, Category, Destination } from '../../types/terroir';",
      "import { Producer, Destination } from '../../types/terroir';"
    );

    replaceExactlyOnce(
      'src/components/Drawer/ProducerDetailDrawer.tsx',
      'Peskesi note terminology',
      `  const term = {\n    ...getCategoryTerminology(producer.category, producer.name),\n    visitingTitle: 'Visiting & Contact',\n    callAction: 'Call Producer',\n    callShortLabel: 'Call',\n  };`,
      `  const term = {\n    ...getCategoryTerminology(producer.category, producer.name),\n    ...(producer.id === 'peskesi-farm-kazani'\n      ? { tastingNotePlaceholder: 'Record your thoughts on the farm, its cultivation, products, or your visit...' }\n      : {}),\n    visitingTitle: 'Visiting & Contact',\n    callAction: 'Call Producer',\n    callShortLabel: 'Call',\n  };`
    );

    const themeButtons: Array<[string, string, string]> = [
      ['topographic theme accessibility', "            onClick={() => setMapTheme('topo')}\n", "            onClick={() => setMapTheme('topo')}\n            aria-pressed={mapTheme === 'topo'}\n            aria-label=\"Use topographic map\"\n"],
      ['street theme accessibility', "            onClick={() => setMapTheme('voyager')}\n", "            onClick={() => setMapTheme('voyager')}\n            aria-pressed={mapTheme === 'voyager'}\n            aria-label=\"Use street map\"\n"],
      ['dark theme accessibility', "            onClick={() => setMapTheme('dark')}\n", "            onClick={() => setMapTheme('dark')}\n            aria-pressed={mapTheme === 'dark'}\n            aria-label=\"Use dark map\"\n"],
      ['satellite theme accessibility', "            onClick={() => setMapTheme('satellite')}\n", "            onClick={() => setMapTheme('satellite')}\n            aria-pressed={mapTheme === 'satellite'}\n            aria-label=\"Use satellite map\"\n"],
    ];
    for (const [label, before, after] of themeButtons) {
      replaceExactlyOnce('src/components/Map/MapCanvas.tsx', label, before, after);
    }

    console.log('✓ Phase 7 discovery readiness patch applied');
  } catch (error) {
    restore();
    throw error;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
