import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

const readOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine;

export const OfflineStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(readOnline);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(readOnline());
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[95] flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-amber-400/30 bg-stone-950/95 px-3.5 py-2 text-xs font-semibold text-amber-100 shadow-2xl backdrop-blur-xl"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
      <span>You’re offline · live map and visit information may be unavailable</span>
    </div>
  );
};
