import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { FirstRunWelcome } from './FirstRunWelcome';
import type { PwaInstallController } from '../../hooks/usePwaInstall';

const controller = (
  overrides: Partial<PwaInstallController> = {}
): PwaInstallController => ({
  isInstalled: false,
  isIos: false,
  isIosSafari: false,
  canInstall: true,
  requestInstall: vi.fn(async () => 'accepted'),
  ...overrides,
});

describe('FirstRunWelcome', () => {
  it('introduces the map-first flow and web-app installation', () => {
    const html = renderToString(
      React.createElement(FirstRunWelcome, {
        pwaInstall: controller(),
        onComplete: () => {},
      })
    );

    expect(html).toContain('Welcome to TerroirTrail');
    expect(html).toContain('Explore the map');
    expect(html).toContain('Open a producer');
    expect(html).toContain('Add TerroirTrail to your Home Screen');
    expect(html).toContain('Install TerroirTrail');
    expect(html).toContain('Start exploring');
    expect(html).toContain('shown only on your first visit');
  });

  it('shows iPhone and iPad Home Screen instructions without a native install button', () => {
    const html = renderToString(
      React.createElement(FirstRunWelcome, {
        pwaInstall: controller({
          isIos: true,
          isIosSafari: true,
          canInstall: true,
        }),
        onComplete: () => {},
      })
    );

    expect(html).toContain('Tap Share');
    expect(html).toContain('Add to Home Screen');
    expect(html).not.toContain('Install TerroirTrail</button>');
  });

  it('acknowledges an already-installed PWA', () => {
    const html = renderToString(
      React.createElement(FirstRunWelcome, {
        pwaInstall: controller({
          isInstalled: true,
          canInstall: false,
        }),
        onComplete: () => {},
      })
    );

    expect(html).toContain('Installed on this device');
  });
});
