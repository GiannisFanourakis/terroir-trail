import { useCallback, useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptChoice {
  outcome: 'accepted' | 'dismissed';
  platform: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
}

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export type PwaInstallResult =
  | 'accepted'
  | 'dismissed'
  | 'ios-instructions'
  | 'unavailable';

export interface PwaInstallController {
  isInstalled: boolean;
  isIos: boolean;
  isIosSafari: boolean;
  canInstall: boolean;
  requestInstall: () => Promise<PwaInstallResult>;
}

export function isPwaStandalone(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as NavigatorWithStandalone).standalone
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const classicIos = /iPad|iPhone|iPod/i.test(userAgent);
  const ipadDesktopMode =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return classicIos || ipadDesktopMode;
}

export function isIosSafariBrowser(): boolean {
  if (!isIosDevice() || typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  return /Safari/i.test(userAgent) && !/(CriOS|FxiOS|EdgiOS|OPiOS)/i.test(userAgent);
}

export function usePwaInstall(): PwaInstallController {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isPwaStandalone());

  const isIos = useMemo(() => isIosDevice(), []);
  const isIosSafari = useMemo(() => isIosSafariBrowser(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const displayMode = window.matchMedia('(display-mode: standalone)');

    const syncInstalledState = () => {
      setIsInstalled(isPwaStandalone());
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    displayMode.addEventListener?.('change', syncInstalledState);

    syncInstalledState();

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleInstalled);
      displayMode.removeEventListener?.('change', syncInstalledState);
    };
  }, []);

  const requestInstall = useCallback(async (): Promise<PwaInstallResult> => {
    if (isPwaStandalone()) {
      setIsInstalled(true);
      return 'unavailable';
    }

    if (isIos) {
      return 'ios-instructions';
    }

    if (!deferredPrompt) {
      return 'unavailable';
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === 'accepted') {
      return 'accepted';
    }

    return 'dismissed';
  }, [deferredPrompt, isIos]);

  return {
    isInstalled,
    isIos,
    isIosSafari,
    canInstall: !isInstalled && (isIos || Boolean(deferredPrompt)),
    requestInstall,
  };
}
