import { spawn } from 'child_process';
import path from 'path';

const jdk21 = 'C:\\Users\\giana\\AppData\\Local\\Programs\\Temurin\\jdk-21';
const env = { ...process.env };
if (!env.JAVA_HOME || !env.JAVA_HOME.includes('jdk-21')) {
  env.JAVA_HOME = jdk21;
  env.PATH = `${path.join(jdk21, 'bin')};${env.PATH}`;
}

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(
  npxCmd,
  [
    'firebase-tools',
    'emulators:exec',
    '--only',
    'firestore',
    '"vitest run tests/firestoreRules.test.ts"',
  ],
  {
    stdio: 'inherit',
    env,
    shell: true,
  }
);

child.on('close', (code) => {
  process.exit(code ?? 0);
});
