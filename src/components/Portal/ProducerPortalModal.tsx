import React, { useState, useEffect } from 'react';
import { Producer } from '../../types/terroir';
import { TastingBooking, ProducerOverride } from '../../types/booking';
import { UserProfile, ProducerTaxDetails } from '../../types/auth';
import { 
  X, Check, AlertCircle, Clock, Calendar, Users, Phone, Mail, 
  Sparkles, CheckCircle2, XCircle, Building2, ChevronDown, Save, Send, 
  Crown, Globe, ExternalLink, ShieldCheck, ArrowRight, LogIn, Wine,
  TrendingUp, DollarSign, Percent, Eye, Compass, Bell, CheckCheck, MapPin,
  Truck, FileText, Package, HelpCircle, QrCode, Camera, Trash2, Plus, UploadCloud
} from 'lucide-react';
import { validateVatNumber, getFiscalLabels } from '../../utils/vatValidator';
import { formatAuthError } from '../../utils/authErrors';
import { ProducerUploadedImage, validateImageUpload, getProducerMediaLimits } from '../../types/producerMedia';
import { runtimeConfig } from '../../config/runtimeConfig';
import { resolveProducerCover } from '../../utils/producerMediaResolver';
import { ProducerRegistrationForm } from './ProducerRegistrationForm';
import { HostQrScannerModal } from './HostQrScannerModal';
import { HostVerificationModal, VerifiedPassInfo } from '../Monetization/HostVerificationModal';

const ENABLE_FUTURE_HOST_FEATURES = false;

interface ProducerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth?: (role?: 'producer') => void;
  onLoginWithGoogle?: (role?: 'traveler' | 'producer', claimedProducerId?: string, producerName?: string) => Promise<any>;
  onLoginWithApple?: (role?: 'traveler' | 'producer', claimedProducerId?: string, producerName?: string) => Promise<any>;
  producers: Producer[];
  bookings: TastingBooking[];
  onUpdateBookingStatus: (bookingId: string, status: TastingBooking['status']) => Promise<void>;
  onSaveProducerOverride: (override: ProducerOverride) => Promise<void>;
  getProducerOverride: (producerId: string) => ProducerOverride | undefined;
  onUpdateProducerTaxDetails?: (taxDetails: ProducerTaxDetails) => Promise<void> | void;
  onSelectProducerForDrawer?: (producer: Producer) => void;
  onPassVerified?: (info: VerifiedPassInfo) => void;
}

export const ProducerPortalModal: React.FC<ProducerPortalModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onLoginWithGoogle,
  onLoginWithApple,
  producers,
  bookings,
  onUpdateBookingStatus,
  onSaveProducerOverride,
  getProducerOverride,
  onUpdateProducerTaxDetails,
  onSelectProducerForDrawer,
  onPassVerified,
}) => {
  const isProducerAuthenticated = Boolean(user && user.isProducer && user.claimedProducerId);

  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [verifiedGuest, setVerifiedGuest] = useState<VerifiedPassInfo | null>(null);

  const handlePassVerified = (info: VerifiedPassInfo) => {
    setIsScannerOpen(false);
    if (onPassVerified) {
      onPassVerified(info);
    } else {
      setVerifiedGuest(info);
    }
  };

  // Initialize selected producer to the authenticated user's claimed estate
  const [selectedProducerId, setSelectedProducerId] = useState<string>(() => {
    if (user?.claimedProducerId) {
      const match = producers.find((p) => p.id === user.claimedProducerId);
      if (match) return match.id;
    }
    return producers[0]?.id || 'domaine-paterianakis';
  });

  const [activeTab, setActiveTab] = useState<'bookings' | 'notice' | 'photos' | 'experiences' | 'analytics' | 'pro' | 'shipping'>('notice');
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

  // Host Photo Management state
  const [rightsConfirmed, setRightsConfirmed] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSaveSuccess, setPhotoSaveSuccess] = useState<boolean>(false);

  const currentImages: ProducerUploadedImage[] = currentOverride?.uploadedImages || [];
  const currentCover = currentImages.find((img) => img.type === 'cover');
  const currentGallery = currentImages.filter((img) => img.type === 'gallery');

  const handleAddPhoto = async (file: File, type: 'cover' | 'gallery') => {
    if (!selectedProducer || !runtimeConfig.hostMediaPrototype.enabled) return;
    setPhotoError(null);

    const validation = validateImageUpload(
      { type: file.type, size: file.size },
      currentGallery.length,
      type === 'cover',
      rightsConfirmed,
      isProTier
    );

    if (!validation.isValid) {
      setPhotoError(validation.error?.message || 'Invalid image file.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    const newImage: ProducerUploadedImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      producerId: selectedProducer.id,
      url: localUrl,
      thumbnailUrl: localUrl,
      type,
      status: 'approved',
      uploadedAt: new Date().toISOString(),
      rightsConfirmed: true,
      source: 'host_upload',
    };

    let updatedImages: ProducerUploadedImage[];
    if (type === 'cover') {
      updatedImages = [newImage, ...currentImages.filter((img) => img.type !== 'cover')];
    } else {
      updatedImages = [...currentImages, newImage];
    }

    await onSaveProducerOverride({
      ...currentOverride,
      producerId: selectedProducer.id,
      customNotice: customNotice.trim(),
      isAcceptingBookings,
      directBottleShopUrl: directBottleShopUrl.trim(),
      uploadedImages: updatedImages,
      updatedAt: new Date().toISOString(),
    });

    setPhotoSaveSuccess(true);
    setTimeout(() => setPhotoSaveSuccess(false), 3000);
  };

  const handleDeletePhoto = async (imageId: string) => {
    if (!selectedProducer) return;
    setPhotoError(null);

    const updatedImages = currentImages.filter((img) => img.id !== imageId);

    await onSaveProducerOverride({
      ...currentOverride,
      producerId: selectedProducer.id,
      customNotice: customNotice.trim(),
      isAcceptingBookings,
      directBottleShopUrl: directBottleShopUrl.trim(),
      uploadedImages: updatedImages,
      updatedAt: new Date().toISOString(),
    });

    setPhotoSaveSuccess(true);
    setTimeout(() => setPhotoSaveSuccess(false), 3000);
  };

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
  }, [selectedProducer, getProducerOverride]);

  const handleSelectProducer = (id: string) => {
    // Prevent real users from switching to another producer in the host portal
    if (user?.id?.startsWith('producer_')) {
      setSelectedProducerId(id);
    }
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
      await onLoginWithGoogle();
    } catch (err: any) {
      setOauthError(formatAuthError(err));
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGateAppleLogin = async () => {
    if (!onLoginWithApple) return;
    setOauthError(null);
    try {
      setOauthLoading('apple');
      await onLoginWithApple();
    } catch (err: any) {
      setOauthError(formatAuthError(err));
    } finally {
      setOauthLoading(null);
    }
  };

  if (!isOpen) return null;

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
                {ENABLE_FUTURE_HOST_FEATURES && isProTier && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Pro Partner
                  </span>
                )}
                {user?.taxDetails?.vatNumber && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0" title={`Verified Legal Entity: ${user.taxDetails.legalBusinessName || ''}`}>
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    <span>{getFiscalLabels(user.taxDetails.countryCode || (user.taxDetails.vatNumber.startsWith('IT') ? 'IT' : 'GR')).shortVatLabel}: {user.taxDetails.vatNumber}</span>
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
            {ENABLE_FUTURE_HOST_FEATURES && isProducerAuthenticated && (
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
                title="Scan guest VIP QR code with device camera"
              >
                <Camera className="w-3.5 h-3.5 text-stone-950" />
                <span>Scan Guest Pass</span>
              </button>
            )}

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
                Claim an existing estate profile and submit evidence for review. Verified ownership is granted only after TerroirTrail approves the claim.
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

              {/* Live Reservation Status Switch & Quick VIP QR Scanner */}
              <div className="hidden">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-sm"
                  title="Scan visitor VIP QR code with device camera"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scan VIP Pass</span>
                </button>

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
            <div className="hidden">
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
                className={`hidden py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
                <span>📢 Visitor Notice</span>
              </button>

              {runtimeConfig.hostMediaPrototype.enabled && (
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'photos'
                      ? 'border-amber-400 text-amber-400 font-bold'
                      : 'border-transparent text-stone-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📸 Profile Photos</span>
                  {currentImages.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300 font-mono">
                      {currentImages.length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('experiences')}
                className={`hidden py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
                className={`hidden py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
                className={`hidden py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'pro'
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Host Pro Tier</span>
                {ENABLE_FUTURE_HOST_FEATURES && isProTier && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-bold">
                    ACTIVE
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('shipping')}
                className={`hidden py-2.5 px-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'shipping'
                    ? 'border-amber-400 text-amber-400 font-bold'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Fiscal & Dispatch Registration</span>
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
                      <span>Visitor Notice</span>
                    </p>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      Publish announcements directly to visitors browsing your pin on the interactive map. Perfect for announcing harvest days, barrel room walk-ins, seasonal food pairings, or emergency closures.
                    </p>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Visitor notice saved.</span>
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

                  {/* Direct Store E-Commerce URL — future feature */}
                  <div className="hidden">
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

                  {/* Estate Visiting Guidelines — future source-backed profile controls */}
                  <div className="hidden">
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
                    <span>Save Visitor Notice</span>
                  </button>
                </form>
              )}

              {/* TAB: PROFILE PHOTOS */}
              {runtimeConfig.hostMediaPrototype.enabled && activeTab === 'photos' && (
                <div className="space-y-4">
                  {/* Local Session Prototype Warning Banner */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Local Session Prototype</span>
                    </p>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      This photo uploader is an in-memory development prototype using temporary browser blob URLs. Uploaded photos will persist only during your current browser session and will not be published to durable cloud storage or public listings until production storage infrastructure is provisioned.
                    </p>
                  </div>

                  {/* Section Title & Description */}
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/5">
                    <div>
                      <h4 className="font-bold text-white text-sm">Estate Profile Photography</h4>
                      <p className="text-[11px] text-stone-400">
                        Showcase authentic imagery of {selectedProducer.name}. Verified host photography replaces default category imagery on your public page.
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Host Provenance</span>
                    </span>
                  </div>

                  {/* Mandatory Rights Confirmation Checkbox */}
                  <div className="p-3.5 rounded-2xl bg-stone-900 border border-amber-500/30 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="producer-rights-confirm"
                        checked={rightsConfirmed}
                        onChange={(e) => {
                          setRightsConfirmed(e.target.checked);
                          if (photoError) setPhotoError(null);
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500 shrink-0"
                      />
                      <label htmlFor="producer-rights-confirm" className="text-xs text-stone-300 leading-relaxed cursor-pointer select-none">
                        <span className="font-bold text-white block">Ownership & Commercial Rights Confirmation</span>
                        I confirm that I own these photos or have express permission to publish them on TerroirTrail. I agree not to upload watermarked third-party photos, copyrighted stock, or images taken from other platforms.
                      </label>
                    </div>
                  </div>

                  {/* Errors / Success Alerts */}
                  {photoError && (
                    <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{photoError}</span>
                    </div>
                  )}
                  {photoSaveSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Profile photography updated successfully.</span>
                    </div>
                  )}

                  {/* 1. Cover Photo Card */}
                  <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-xs block">Main Cover Photo</span>
                        <span className="text-[10px] text-stone-400">
                          Displays at the top of your drawer card and in search highlights.
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        currentCover
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-stone-800 text-stone-400 border border-white/10'
                      }`}>
                        {currentCover ? 'Host Cover Active' : 'Default Cover'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-stone-950 border border-white/10 shrink-0 relative group">
                        <img
                          src={currentCover?.url || resolveProducerCover(selectedProducer).url}
                          alt={`${selectedProducer.name} cover`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-stone-300 font-mono">
                          {currentCover ? 'Host upload' : 'Default'}
                        </div>
                      </div>

                      <div className="space-y-2.5 w-full">
                        <label className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                          rightsConfirmed
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md cursor-pointer'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-white/5'
                        }`}>
                          <UploadCloud className="w-4 h-4" />
                          <span>{currentCover ? 'Replace Cover Photo' : 'Upload Host Cover Photo'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={!rightsConfirmed}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                void handleAddPhoto(file, 'cover');
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {currentCover && (
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(currentCover.id)}
                            className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 font-medium transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revert to catalogue default</span>
                          </button>
                        )}

                        <p className="text-[10px] text-stone-500">
                          Allowed formats: JPEG, PNG, WebP · Max size: 8MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Gallery Photos Section & Tier Limits */}
                  <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-bold text-white text-xs block">Estate Gallery Photos</span>
                        <span className="text-[10px] text-stone-400">
                          Showcase cellars, harvest, vineyards, and tasting spaces.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-stone-400 bg-stone-950 px-2.5 py-0.5 rounded-full border border-white/5">
                          {currentGallery.length} / {getProducerMediaLimits(isProTier).maxGalleryImages} used
                        </span>
                      </div>
                    </div>

                    {/* Non-pro upgrade hint when basic limit reached */}
                    {!isProTier && currentGallery.length >= getProducerMediaLimits(false).maxGalleryImages && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
                            Basic Limit Reached (3 photos)
                          </span>
                          <span className="text-[11px] text-stone-300">
                            Upgrade to Host Pro to showcase up to 10 photos, seasonal releases, and priority discovery placement.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                      {currentGallery.map((img) => (
                        <div
                          key={img.id}
                          className="relative group rounded-xl overflow-hidden bg-stone-950 border border-white/10 aspect-4/3 flex flex-col justify-end"
                        >
                          <img
                            src={img.url}
                            alt="Estate gallery item"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition" />
                          <div className="relative p-2 flex items-center justify-between gap-1 z-10">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/80 text-stone-950 font-bold uppercase">
                              Published
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(img.id)}
                              className="w-6 h-6 rounded-lg bg-black/70 hover:bg-rose-600 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Gallery Photo Button */}
                      {currentGallery.length < getProducerMediaLimits(isProTier).maxGalleryImages && (
                        <label className={`rounded-xl border border-dashed aspect-4/3 flex flex-col items-center justify-center gap-1.5 p-3 text-center transition ${
                          rightsConfirmed
                            ? 'border-amber-500/40 hover:border-amber-400 bg-stone-950/40 hover:bg-amber-500/5 cursor-pointer text-stone-300 hover:text-white'
                            : 'border-white/10 bg-stone-950/20 text-stone-600 cursor-not-allowed'
                        }`}>
                          <Plus className="w-5 h-5 text-amber-400" />
                          <span className="text-[11px] font-bold">Add Photo</span>
                          <span className="text-[9px] text-stone-500">Up to 8MB</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={!rightsConfirmed}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                void handleAddPhoto(file, 'gallery');
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
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
                      <span>To modify tasting flight prices, add seasonal vertical flights, or change cheese pairings, contact our editorial curator team at <a href="mailto:terroirtrail@gmail.com" className="text-amber-400 underline">terroirtrail@gmail.com</a>.</span>
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
                      Global booking agencies (TripAdvisor, Viator, GetYourGuide) typically demand <strong className="text-rose-400">20% to 25% commissions</strong> on every tasting. TerroirTrail charges <strong>0% booking commission</strong> on direct reservation inquiries.
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
                        <li>Regional directory & GPS map listing</li>
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
                        <div className="text-right">
                          <span className="font-serif-title text-amber-300 font-bold text-sm">
                            €199
                            <span className="text-[10px] text-stone-400">/year</span>
                          </span>
                          <div className="text-[9px] text-stone-400">
                            Pilot subscription
                          </div>
                        </div>
                      </div>
                      <ul className="text-[11px] text-stone-300 space-y-1.5 list-disc list-inside">
                        <li><strong className="text-amber-300">Gold Glowing Badge</strong> on the interactive map</li>
                        <li><strong className="text-amber-300">Direct Bottle Shop</strong> button on mobile drawer</li>
                        <li>Priority placement — planned pilot feature</li>
                        <li>Traveler analytics — planned pilot feature</li>
                      </ul>

                      {/* Neutral Billing & Tax Notice */}
                      <div className="mt-3 p-3 rounded-xl bg-stone-950/90 border border-white/10 text-[11px] space-y-1 text-left">
                        <div className="flex items-center gap-1.5 font-semibold text-stone-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Billing & Tax Notice</span>
                        </div>
                        <p className="text-stone-400 text-[10px] leading-relaxed">
                          Tax and VAT treatment depends on your business location, tax status, billing details and applicable law. Final tax treatment is determined during invoicing/payment setup. Consult your accountant or tax adviser.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!user || !user.isProducer) {
                            if (onOpenAuth) onOpenAuth('producer');
                            return;
                          }
                          const stripeUrl = import.meta.env.VITE_STRIPE_PRODUCER_UPGRADE_URL;
                          if (stripeUrl && !isProTier) {
                            try {
                              const targetUrl = new URL(stripeUrl);
                              if (user?.email) targetUrl.searchParams.set('prefilled_email', user.email);
                              if (selectedProducer?.id) targetUrl.searchParams.set('client_reference_id', selectedProducer.id);
                              window.location.href = targetUrl.toString();
                              return;
                            } catch {
                              window.location.href = stripeUrl;
                              return;
                            }
                          }
                        }}
                        disabled={isProTier}
                        className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isProTier
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                            : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg cursor-pointer'
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>{isProTier ? '✓ Verified Host Pro Active' : 'Upgrade to Host Pro (€199/yr pilot)'}</span>
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
                      const registrationAddress = record.registeredAddress || (record.logistics ? [record.logistics.streetAddress, record.logistics.cityOrVillage, record.logistics.postalCode].filter(Boolean).join(', ') : '');
                      const registrationPhone = record.contactPhone || record.logistics?.dispatchPhone || '';
                      setTaxVatNumber(record.vatNumber || '');
                      setTaxLegalName(record.legalBusinessName || '');
                      setTaxOffice(record.taxOffice || '');
                      setTaxAddress(registrationAddress);
                      setTaxPhone(registrationPhone);
                      setTaxEori(record.eoriNumber || '');
                      if (onUpdateProducerTaxDetails && record.vatNumber && record.legalBusinessName && record.countryCode) {
                        onUpdateProducerTaxDetails({
                          vatNumber: record.vatNumber, legalBusinessName: record.legalBusinessName, taxOffice: record.taxOffice,
                          registeredAddress: registrationAddress || undefined, dispatchContactPhone: registrationPhone || undefined,
                          countryCode: record.countryCode, isVatVerified: record.isVatVerified, vatVerificationDate: record.vatVerificationDate,
                          eoriNumber: record.eoriNumber, gemiNumber: record.permits?.gemiNumber, iban: record.banking?.iban, registrationRecord: record,
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

      {/* In-Portal Camera Scanner Modal */}
      <HostQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onPassVerified={handlePassVerified}
      />

      {/* Fallback Internal Verification Modal */}
      <HostVerificationModal
        isOpen={!!verifiedGuest}
        onClose={() => setVerifiedGuest(null)}
        guestInfo={verifiedGuest}
      />
    </div>
  );
};
