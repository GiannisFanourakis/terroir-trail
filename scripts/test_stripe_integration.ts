// Retained as a direct entry point for the verified-pass regression suite.
import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['--import', 'tsx', '--test',
  'server/tests/passApi.test.ts', 'server/tests/passPolicy.test.ts'], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
