import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';

type Viewport = { name: string; width: number; height: number };

const viewports: Viewport[] = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'ipad-portrait', width: 834, height: 1194 },
  { name: 'ipad-landscape', width: 1194, height: 834 },
  { name: 'desktop', width: 1440, height: 900 },
];

const timeoutMs = Number(process.env.E2E_TIMEOUT_MS || 18_000);
const productionOrigin = process.argv.includes('--production')
  ? 'https://terroir-trail.web.app'
  : '';
const externalOrigin = (process.env.E2E_BASE_URL || productionOrigin)
  .trim()
  .replace(/\/+$/, '');
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function stopChromeProcess(
  processHandle: ChildProcess | null
): Promise<void> {
  if (!processHandle || processHandle.exitCode !== null) return;

  const exited = new Promise<void>((resolve) => {
    processHandle.once('exit', () => resolve());
    processHandle.once('close', () => resolve());
  });

  try {
    processHandle.kill('SIGKILL');
  } catch {
    return;
  }

  await Promise.race([exited, delay(2_000)]);
}

async function cleanupChromeProfile(profilePath: string): Promise<void> {
  // Chrome's Windows Crashpad process can hold CrashpadMetrics-active.pma for a
  // brief moment after the browser has exited. Retry removal, then treat a
  // lingering temp-profile lock as cleanup-only rather than a smoke-test failure.
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      fs.rmSync(profilePath, {
        recursive: true,
        force: true,
        maxRetries: 2,
        retryDelay: 100,
      });
      return;
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as NodeJS.ErrnoException).code)
          : '';

      if (!['EBUSY', 'EPERM', 'ENOTEMPTY'].includes(code)) throw error;
      if (attempt === 8) {
        console.warn(
          '[browser smoke] temporary Chrome profile is still locked; cleanup will be left to the OS:',
          profilePath
        );
        return;
      }
      await delay(150 * attempt);
    }
  }
}

function findChrome(): string {
  const candidates = [
    (process.env.CHROME_BIN || '').trim(),
    process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : '',
    process.platform === 'win32'
      ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      : '',
    process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean) as string[];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      'Chrome/Chromium was not found. Set CHROME_BIN to run the browser quality smoke.'
    );
  }
  return found;
}

function contentType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg'))
    return 'image/jpeg';
  if (filePath.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

async function startStaticServer(): Promise<{
  origin: string;
  close: () => Promise<void>;
}> {
  const root = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(path.join(root, 'index.html'))) {
    throw new Error(
      'dist/index.html is missing. Run npm run build before test:browser.'
    );
  }

  const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = path.join(root, requestPath.replace(/^\/+/, ''));
    if (requestPath === '/') filePath = path.join(root, 'index.html');

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(root, 'index.html');
    }

    try {
      const body = fs.readFileSync(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType(filePath));
      res.setHeader('Cache-Control', 'no-store');
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to resolve browser smoke server port.');
  }

  return {
    origin: 'http://127.0.0.1:' + address.port,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      ),
  };
}

class CdpClient {
  private socket: any;
  private nextId = 1;
  private pending = new Map<
    number,
    { resolve: (value: any) => void; reject: (error: Error) => void }
  >();

  static async connect(url: string): Promise<CdpClient> {
    const SocketCtor = (globalThis as any).WebSocket;
    if (!SocketCtor) {
      throw new Error('This Node runtime does not expose WebSocket.');
    }
    const socket = new SocketCtor(url);
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve(), { once: true });
      socket.addEventListener(
        'error',
        () => reject(new Error('Unable to connect to Chrome DevTools.')),
        { once: true }
      );
    });
    return new CdpClient(socket);
  }

  private constructor(socket: any) {
    this.socket = socket;
    socket.addEventListener('message', (event: any) => {
      const data = JSON.parse(String(event.data));
      if (!data.id) return;
      const pending = this.pending.get(data.id);
      if (!pending) return;
      this.pending.delete(data.id);
      if (data.error) {
        pending.reject(new Error(data.error.message || 'CDP request failed'));
      } else {
        pending.resolve(data.result);
      }
    });
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<any> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close(): void {
    this.socket.close();
  }
}

async function waitForDevTools(port: number): Promise<any> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(
        'http://127.0.0.1:' + port + '/json/version'
      );
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error('Timed out waiting for Chrome DevTools.');
}

async function waitFor(
  cdp: CdpClient,
  expression: string,
  label: string,
  timeout = timeoutMs
): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result?.result?.value) return;
    await delay(150);
  }
  throw new Error('Timed out waiting for ' + label + '.');
}

async function evaluate<T>(cdp: CdpClient, expression: string): Promise<T> {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result?.exceptionDetails) {
    throw new Error(
      result.exceptionDetails?.exception?.description ||
        result.exceptionDetails?.text ||
        'Browser evaluation failed'
    );
  }
  return result?.result?.value as T;
}

async function navigate(cdp: CdpClient, url: string): Promise<void> {
  await cdp.send('Page.navigate', { url });
  await waitFor(
    cdp,
    "document.readyState === 'complete'",
    'page load for ' + url
  );
}

async function runViewport(
  cdp: CdpClient,
  origin: string,
  viewport: Viewport
): Promise<void> {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 640,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });

  await navigate(cdp, origin + '/?qualityViewport=' + viewport.name);
  await evaluate(
    cdp,
    "localStorage.removeItem('terroir_trail_first_run_welcome_v1'); true"
  );
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitFor(cdp, "document.readyState === 'complete'", 'reloaded app');
  await waitFor(
    cdp,
    "document.body && document.body.innerText.includes('Welcome to TerroirTrail')",
    viewport.name + ' onboarding'
  );

  const crashedBeforeStart = await evaluate<boolean>(
    cdp,
    "document.body.innerText.includes('Something went wrong')"
  );
  if (crashedBeforeStart) {
    throw new Error(
      viewport.name + ': error boundary rendered before onboarding completion.'
    );
  }

  const upgradeOfferVisible = await evaluate<boolean>(
    cdp,
    `(() => {
      const button = [...document.querySelectorAll('button')].find((candidate) =>
        candidate.textContent?.includes('Upgrade your trip')
      );
      const text = document.body.innerText;
      return Boolean(button) &&
        text.includes('Holiday €9.99 / 14 days') &&
        text.includes('Annual €24.99 / year');
    })()`
  );
  if (!upgradeOfferVisible) {
    throw new Error(
      viewport.name + ': first-run Upgrade your trip offer missing.'
    );
  }

  const clicked = await evaluate<boolean>(
    cdp,
    "(() => { const button = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent?.includes('Start exploring')); if (!button) return false; button.click(); return true; })()"
  );
  if (!clicked)
    throw new Error(viewport.name + ': Start exploring button missing.');

  await waitFor(
    cdp,
    "Boolean(document.querySelector('[role=region][aria-label*=Interactive]'))",
    viewport.name + ' map render'
  );
  await waitFor(
    cdp,
    "document.querySelectorAll('.leaflet-marker-icon[role=button]').length > 0",
    viewport.name + ' keyboard-accessible producer markers'
  );

  if (viewport.width < 640) {
    const menuClicked = await evaluate<boolean>(
      cdp,
      `(() => { const button = document.querySelector('button[aria-label="Open menu"]'); if (!button) return false; button.click(); return true; })()`
    );
    if (!menuClicked) {
      throw new Error(viewport.name + ': mobile menu button missing.');
    }
    await waitFor(
      cdp,
      "([...document.querySelectorAll('button')].some((button) => button.textContent?.trim() === 'Passes' && button.getClientRects().length > 0))",
      viewport.name + ' Passes mobile menu item'
    );
  }

  const passesClicked = await evaluate<boolean>(
    cdp,
    "(() => { const button = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent?.trim() === 'Passes' && candidate.getClientRects().length > 0); if (!button) return false; button.click(); return true; })()"
  );
  if (!passesClicked) {
    throw new Error(viewport.name + ': Passes entry point missing.');
  }

  await waitFor(
    cdp,
    `Boolean(document.querySelector('[role=dialog][aria-labelledby="terroir-passes-title"]'))`,
    viewport.name + ' Passes dialog'
  );

  const passesState = await evaluate<{
    hasFree: boolean;
    hasHoliday: boolean;
    hasAnnual: boolean;
    hasHolidayPrice: boolean;
    hasAnnualPrice: boolean;
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    overflow: number;
  }>(
    cdp,
    `(() => { const dialog = document.querySelector('[role=dialog][aria-labelledby="terroir-passes-title"]'); if (!dialog) return null; const rect = dialog.getBoundingClientRect(); const text = dialog.textContent || ''; return { hasFree: text.includes('Free'), hasHoliday: text.includes('Holiday Pass'), hasAnnual: text.includes('Annual Explorer Pass'), hasHolidayPrice: text.includes('€9.99'), hasAnnualPrice: text.includes('€24.99'), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height, overflow: dialog.scrollWidth - dialog.clientWidth }; })()`
  );

  if (
    !passesState.hasFree ||
    !passesState.hasHoliday ||
    !passesState.hasAnnual ||
    !passesState.hasHolidayPrice ||
    !passesState.hasAnnualPrice
  ) {
    throw new Error(
      viewport.name + ': Passes comparison is missing a tier or agreed price.'
    );
  }
  if (
    passesState.left < -1 ||
    passesState.right > viewport.width + 1 ||
    passesState.top < -1 ||
    passesState.bottom > viewport.height + 1 ||
    passesState.overflow > 2
  ) {
    throw new Error(
      viewport.name +
        ': Passes dialog exceeds viewport bounds (' +
        JSON.stringify(passesState) +
        ').'
    );
  }

  const passesClosed = await evaluate<boolean>(
    cdp,
    `(() => { const button = document.querySelector('button[aria-label="Close Passes"]'); if (!button) return false; button.click(); return true; })()`
  );
  if (!passesClosed) {
    throw new Error(viewport.name + ': Passes close control missing.');
  }
  await waitFor(
    cdp,
    `!document.querySelector('[role=dialog][aria-labelledby="terroir-passes-title"]')`,
    viewport.name + ' Passes dialog close'
  );

  const state = await evaluate<{
    crashed: boolean;
    hasListToggle: boolean;
    horizontalOverflow: number;
    focusableMarkers: number;
  }>(
    cdp,
    "(() => ({ crashed: document.body.innerText.includes('Something went wrong'), hasListToggle: document.body.innerText.includes('Show List') || document.body.innerText.includes('Show Map'), horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth, focusableMarkers: [...document.querySelectorAll('.leaflet-marker-icon[role=button]')].filter((element) => element.tabIndex === 0).length }))()"
  );

  if (state.crashed)
    throw new Error(viewport.name + ': app error boundary rendered.');
  if (state.hasListToggle)
    throw new Error(viewport.name + ': obsolete map/list toggle returned.');
  if (state.horizontalOverflow > 2) {
    throw new Error(
      viewport.name +
        ': horizontal overflow is ' +
        state.horizontalOverflow +
        'px.'
    );
  }
  if (state.focusableMarkers < 1) {
    throw new Error(
      viewport.name + ': no keyboard-focusable producer marker found.'
    );
  }

  console.log(
    '[browser smoke] ' +
      viewport.name +
      ' ' +
      viewport.width +
      '×' +
      viewport.height +
      ' ✓'
  );
}

async function main(): Promise<void> {
  const local = externalOrigin ? null : await startStaticServer();
  const origin = externalOrigin || local!.origin;
  const chrome = findChrome();
  const port = 9200 + Math.floor(Math.random() * 500);
  const profile = fs.mkdtempSync(
    path.join(os.tmpdir(), 'terroirtrail-browser-')
  );
  let chromeProcess: ChildProcess | null = null;
  let cdp: CdpClient | null = null;

  try {
    chromeProcess = spawn(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-background-networking',
        '--disable-crash-reporter',
        '--disable-breakpad',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--remote-debugging-port=' + port,
        '--user-data-dir=' + profile,
        'about:blank',
      ],
      { stdio: 'ignore' }
    );

    await waitForDevTools(port);
    const targetResponse = await fetch(
      'http://127.0.0.1:' +
        port +
        '/json/new?' +
        encodeURIComponent('about:blank'),
      { method: 'PUT' }
    );
    if (!targetResponse.ok) {
      throw new Error(
        'Unable to create Chrome target: HTTP ' + targetResponse.status
      );
    }

    const target = await targetResponse.json();
    cdp = await CdpClient.connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    for (const viewport of viewports) {
      await runViewport(cdp, origin, viewport);
    }

    await evaluate(
      cdp,
      "localStorage.setItem('terroir_trail_first_run_welcome_v1', 'true'); localStorage.removeItem('terroir_trail_alcohol_content_notice_v1'); true"
    );
    await navigate(cdp, origin + '/?producer=anoskeli-estate');
    await waitFor(
      cdp,
      "document.body.innerText.includes('Alcohol-related content') && document.body.innerText.includes('legal drinking age in the destination')",
      'alcohol content notice',
      timeoutMs
    );

    const continuedAlcoholNotice = await evaluate<boolean>(
      cdp,
      `(() => {
        const button = [...document.querySelectorAll('button')].find((candidate) =>
          candidate.textContent?.trim() === 'Continue'
        );
        if (!button) return false;
        button.click();
        return true;
      })()`
    );
    if (!continuedAlcoholNotice) {
      throw new Error('Alcohol content notice Continue button missing.');
    }

    await waitFor(
      cdp,
      "Boolean([...document.querySelectorAll('[role=dialog]')].find((element) => element.getAttribute('aria-label')?.startsWith('Producer details:')))",
      'direct producer deep link after alcohol notice',
      timeoutMs
    );

    const alcoholNoticePersisted = await evaluate<boolean>(
      cdp,
      "localStorage.getItem('terroir_trail_alcohol_content_notice_v1') === 'true'"
    );
    if (!alcoholNoticePersisted) {
      throw new Error(
        'Alcohol content notice acknowledgement was not persisted.'
      );
    }

    const deepLinkCrash = await evaluate<boolean>(
      cdp,
      "document.body.innerText.includes('Something went wrong')"
    );
    if (deepLinkCrash) {
      throw new Error('Direct producer deep link rendered the error boundary.');
    }

    console.log('[browser smoke] direct producer deep link ✓');
    console.log('[browser smoke] all responsive browser checks passed.');
  } finally {
    try {
      cdp?.close();
    } catch {
      // Ignore close errors during cleanup.
    }
    await stopChromeProcess(chromeProcess);
    await local?.close();
    await cleanupChromeProfile(profile);
  }
}

main().catch((error) => {
  console.error(
    '[browser smoke failed]',
    error instanceof Error ? error.message : String(error)
  );
  process.exitCode = 1;
});
