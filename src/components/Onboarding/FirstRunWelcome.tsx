import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Crown,
  Download,
  MapPin,
  Plus,
  Share2,
  Smartphone,
} from 'lucide-react';
import type {
  PwaInstallController,
  PwaInstallResult,
} from '../../hooks/usePwaInstall';

interface FirstRunWelcomeProps {
  onComplete: () => void;
  onOpenPasses: () => void;
  pwaInstall: PwaInstallController;
}

const installResultMessage = (result: PwaInstallResult): string | null => {
  switch (result) {
    case 'accepted':
      return 'TerroirTrail is being added to your device.';
    case 'dismissed':
      return 'No problem — you can install it later from the TerroirTrail menu.';
    case 'unavailable':
      return 'Use your browser menu and choose “Install app” or “Add to Home Screen” when available.';
    case 'ios-instructions':
      return null;
  }
};

export const FirstRunWelcome: React.FC<FirstRunWelcomeProps> = ({
  onComplete,
  onOpenPasses,
  pwaInstall,
}) => {
  const { canInstall, isInstalled, isIos, isIosSafari, requestInstall } =
    pwaInstall;
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    try {
      const result = await requestInstall();
      setInstallMessage(installResultMessage(result));
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <section
      className="fixed inset-0 z-[100] overflow-y-auto bg-stone-950 text-stone-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-run-welcome-title"
    >
      <div
        className="relative min-h-full overflow-hidden"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-[-5rem] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col justify-center px-4 py-6 sm:px-8 md:py-10">
          <div className="mx-auto w-full max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-stone-900/90 shadow-2xl sm:h-20 sm:w-20">
              <img
                src="/logo.png"
                alt="TerroirTrail"
                className="h-12 w-12 object-contain sm:h-16 sm:w-16"
              />
            </div>

            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Independent producer discovery
            </div>
            <h1
              id="first-run-welcome-title"
              className="font-serif-title text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
            >
              Welcome to TerroirTrail
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-300 sm:text-base sm:leading-7">
              Explore independent food and drink producers through the map, then
              open a producer to see their story, visiting status and practical
              access information.
            </p>
          </div>

          <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-stone-900/75 p-4 text-left">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-sm font-bold text-white">Explore the map</h2>
              <p className="mt-1 text-xs leading-5 text-stone-400">
                Search by region or category and discover makers directly on the
                interactive map.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-stone-900/75 p-4 text-left">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-sm font-bold text-white">Open a producer</h2>
              <p className="mt-1 text-xs leading-5 text-stone-400">
                Tap a marker for a quick preview, then open the story for visit
                and access details.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-stone-900/75 p-4 text-left">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Smartphone className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-sm font-bold text-white">
                Keep it on your device
              </h2>
              <p className="mt-1 text-xs leading-5 text-stone-400">
                TerroirTrail is a web app, so you can add it to your Home Screen
                without an app store.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-4 w-full max-w-4xl rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-stone-900/90 to-stone-900/90 p-4 sm:p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="min-w-0 md:max-w-xl">
                <div className="flex items-center gap-2">
                  <Download
                    className="h-4 w-4 shrink-0 text-amber-400"
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-bold text-white sm:text-base">
                    Add TerroirTrail to your Home Screen
                  </h2>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-stone-400 sm:text-sm">
                  Launch it full-screen from your phone or tablet while
                  travelling, while still receiving the latest web version.
                </p>
              </div>

              {isInstalled ? (
                <div className="flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Installed on this device
                </div>
              ) : !isIos && canInstall ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleInstall();
                  }}
                  disabled={isInstalling}
                  className="min-h-[48px] shrink-0 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-stone-950 shadow-lg shadow-amber-950/20 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70"
                >
                  {isInstalling ? 'Opening install…' : 'Install TerroirTrail'}
                </button>
              ) : null}
            </div>

            {!isInstalled && isIos && (
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {!isIosSafari && (
                  <div className="sm:col-span-2 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-3.5 py-3 text-xs leading-5 text-sky-100">
                    For the most consistent Home Screen install flow on iPhone
                    or iPad, open TerroirTrail in Safari.
                  </div>
                )}

                <div className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-white/10 bg-stone-950/60 px-3.5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-stone-900">
                    <Share2
                      className="h-4 w-4 text-amber-400"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">
                      1. Tap Share
                    </div>
                    <div className="mt-0.5 text-[11px] leading-4 text-stone-400">
                      Open Safari’s Share menu.
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-white/10 bg-stone-950/60 px-3.5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-stone-900">
                    <Plus
                      className="h-4 w-4 text-amber-400"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">
                      2. Add to Home Screen
                    </div>
                    <div className="mt-0.5 text-[11px] leading-4 text-stone-400">
                      Choose “Add to Home Screen”, then tap Add.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isInstalled && !isIos && !canInstall && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-stone-950/60 px-3.5 py-3 text-xs leading-5 text-stone-300">
                Open your browser menu and choose{' '}
                <strong className="text-white">Install app</strong> or{' '}
                <strong className="text-white">Add to Home Screen</strong> when
                your browser offers it.
              </div>
            )}

            {installMessage && (
              <div
                className="mt-3 rounded-xl border border-white/10 bg-stone-950/70 px-3 py-2 text-[11px] leading-5 text-stone-300"
                role="status"
                aria-live="polite"
              >
                {installMessage}
              </div>
            )}
          </div>

          <div className="mx-auto mt-5 flex w-full max-w-4xl flex-col items-center">
            <button
              type="button"
              onClick={onComplete}
              className="flex min-h-[52px] w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-stone-950 shadow-xl transition hover:bg-stone-100 active:scale-[0.99]"
            >
              Start exploring
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenPasses}
              className="mt-2.5 flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-500/15 active:scale-[0.99]"
            >
              <Crown className="h-4 w-4 text-amber-400" aria-hidden="true" />
              Upgrade your trip
            </button>
            <div className="mt-1.5 text-center text-[10px] font-medium text-stone-500">
              Holiday €9.99 / 14 days · Annual €24.99 / year
            </div>

            <p className="mt-2.5 text-center text-[11px] leading-5 text-stone-500">
              No account is required to explore. This welcome screen is shown
              only on your first visit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
