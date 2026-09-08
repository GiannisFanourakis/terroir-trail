import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { TravelerType } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginAsDemo: (key: 'giannis' | 'elena' | 'markos') => void;
  onLogin: (email: string, name?: string) => void;
  onSignup: (name: string, email: string, travelerType: TravelerType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginAsDemo,
  onLogin,
  onSignup,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'signup'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [travelerType, setTravelerType] = useState<TravelerType>('crete_local');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    onLogin(email);
    onClose();
  };

  const handleCustomSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    onSignup(name.trim(), email, travelerType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-sm font-bold">
              🛂
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight">
                Terroir Explorer Account
              </h2>
              <p className="text-[11px] text-stone-400">
                Save your passport stamps, favorites & tasting notes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-stone-900/60 px-3 pt-2 shrink-0 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('demo'); setError(''); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'demo'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            ⚡ 1-Click Demo
          </button>
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'login'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              activeTab === 'signup'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* TAB 1: 1-Click Demo */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-stone-400 text-[11px]">
                Select an authentic pre-configured traveler profile to test passport stamps and tasting notes instantly:
              </p>

              {/* Giannis */}
              <button
                onClick={() => {
                  onLoginAsDemo('giannis');
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-amber-500/30 hover:border-amber-400 transition group flex items-center justify-between"
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
                className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 hover:border-rose-400 transition group flex items-center justify-between"
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
                className="w-full text-left p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 hover:border-amber-400 transition group flex items-center justify-between"
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

          {/* TAB 2: Sign In */}
          {activeTab === 'login' && (
            <form onSubmit={handleCustomLogin} className="space-y-3.5">
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
                    placeholder="you@example.com"
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400"
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
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98"
              >
                Sign In to TerroirTrail
              </button>
            </form>
          )}

          {/* TAB 3: Register */}
          {activeTab === 'signup' && (
            <form onSubmit={handleCustomSignup} className="space-y-3.5">
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
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400"
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
                    placeholder="you@example.com"
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400"
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
                      className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition ${
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
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98"
              >
                Create Free Traveler Account
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Free & Private · Local browser storage</span>
          </div>
        </div>

      </div>
    </div>
  );
};
