const origin = (
  process.env.SMOKE_PUBLIC_ORIGIN || 'https://terroir-trail.web.app'
).replace(/\/+$/, '');
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 20_000);

type Check = {
  path: string;
  contentType?: string;
  includes?: string[];
};

const checks: Check[] = [
  { path: '/', contentType: 'text/html', includes: ['TerroirTrail'] },
  {
    path: '/version.json',
    contentType: 'application/json',
    includes: ['buildId'],
  },
  {
    path: '/manifest.json',
    contentType: 'application/manifest+json',
    includes: ['TerroirTrail'],
  },
  {
    path: '/catalogue-state.json',
    contentType: 'application/json',
    includes: ['catalogueHash', 'producers', 'destinations', 'countries'],
  },
  { path: '/offline.html', contentType: 'text/html', includes: ['You’re offline'] },
  {
    path: '/api/health',
    contentType: 'application/json',
    includes: ['ok'],
  },
];

for (const check of checks) {
  const url = `${origin}${check.path}`;
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`${check.path} returned HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (check.contentType && !contentType.includes(check.contentType)) {
    throw new Error(
      `${check.path} returned content-type ${contentType}; expected ${check.contentType}`
    );
  }

  const body = await response.text();
  for (const required of check.includes || []) {
    if (!body.includes(required)) {
      throw new Error(`${check.path} is missing expected content: ${required}`);
    }
  }

  console.log(`[public smoke] ${check.path} ✓`);
}

const version = await (
  await fetch(`${origin}/version.json?t=${Date.now()}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  })
).json();

if (!version?.buildId || typeof version.buildId !== 'string') {
  throw new Error('version.json does not contain a valid buildId.');
}

const catalogueState = await (
  await fetch(`${origin}/catalogue-state.json?t=${Date.now()}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  })
).json();

if (
  !catalogueState?.catalogueHash ||
  typeof catalogueState.catalogueHash !== 'string' ||
  !Number.isInteger(catalogueState.producers)
) {
  throw new Error('catalogue-state.json does not contain a valid synchronized catalogue state.');
}

console.log(`[public smoke] live build ${version.buildId}`);
console.log(
  `[public smoke] catalogue ${catalogueState.producers} producers / hash ${catalogueState.catalogueHash.slice(0, 12)}…`
);
console.log('[public smoke] production surface is healthy.');
