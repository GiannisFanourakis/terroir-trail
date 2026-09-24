import React, { useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Crown,
  Download,
  Lock,
  Route,
  ShieldCheck,
  Sparkles,
  WifiOff,
  X,
} from 'lucide-react';
import { runtimeConfig } from '../../config/runtimeConfig';
import type { UserProfile } from '../../types/auth';
import {
  isExplorerPassPurchasesEnabled,
  startPassBillingPortal,
  startPassCheckout,
} from '../../services/explorerPass';

interface ExplorerPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth: (role?: 'traveler' | 'producer') => void;
  onOpenDigitalPass?: () => void;
}

type PassPlan = 'holiday' | 'annual';
const paidConveniences = [
  ...(runtimeConfig.tripOptimization.enabled
    ? [
        {
          icon: Route,
          title: 'Optimize My Day',
          description:
            'Reorder the stops already in your trip day using real road-route estimates. Lock important stops, review the suggestion, and apply it only when you choose.',
        },
      ]
    : []),
  {
    icon: Sparkles,
    title: 'Ad-free trip planning',
    description:
      'Plan without travel-affiliate placements while your pass is active.',
  },
  {
    icon: Download,
    title: 'Printable Trip Pack',
    description:
      'Export a clean trip snapshot that you can print or save as PDF.',
  },
  {
    icon: CalendarDays,
    title: 'Calendar export',
    description:
      'Download your dated itinerary as an .ics file for Apple, Google or Outlook calendars.',
  },
  {
    icon: WifiOff,
    title: 'Offline trip snapshot',
    description:
      'Keep a self-contained copy of your itinerary and current producer visit facts for poor-signal areas.',
  },
];

const freeFeatures = [
  'Interactive producer map & directory',
  'Free My Trips planning',
  'Visitability and road/access facts',
  'Direct producer contact and directions',
];

const planDetails: Record<
  PassPlan,
  {
    name: string;
    price: string;
    duration: string;
    billing: string;
    description: string;
  }
> = {
  holiday: {
    name: 'Holiday Pass',
    price: '€9.99',
    duration: '14 days',
    billing: 'one-time',
    description: 'For one holiday or road trip. Buy another after it expires.',
  },
  annual: {
    name: 'Annual Explorer Pass',
    price: '€24.99',
    duration: '365 days',
    billing: 'per year',
    description: 'For repeat travelers and year-round explorers.',
  },
};

export const ExplorerPassModal: React.FC<ExplorerPassModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onOpenDigitalPass,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PassPlan>('holiday');
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingProcessing, setBillingProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [immediatePerformanceRequested, setImmediatePerformanceRequested] =
    useState(false);
  const purchasesEnabled = isExplorerPassPurchasesEnabled();
  const consumerConsentComplete =
    ageConfirmed && termsAccepted && immediatePerformanceRequested;

  if (!isOpen) return null;

  const selected = planDetails[selectedPlan];

  const handlePurchase = async () => {
    if (!user) {
      onClose();
      onOpenAuth('traveler');
      return;
    }

    if (!consumerConsentComplete) {
      setPurchaseError(
        'Confirm the age, Terms, and immediate-activation statements before continuing to checkout.'
      );
      return;
    }

    setPurchaseError(null);
    setIsProcessing(true);
    try {
      const { url } = await startPassCheckout(selectedPlan, {
        ageConfirmed,
        termsAccepted,
        immediatePerformanceRequested,
      });
      window.location.assign(url);
    } catch (error) {
      setPurchaseError(
        error instanceof Error
          ? error.message
          : 'Unable to start Explorer Pass checkout.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageBilling = async () => {
    setPurchaseError(null);
    setBillingProcessing(true);
    try {
      const { url } = await startPassBillingPortal();
      window.location.assign(url);
    } catch (error) {
      setPurchaseError(
        error instanceof Error
          ? error.message
          : 'Unable to open Explorer billing management.'
      );
    } finally {
      setBillingProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <div
        className="relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-amber-500/30 bg-stone-950 text-stone-100 shadow-2xl sm:max-h-[94vh] sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terroir-passes-title"
      >
        <header className="shrink-0 border-b border-white/10 bg-gradient-to-br from-amber-950/75 via-stone-950 to-stone-950 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15">
                <Crown className="h-5 w-5 text-amber-400" />
              </span>{' '}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="terroir-passes-title"
                    className="font-serif-title text-xl font-bold text-white"
                  >
                    TerroirTrail Passes
                  </h2>
                  {user?.hasExplorerPass && (
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-300">
                  Core discovery stays free. Passes add practical conveniences
                  for carrying and using your trip on the road.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-stone-900 text-stone-400 transition hover:text-white"
              aria-label="Close Passes"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto overscroll-contain p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-6">
          {purchaseError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-xs text-rose-200"
            >
              {purchaseError}
            </div>
          )}{' '}
          <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 md:col-span-2 lg:col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                Free
              </div>
              <div className="mt-2 text-2xl font-bold text-white">€0</div>
              <p className="mt-1 text-xs text-stone-400">
                Everything needed to discover and plan.
              </p>
              <div className="mt-4 space-y-2.5">
                {freeFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-2 text-[11px] leading-relaxed text-stone-300"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/5 bg-stone-950/70 px-3 py-2.5 text-[10px] leading-relaxed text-stone-500">
                Safety, visitability and road/access facts are never paywalled.
              </div>
            </div>

            {(['holiday', 'annual'] as PassPlan[]).map((plan) => {
              const detail = planDetails[plan];
              const selectedCard = selectedPlan === plan;
              return (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative rounded-2xl border p-4 text-left transition ${
                    selectedCard
                      ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-950/30'
                      : 'border-white/10 bg-stone-900/60 hover:border-amber-500/30'
                  }`}
                >
                  {plan === 'holiday' && (
                    <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-stone-950">
                      Trip pick
                    </span>
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                    {detail.name}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-white">
                      {detail.price}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {detail.billing}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-300">
                    {detail.description}
                  </p>
                  <div className="mt-3 rounded-xl border border-white/5 bg-stone-950/60 px-3 py-2 text-[10px] font-semibold text-amber-200">
                    {detail.duration} of Explorer conveniences
                  </div>
                  <div className="mt-3 space-y-2">
                    {paidConveniences.map((perk) => (
                      <div
                        key={perk.title}
                        className="flex items-center gap-2 text-[10px] text-stone-300"
                      >
                        <Check className="h-3 w-3 shrink-0 text-amber-400" />
                        <span>{perk.title}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </section>{' '}
          <section className="mt-4 rounded-2xl border border-white/10 bg-stone-900/55 p-4 sm:mt-5 sm:p-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-white">
                What the paid Pass actually adds
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
                Plan smarter and carry your trip with you — optimize your day,
                export it, save it offline, and travel without distractions.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paidConveniences.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={perk.title}
                    className="flex gap-3 rounded-xl border border-white/5 bg-stone-950/60 p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {perk.title}
                      </div>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-stone-400">
                        {perk.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          {user?.hasExplorerPass ? (
            <section className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">
                    Your Explorer Pass is active
                  </h3>{' '}
                  <p className="mt-1 text-[11px] leading-relaxed text-stone-300">
                    Your paid conveniences are available in My Trips while the
                    pass remains active.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {onOpenDigitalPass && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenDigitalPass();
                        }}
                        className="rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-200"
                      >
                        View active pass
                      </button>
                    )}
                    {user.explorerPassPlan === 'annual' && (
                      <button
                        type="button"
                        onClick={() => void handleManageBilling()}
                        disabled={billingProcessing}
                        className="rounded-xl border border-white/10 bg-stone-950/60 px-3 py-2 text-xs font-bold text-stone-200 transition hover:border-amber-400/30 hover:text-amber-200 disabled:cursor-wait disabled:opacity-50"
                      >
                        {billingProcessing
                          ? 'Opening billing…'
                          : 'Manage annual billing'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-5">
              {!purchasesEnabled && (
                <div className="mb-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-[11px] leading-relaxed text-stone-300">
                  <strong className="text-amber-200">
                    Final validation in progress.
                  </strong>{' '}
                  The new Explorer conveniences are being completed before
                  public checkout is opened.
                </div>
              )}
              {!user && (
                <div className="mb-3 flex items-start gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                  <p className="text-[11px] leading-relaxed text-stone-300">
                    A free traveler account is required so the Pass and Trip
                    Pack tools remain linked to the correct account.
                  </p>
                </div>
              )}{' '}
              {user && (
                <div className="mb-3 space-y-2.5 rounded-2xl border border-white/10 bg-stone-900/60 p-4">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] leading-relaxed text-stone-300">
                    {selectedPlan === 'annual' ? (
                      <>
                        <strong className="text-amber-200">
                          €24.99/year · recurring.
                        </strong>{' '}
                        Renews annually until cancelled. Manage cancellation from
                        the Stripe billing portal.
                      </>
                    ) : (
                      <>
                        <strong className="text-amber-200">
                          €9.99 one-time · 14 days.
                        </strong>{' '}
                        No automatic renewal.
                      </>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5 text-[10px] leading-relaxed text-stone-300">
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={(event) => setAgeConfirmed(event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
                    />
                    <span>I confirm that I am at least 18 years old.</span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2.5 text-[10px] leading-relaxed text-stone-300">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
                    />
                    <span>
                      I agree to the{' '}
                      <a
                        href="/terms.html#explorer-pass-consumer-rights"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-amber-300 underline"
                      >
                        Terms of Service
                      </a>{' '}
                      and acknowledge the{' '}
                      <a
                        href="/privacy.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-amber-300 underline"
                      >
                        Privacy Notice
                      </a>
                      .
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2.5 text-[10px] leading-relaxed text-stone-300">
                    <input
                      type="checkbox"
                      checked={immediatePerformanceRequested}
                      onChange={(event) =>
                        setImmediatePerformanceRequested(event.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
                    />
                    <span>
                      I expressly request immediate activation before the
                      14-day statutory withdrawal period ends (where that right
                      applies). I understand that this does not by itself waive
                      mandatory withdrawal rights and that a proportionate charge
                      may apply where permitted by law for service already
                      supplied.
                    </span>
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handlePurchase()}
                disabled={
                  isProcessing ||
                  !purchasesEnabled ||
                  Boolean(user && !consumerConsentComplete)
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3.5 text-xs font-extrabold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {!purchasesEnabled ? (
                  <span>Pass checkout opens after final validation</span>
                ) : isProcessing ? (
                  <span>Opening secure checkout…</span>
                ) : !user ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Sign in to choose {selected.name}</span>
                  </>
                ) : (
                  <>
                    <span>
                      Continue to secure checkout · {selected.price}
                      {selectedPlan === 'annual' ? '/year' : ''}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-stone-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  Secure Stripe checkout · TerroirTrail does not store card
                  details
                </span>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
