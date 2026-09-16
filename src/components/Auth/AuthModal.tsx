import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { ProducerTaxDetails } from '../../types/auth';
import { Producer } from '../../types/terroir';
import { validateVatNumber, getFiscalLabels } from '../../utils/vatValidator';
import { formatAuthError } from '../../utils/authErrors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'traveler' | 'producer';
  producers?: Producer[];
  onLogin: (email: string, password?: string) => Promise<any> | void;
  onSignup: (name: string, email: string, password?: string) => Promise<any> | void;
  onLoginAsProducer?: (email: string, password?: string, producerId?: string, producerName?: string) => Promise<any> | void;
  onClaimProducer?: (
    producerId: string,
    producerName: string,
    hostName: string,
    email: string,
    password?: string,
    taxDetails?: ProducerTaxDetails,
    termsAccepted?: boolean
  ) => Promise<any> | void;
  onResetPassword?: (email: string) => Promise<any> | void;
  onLoginWithGoogle?: () => Promise<any>;
  onLoginWithApple?: () => Promise<any>;
  onOpenPrivacyNotice?: () => void;
  onOpenTerms?: () => void;
  onOpenLicenses?: () => void;
  isLoading?: boolean;
  authError?: string | null;
  isFirebaseConfigured?: boolean;
}

type TravelerMode = 'login' | 'signup' | 'forgot';
type ProducerMode = 'login' | 'claim' | 'forgot';

const countryCodeForProducer = (producer?: Producer): string => {
  const country = producer?.country?.trim().toLowerCase();
  if (country === 'italy' || producer?.destination === 'tuscany') return 'IT';
  if (country === 'france') return 'FR';
  if (country === 'spain') return 'ES';
  return 'GR';
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'traveler',
  producers = [],
  onLogin,
  onSignup,
  onLoginAsProducer,
  onClaimProducer,
  onResetPassword,
  onLoginWithGoogle,
  onLoginWithApple,
  onOpenPrivacyNotice,
  onOpenTerms,
  onOpenLicenses,
  isLoading = false,
  authError,
  isFirebaseConfigured = false,
}) => {
  const [accountType, setAccountType] = useState<'traveler' | 'producer'>(initialRole);
  const [travelerMode, setTravelerMode] = useState<TravelerMode>('login');
  const [producerMode, setProducerMode] = useState<ProducerMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');

  const [selectedProducerId, setSelectedProducerId] = useState('');
  const [producerHostName, setProducerHostName] = useState('');
  const [producerEmail, setProducerEmail] = useState('');
  const [producerPassword, setProducerPassword] = useState('');
  const [showProducerPassword, setShowProducerPassword] = useState(false);
  const [fiscalCountry, setFiscalCountry] = useState('GR');
  const [vatNumber, setVatNumber] = useState('');
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [producerTermsAccepted, setProducerTermsAccepted] = useState(false);

  const [localError, setLocalError] = useState('');
  const [resetSuccessEmail, setResetSuccessEmail] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState<'google' | 'apple' | 'form' | 'reset' | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAccountType(initialRole);
    setTravelerMode('login');
    setProducerMode('login');
    setLocalError('');
    setResetSuccessEmail(null);
    setProducerTermsAccepted(false);
    const firstId = producers[0]?.id || '';
    setSelectedProducerId(current => current && producers.some(p => p.id === current) ? current : firstId);
  }, [isOpen, initialRole, producers]);

  const selectedProducer = useMemo(
    () => producers.find(producer => producer.id === selectedProducerId) || producers[0],
    [producers, selectedProducerId]
  );

  useEffect(() => {
    if (selectedProducer) setFiscalCountry(countryCodeForProducer(selectedProducer));
  }, [selectedProducer?.id]);

  if (!isOpen) return null;

  const currentError = localError || authError;
  const isBusy = isLoading || localLoading !== null;
  const fiscalLabels = getFiscalLabels(fiscalCountry);
  const vatValidation = vatNumber.trim() ? validateVatNumber(vatNumber.trim(), fiscalCountry) : null;

  const runSocialLogin = async (provider: 'google' | 'apple') => {
    setLocalError('');
    const action = provider === 'google' ? onLoginWithGoogle : onLoginWithApple;
    if (!action) return;
    try {
      setLocalLoading(provider);
      await action();
      onClose();
    } catch (error) {
      setLocalError(formatAuthError(error));
    } finally {
      setLocalLoading(null);
    }
  };

  const handleTravelerLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');
    if (!email.trim() || !password) {
      setLocalError('Enter your email address and password.');
      return;
    }
    try {
      setLocalLoading('form');
      await onLogin(email.trim(), password);
      onClose();
    } catch (error) {
      setLocalError(formatAuthError(error));
    } finally {
      setLocalLoading(null);
    }
  };

  const handleTravelerSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');
    if (!name.trim()) {
      setLocalError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    try {
      setLocalLoading('form');
      // No persona is required. The legacy internal travelerType defaults in
      // useAuth only for backwards compatibility with older stored profiles.
      await onSignup(name.trim(), email.trim(), password);
      onClose();
    } catch (error) {
      setLocalError(formatAuthError(error));
    } finally {
      setLocalLoading(null);
    }
  };

  const handleProducerLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');
    if (!producerEmail.trim() || !producerPassword) {
      setLocalError('Enter your producer account email and password.');
      return;
    }
    try {
      setLocalLoading('form');
      if (onLoginAsProducer) await onLoginAsProducer(producerEmail.trim(), producerPassword);
      else await onLogin(producerEmail.trim(), producerPassword);
      onClose();
    } catch (error) {
      setLocalError(formatAuthError(error));
    } finally {
      setLocalLoading(null);
    }
  };

  const handleProducerClaim = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');
    if (!selectedProducer) {
      setLocalError('Choose the producer listing you represent.');
      return;
    }
    if (!producerHostName.trim()) {
      setLocalError('Enter the name of the person making this claim.');
      return;
    }
    if (!producerEmail.trim()) {
      setLocalError('Enter an official producer contact email.');
      return;
    }
    if (!producerPassword || producerPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (!producerTermsAccepted) {
      setLocalError('You must accept the TerroirTrail Producer Terms before submitting a claim.');
      return;
    }
    if (vatNumber.trim() && !vatValidation?.isValid) {
      setLocalError(vatValidation?.error || `Enter a valid ${fiscalLabels.shortVatLabel}, or leave it blank for manual review.`);
      return;
    }

    const taxDetails: ProducerTaxDetails | undefined = vatNumber.trim()
      ? {
          vatNumber: vatValidation?.formatted || vatNumber.trim().toUpperCase(),
          legalBusinessName: legalBusinessName.trim() || selectedProducer.name,
          countryCode: fiscalCountry,
          isVatVerified: false,
        }
      : undefined;

    try {
      setLocalLoading('form');
      await onClaimProducer?.(
        selectedProducer.id,
        selectedProducer.name,
        producerHostName.trim(),
        producerEmail.trim(),
        producerPassword,
        taxDetails,
        true
      );
      onClose();
    } catch (error) {
      setLocalError(formatAuthError(error));
    } finally {
      setLocalLoading(null);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');
    const targetEmail = accountType === 'producer' ? producerEmail.trim() : email.trim();
    if (!targetEmail) {
      setLocalError('Enter your registered email address.');
      return;
    }
    try {
      setLocalLoading('reset');
      await onResetPassword?.(targetEmail);
      setResetSuccessEmail(targetEmail);
    } catch (error) {
      setLocalError(formatAuthError(error));
    } finally {
      setLocalLoading(null);
    }
  };

  const socialButtons = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {onLoginWithGoogle && (
        <button
          type="button"
          onClick={() => void runSocialLogin('google')}
          disabled={isBusy}
          className="rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-stone-900 disabled:opacity-50 cursor-pointer"
        >
          {localLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
        </button>
      )}
      {onLoginWithApple && (
        <button
          type="button"
          onClick={() => void runSocialLogin('apple')}
          disabled={isBusy}
          className="rounded-xl border border-white/15 bg-stone-900 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
        >
          {localLoading === 'apple' ? 'Connecting…' : 'Continue with Apple'}
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-busy={isBusy}
        className="relative w-full max-w-md max-h-[92dvh] overflow-hidden rounded-3xl border border-white/15 bg-stone-950 text-stone-100 shadow-2xl flex flex-col"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 text-stone-400 hover:text-white cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pb-4 border-b border-white/10 text-center bg-stone-900/70">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-stone-950 px-3 py-1 text-xs font-semibold text-amber-300">
            <img src="/logo.png" alt="TerroirTrail" className="w-4 h-4 object-contain" />
            TerroirTrail Account
            {isFirebaseConfigured && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Cloud authentication enabled" />}
          </div>
          <h2 id="auth-modal-title" className="mt-3 text-xl font-bold font-serif-title text-white">
            {accountType === 'traveler'
              ? travelerMode === 'login' ? 'Sign in' : travelerMode === 'signup' ? 'Create traveler account' : 'Reset password'
              : producerMode === 'login' ? 'Producer sign in' : producerMode === 'claim' ? 'Claim a producer listing' : 'Reset producer password'}
          </h2>

          <div className="mt-4 flex rounded-xl bg-stone-950 p-1 border border-white/10 text-xs font-semibold">
            <button type="button" onClick={() => { setAccountType('traveler'); setLocalError(''); }} className={`flex-1 rounded-lg py-2 cursor-pointer ${accountType === 'traveler' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}>Traveler</button>
            <button type="button" onClick={() => { setAccountType('producer'); setLocalError(''); }} className={`flex-1 rounded-lg py-2 cursor-pointer ${accountType === 'producer' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}>Producer / Host</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {currentError && (
            <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{currentError}</span>
            </div>
          )}
          {resetSuccessEmail && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200 flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Reset instructions were sent to {resetSuccessEmail}.
            </div>
          )}

          {accountType === 'traveler' && travelerMode === 'login' && (
            <div className="space-y-4">
              {socialButtons}
              <form onSubmit={handleTravelerLogin} className="space-y-3">
                <label className="block text-xs font-semibold text-stone-300">Email
                  <div className="relative mt-1.5"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-stone-900 pl-9 pr-3 py-2.5 text-xs text-white" required /></div>
                </label>
                <label className="block text-xs font-semibold text-stone-300">Password
                  <div className="relative mt-1.5"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-stone-900 pl-9 pr-10 py-2.5 text-xs text-white" required /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 cursor-pointer" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                </label>
                <div className="flex justify-between text-[11px]"><button type="button" onClick={() => setTravelerMode('signup')} className="text-amber-400 font-semibold cursor-pointer">Create account</button><button type="button" onClick={() => setTravelerMode('forgot')} className="text-stone-400 cursor-pointer">Forgot password?</button></div>
                <button type="submit" disabled={isBusy} className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-stone-950 disabled:opacity-50 cursor-pointer">{localLoading === 'form' ? 'Signing in…' : 'Sign in'}</button>
              </form>
            </div>
          )}

          {accountType === 'traveler' && travelerMode === 'signup' && (
            <form onSubmit={handleTravelerSignup} className="space-y-3">
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[11px] leading-relaxed text-stone-300">No traveler persona is required. You can optionally add interests such as wine, cheese, olive oil, beer, farms, honey or heritage from your account settings later.</div>
              <label className="block text-xs font-semibold text-stone-300">Name<div className="relative mt-1.5"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input autoComplete="name" value={name} onChange={event => setName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-stone-900 pl-9 pr-3 py-2.5 text-xs text-white" required /></div></label>
              <label className="block text-xs font-semibold text-stone-300">Email<div className="relative mt-1.5"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-stone-900 pl-9 pr-3 py-2.5 text-xs text-white" required /></div></label>
              <label className="block text-xs font-semibold text-stone-300">Password<div className="relative mt-1.5"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" /><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-stone-900 pl-9 pr-10 py-2.5 text-xs text-white" required /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 cursor-pointer" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></label>
              <button type="submit" disabled={isBusy} className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-stone-950 disabled:opacity-50 cursor-pointer">{localLoading === 'form' ? 'Creating account…' : 'Create free account'}</button>
              <button type="button" onClick={() => setTravelerMode('login')} className="w-full text-xs text-stone-400 cursor-pointer">← Back to sign in</button>
            </form>
          )}

          {accountType === 'traveler' && travelerMode === 'forgot' && (
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <label className="block text-xs font-semibold text-stone-300">Registered email<input type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white" required /></label>
              <button type="submit" disabled={isBusy} className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-stone-950 cursor-pointer">Send reset link</button>
              <button type="button" onClick={() => setTravelerMode('login')} className="w-full text-xs text-stone-400 cursor-pointer">← Back to sign in</button>
            </form>
          )}

          {accountType === 'producer' && producerMode === 'login' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-stone-300 flex gap-2"><ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />Host permissions come only from listings explicitly approved and assigned by TerroirTrail.</div>
              {socialButtons}
              <form onSubmit={handleProducerLogin} className="space-y-3">
                <label className="block text-xs font-semibold text-stone-300">Producer account email<input type="email" autoComplete="email" value={producerEmail} onChange={event => setProducerEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white" required /></label>
                <label className="block text-xs font-semibold text-stone-300">Password<div className="relative mt-1.5"><input type={showProducerPassword ? 'text' : 'password'} autoComplete="current-password" value={producerPassword} onChange={event => setProducerPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-stone-900 px-3 pr-10 py-2.5 text-xs text-white" required /><button type="button" onClick={() => setShowProducerPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 cursor-pointer" aria-label={showProducerPassword ? 'Hide password' : 'Show password'}>{showProducerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></label>
                <button type="submit" disabled={isBusy} className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-stone-950 cursor-pointer"><Building2 className="inline w-4 h-4 mr-1" /> Sign in as Host</button>
                <div className="flex justify-between text-[11px]"><button type="button" onClick={() => setProducerMode('claim')} className="text-amber-400 font-semibold cursor-pointer">Claim a listing</button><button type="button" onClick={() => setProducerMode('forgot')} className="text-stone-400 cursor-pointer">Forgot password?</button></div>
              </form>
            </div>
          )}

          {accountType === 'producer' && producerMode === 'claim' && (
            <form onSubmit={handleProducerClaim} className="space-y-3">
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[11px] leading-relaxed text-stone-300">The initial claim only verifies legitimate representation. Banking, shipping, packaging and payout details are not collected here.</div>
              <label className="block text-xs font-semibold text-stone-300">Producer listing<select value={selectedProducerId} onChange={event => setSelectedProducerId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white" required>{producers.map(producer => <option key={producer.id} value={producer.id}>{producer.name} · {producer.village}, {producer.region}</option>)}</select></label>
              <label className="block text-xs font-semibold text-stone-300">Your name<input value={producerHostName} onChange={event => setProducerHostName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white" required /></label>
              <label className="block text-xs font-semibold text-stone-300">Official producer email<input type="email" value={producerEmail} onChange={event => setProducerEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white" required /></label>
              <label className="block text-xs font-semibold text-stone-300">Create password<input type="password" value={producerPassword} onChange={event => setProducerPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white" required /></label>

              <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-3 space-y-3">
                <div><div className="text-xs font-bold text-white">Business evidence <span className="text-stone-500 font-normal">(optional where applicable)</span></div><div className="text-[10px] text-stone-500 mt-0.5">A VAT/business registration can help the review. Small producers without one can still submit for manual verification.</div></div>
                <div className="grid grid-cols-[90px_1fr] gap-2"><input value={fiscalCountry} onChange={event => setFiscalCountry(event.target.value.toUpperCase().slice(0, 2))} maxLength={2} aria-label="Country code" className="rounded-xl border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white uppercase" /><input value={legalBusinessName} onChange={event => setLegalBusinessName(event.target.value)} placeholder="Registered business name (optional)" className="rounded-xl border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white" /></div>
                <input value={vatNumber} onChange={event => setVatNumber(event.target.value.toUpperCase())} placeholder={`${fiscalLabels.shortVatLabel} / business tax ID (optional)`} className="w-full rounded-xl border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white" />
                {vatValidation && <div className={`text-[10px] ${vatValidation.isValid ? 'text-emerald-300' : 'text-amber-300'}`}>{vatValidation.isValid ? 'Format accepted; ownership still requires review.' : vatValidation.error}</div>}
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-stone-900/60 p-3 text-[11px] text-stone-300 cursor-pointer"><input type="checkbox" checked={producerTermsAccepted} onChange={event => setProducerTermsAccepted(event.target.checked)} className="mt-0.5" /><span>I am authorized to represent this producer and I accept the TerroirTrail Producer Terms. {onOpenTerms && <button type="button" onClick={() => { onClose(); onOpenTerms(); }} className="text-amber-400 underline cursor-pointer">Read Producer Terms</button>}</span></label>
              <button type="submit" disabled={isBusy || producers.length === 0} className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-stone-950 disabled:opacity-50 cursor-pointer">{localLoading === 'form' ? 'Submitting claim…' : <><ArrowRight className="inline w-4 h-4 mr-1" /> Submit claim for review</>}</button>
              <button type="button" onClick={() => setProducerMode('login')} className="w-full text-xs text-stone-400 cursor-pointer">← Back to producer sign in</button>
            </form>
          )}

          {accountType === 'producer' && producerMode === 'forgot' && (
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <label className="block text-xs font-semibold text-stone-300">Registered producer email<input type="email" value={producerEmail} onChange={event => setProducerEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white" required /></label>
              <button type="submit" disabled={isBusy} className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-stone-950 cursor-pointer">Send reset link</button>
              <button type="button" onClick={() => setProducerMode('login')} className="w-full text-xs text-stone-400 cursor-pointer">← Back to producer sign in</button>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-stone-500 space-y-1.5">
            <div className="flex items-center justify-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />Firebase authentication · private account data</div>
            <div className="flex justify-center gap-2">
              {onOpenPrivacyNotice && <button type="button" onClick={() => { onClose(); onOpenPrivacyNotice(); }} className="underline hover:text-amber-400 cursor-pointer">Privacy</button>}
              {onOpenTerms && <button type="button" onClick={() => { onClose(); onOpenTerms(); }} className="underline hover:text-amber-400 cursor-pointer">Terms</button>}
              {onOpenLicenses && <button type="button" onClick={() => { onClose(); onOpenLicenses(); }} className="underline hover:text-amber-400 cursor-pointer">Licenses</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
