import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');
const baseline = '20260924043034_harden_public_default_privileges.sql';

const files = fs
  .readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql') && name > baseline)
  .sort();

const errors = [];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const file of files) {
  const fullPath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(fullPath, 'utf8');
  const createTableRe =
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([-_a-zA-Z0-9]+)/gim;

  for (const match of sql.matchAll(createTableRe)) {
    const table = match[1] || '';
    if (!table) continue;

    const tableRef = 'public\\.' + escapeRegex(table);
    const rlsRe = new RegExp(
      'alter\\s+table\\s+' +
        tableRef +
        '\\s+enable\\s+row\\s+level\\s+security',
      'im'
    );
    const grantRe = new RegExp(
      'grant\\s+[\\s\\S]{0,240}?on\\s+(?:table\\s+)?' +
        tableRef +
        '\\s+to\\s+[\\s\\S]{0,120}?(?:anon|authenticated|service_role)',
      'im'
    );
    const privateMarkerRe = new RegExp(
      '--\\s*data-api:\\s*private\\s+public\\.' + escapeRegex(table) + '\\b',
      'im'
    );

    if (!rlsRe.test(sql)) {
      errors.push(
        file +
          ': public.' +
          table +
          ' is created without ENABLE ROW LEVEL SECURITY.'
      );
    }

    if (!grantRe.test(sql) && !privateMarkerRe.test(sql)) {
      errors.push(
        file +
          ': public.' +
          table +
          ' has no explicit GRANT and no "-- data-api: private public.' +
          table +
          '" marker.'
      );
    }
  }
}

if (errors.length > 0) {
  process.stderr.write('Supabase public-table access check failed:\n');
  for (const error of errors) process.stderr.write('- ' + error + '\n');
  process.stderr.write(
    '\nEvery new public table must enable RLS and explicitly declare either role GRANTs or an intentional private-table marker.\n'
  );
  process.exit(1);
}

process.stdout.write(
  'Supabase public-table access check passed for ' +
    files.length +
    ' migration(s) after ' +
    baseline +
    '.\n'
);
