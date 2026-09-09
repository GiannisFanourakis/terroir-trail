import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, AlertCircle, Building2, Sparkles } from 'lucide-react';
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
  onLoginAsProducer?: (producerId: string, producerName: string, email: string, password?: string, hostName?: string) => Promise<any> | void;
  onClaimProducer?: (producerId: string, producerName: string, hostName: string, email: string, password?: string) => Promise<any> | void;
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
  onLoginWithGoogle,
  onLoginWithApple,
  isLoading = false,
  authError,
  isFirebaseConfigured = false,
}) => {
  const [accountType, setAccountType] = useState<'traveler' | 'producer'>(initialRole);
  
  // Traveler Tabs: demo | login | signup
  const [activeTravelerTab, setActiveTravelerTab] = useState<'demo' | 'login' | 'signup'>('demo');
  
  // Producer Tabs: demo | login | claim
  const [activeProducerTab, setActiveProducerTab] = useState<'demo' | 'login' | 'claim'>('demo');

  // Traveler Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [travelerType, setTravelerType] = useState<TravelerType>('crete_local');

  // Producer Form Fields
  const [selectedProducerId, setSelectedProducerId] = useState<string>(
    producers[0]?.id || 'domaine-paterianakis'
  );
  const [producerHostName, setProducerHostName] = useState('');
  const [producerEmail, setProducerEmail] = useState('');
  const [producerPassword, setProducerPassword] = useState('');

  const [localError, setLocalError] = useState<string>('');
  const [localLoading, setLocalLoading] = useState<'google' | 'apple' | 'form' | 'producer' | null>(null);

  // Sync initialRole when modal opens
  useEffect(() => {
    if (isOpen) {
      setAccountType(initialRole);
      setLocalError('');
      if (producers.length > 0 && !selectedProducerId) {
        setSelectedProducerId(producers[0].id);
      }
    }
  }, [isOpen, initialRole, producers]);

  if (!isOpen) return null;

  const currentError = localError || authError;

  const handleGoogleLogin = async () => {
    setLocalError('');
    if (!onLoginWithGoogle) return;
    try {
      setLocalLoading('google');
      await onLoginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setLocalError(
          'Live Google sign-in requires Firebase credentials. Add your keys to .env (see .env.example) or try the 1-Click Demo below!'
        );
      } else {
        setLocalError(err.message || 'Google sign-in failed');
      }
    } finally {
      setLocalLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setLocalError('');
    if (!onLoginWithApple) return;
    try {
      setLocalLoading('apple');
      await onLoginWithApple();
      onClose();
    } catch (err: any) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setLocalError(
          'Live Apple sign-in requires Firebase credentials. Add your keys to .env (see .env.example) or try the 1-Click Demo below!'
        );
      } else {
        setLocalError(err.message || 'Apple sign-in failed');
      }
    } finally {
      setLocalLoading(null);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }
    setLocalError('');
    try {
      setLocalLoading('form');
      await onLogin(email, password);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLocalLoading(null);
    }
  };

  const handleCustomSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Please enter your full name');
      return;
    }
    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (password && password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    setLocalError('');
    try {
      setLocalLoading('form');
      await onSignup(name.trim(), email, password, travelerType);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    } finally {
      setLocalLoading(null);
    }
  };

  // Producer Login Handler
  const handleProducerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producerEmail || !producerEmail.includes('@')) {
      setLocalError('Please enter your estate email address');
      return;
    }
    const matched = producers.find((p) => p.id === selectedProducerId) || producers[0];
    const estateName = matched ? matched.name : 'Artisan Producer';
    setLocalError('');
    try {
      setLocalLoading('producer');
      if (onLoginAsProducer) {
        await onLoginAsProducer(selectedProducerId, estateName, producerEmail, producerPassword, producerHostName);
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Producer login failed. Please verify credentials.');
    } finally {
      setLocalLoading(null);
    }
  };

  // Producer Claim Handler
  const handleProducerClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producerHostName.trim()) {
      setLocalError('Please enter the host or winemaker name');
      return;
    }
    if (!producerEmail || !producerEmail.includes('@')) {
      setLocalError('Please enter your estate official email');
      return;
    }
    if (producerPassword && producerPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    const matched = producers.find((p) => p.id === selectedProducerId) || producers[0];
    const estateName = matched ? matched.name : 'Artisan Producer';
    setLocalError('');
    try {
      setLocalLoading('producer');
      if (onClaimProducer) {
        await onClaimProducer(selectedProducerId, estateName, producerHostName.trim(), producerEmail, producerPassword);
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to claim estate profile');
    } finally {
      setLocalLoading(null);
    }
  };

  const isBusy = isLoading || localLoading !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Account Role Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-stone-900/90 border-b border-white/10 shrink-0 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAccountType('traveler'); setLocalError(''); }}
            className={`py-2 rounded-xl text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
              accountType === 'traveler'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🧭 Explorer & Traveler</span>
          </button>

          <button
            type="button"
            onClick={() => { setAccountType('producer'); setLocalError(''); }}
            className={`py-2 rounded-xl text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
              accountType === 'producer'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-amber-300 hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Producer Login</span>
          </button>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner border ${
              accountType === 'producer'
                ? 'bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {accountType === 'producer' ? '🏛️' : '🛂'}
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight">
                {accountType === 'producer' ? 'Producer & Estate Host Login' : 'Terroir Explorer Account'}
              </h2>
              <p className="text-[11px] text-stone-400">
                {accountType === 'producer'
                  ? 'Manage reservations, estate hours & announcements'
                  : 'Save your passport stamps, favorites & tasting notes'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4 text-xs">

          {/* Error Message */}
          {currentError && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {currentError}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW A: PRODUCER & ESTATE HOST LOGIN FLOW                */}
          {/* ========================================================= */}
          {accountType === 'producer' && (
            <div className="space-y-4">
              {/* Producer Sub-tabs */}
              <div className="flex rounded-xl bg-stone-900/80 p-1 border border-white/10 text-xs font-semibold">
                <button
                  onClick={() => { setActiveProducerTab('demo'); setLocalError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                    activeProducerTab === 'demo'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  ⚡ 1-Click Host Demo
                </button>
                <button
                  onClick={() => { setActiveProducerTab('login'); setLocalError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                    activeProducerTab === 'login'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Host Sign In
                </button>
                <button
                  onClick={() => { setActiveProducerTab('claim'); setLocalError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                    activeProducerTab === 'claim'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Claim Estate
                </button>
              </div>

              {/* TAB 1: 1-Click Producer Demos */}
              {activeProducerTab === 'demo' && (
                <div className="space-y-2.5">
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Test the complete host management dashboard instantly with verified artisan accounts:
                  </p>

                  {/* Domaine Paterianakis */}
                  <button
                    onClick={() => {
                      if (onLoginAsDemoProducer) onLoginAsDemoProducer('paterianakis');
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-amber-500/30 hover:border-amber-400 transition group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                        🍇
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white group-hover:text-amber-300 transition text-xs">
                            Domaine Paterianakis
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                            Verified Host
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Emmanuela Paterianaki · Peza, Crete · 1 Pending Tasting
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Manousakis Winery */}
                  <button
                    onClick={() => {
                      if (onLoginAsDemoProducer) onLoginAsDemoProducer('manousakis');
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 hover:border-rose-400 transition group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl shrink-0">
                        🍷
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white group-hover:text-rose-300 transition text-xs">
                            Manousakis Winery
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-400/20 text-rose-300 font-bold">
                            Verified Host
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Alexandra Manousakis · Vatolakkos, Chania · Sunset Pairings
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Cretan Brewery (Charma) */}
                  <button
                    onClick={() => {
                      if (onLoginAsDemoProducer) onLoginAsDemoProducer('charma');
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 hover:border-amber-400 transition group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-xl shrink-0">
                        🍺
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white group-hover:text-amber-300 transition text-xs">
                            Cretan Brewery (Charma)
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                            Craft Brewer
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Ioannis Lionakis · Zounaki, Platanias · Brewhouse Tours
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Azienda Agricola Monteraponi (Tuscany) */}
                  <button
                    onClick={() => {
                      if (onLoginAsDemoProducer) onLoginAsDemoProducer('monteraponi');
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 hover:border-amber-400 transition group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600/30 to-rose-600/30 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                        🏰
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white group-hover:text-amber-300 transition text-xs">
                            Azienda Agricola Monteraponi
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                            Tuscany Host 🇮🇹
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Michele Braganti · Radda in Chianti, Italy · Cellar Flights
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* TAB 2: Registered Producer Login */}
              {activeProducerTab === 'login' && (
                <form onSubmit={handleProducerLogin} className="space-y-3">
                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Select Your Registered Estate
                    </label>
                    <select
                      value={selectedProducerId}
                      onChange={(e) => setSelectedProducerId(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer"
                      required
                    >
                      {producers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.village}, {p.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Estate Host Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={producerEmail}
                        onChange={(e) => setProducerEmail(e.target.value)}
                        placeholder="host@estatewinery.gr"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={producerPassword}
                        onChange={(e) => setProducerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {localLoading === 'producer' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>Signing in to Estate...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Sign In to Estate Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: Claim & Register Estate */}
              {activeProducerTab === 'claim' && (
                <form onSubmit={handleProducerClaim} className="space-y-3">
                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Select Estate to Claim
                    </label>
                    <select
                      value={selectedProducerId}
                      onChange={(e) => setSelectedProducerId(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer"
                      required
                    >
                      {producers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.village}, {p.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Winemaker / Host Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={producerHostName}
                        onChange={(e) => setProducerHostName(e.target.value)}
                        placeholder="Emmanuela Paterianaki"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Official Estate Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={producerEmail}
                        onChange={(e) => setProducerEmail(e.target.value)}
                        placeholder="info@paterianakis.gr"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Create Master Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={producerPassword}
                        onChange={(e) => setProducerPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {localLoading === 'producer' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>Verifying & Claiming...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Claim Estate & Activate Host Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Host Verification & Direct Booking Commission Management</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW B: TRAVELER / EXPLORER ACCOUNT FLOW                  */}
          {/* ========================================================= */}
          {accountType === 'traveler' && (
            <div className="space-y-4">
              {/* Social OAuth Providers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-stone-300">Fast Single Sign-On</span>
                  {isFirebaseConfigured ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Live Auth Server
                    </span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                      Config via .env
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isBusy}
                    className="flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white text-stone-900 font-bold hover:bg-stone-100 active:scale-98 transition shadow-md disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {localLoading === 'google' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-stone-700" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                    )}
                    <span>Google Account</span>
                  </button>

                  {/* Apple Button */}
                  <button
                    type="button"
                    onClick={handleAppleLogin}
                    disabled={isBusy}
                    className="flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold border border-white/20 active:scale-98 transition shadow-md disabled:opacity-50 cursor-pointer text-xs"
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
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-3 bg-stone-950 text-[10px] uppercase font-bold tracking-wider text-stone-500">
                  or explore via
                </span>
              </div>

              {/* Traveler Tab Selector */}
              <div className="flex rounded-xl bg-stone-900/80 p-1 border border-white/10 text-xs font-semibold">
                <button
                  onClick={() => { setActiveTravelerTab('demo'); setLocalError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                    activeTravelerTab === 'demo'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  ⚡ 1-Click Demo
                </button>
                <button
                  onClick={() => { setActiveTravelerTab('login'); setLocalError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                    activeTravelerTab === 'login'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Email Login
                </button>
                <button
                  onClick={() => { setActiveTravelerTab('signup'); setLocalError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                    activeTravelerTab === 'signup'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* TAB 1: 1-Click Demo */}
              {activeTravelerTab === 'demo' && (
                <div className="space-y-2.5">
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Test the complete experience instantly with genuine pre-configured traveler profiles:
                  </p>

                  {/* Giannis */}
                  <button
                    onClick={() => {
                      onLoginAsDemo('giannis');
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-amber-500/30 hover:border-amber-400 transition group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                        🇬🇷
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white group-hover:text-amber-300 transition text-xs">
                            Giannis Fanourakis
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                            Crete Local
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Heraklion · 4 Passport Stamps · 2 Tasting Notes
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Elena */}
                  <button
                    onClick={() => {
                      onLoginAsDemo('elena');
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 hover:border-rose-400 transition group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl shrink-0">
                        🍷
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white group-hover:text-rose-300 transition text-xs">
                            Elena Kazantzaki
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-400/20 text-rose-300 font-bold">
                            Sommelier
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Santorini / Athens · 3 Wine Stamps
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Markos */}
                  <button
                    onClick={() => {
                      onLoginAsDemo('markos');
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 hover:border-amber-400 transition group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-xl shrink-0">
                        🍺
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white group-hover:text-amber-300 transition text-xs">
                            Markos V.
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                            Craft Brewer
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Chania · 3 Microbrewery Stamps
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* TAB 2: Traveler Sign In */}
              {activeTravelerTab === 'login' && (
                <form onSubmit={handleCustomLogin} className="space-y-3">
                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="explorer@example.com"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {localLoading === 'form' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign In to TerroirTrail</span>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: Traveler Register */}
              {activeTravelerTab === 'signup' && (
                <form onSubmit={handleCustomSignup} className="space-y-3">
                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Giannis Fanourakis"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="explorer@example.com"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                      Traveler Personality
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
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {localLoading === 'form' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create Free Traveler Account</span>
                    )}
                  </button>
                </form>
              )}

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure Authentication · Stored per unique Explorer ID</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

