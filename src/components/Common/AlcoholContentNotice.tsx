import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

interface AlcoholContentNoticeProps {
  producerName: string;
  onContinue: () => void;
  onBack: () => void;
}

export const AlcoholContentNotice: React.FC<AlcoholContentNoticeProps> = ({
  producerName,
  onContinue,
  onBack,
}) => (
  <>
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm"
      aria-hidden="true"
    />
    <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="alcohol-content-notice-title"
        aria-describedby="alcohol-content-notice-description"
        className="w-full max-w-md rounded-3xl border border-amber-400/20 bg-stone-950 p-5 text-stone-100 shadow-2xl sm:p-6"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="mt-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
            Responsible discovery
          </div>
          <h2
            id="alcohol-content-notice-title"
            className="mt-1.5 font-serif-title text-2xl font-bold text-white"
          >
            Alcohol-related content
          </h2>
          <p className="mt-2 text-xs leading-5 text-stone-500">
            You&apos;re opening {producerName}.
          </p>
        </div>

        <p
          id="alcohol-content-notice-description"
          className="mt-5 text-sm leading-6 text-stone-300"
        >
          TerroirTrail includes wineries, breweries, distilleries and tasting
          experiences. Alcohol-related visits and tastings are intended for
          visitors of legal drinking age in the destination. Please enjoy
          responsibly.
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-stone-900/70 px-3.5 py-3 text-xs leading-5 text-stone-400">
          No date of birth is requested or stored. This informational notice is
          shown once on this device.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm font-bold text-stone-200 transition hover:border-white/20 hover:bg-stone-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to discovery
          </button>
          <button
            type="button"
            onClick={onContinue}
            autoFocus
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-extrabold text-stone-950 transition hover:bg-amber-400"
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  </>
);
