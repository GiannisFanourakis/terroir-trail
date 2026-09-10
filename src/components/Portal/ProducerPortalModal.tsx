import React, { useState, useEffect } from 'react';
import { Producer } from '../../types/terroir';
import { TastingBooking, ProducerOverride } from '../../types/booking';
import { UserProfile, ProducerTaxDetails } from '../../types/auth';
import { 
  X, Check, AlertCircle, Clock, Calendar, Users, Phone, Mail, 
  Sparkles, CheckCircle2, XCircle, Building2, ChevronDown, Save, Send, 
  Crown, Globe, ExternalLink, ShieldCheck, ArrowRight, LogIn, Wine,
  TrendingUp, DollarSign, Percent, Eye, Compass, Bell, CheckCheck, MapPin,
  Truck, FileText, Package, HelpCircle
} from 'lucide-react';
import { validateVatNumber } from '../../utils/vatValidator';
import { ProducerRegistrationForm } from './ProducerRegistrationForm';

interface ProducerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth?: (role?: 'producer') => void;
  onLoginAsDemoProducer?: (key: 'paterianakis' | 'manousakis' | 'charma' | 'monteraponi') => void;
  onLoginWithGoogle?: (role?: 'traveler' | 'producer', claimedProducerId?: string, producerName?: string) => Promise<any>;
  onLoginWithApple?: (role?: 'traveler' | 'producer', claimedProducerId?: string, producerName?: string) => Promise<any>;
  producers: Producer[];
  bookings: TastingBooking[];
  onUpdateBookingStatus: (bookingId: string, status: TastingBooking['status']) => Promise<void>;
  onSaveProducerOverride: (override: ProducerOverride) => Promise<void>;
  getProducerOverride: (producerId: string) => ProducerOverride | undefined;
  onUpdateProducerTaxDetails?: (taxDetails: ProducerTaxDetails) => Promise<void> | void;
  onSelectProducerForDrawer?: (producer: Producer) => void;
}

export const ProducerPortalModal: React.FC<ProducerPortalModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onLoginAsDemoProducer,
  onLoginWithGoogle,
  onLoginWithApple,
  producers,
  bookings,
  onUpdateBookingStatus,
  onSaveProducerOverride,
  getProducerOverride,
  onUpdateProducerTaxDetails,
  onSelectProducerForDrawer,
}) => {
  if (!isOpen) return null;

  const isProducerAuthenticated = Boolean(user && user.isProducer && user.claimedProducerId);

  // Initialize selected producer to the authenticated user's claimed estate
  const [selectedProducerId, setSelectedProducerId] = useState<string>(() => {
    if (user?.claimedProducerId) {
      const match = producers.find((p) => p.id === user.claimedProducerId);
      if (match) return match.id;
    }
    return producers[0]?.id || 'domaine-paterianakis';
  });

  const [activeTab, setActiveTab] = useState<'bookings' | 'notice' | 'experiences' | 'analytics' | 'pro' | 'shipping'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Sync selected producer whenever user profile changes
  useEffect(() => {
    if (user?.claimedProducerId) {
      setSelectedProducerId(user.claimedProducerId);
    }
  }, [user?.claimedProducerId]);

  const selectedProducer =
    producers.find((p) => p.id === selectedProducerId) ||
    producers.find((p) => p.id === user?.claimedProducerId) ||
    producers[0];

  const currentOverride = selectedProducer ? getProducerOverride(selectedProducer.id) : undefined;
  const [customNotice, setCustomNotice] = useState<string>(
    currentOverride?.customNotice || ''
  );
  const [isAcceptingBookings, setIsAcceptingBookings] = useState<boolean>(
    currentOverride ? currentOverride.isAcceptingBookings : true
  );
  const [isProTier, setIsProTier] = useState<boolean>(
    currentOverride ? Boolean(currentOverride.isProTier) : false
  );
  const [directBottleShopUrl, setDirectBottleShopUrl] = useState<string>(
    currentOverride?.directBottleShopUrl || ''
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fiscal & Shipping state
  const [taxVatNumber, setTaxVatNumber] = useState<string>(user?.taxDetails?.vatNumber || '');
  const [taxLegalName, setTaxLegalName] = useState<string>(user?.taxDetails?.legalBusinessName || selectedProducer?.name || '');
  const [taxOffice, setTaxOffice] = useState<string>(user?.taxDetails?.taxOffice || '');
  const [taxAddress, setTaxAddress] = useState<string>(user?.taxDetails?.registeredAddress || (selectedProducer ? `${selectedProducer.village}, ${selectedProducer.region}` : ''));
  const [taxPhone, setTaxPhone] = useState<string>(user?.taxDetails?.dispatchContactPhone || selectedProducer?.phone || '');
  const [taxEori, setTaxEori] = useState<string>(user?.taxDetails?.eoriNumber || '');
  const [taxSaveSuccess, setTaxSaveSuccess] = useState<boolean>(false);
  const [taxError, setTaxError] = useState<string | null>(null);

  const portalCountryHint = (selectedProducer?.country === 'Italy' || selectedProducer?.destination === 'tuscany') ? 'IT' : 'GR';
  const portalVatValidation = taxVatNumber.trim() ? validateVatNumber(taxVatNumber.trim(), portalCountryHint) : null;

  // Sync tax state when user or selectedProducer changes
  useEffect(() => {
    if (user?.taxDetails) {
      setTaxVatNumber(user.taxDetails.vatNumber || '');
      setTaxLegalName(user.taxDetails.legalBusinessName || selectedProducer?.name || '');
      setTaxOffice(user.taxDetails.taxOffice || '');
      setTaxAddress(user.taxDetails.registeredAddress || (selectedProducer ? `${selectedProducer.village}, ${selectedProducer.region}` : ''));
      setTaxPhone(user.taxDetails.dispatchContactPhone || selectedProducer?.phone || '');
      setTaxEori(user.taxDetails.eoriNumber || '');
    } else if (selectedProducer) {
      setTaxLegalName(selectedProducer.name);
      setTaxAddress(`${selectedProducer.village}, ${selectedProducer.region} (${selectedProducer.country || 'Greece'})`);
      setTaxPhone(selectedProducer.phone || '');
    }
  }, [user?.taxDetails, selectedProducer]);

  const handleSaveTaxDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTaxError(null);
    if (!onUpdateProducerTaxDetails) return;

    const vatCheck = taxVatNumber.trim() ? validateVatNumber(taxVatNumber.trim(), portalCountryHint) : null;
    if (taxVatNumber.trim() && !vatCheck?.isValid) {
      setTaxError(vatCheck?.error || 'Invalid VAT Number. Please verify format.');
      return;
    }

    const details: ProducerTaxDetails = {
      vatNumber: vatCheck?.formatted || taxVatNumber.trim(),
      legalBusinessName: taxLegalName.trim() || selectedProducer?.name || '',
      taxOffice: taxOffice.trim() || undefined,
      registeredAddress: taxAddress.trim() || '',
      dispatchContactPhone: taxPhone.trim() || selectedProducer?.phone || '',
      countryCode: portalCountryHint,
      isVatVerified: Boolean(vatCheck?.isValid),
      vatVerificationDate: vatCheck?.isValid ? new Date().toISOString() : undefined,
      eoriNumber: taxEori.trim() || (vatCheck?.isValid ? vatCheck.formatted : undefined),
    };

    try {
      await onUpdateProducerTaxDetails(details);
      setTaxSaveSuccess(true);
      setTimeout(() => setTaxSaveSuccess(false), 3500);
    } catch (err: any) {
      setTaxError(err.message || 'Failed to update fiscal and shipping details.');
    }
  };

  // Sync state when selected producer changes
  useEffect(() => {
    if (selectedProducer) {
      const ov = getProducerOverride(selectedProducer.id);
      setCustomNotice(ov?.customNotice || '');
      setIsAcceptingBookings(ov ? ov.isAcceptingBookings : true);
      setIsProTier(ov ? Boolean(ov.isProTier) : false);
      setDirectBottleShopUrl(ov?.directBottleShopUrl || '');
      setSaveSuccess(false);
    }
  }, [selectedProducerId, getProducerOverride]);

  const handleSelectProducer = (id: string) => {
    setSelectedProducerId(id);
  };

  const estateBookings = selectedProducer ? bookings.filter((b) => b.producerId === selectedProducer.id) : [];
  
  const pendingBookings = estateBookings.filter((b) => b.status === 'pending');
  const confirmedBookings = estateBookings.filter((b) => b.status === 'confirmed');
  const completedBookings = estateBookings.filter((b) => b.status === 'completed');
  const cancelledBookings = estateBookings.filter((b) => b.status === 'cancelled');

  const filteredBookings = estateBookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  const totalGuests = confirmedBookings.reduce((sum, b) => sum + b.guestsCount, 0) + 
                      completedBookings.reduce((sum, b) => sum + b.guestsCount, 0);
  const estimatedRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalEstimated, 0) +
                           completedBookings.reduce((sum, b) => sum + b.totalEstimated, 0);
  const otaCommissionSaved = Math.round(estimatedRevenue * 0.20); // 20% commission standard on OTA

  const handleSaveNotice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProducer) return;
    await onSaveProducerOverride({
      producerId: selectedProducer.id,
      customNotice: customNotice.trim(),
      isAcceptingBookings,
      isProTier,
      directBottleShopUrl: directBottleShopUrl.trim(),
      updatedAt: new Date().toISOString(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleAcceptingBookings = async () => {
    const nextVal = !isAcceptingBookings;
    setIsAcceptingBookings(nextVal);
    if (selectedProducer) {
      await onSaveProducerOverride({
        producerId: selectedProducer.id,
        customNotice: customNotice.trim(),
        isAcceptingBookings: nextVal,
        isProTier,
        directBottleShopUrl: directBottleShopUrl.trim(),
        updatedAt: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleGateGoogleLogin = async () => {
    if (!onLoginWithGoogle) return;
    setOauthError(null);
    try {
      setOauthLoading('google');
      await onLoginWithGoogle('producer', selectedProducerId, selectedProducer?.name);
    } catch (err: any) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setOauthError('Google sign-in requires Firebase credentials. Check your .env file or use 1-Click Host Demo.');
      } else {
        setOauthError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGateAppleLogin = async () => {
    if (!onLoginWithApple) return;
    setOauthError(null);
    try {
      setOauthLoading('apple');
      await onLoginWithApple('producer', selectedProducerId, selectedProducer?.name);
    } catch (err: any) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setOauthError('Apple sign-in requires Firebase credentials. Check your .env file or use 1-Click Host Demo.');
      } else if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setOauthError('Apple Sign-In is not enabled yet in your Firebase project. To use it, enable Apple in Firebase Console ➔ Authentication ➔ Sign-in method, or sign in with Google or 1-Click Host Demo.');
      } else {
        setOauthError(err.message || 'Apple sign-in failed.');
      }
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-5xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* ========================================================= */}
        {/* 1. TOP HEADER & ESTATE IDENTITY                           */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-900 border-b border-white/10 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="TerroirTrail" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight truncate">
                  {isProducerAuthenticated && selectedProducer
                    ? selectedProducer.name
                    : 'TerroirTrail Estate Host Management'}
                </h2>
                {isProducerAuthenticated && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Host
                  </span>
                )}
                {isProTier && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Pro Partner
                  </span>
                )}
                {user?.taxDetails?.vatNumber && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0" title={`Verified Legal Entity: ${user.taxDetails.legalBusinessName || ''}`}>
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    <span>ΑΦΜ/VAT: {user.taxDetails.vatNumber}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                {isProducerAuthenticated && user
                  ? `${user.name} (${user.email}) · ${selectedProducer?.village || ''}, ${selectedProducer?.region || ''} (${selectedProducer?.country || 'Greece'})`
                  : 'Independent Producer Dashboard · 0% Commission Fair-Trade Agritourism'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isProducerAuthenticated && selectedProducer && onSelectProducerForDrawer && (
              <button
                onClick={() => {
                  onSelectProducerForDrawer(selectedProducer);
                  onClose();
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer"
                title="View your public visitor page"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>View Public Page</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* GATE: IF NOT LOGGED IN AS A PRODUCER                      */}
        {/* ========================================================= */}
        {!isProducerAuthenticated ? (
          <div className="p-6 sm:p-12 text-center space-y-6 my-auto overflow-y-auto max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto flex items-center justify-center">
              <img src="/logo.png" alt="TerroirTrail" className="w-full h-full object-contain drop-shadow-xl" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 font-bold tracking-wider uppercase border border-amber-500/30">
                Winery, Brewery & Farm Portal
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-serif-title">
                Artisan Producer & Host Estate Center
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
                Connect your estate profile to manage incoming guest tasting reservations, post live harvest notices, and configure direct artisan shop links with <strong className="text-emerald-400">0% platform commission</strong>.
              </p>
            </div>

            {oauthError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{oauthError}</span>
              </div>
            )}

            {/* Fast OAuth Options */}
            <div className="space-y-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleGateGoogleLogin}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs hover:bg-stone-100 active:scale-98 transition shadow disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{oauthLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-white/10"></div>
                <span className="relative px-3 bg-stone-950 text-[10px] uppercase font-bold tracking-wider text-stone-500">
                  or email / claim registration
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('producer');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Estate Email or Claim Profile</span>
              </button>
            </div>

            {/* Demo Host Fast Preview */}
            {onLoginAsDemoProducer && (
              <div className="pt-4 border-t border-white/10 max-w-md mx-auto text-left space-y-2">
                <p className="text-[11px] text-stone-400 font-semibold text-center">
                  🧪 Instant Host Demo Preview (1-Click Evaluation):
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onLoginAsDemoProducer('paterianakis')}
                    className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-500/30 text-stone-300 text-xs text-left transition hover:border-amber-400 cursor-pointer"
                  >
                    <span className="font-bold text-white block truncate">Fake Winery (Demo)</span>
                    <span className="text-[10px] text-amber-400">Host: John Smith</span>
                  </button>
                  <button
                    onClick={() => onLoginAsDemoProducer('manousakis')}
                    className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-300 text-xs text-left transition hover:border-amber-400/40 cursor-pointer"
                  >
                    <span className="font-bold text-white block truncate">Valley Vineyard (Demo)</span>
                    <span className="text-[10px] text-stone-400">Host: Jane Miller</span>
                  </button>
                  <button
                    onClick={() => onLoginAsDemoProducer('charma')}
                    className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-300 text-xs text-left transition hover:border-amber-400/40 cursor-pointer"
                  >
                    <span className="font-bold text-white block truncate">Craft Brewing Co. (Demo)</span>
                    <span className="text-[10px] text-stone-400">Host: David Wilson</span>
                  </button>
                  <button
                    onClick={() => onLoginAsDemoProducer('monteraponi')}
                    className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-300 text-xs text-left transition hover:border-amber-400/40 cursor-pointer"
                  >
                    <span className="font-bold text-white block truncate">Tuscan Hillside (Demo)</span>
                    <span className="text-[10px] text-stone-400">Host: Marco Rossi</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Are you an independent producer on TerroirTrail? Access is verified per estate.</span>
            </div>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* 2. ESTATE HERO & EXECUTIVE CONTROLS                       */}
            {/* ========================================================= */}
            <div className="px-5 sm:px-6 py-3.5 bg-stone-900/60 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              {/* Estate Switcher or Identity Display */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                    Active Estate Profile
                  </span>
                  
                  {user?.id.startsWith('producer_') ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedProducerId}
                        onChange={(e) => handleSelectProducer(e.target.value)}
                        className="bg-stone-950 border border-amber-500/30 text-amber-300 font-bold rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer max-w-[260px] truncate"
                      >
                        {producers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.village}, {p.region})
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-stone-500">(Demo Mode Switcher)</span>
                    </div>
                  ) : (
                    <span className="font-bold text-white text-sm truncate block">
                      {selectedProducer?.name} <span className="text-stone-400 font-normal text-xs">({selectedProducer?.village}, {selectedProducer?.region})</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Live Reservation Status Switch */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950 border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${isAcceptingBookings ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                  <span className="text-[11px] font-semibold text-stone-300">
                    {isAcceptingBookings ? 'Accepting Reservations' : 'Reservations Paused'}
                  </span>
                  <button
                    type="button"
                    onClick={toggleAcceptingBookings}
                    className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      isAcceptingBookings
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                    }`}
                  >
                    {isAcceptingBookings ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3. EXECUTIVE KPI PERFORMANCE STRIP                        */}
            {/* ========================================================= */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-5 sm:px-6 py-3 bg-stone-950 border-b border-white/10 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-white/5">
                <span className="text-stone-400 text-[10px] uppercase font-semibold block">Total Inquiries</span>
                <span className="text-lg font-bold text-white font-serif-title">{estateBookings.length}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${pendingBookings.length > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-stone-900/80 border-white/5'}`}>
                <span className="text-stone-400 text-[10px] uppercase font-semibold block">Pending Action</span>
                <span className={`text-lg font-bold font-serif-title ${pendingBookings.length > 0 ? 'text-amber-400' : 'text-stone-400'}`}>
                  {pendingBookings.length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-white/5">
                <span className="text-stone-400 text-[10px] uppercase font-semibold block">Guests Welcomed</span>
                <span className="text-lg font-bold text-amber-300 font-serif-title">{totalGuests}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-white/5">
                <span className="text-stone-400 text-[10px] uppercase font-semibold block">Est. Revenue</span>
                <span className="text-lg font-bold text-emerald-400 font-serif-title">€{estimatedRevenue}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 col-span-2 sm:col-span-1">
                <span className="text-emerald-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  0% Commission
                </span>
                <span className="text-xs text-emerald-300 font-medium leading-tight block mt-0.5">
                  Saved ~€{otaCommissionSaved} vs OTAs
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. DASHBOARD TABS NAVIGATION                              */}
            {/* ========================================================= */}
            <div className="flex border-b border-white/10 bg-stone-950 px-5 sm:px-6 pt-1 text-xs font-semibold shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <span>📋 Reservations Queue</span>
                {pendingBookings.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[9px] font-bold flex items-center justify-center">
                    {pendingBookings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('notice')}
                className={`py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'notice'
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <span>📢 Live Bulletin & Hours</span>
              </button>

              <button
                onClick={() => setActiveTab('experiences')}
                className={`py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'experiences'
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Wine className="w-3.5 h-3.5" />
                <span>Tasting Flights</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Analytics & Fair-Trade</span>
              </button>

              <button
                onClick={() => setActiveTab('pro')}
                className={`py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'pro'
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Host Pro Tier</span>
                {isProTier && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-bold">
                    ACTIVE
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'shipping'
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Shipping & Fiscal (ΑΦΜ)</span>
                {user?.taxDetails?.isVatVerified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>

            {/* ========================================================= */}
            {/* 5. ACTIVE TAB CONTENT                                     */}
            {/* ========================================================= */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
              
              {/* TAB 1: RESERVATIONS QUEUE */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {/* Status Filter Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setBookingFilter('all')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          bookingFilter === 'all'
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-400 hover:text-white'
                        }`}
                      >
                        All ({estateBookings.length})
                      </button>
                      <button
                        onClick={() => setBookingFilter('pending')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          bookingFilter === 'pending'
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span>Pending</span>
                        {pendingBookings.length > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            bookingFilter === 'pending' ? 'bg-stone-950 text-amber-400 font-bold' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {pendingBookings.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setBookingFilter('confirmed')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          bookingFilter === 'confirmed'
                            ? 'bg-emerald-500 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-400 hover:text-white'
                        }`}
                      >
                        Confirmed ({confirmedBookings.length})
                      </button>
                      <button
                        onClick={() => setBookingFilter('completed')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          bookingFilter === 'completed'
                            ? 'bg-sky-500 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-400 hover:text-white'
                        }`}
                      >
                        Visited ({completedBookings.length})
                      </button>
                      <button
                        onClick={() => setBookingFilter('cancelled')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          bookingFilter === 'cancelled'
                            ? 'bg-rose-500 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-400 hover:text-white'
                        }`}
                      >
                        Cancelled ({cancelledBookings.length})
                      </button>
                    </div>

                    <span className="text-[11px] text-stone-400">
                      Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'reservation' : 'reservations'}
                    </span>
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="py-14 text-center text-stone-500 space-y-3 bg-stone-900/30 rounded-2xl border border-white/5">
                      <Calendar className="w-10 h-10 mx-auto text-stone-600 stroke-[1.5]" />
                      <div>
                        <p className="text-sm font-semibold text-stone-300">No reservations match this filter.</p>
                        <p className="text-[11px] text-stone-500 max-w-sm mx-auto mt-1">
                          When travelers book a tasting session through TerroirTrail, requests appear here immediately with guest contact details.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBookings.map((b) => (
                        <div
                          key={b.id}
                          className={`p-4 rounded-2xl border transition ${
                            b.status === 'pending'
                              ? 'bg-stone-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                              : b.status === 'confirmed'
                              ? 'bg-stone-900/90 border-emerald-500/30'
                              : b.status === 'completed'
                              ? 'bg-stone-900/60 border-sky-500/20'
                              : 'bg-stone-950/60 border-white/5 opacity-50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{b.userName}</span>
                                <span
                                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    b.status === 'pending'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : b.status === 'confirmed'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : b.status === 'completed'
                                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  }`}
                                >
                                  {b.status === 'completed' ? 'Visited & Completed' : b.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-stone-400 text-[11px] mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                  {b.date} at {b.timeSlot}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-amber-400" />
                                  {b.guestsCount} {b.guestsCount === 1 ? 'Guest' : 'Guests'}
                                </span>
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-emerald-400 font-bold text-sm">
                                €{b.totalEstimated}
                              </span>
                              <div className="text-[10px] text-stone-400">{b.experienceTitle}</div>
                            </div>
                          </div>

                          {/* Guest Details & Special Requests */}
                          <div className="pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 text-stone-300">
                              <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                              <a href={`mailto:${b.userEmail}`} className="hover:text-amber-400 underline truncate">
                                {b.userEmail}
                              </a>
                            </div>
                            {b.userPhone && (
                              <div className="flex items-center gap-1.5 text-stone-300">
                                <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                <a href={`tel:${b.userPhone}`} className="hover:text-amber-400 underline">
                                  {b.userPhone}
                                </a>
                              </div>
                            )}
                          </div>

                          {b.specialRequests && (
                            <div className="mt-2 p-2 rounded-xl bg-stone-950/80 border border-white/5 text-[11px] text-stone-300">
                              <span className="font-semibold text-amber-300">Special Note: </span>
                              <span>{b.specialRequests}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end gap-2">
                            {b.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'cancelled')}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'confirmed')}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Confirm Reservation</span>
                                </button>
                              </>
                            )}

                            {b.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'cancelled')}
                                  className="px-3 py-1.5 rounded-xl text-stone-400 hover:text-rose-300 text-xs transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                                  className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                                  <span>Mark as Visited / Completed</span>
                                </button>
                              </>
                            )}

                            {b.status === 'completed' && (
                              <span className="text-[11px] text-sky-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Tasting Finished · Cellar Stamped</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LIVE BULLETIN & HOURS */}
              {activeTab === 'notice' && (
                <form onSubmit={handleSaveNotice} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Bell className="w-4 h-4" />
                      <span>Live Harvest & Cellar Bulletin</span>
                    </p>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      Publish announcements directly to visitors browsing your pin on the interactive map. Perfect for announcing harvest days, barrel room walk-ins, seasonal food pairings, or emergency closures.
                    </p>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Estate bulletin saved and broadcast to live map!</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-stone-300 text-xs font-semibold mb-1">
                      Current Estate Announcement
                    </label>
                    <textarea
                      value={customNotice}
                      onChange={(e) => setCustomNotice(e.target.value)}
                      placeholder="e.g. 🍇 Fresh seasonal harvest in progress! Stop by between 11:00-16:00 for tastings with producer Emmanuela."
                      rows={3}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>

                  {/* Direct Store E-Commerce URL */}
                  <div>
                    <label className="block text-stone-300 text-xs font-semibold mb-1">
                      Direct Estate Store URL (E-Commerce)
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={directBottleShopUrl}
                        onChange={(e) => setDirectBottleShopUrl(e.target.value)}
                        placeholder="https://shop.yourestate.com"
                        className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Allows travelers to order products directly from your webshop after their visit. TerroirTrail takes 0% commission on direct artisan sales.
                    </p>
                  </div>

                  {/* Estate Visiting Guidelines */}
                  <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2">
                    <span className="font-bold text-white text-xs block">Visitor Access & Ethos Notice</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-400">
                      <div className="p-2.5 rounded-xl bg-stone-950 border border-white/5">
                        <span className="font-semibold text-stone-200 block mb-0.5">Road Access:</span>
                        <span>{selectedProducer.roadAccess === 'paved' ? 'Paved Road (Standard cars welcome)' : 'Mountain Track (Drive cautiously)'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-950 border border-white/5">
                        <span className="font-semibold text-stone-200 block mb-0.5">Pet & Camper Policy:</span>
                        <span>{selectedProducer.dogFriendly ? '🐶 Dogs Welcome' : 'No Pets'} · {selectedProducer.campervanFriendly ? '🚐 Campervan Friendly' : 'Standard Parking Only'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Broadcast to Live Map</span>
                  </button>
                </form>
              )}

              {/* TAB 3: TASTING FLIGHTS & EXPERIENCES */}
              {activeTab === 'experiences' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">Curated Tasting Experiences</h4>
                      <p className="text-[11px] text-stone-400">
                        These flights are presented to travelers when booking a tasting at {selectedProducer.name}.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Native Terroir Flight */}
                    <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-white text-xs block">Signature Terroir Flight</span>
                          <span className="text-[10px] text-amber-400 font-semibold">4 Native Wines / Craft Brews</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-xs">
                          €15 / person
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Guided cellar tasting showcasing the estate's indigenous varieties ({selectedProducer.indigenousVarieties.slice(0, 3).join(', ')}), accompanied by local Cretan barley rusks and estate olive oil.
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-stone-500 pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 45 Minutes</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 1-12 Guests</span>
                      </div>
                    </div>

                    {/* Master VIP Cellar Experience */}
                    <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-white text-xs block">VIP Barrel & Terroir Deep Dive</span>
                          <span className="text-[10px] text-amber-400 font-semibold">6 Wines + Artisan Cheese Board</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-xs">
                          €30 / person
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Private tour with the producer into the cellar and production rooms. Includes rare reserve batches paired with aged Graviera and sourdough.
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-stone-500 pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 90 Minutes</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 2-8 Guests</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-white/10 text-[11px] text-stone-400 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Custom Flight Editing: </span>
                      <span>To modify tasting flight prices, add seasonal vertical flights, or change cheese pairings, contact our editorial curator team at <a href="mailto:hosts@terroirtrail.com" className="text-amber-400 underline">hosts@terroirtrail.com</a>.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ANALYTICS & 0% FAIR-TRADE COMPARISON */}
              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  {/* Fair-Trade 0% vs 25% Comparison */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-stone-900 to-stone-900 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white text-xs">Fair-Trade Agritourism: 0% Platform Commission</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-stone-950 font-bold">
                        ESTATE BENEFIT
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      Global booking agencies (TripAdvisor, Viator, GetYourGuide) typically demand <strong className="text-rose-400">20% to 25% commissions</strong> on every tasting. TerroirTrail charges <strong>0% booking commission</strong> to independent producers, leaving 100% of cellar revenue where it belongs—in your hands.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-stone-950/80 border border-white/10 text-center">
                        <span className="text-[10px] text-stone-400 block">Gross Tasting Revenue</span>
                        <span className="text-lg font-bold text-white">€{estimatedRevenue}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-950/80 border border-white/10 text-center">
                        <span className="text-[10px] text-rose-400 block">Typical OTA Fees (20%)</span>
                        <span className="text-lg font-bold text-rose-400">-€{otaCommissionSaved}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-emerald-300 block font-bold">TerroirTrail Fee</span>
                        <span className="text-lg font-bold text-emerald-400">€0 (Saved €{otaCommissionSaved})</span>
                      </div>
                    </div>
                  </div>

                  {/* Demographic Breakdown */}
                  <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-3">
                    <span className="font-bold text-white text-xs block">
                      Visitor Origin Demographics (Last 30 Days)
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-stone-950/80 border border-white/5">
                        <span className="text-base block">🇩🇪</span>
                        <span className="font-bold text-white text-xs block">42%</span>
                        <span className="text-[9px] text-stone-400">Germany</span>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-950/80 border border-white/5">
                        <span className="text-base block">🇬🇧</span>
                        <span className="font-bold text-white text-xs block">28%</span>
                        <span className="text-[9px] text-stone-400">UK</span>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-950/80 border border-white/5">
                        <span className="text-base block">🇺🇸</span>
                        <span className="font-bold text-white text-xs block">18%</span>
                        <span className="text-[9px] text-stone-400">USA</span>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-950/80 border border-white/5">
                        <span className="text-base block">🇫🇷</span>
                        <span className="font-bold text-white text-xs block">12%</span>
                        <span className="text-[9px] text-stone-400">France</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: HOST PRO TIER */}
              {activeTab === 'pro' && (
                <div className="space-y-4">
                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Host Pro subscription settings updated!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Free Partner */}
                    <div className={`p-4 rounded-2xl border transition ${
                      !isProTier ? 'bg-stone-900/90 border-white/20' : 'bg-stone-950/60 border-white/5 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-xs">Standard Partner</span>
                        <span className="text-[10px] text-stone-400">Free Forever</span>
                      </div>
                      <ul className="text-[11px] text-stone-400 space-y-1.5 list-disc list-inside">
                        <li>Interactive map marker & producer profile</li>
                        <li>Direct tasting reservation reception</li>
                        <li>0% commission on tasting bookings</li>
                        <li>Standard Day Circuit inclusion</li>
                      </ul>
                      {!isProTier && (
                        <span className="mt-3 block text-center py-1.5 rounded-xl bg-stone-800 text-stone-300 text-[11px] font-bold">
                          Active Plan
                        </span>
                      )}
                    </div>

                    {/* Terroir Pro */}
                    <div className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                      isProTier
                        ? 'bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-900 border-amber-400 shadow-xl shadow-amber-500/10'
                        : 'bg-stone-900/90 border-amber-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white text-xs">Verified Host Pro</span>
                        </div>
                        <span className="font-serif-title text-amber-300 font-bold text-sm">
                          €39<span className="text-[10px] text-stone-400">/mo</span>
                        </span>
                      </div>
                      <ul className="text-[11px] text-stone-300 space-y-1.5 list-disc list-inside">
                        <li><strong className="text-amber-300">Gold Glowing Badge</strong> on the interactive map</li>
                        <li><strong className="text-amber-300">Featured Day Circuit</strong> priority recommendation</li>
                        <li><strong className="text-amber-300">Direct Bottle Shop</strong> button on mobile drawer</li>
                        <li>Advanced traveler demographic analytics</li>
                      </ul>

                      <button
                        type="button"
                        onClick={() => setIsProTier(!isProTier)}
                        className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          isProTier
                            ? 'bg-emerald-500 text-stone-950 shadow-md'
                            : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg'
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>{isProTier ? '✓ Pro Active (Click to Pause)' : 'Upgrade to Host Pro (€39/mo)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SHIPPING & FISCAL LOGISTICS */}
              {activeTab === 'shipping' && (
                <div className="space-y-4">
                  <ProducerRegistrationForm
                    initialProducerId={selectedProducer?.id}
                    userId={user?.id}
                    producersList={producers}
                    onSaved={(record) => {
                      setTaxVatNumber(record.vatNumber);
                      setTaxLegalName(record.legalBusinessName);
                      setTaxOffice(record.taxOffice);
                      setTaxAddress(`${record.logistics.streetAddress}, ${record.logistics.cityOrVillage}, ${record.logistics.postalCode}`);
                      setTaxPhone(record.logistics.dispatchPhone);
                      setTaxEori(record.eoriNumber || '');

                      if (onUpdateProducerTaxDetails) {
                        onUpdateProducerTaxDetails({
                          vatNumber: record.vatNumber,
                          legalBusinessName: record.legalBusinessName,
                          taxOffice: record.taxOffice,
                          registeredAddress: `${record.logistics.streetAddress}, ${record.logistics.cityOrVillage}, ${record.logistics.postalCode}`,
                          dispatchContactPhone: record.logistics.dispatchPhone,
                          countryCode: record.countryCode,
                          isVatVerified: record.isVatVerified,
                          vatVerificationDate: record.vatVerificationDate,
                          eoriNumber: record.eoriNumber,
                          gemiNumber: record.permits?.gemiNumber,
                          iban: record.banking?.iban,
                          registrationRecord: record,
                        });
                      }
                    }}
                  />
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
