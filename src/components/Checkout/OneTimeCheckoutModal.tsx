import React, { useState } from 'react';
import { X, CreditCard, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface OneTimeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  amountUsd?: number;
  onSuccess?: () => void;
}

export const OneTimeCheckoutModal: React.FC<OneTimeCheckoutModalProps> = ({
  isOpen,
  onClose,
  productName = 'Example Product',
  amountUsd = 20.0,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateCheckoutSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call backend API endpoint
      const res = await fetch('http://localhost:4242/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        setCheckoutUrl(data.url);
        setSessionId(data.sessionId);
        // Automatically redirect or open checkout URL as per blueprint
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Stripe Checkout. Please ensure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Complete checkout</h2>
              <p className="text-xs text-stone-400">One-time payment with Stripe Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Card */}
        <div className="my-5 p-4 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm text-white block">{productName}</span>
            <span className="text-xs text-stone-400">One-time payment</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-400 font-mono">
               USD
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action button */}
        {!checkoutUrl ? (
          <button
            onClick={handleCreateCheckoutSession}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Checkout Session...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay  with Stripe</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Open Checkout Session URL</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            {sessionId && (
              <p className="text-[10px] text-stone-500 text-center font-mono truncate">
                Session ID: {sessionId}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 text-center text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted payment powered by Stripe</span>
        </div>
      </div>
    </div>
  );
};
