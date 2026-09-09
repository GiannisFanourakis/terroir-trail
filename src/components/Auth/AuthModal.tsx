import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, AlertCircle, 
  Building2, Sparkles, Eye, EyeOff, CheckCircle2, ChevronDown, ChevronUp 
} from 'lucide-react';
import { TravelerType } from '../../types/auth';
import { Producer } from '../../types/terroir';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'traveler' | 'producer';
  producers?: Producer[];
  onLoginAsDemo: (key: 'giannis' | 'elena' | 'markos') => void;
  onLoginAsDemoProducer?: (key: 'paterianakis' | 'manousakis' | 'charma' | 'monteraponi') => void;
  onLogin: (email: string, password?: string) => Promise<any> | void;
  onSignup: (name: string, email: string, password?: string, travelerType?: TravelerType) => Promise<any> | void;
  onLoginAsProducer?: (email: string, password?: string, producerId?: string, producerName?: string) => Promise<any> | void;
  onClaimProducer?: (producerId: string, producerName: string, hostName: string, email: string, password?: string) => Promise<any> | void;
  onResetPassword?: (email: string) => Promise<any> | void;
  onLoginWithGoogle?: () => Promise<any>;
  onLoginWithApple?: () => Promise<any>;
  isLoading?: boolean;
  authError?: string | null;
  isFirebaseConfigured?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'traveler',
  producers = [],
  onLoginAsDemo,
  onLoginAsDemoProducer,
  onLogin,
  onSignup,
  onLoginAsProducer,
  onClaimProducer,
  onResetPassword,
  onLoginWithGoogle,
  onLoginWithApple,
  isLoading = false,
  authError,
  isFirebaseConfigured = false,
}) => {
  const [accountType, setAccountType] = useState<'traveler' | 'producer'>(initialRole);
  
  // Modes: 'login' | 'signup' | 'forgot'
  const [travelerMode, setTravelerMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [producerMode, setProducerMode] = useState<'login' | 'claim' | 'forgot'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [name, setName] = useState('');
  const [travelerType, setTravelerType] = useState<TravelerType>('crete_local');

  // Producer Claim Fields
  const [selectedProducerId, setSelectedProducerId] = useState<string>('');
  const [producerHostName, setProducerHostName] = useState('');
  const [producerEmail, setProducerEmail] = useState('');
  const [producerPassword, setProducerPassword] = useState('');
  const [showProducerPassword, setShowProducerPassword] = useState(false);

  // Statuses
  const [localError, setLocalError] = useState<string>('');
  const [resetSuccessEmail, setResetSuccessEmail] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState<'google' | 'apple' | 'form' | 'reset' | null>(null);
  const [showDemoSection, setShowDemoSection] = useState(false);

  // Sync initialRole when modal opens
  useEffect(() => {
    if (isOpen) {
      setAccountType(initialRole);
      setTravelerMode('login');
      setProducerMode('login');
      setLocalError('');
      setResetSuccessEmail(null);
      setShowDemoSection(false);
      if (producers.length > 0 && !selectedProducerId) {
        setSelectedProducerId(producers[0].id);
      }
    }
  }, [isOpen, initialRole, producers]);

  if (!isOpen) return null;

  const currentError = localError || authError;
  const isBusy = isLoading || localLoading !== null;

  // 1. Google OAuth
  const handleGoogleLogin = async () => {
    setLocalError('');
    setResetSuccessEmail(null);
    if (!onLoginWithGoogle) return;
    try {
      setLocalLoading('google');
      await onLoginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setLocalError('Google sign-in requires Firebase credentials. Check your .env file.');
      } else {
        setLocalError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLocalLoading(null);
    }
  };

  // 2. Apple OAuth
  const handleAppleLogin = async () => {
    setLocalError('');
    setResetSuccessEmail(null);
    if (!onLoginWithApple) return;
    try {
      setLocalLoading('apple');
      await onLoginWithApple();
      onClose();
    } catch (err: any) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setLocalError('Apple sign-in requires Firebase credentials. Check your .env file.');
      } else {
        setLocalError(err.message || 'Apple sign-in failed.');
      }
    } finally {
      setLocalLoading(null);
    }
  };

  // 3. Traveler Sign In
  const handleTravelerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setResetSuccessEmail(null);
    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      setLocalLoading('form');
      await onLogin(email.trim(), password);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Sign in failed. Please verify your email and password.');
    } finally {
      setLocalLoading(null);
    }
  };

  // 4. Traveler Sign Up
  const handleTravelerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setResetSuccessEmail(null);
    if (!name.trim()) {
      setLocalError('Please enter your full name.');
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
      await onSignup(name.trim(), email.trim(), password, travelerType);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Account registration failed.');
    } finally {
      setLocalLoading(null);
    }
  };

  // 5. Producer Sign In
  const handleProducerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setResetSuccessEmail(null);
    const targetEmail = (accountType === 'producer' ? producerEmail || email : email).trim();
    const targetPassword = accountType === 'producer' ? producerPassword || password : password;

    if (!targetEmail) {
      setLocalError('Please enter your official estate email.');
      return;
    }
    if (!targetPassword) {
      setLocalError('Please enter your host password.');
      return;
    }

    try {
      setLocalLoading('form');
      if (onLoginAsProducer) {
        await onLoginAsProducer(targetEmail, targetPassword);
      } else {
        await onLogin(targetEmail, targetPassword);
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Host login failed. Please verify your email and password.');
    } finally {
      setLocalLoading(null);
    }
  };

  // 6. Producer Claim & Register
  const handleProducerClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setResetSuccessEmail(null);

    const producer = producers.find((p) => p.id === selectedProducerId) || producers[0];
    if (!producer) {
      setLocalError('Please select your estate from the registry.');
      return;
    }
    if (!producerHostName.trim()) {
      setLocalError('Please enter the winemaker or host name.');
      return;
    }
    if (!producerEmail.trim()) {
      setLocalError('Please enter your official estate email.');
      return;
    }
    if (!producerPassword || producerPassword.length < 6) {
      setLocalError('Master password must be at least 6 characters long.');
      return;
    }

    try {
      setLocalLoading('form');
      if (onClaimProducer) {
        await onClaimProducer(
          producer.id,
          producer.name,
          producerHostName.trim(),
          producerEmail.trim(),
          producerPassword
        );
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Estate registration failed.');
    } finally {
      setLocalLoading(null);
    }
  };

  // 7. Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setResetSuccessEmail(null);
    const targetEmail = (accountType === 'producer' ? producerEmail || email : email).trim();

    if (!targetEmail) {
      setLocalError('Please enter your registered email address.');
      return;
    }

    try {
      setLocalLoading('reset');
      if (onResetPassword) {
        await onResetPassword(targetEmail);
      }
      setResetSuccessEmail(targetEmail);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send password reset email.');
    } finally {
      setLocalLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-stone-100 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition cursor-pointer z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/10 text-center relative bg-gradient-to-b from-stone-900/80 to-transparent">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/90 border border-white/10 text-xs font-semibold mb-2 shadow-sm">
            <img src="/logo.png" alt="TerroirTrail" className="w-4 h-4 rounded-full object-cover shrink-0" />
            <span className="text-amber-300">TerroirTrail Authentication</span>
            {isFirebaseConfigured && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Cloud Auth Server"></span>
            )}
          </div>
          
          <h2 className="text-xl font-bold font-serif-title tracking-tight text-white">
            {accountType === 'traveler' ? (
              travelerMode === 'login' ? 'Sign In to TerroirTrail' :
              travelerMode === 'signup' ? 'Create Explorer Account' : 'Reset Your Password'
            ) : (
              producerMode === 'login' ? 'Winemaker & Host Sign In' :
              producerMode === 'claim' ? 'Claim Your Estate Listing' : 'Reset Host Password'
            )}
          </h2>

          <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
            {accountType === 'traveler' ? (
              travelerMode === 'login' ? 'Access your Terroir Passport, verified tasting notes, and bookings.' :
              travelerMode === 'signup' ? 'Collect digital stamps and unlock VIP cellar perks across Greece & Italy.' :
              'Enter your email address and we will send you a secure password reset link.'
            ) : (
              producerMode === 'login' ? 'Manage your cellar reservations, operating hours, and direct shop links.' :
              producerMode === 'claim' ? 'Verify your winery or brewery to accept bookings and customize your story.' :
              'Enter your official estate email to reset your master password.'
            )}
          </p>

          {/* Dual Account Type Switcher */}
          <div className="mt-4 flex rounded-xl bg-stone-900 p-1 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAccountType('traveler');
                setLocalError('');
                setResetSuccessEmail(null);
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                accountType === 'traveler'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>🧭</span>
              <span>Explorer & Traveler</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('producer');
                setLocalError('');
                setResetSuccessEmail(null);
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                accountType === 'producer'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>🏛️</span>
              <span>Winemaker & Host</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Error Banner */}
          {currentError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 leading-relaxed">{currentError}</div>
            </div>
          )}

          {/* Reset Success Banner */}
          {resetSuccessEmail && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Password Reset Email Sent!</p>
                <p className="mt-0.5 text-stone-300">
                  Please check your inbox at <span className="text-emerald-300 font-semibold">{resetSuccessEmail}</span> for instructions to reset your password.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION A: TRAVELER & EXPLORER FLOWS                      */}
          {/* ========================================================= */}
          {accountType === 'traveler' && (
            <>
              {/* 1. TRAVELER LOGIN */}
              {travelerMode === 'login' && (
                <div className="space-y-4">
                  {/* Social Single Sign-On (Google / Apple) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isBusy}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs hover:bg-stone-100 active:scale-98 transition shadow disabled:opacity-50 cursor-pointer"
                    >
                      {localLoading === 'google' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-stone-800" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                      )}
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAppleLogin}
                      disabled={isBusy}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-stone-900 border border-white/20 text-white font-bold text-xs hover:bg-stone-850 active:scale-98 transition shadow disabled:opacity-50 cursor-pointer"
                    >
                      {localLoading === 'apple' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                      ) : (
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.06-7.7-7.92-12.02-14.58-6.1-9.35-10.86-19.98-14.28-31.9-3.42-11.91-5.13-23.01-5.13-33.3 0-14.83 3.73-27.02 11.2-36.56 7.47-9.55 16.73-14.38 27.78-14.51 5.37 0 11.13 1.48 17.29 4.43 6.16 2.96 10.15 4.5 11.97 4.64 1.82-.14 6.04-1.74 12.65-4.78 6.62-3.05 12.38-4.42 17.29-4.13 13.58.74 24.36 5.86 32.34 15.35-11.89 7.22-17.65 17.06-17.29 29.53.36 9.87 4.2 18.06 11.53 24.58 7.33 6.51 16.14 10.16 26.43 10.95-2.09 6.31-4.72 12.98-7.91 20.02zM119.22 33.15c-.24-7.4 2.22-14.42 7.38-21.05 5.16-6.63 11.81-10.98 19.96-13.06.49 7.15-1.97 14.07-7.38 20.76-5.41 6.69-12.07 11.14-19.96 13.35z"/>
                        </svg>
                      )}
                      <span>Apple ID</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-white/10"></div>
                    <span className="relative px-3 bg-stone-950 text-[10px] uppercase font-bold tracking-wider text-stone-500">
                      or sign in with email
                    </span>
                  </div>

                  {/* Real Email & Password Form */}
                  <form onSubmit={handleTravelerLogin} className="space-y-3">
                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-stone-300 text-xs font-semibold">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setTravelerMode('forgot');
                            setLocalError('');
                          }}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-400 hover:text-stone-300">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-white/20 bg-stone-900 text-amber-500 focus:ring-amber-400/20"
                        />
                        <span>Remember me</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {localLoading === 'form' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign In</span>
                      )}
                    </button>
                  </form>

                  {/* Switch to Signup */}
                  <div className="text-center pt-2">
                    <span className="text-xs text-stone-400">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTravelerMode('signup');
                        setLocalError('');
                      }}
                      className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Create Free Account →
                    </button>
                  </div>
                </div>
              )}

              {/* 2. TRAVELER SIGN UP */}
              {travelerMode === 'signup' && (
                <div className="space-y-4">
                  <form onSubmit={handleTravelerSignup} className="space-y-3">
                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Giannis Fanourakis"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-400 text-[11px] font-semibold mb-1.5">
                        Traveler Personality Style
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'crete_local', label: 'Crete Local', icon: '🇬🇷' },
                          { id: 'wine_enthusiast', label: 'Wine Lover', icon: '🍷' },
                          { id: 'craft_beer_explorer', label: 'Craft Brewer', icon: '🍺' },
                          { id: 'culinary_nomad', label: 'Agritourist', icon: '🌿' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTravelerType(t.id as TravelerType)}
                            className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition cursor-pointer ${
                              travelerType === t.id
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                                : 'bg-stone-900 text-stone-400 border-white/5 hover:text-white'
                            }`}
                          >
                            <span className="text-base">{t.icon}</span>
                            <span className="text-[11px]">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {localLoading === 'form' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Creating account...</span>
                        </>
                      ) : (
                        <span>Create Free Account</span>
                      )}
                    </button>
                  </form>

                  {/* Switch to Login */}
                  <div className="text-center pt-2">
                    <span className="text-xs text-stone-400">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTravelerMode('login');
                        setLocalError('');
                      }}
                      className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign In →
                    </button>
                  </div>
                </div>
              )}

              {/* 3. TRAVELER FORGOT PASSWORD */}
              {travelerMode === 'forgot' && (
                <div className="space-y-4">
                  <form onSubmit={handlePasswordReset} className="space-y-3">
                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {localLoading === 'reset' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Sending Reset Link...</span>
                        </>
                      ) : (
                        <span>Send Password Reset Link</span>
                      )}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTravelerMode('login');
                        setLocalError('');
                      }}
                      className="text-xs text-stone-400 hover:text-white transition cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* SECTION B: WINEMAKER & ESTATE HOST FLOWS                  */}
          {/* ========================================================= */}
          {accountType === 'producer' && (
            <>
              {/* 1. PRODUCER HOST SIGN IN */}
              {producerMode === 'login' && (
                <div className="space-y-4">
                  <form onSubmit={handleProducerLogin} className="space-y-3">
                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Official Estate or Winemaker Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          autoComplete="email"
                          value={producerEmail}
                          onChange={(e) => setProducerEmail(e.target.value)}
                          placeholder="winery@estate.gr"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-stone-300 text-xs font-semibold">
                          Host Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setProducerMode('forgot');
                            setLocalError('');
                          }}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showProducerPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={producerPassword}
                          onChange={(e) => setProducerPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowProducerPassword(!showProducerPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                        >
                          {showProducerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {localLoading === 'form' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Signing in to Estate...</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4" />
                          <span>Sign In as Estate Host</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Switch to Claim */}
                  <div className="text-center pt-2">
                    <span className="text-xs text-stone-400">First time here? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setProducerMode('claim');
                        setLocalError('');
                      }}
                      className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Claim Your Estate & Register →
                    </button>
                  </div>
                </div>
              )}

              {/* 2. CLAIM ESTATE & REGISTER */}
              {producerMode === 'claim' && (
                <div className="space-y-4">
                  <form onSubmit={handleProducerClaim} className="space-y-3">
                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Select Estate to Claim
                      </label>
                      <select
                        value={selectedProducerId}
                        onChange={(e) => setSelectedProducerId(e.target.value)}
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer"
                        required
                      >
                        {producers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.village}, {p.region} · {p.country || 'Greece'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Winemaker / Host Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={producerHostName}
                          onChange={(e) => setProducerHostName(e.target.value)}
                          placeholder="Emmanuela Paterianaki"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Official Estate Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={producerEmail}
                          onChange={(e) => setProducerEmail(e.target.value)}
                          placeholder="info@paterianakis.gr"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Create Master Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showProducerPassword ? 'text' : 'password'}
                          value={producerPassword}
                          onChange={(e) => setProducerPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowProducerPassword(!showProducerPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                        >
                          {showProducerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {localLoading === 'form' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Verifying & Claiming...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Claim Estate & Activate Host Portal</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Switch to Login */}
                  <div className="text-center pt-2">
                    <span className="text-xs text-stone-400">Already claimed your estate? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setProducerMode('login');
                        setLocalError('');
                      }}
                      className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign In to Estate →
                    </button>
                  </div>
                </div>
              )}

              {/* 3. PRODUCER FORGOT PASSWORD */}
              {producerMode === 'forgot' && (
                <div className="space-y-4">
                  <form onSubmit={handlePasswordReset} className="space-y-3">
                    <div>
                      <label className="block text-stone-300 text-xs font-semibold mb-1">
                        Registered Estate Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={producerEmail}
                          onChange={(e) => setProducerEmail(e.target.value)}
                          placeholder="winery@estate.gr"
                          className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {localLoading === 'reset' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Sending Reset Link...</span>
                        </>
                      ) : (
                        <span>Send Password Reset Link</span>
                      )}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProducerMode('login');
                        setLocalError('');
                      }}
                      className="text-xs text-stone-400 hover:text-white transition cursor-pointer"
                    >
                      ← Back to Host Sign In
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* DISCREET TESTING & DEMO HELPER (COLLAPSIBLE)              */}
          {/* ========================================================= */}
          <div className="pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowDemoSection(!showDemoSection)}
              className="w-full py-1 text-[11px] text-stone-500 hover:text-stone-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>🧪 Testing or evaluating without an account?</span>
              {showDemoSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoSection && (
              <div className="mt-2.5 space-y-2 p-3 rounded-2xl bg-stone-900/60 border border-white/5 animate-in fade-in duration-200">
                <p className="text-[10px] text-stone-400">
                  {accountType === 'traveler'
                    ? 'Click any pre-configured profile to explore stamps, passport notes, and bookings:'
                    : 'Click any estate to preview the verified host management dashboard:'}
                </p>

                {accountType === 'traveler' ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onLoginAsDemo('giannis');
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-500/20 text-left flex items-center justify-between text-xs cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇬🇷</span>
                        <div>
                          <span className="font-bold text-white">Giannis Fanourakis</span>
                          <span className="text-[10px] text-stone-400 ml-2">Crete Local · 4 Stamps</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoginAsDemo('elena');
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-rose-500/20 text-left flex items-center justify-between text-xs cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🍷</span>
                        <div>
                          <span className="font-bold text-white">Elena Kazantzaki</span>
                          <span className="text-[10px] text-stone-400 ml-2">Sommelier · 3 Stamps</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoginAsDemo('markos');
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-400/20 text-left flex items-center justify-between text-xs cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🍺</span>
                        <div>
                          <span className="font-bold text-white">Markos V.</span>
                          <span className="text-[10px] text-stone-400 ml-2">Craft Brewer · 3 Stamps</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { key: 'paterianakis', name: 'Domaine Paterianakis', host: 'Emmanuela Paterianaki', tag: 'Organic Winery · Peza' },
                      { key: 'manousakis', name: 'Manousakis Winery', host: 'Alexandra Manousakis', tag: 'Estate Winery · Chania' },
                      { key: 'charma', name: 'Cretan Brewery (Charma)', host: 'Ioannis Lionakis', tag: 'Microbrewery · Chania' },
                      { key: 'monteraponi', name: 'Monteraponi (Tuscany)', host: 'Michele Braganti', tag: 'Chianti Classico · Italy' },
                    ].map((h) => (
                      <button
                        key={h.key}
                        type="button"
                        onClick={() => {
                          onLoginAsDemoProducer?.(h.key as any);
                          onClose();
                        }}
                        className="p-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-500/20 text-left flex items-center justify-between text-xs cursor-pointer transition"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{h.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">Host</span>
                          </div>
                          <span className="text-[10px] text-stone-400">{h.host} · {h.tag}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Authentication · Stored per unique User ID</span>
          </div>

        </div>

      </div>
    </div>
  );
};
