import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MailWarning } from 'lucide-react';

const AUTH_DIALOG_SELECTOR = '[aria-labelledby="auth-modal-title"]';

export const AuthEmailDeliveryNotice: React.FC = () => {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const syncTarget = () => {
      setTarget(document.querySelector<HTMLElement>(AUTH_DIALOG_SELECTOR));
    };

    syncTarget();
    const observer = new MutationObserver(syncTarget);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  if (!target) return null;

  return createPortal(
    <div
      role="note"
      aria-label="Email delivery note"
      className="shrink-0 border-t border-white/10 bg-amber-500/10 px-5 py-3 text-[11px] leading-relaxed text-stone-300"
    >
      <div className="mx-auto flex max-w-sm items-start gap-2">
        <MailWarning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
        <p>
          <span className="font-semibold text-amber-200">Email delivery note:</span>{' '}
          Welcome, password-reset, verification and account emails may occasionally be filtered into your Spam or Junk folder. If you do not see an expected email, please check those folders.
        </p>
      </div>
    </div>,
    target
  );
};
