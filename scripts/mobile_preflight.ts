import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env and .env.local if present
const rootDir = process.cwd();
if (fs.existsSync(path.join(rootDir, '.env'))) {
  dotenv.config({ path: path.join(rootDir, '.env') });
}
if (fs.existsSync(path.join(rootDir, '.env.local'))) {
  dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });
}

interface PreflightOptions {
  platform: 'android' | 'ios' | 'all';
  strict?: boolean;
}

const REQUIRED_FIREBASE_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

export function runMobilePreflight(options: PreflightOptions): boolean {
  console.log('====================================================');
  console.log(`RUNNING TERROIRTRAIL MOBILE PREFLIGHT [${options.platform.toUpperCase()}]`);
  console.log('====================================================\n');

  let passed = true;

  // 1. Check required Firebase environment variables presence (NEVER print values)
  console.log('--- Firebase Client Environment Checks ---');
  for (const varName of REQUIRED_FIREBASE_VARS) {
    const val = process.env[varName];
    if (val && val.trim().length > 0) {
      console.log(`[OK] ${varName} is configured`);
    } else {
      console.error(`[FAIL] ${varName} is missing or empty`);
      passed = false;
    }
  }

  // 2. Enforce Explorer Pass purchases remain disabled
  console.log('\n--- Commercial Feature Flags ---');
  const explorerPurchases = process.env.VITE_ENABLE_EXPLORER_PASS_PURCHASES;
  if (explorerPurchases === 'true') {
    console.error('[FAIL] VITE_ENABLE_EXPLORER_PASS_PURCHASES must NOT be true in mobile builds.');
    passed = false;
  } else {
    console.log('[OK] VITE_ENABLE_EXPLORER_PASS_PURCHASES is disabled (pilot safety active)');
  }

  // 3. API Base URL validation
  console.log('\n--- API Connectivity Configuration ---');
  const apiBaseUrl = process.env.VITE_API_BASE_URL;
  if (apiBaseUrl && apiBaseUrl.trim().length > 0) {
    try {
      const parsed = new URL(apiBaseUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        console.error(`[FAIL] VITE_API_BASE_URL has invalid protocol: ${parsed.protocol}`);
        passed = false;
      } else {
        console.log(`[OK] VITE_API_BASE_URL is valid (${parsed.protocol}//${parsed.host})`);
      }
    } catch {
      console.error('[FAIL] VITE_API_BASE_URL is not a valid URL');
      passed = false;
    }
  } else {
    console.log('[OK] VITE_API_BASE_URL is blank; native app will use public HTTPS gateway: https://terroir-trail.web.app');
  }

  // 4. Android Configuration Check
  if (options.platform === 'android' || options.platform === 'all') {
    console.log('\n--- Android Platform Configuration ---');
    const googleServicesPath = path.join(rootDir, 'android', 'app', 'google-services.json');
    if (fs.existsSync(googleServicesPath)) {
      console.log('[OK] android/app/google-services.json exists');
    } else {
      console.error('[FAIL] android/app/google-services.json is missing');
      passed = false;
    }
  }

  // 5. iOS Configuration Check
  if (options.platform === 'ios' || options.platform === 'all') {
    console.log('\n--- iOS Platform Configuration ---');
    const googleServiceInfoPath = path.join(rootDir, 'ios', 'App', 'App', 'GoogleService-Info.plist');
    if (fs.existsSync(googleServiceInfoPath)) {
      console.log('[OK] ios/App/App/GoogleService-Info.plist exists');
    } else {
      console.warn('[WARN] ios/App/App/GoogleService-Info.plist is missing. IOS_FIREBASE_CONFIG_REQUIRED');
      if (options.strict) {
        passed = false;
      }
    }

    const entitlementsPath = path.join(rootDir, 'ios', 'App', 'App', 'App.entitlements');
    if (fs.existsSync(entitlementsPath)) {
      console.log('[OK] ios/App/App/App.entitlements exists (Sign in with Apple configured)');
    } else {
      console.warn('[WARN] ios/App/App/App.entitlements is missing');
      if (options.strict) passed = false;
    }
  }

  console.log('\n====================================================');
  if (passed) {
    console.log('MOBILE PREFLIGHT PASSED');
  } else {
    console.error('MOBILE PREFLIGHT FAILED');
  }
  console.log('====================================================\n');

  return passed;
}

// CLI entrypoint
const arg = (process.argv[2] || 'all').toLowerCase();
const platform: 'android' | 'ios' | 'all' =
  arg === 'android' ? 'android' : arg === 'ios' ? 'ios' : 'all';
const isStrict = process.argv.includes('--strict');

const success = runMobilePreflight({ platform, strict: isStrict });
if (!success) {
  process.exit(1);
}
