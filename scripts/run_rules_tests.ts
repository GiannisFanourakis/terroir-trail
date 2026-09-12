import { spawn, spawnSync, execSync } from 'child_process';
import path from 'path';

const env = { ...process.env };

// Resolve JAVA_HOME from environment or registry (on Windows, if process hasn't inherited updated user env)
let javaHome = env.JAVA_HOME;
if (process.platform === 'win32') {
  try {
    const regOut = execSync('reg query HKCU\\Environment /v JAVA_HOME', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const match = regOut.match(/JAVA_HOME\s+REG_\w+\s+(.*)/i);
    if (match && match[1]) {
      javaHome = match[1].trim();
    }
  } catch {
    // Keep existing process.env.JAVA_HOME
  }
}

if (javaHome) {
  env.JAVA_HOME = javaHome;
  const javaBin = path.join(javaHome, 'bin');
  const pathKey = Object.keys(env).find((k) => k.toLowerCase() === 'path') || 'PATH';
  env[pathKey] = `${javaBin}${path.delimiter}${env[pathKey] || ''}`;
}

// Verify that Java is installed and meets the Firestore emulator requirement (Java 21+)
const javaCheck = spawnSync('java', ['-version'], { env, encoding: 'utf-8' });
if (javaCheck.error || (javaCheck.status !== 0 && !javaCheck.stderr && !javaCheck.stdout)) {
  console.error(
    '\n[Error] Java is required to run the Firestore emulator, but "java" could not be executed.\n' +
    'Please install Java 21 or higher and ensure JAVA_HOME is configured or java is on PATH.\n'
  );
  process.exit(1);
}

const versionOutput = `${javaCheck.stderr || ''}\n${javaCheck.stdout || ''}`;
const versionMatch = versionOutput.match(/(?:version|openjdk)\s+"?(\d+)(?:\.(\d+))?/i);
if (versionMatch) {
  const major = versionMatch[1] === '1' ? parseInt(versionMatch[2], 10) : parseInt(versionMatch[1], 10);
  if (major < 21) {
    console.error(
      `\n[Error] The Firestore emulator requires Java 21 or higher, but found Java version ${major}.\n` +
      `Detected output: ${versionOutput.split('\n')[0]}\n` +
      'Please update your JAVA_HOME environment variable to point to a valid JDK 21+ installation.\n'
    );
    process.exit(1);
  }
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
