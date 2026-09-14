import fs from 'node:fs';
import path from 'node:path';

type Backup = { file: string; existed: boolean; content: string };

const files = [
  'src/hooks/useProducers.ts',
  'src/components/Drawer/ProducerDetailDrawer.tsx',
  'src/components/phase7DiscoveryReadiness.test.ts',
] as const;

const backups: Backup[] = files.map((file) => {
  const resolved = path.resolve(file);
  const existed = fs.existsSync(resolved);
  return { file, existed, content: existed ? fs.readFileSync(resolved, 'utf8') : '' };
});

const replaceExactlyOnce = (file: string, label: string, before: string, after: string) => {
  const resolved = path.resolve(file);
  const raw = fs.readFileSync(resolved, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const source = raw.replace(/\r\n/g, '\n');
  const normalizedBefore = before.replace(/\r\n/g, '\n');
  const normalizedAfter = after.replace(/\r\n/g, '\n');
  const count = source.split(normalizedBefore).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  const updated = source.replace(normalizedBefore, normalizedAfter);
  fs.writeFileSync(resolved, updated.replace(/\n/g, eol));
};

const restore = () => {
  for (const backup of backups) {
    const resolved = path.resolve(backup.file);
    if (backup.existed) fs.writeFileSync(resolved, backup.content);
    else if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
  }
};

try {
  replaceExactlyOnce(
    'src/hooks/useProducers.ts',
    'initial catalogue loading state',
    '  const [loading, setLoading] = useState<boolean>(false);',
    '  const [loading, setLoading] = useState<boolean>(true);'
  );

  replaceExactlyOnce(
    'src/components/Drawer/ProducerDetailDrawer.tsx',
    'Peskesi legacy-category terminology override',
    [
      "    ...(producer.id === 'peskesi-farm-kazani'",
      "      ? { tastingNotePlaceholder: 'Record your thoughts on the farm, its cultivation, products, or your visit...' }",
      '      : {}),',
    ].join('\n'),
    [
      "    ...(producer.id === 'peskesi-farm-kazani'",
      '      ? {',
      "          tastingNotePlaceholder: 'Record your thoughts on the farm, its cultivation, products, or your visit...',",
      "          visitingTitle: 'Farm & Visiting',",
      "          callAction: 'Call Farm',",
      "          callShortLabel: 'Call Farm',",
      '        }',
      '      : {}),',
    ].join('\n')
  );

  replaceExactlyOnce(
    'src/components/phase7DiscoveryReadiness.test.ts',
    'Peskesi regression assertions',
    "      expect(source).toContain('Organic Farm');\n    }",
    "      expect(source).toContain('Organic Farm');\n    }\n    expect(drawer).toContain('Farm & Visiting');\n    expect(drawer).toContain('Call Farm');"
  );

  replaceExactlyOnce(
    'src/components/phase7DiscoveryReadiness.test.ts',
    'catalogue initial loading regression',
    "    expect(app).not.toContain('<Suspense fallback={null}>');",
    "    expect(app).not.toContain('<Suspense fallback={null}>');\n    const hook = read('src/hooks/useProducers.ts');\n    expect(hook).toContain('const [loading, setLoading] = useState<boolean>(true);');"
  );

  console.log('✓ Phase 7 discovery final touch applied');
} catch (error) {
  restore();
  throw error;
}
