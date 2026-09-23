import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Header } from './Header';
import type { PwaInstallController } from '../../hooks/usePwaInstall';

const pwaInstall: PwaInstallController = {
  isInstalled: false,
  isIos: false,
  isIosSafari: false,
  canInstall: false,
  requestInstall: async () => 'unavailable',
};

const renderHeader = (hasExplorerPass: boolean) =>
  renderToString(
    <Header
      selectedDestination="all"
      onSelectDestination={vi.fn()}
      searchQuery=""
      onSearchChange={vi.fn()}
      totalFilteredCount={147}
      savedCount={0}
      favoritesOnly={false}
      onToggleFavoritesOnly={vi.fn()}
      user={null}
      onOpenAuth={vi.fn()}
      onOpenPassport={vi.fn()}
      onOpenMyTrips={vi.fn()}
      onLogout={vi.fn()}
      totalProducersCount={147}
      onOpenExplorerPass={vi.fn()}
      hasExplorerPass={hasExplorerPass}
      onOpenOptimizeMyDay={vi.fn()}
      pwaInstall={pwaInstall}
    />
  );

describe('Header Optimize My Day entitlement gating', () => {
  it('does not expose Optimize My Day without an active Explorer entitlement', () => {
    const html = renderHeader(false);
    expect(html).not.toContain('Optimize My Day');
    expect(html).toContain('Passes');
  });

  it('unlocks Optimize My Day for the shared active Explorer entitlement', () => {
    const html = renderHeader(true);
    expect(html).toContain('Optimize My Day');
    expect(html).toContain('Passes');
  });
});
