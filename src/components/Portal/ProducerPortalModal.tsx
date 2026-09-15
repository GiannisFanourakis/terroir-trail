import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  Eye,
  ImagePlus,
  LogIn,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Producer } from '../../types/terroir';
import { TastingBooking, ProducerOverride } from '../../types/booking';
import { UserProfile, ProducerTaxDetails } from '../../types/auth';
import { ProducerUploadedImage, validateImageUpload } from '../../types/producerMedia';
import { runtimeConfig } from '../../config/runtimeConfig';
import {
  fetchOwnProducerClaimStatus,
  type OwnProducerClaimStatus,
} from '../../services/producerClaimStatus';

interface ProducerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth?: (role?: 'producer') => void;
  onLoginWithGoogle?: (
    role?: 'traveler' | 'producer',
    claimedProducerId?: string,
    producerName?: string
  ) => Promise<any>;
  onLoginWithApple?: (
    role?: 'traveler' | 'producer',
    claimedProducerId?: string,
    producerName?: string
  ) => Promise<any>;
  producers: Producer[];
  bookings: TastingBooking[];
  onUpdateBookingStatus: (
    bookingId: string,
    status: TastingBooking['status']
  ) => Promise<void>;
  onSaveProducerOverride: (override: ProducerOverride) => Promise<void>;
  getProducerOverride: (producerId: string) => ProducerOverride | undefined;
  onUpdateProducerTaxDetails?: (
    taxDetails: ProducerTaxDetails
  ) => Promise<void> | void;
  onSelectProducerForDrawer?: (producer: Producer) => void;
  onPassVerified?: (info: any) => void;
}

type PortalTab = 'overview' | 'notice' | 'photos' | 'account';

const claimBusinessLabel = (claim: OwnProducerClaimStatus) => {
  switch (claim.businessVerificationStatus) {
    case 'verified':
      return 'Business check passed';
    case 'needs_review':
      return 'Business check needs review';
    case 'failed':
      return 'Business check did not validate';
    case 'manual_required':
      return 'Manual business review required';
    case 'unavailable':
      return 'Business check temporarily unavailable';
    default:
      return 'Business check not started';
  }
};

const claimContactLabel = (claim: OwnProducerClaimStatus) => {
  switch (claim.contactVerificationStatus) {
    case 'verified':
      return 'Official email verified';
    case 'pending':
      return 'Verification email sent';
    case 'unavailable':
      return 'Official email verification unavailable';
    default:
      return 'Official email verification not started';
  }
};

const ProgressRow: React.FC<{
  done?: boolean;
  warning?: boolean;
  label: string;
  detail?: string;
}> = ({ done, warning, label, detail }) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-stone-950/70 px-3 py-2.5">
    <div
      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
        done
          ? 'bg-emerald-500/15 text-emerald-300'
          : warning
            ? 'bg-amber-500/15 text-amber-300'
            : 'bg-stone-800 text-stone-500'
      }`}
    >
      {done ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : warning ? (
        <AlertTriangle className="w-3.5 h-3.5" />
      ) : (
        <Clock3 className="w-3.5 h-3.5" />
      )}
    </div>
    <div className="min-w-0">
      <div className="text-xs font-semibold text-stone-200">{label}</div>
      {detail && <div className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">{detail}</div>}
    </div>
  </div>
);

export const ProducerPortalModal: React.FC<ProducerPortalModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  producers,
  onSaveProducerOverride,
  getProducerOverride,
  onSelectProducerForDrawer,
}) => {
  const isProducerAuthenticated = Boolean(
    user?.isProducer && user.claimedProducerId
  );
  const selectedProducer = useMemo(
    () =>
      isProducerAuthenticated
        ? producers.find(producer => producer.id === user?.claimedProducerId)
        : undefined,
    [isProducerAuthenticated, producers, user?.claimedProducerId]
  );

  const [activeTab, setActiveTab] = useState<PortalTab>('overview');
  const [claim, setClaim] = useState<OwnProducerClaimStatus | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [customNotice, setCustomNotice] = useState('');
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [noticeSaved, setNoticeSaved] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaSaved, setMediaSaved] = useState(false);

  const currentOverride = selectedProducer
    ? getProducerOverride(selectedProducer.id)
    : undefined;
  const currentImages: ProducerUploadedImage[] = currentOverride?.uploadedImages || [];
  const currentGallery = currentImages.filter(image => image.type === 'gallery');

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('overview');
    setNoticeSaved(false);
    setMediaSaved(false);
    setMediaError(null);
    setRightsConfirmed(false);
  }, [isOpen]);

  useEffect(() => {
    setCustomNotice(currentOverride?.customNotice || '');
  }, [currentOverride?.customNotice, selectedProducer?.id]);

  const loadClaim = async () => {
    if (!user || isProducerAuthenticated) {
      setClaim(null);
      return;
    }
    setClaimLoading(true);
    setClaimError(null);
    try {
      setClaim(await fetchOwnProducerClaimStatus());
    } catch (error) {
      setClaim(null);
      setClaimError(
        error instanceof Error
          ? error.message
          : 'Unable to load your producer verification status.'
      );
    } finally {
      setClaimLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) void loadClaim();
  }, [isOpen, user?.id, isProducerAuthenticated]);

  if (!isOpen) return null;

  const buildOverride = (
    patch: Partial<ProducerOverride>
  ): ProducerOverride | null => {
    if (!selectedProducer) return null;
    return {
      ...(currentOverride || {}),
      producerId: selectedProducer.id,
      isAcceptingBookings: currentOverride?.isAcceptingBookings ?? false,
      updatedAt: new Date().toISOString(),
      ...patch,
    };
  };

  const handleSaveNotice = async (event: React.FormEvent) => {
    event.preventDefault();
    const override = buildOverride({ customNotice: customNotice.trim() });
    if (!override) return;
    setNoticeSaving(true);
    setNoticeSaved(false);
    try {
      await onSaveProducerOverride(override);
      setNoticeSaved(true);
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleAddPhoto = async (file: File, type: 'cover' | 'gallery') => {
    if (!selectedProducer || !runtimeConfig.hostMediaPrototype.enabled) return;
    setMediaError(null);
    setMediaSaved(false);

    const validation = validateImageUpload(
      { type: file.type, size: file.size },
      currentGallery.length,
      type === 'cover',
      rightsConfirmed,
      false
    );
    if (!validation.isValid) {
      setMediaError(validation.error?.message || 'Invalid image file.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    const newImage: ProducerUploadedImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      producerId: selectedProducer.id,
      url: localUrl,
      thumbnailUrl: localUrl,
      type,
      status: 'pending_review',
      uploadedAt: new Date().toISOString(),
      rightsConfirmed: true,
      source: 'host_upload',
    };

    const uploadedImages =
      type === 'cover'
        ? [newImage, ...currentImages.filter(image => image.type !== 'cover')]
        : [...currentImages, newImage];
    const override = buildOverride({ uploadedImages });
    if (!override) return;
    await onSaveProducerOverride(override);
    setMediaSaved(true);
  };

  const handleDeletePhoto = async (imageId: string) => {
    const override = buildOverride({
      uploadedImages: currentImages.filter(image => image.id !== imageId),
    });
    if (!override) return;
    await onSaveProducerOverride(override);
    setMediaSaved(true);
  };

  const shell = (content: React.ReactNode) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[94dvh] overflow-hidden rounded-3xl border border-white/15 bg-stone-950 text-stone-100 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/10 bg-stone-900/80">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="TerroirTrail" className="w-9 h-9 object-contain shrink-0" />
            <div className="min-w-0">
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-white truncate">
                {selectedProducer?.name || claim?.tradeBrandName || 'TerroirTrail Host Portal'}
              </h2>
              <div className="text-[11px] text-stone-400 truncate">
                {isProducerAuthenticated && user
                  ? `${user.name} · ${user.email}`
                  : 'Producer verification and listing management'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/10 bg-stone-950 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
            aria-label="Close host portal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {content}
      </div>
    </div>
  );

  if (!user) {
    return shell(
      <div className="p-8 sm:p-12 text-center my-auto">
        <Building2 className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white font-serif-title">Producer & Host Portal</h3>
        <p className="mt-2 text-sm text-stone-400 max-w-lg mx-auto">
          Sign in with your producer account or claim an existing TerroirTrail producer listing. Host access is granted only after verification and Admin approval.
        </p>
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAuth?.('producer');
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Sign in or claim a listing
        </button>
      </div>
    );
  }

  if (!isProducerAuthenticated) {
    return shell(
      <div className="flex-1 overflow-y-auto p-5 sm:p-8">
        {claimLoading ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-3" />
            Loading producer verification…
          </div>
        ) : claim ? (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-300 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">Producer verification in progress</h3>
                    {claim.verificationReadyForAdminReview && (
                      <span className="px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[9px] uppercase font-bold">
                        Ready for review
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    Your claim for <strong>{claim.tradeBrandName}</strong> is recorded. Automated checks support the review, but TerroirTrail Admin approval is still required before Host Portal controls unlock.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <ProgressRow done label="Account created" detail={user.email} />
              <ProgressRow
                done={claim.businessVerificationStatus === 'verified'}
                warning={Boolean(claim.businessVerificationStatus && claim.businessVerificationStatus !== 'verified')}
                label={claimBusinessLabel(claim)}
                detail={
                  claim.businessVerificationProvider === 'vies'
                    ? `VIES${claim.businessVerificationRegistryName ? ` · ${claim.businessVerificationRegistryName}` : ''}`
                    : claim.businessVerificationReason || 'TerroirTrail will review available national/public business evidence.'
                }
              />
              <ProgressRow
                done={claim.contactVerificationStatus === 'verified'}
                warning={claim.contactVerificationStatus === 'unavailable'}
                label={claimContactLabel(claim)}
                detail={
                  claim.contactVerificationStatus === 'pending'
                    ? `Open the verification message sent to ${claim.officialEmail || user.email}. Check Spam/Junk if it is not in your inbox.`
                    : claim.officialEmail || user.email
                }
              />
              <ProgressRow
                done={false}
                label="TerroirTrail Admin approval"
                detail="Approval creates the trusted producer ownership record that unlocks this portal."
              />
            </div>

            {claim.businessVerificationReason && claim.businessVerificationStatus !== 'verified' && (
              <div className="rounded-xl border border-white/10 bg-stone-900/70 px-4 py-3 text-[11px] text-stone-400 leading-relaxed">
                <span className="font-semibold text-stone-200">Business verification note: </span>
                {claim.businessVerificationReason}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void loadClaim()}
                disabled={claimLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh verification status
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto py-10 text-center">
            <Building2 className="w-11 h-11 text-stone-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No producer claim found</h3>
            <p className="mt-2 text-sm text-stone-400">
              This account does not currently have trusted producer ownership or a pending producer claim.
            </p>
            {claimError && <p className="mt-2 text-xs text-rose-300">{claimError}</p>}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth?.('producer');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 cursor-pointer"
            >
              Claim a producer listing
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!selectedProducer) {
    return shell(
      <div className="p-8 text-center my-auto">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Assigned producer is not in the current catalogue</h3>
        <p className="text-sm text-stone-400 mt-2">
          Your trusted ownership is active, but the assigned producer record could not be loaded. No other producer has been substituted.
        </p>
      </div>
    );
  }

  const tabClass = (tab: PortalTab) =>
    `px-3 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
      activeTab === tab
        ? 'border-amber-400 text-amber-300'
        : 'border-transparent text-stone-400 hover:text-white'
    }`;

  return shell(
    <>
      <div className="px-5 sm:px-6 py-3 border-b border-white/10 bg-stone-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white truncate">{selectedProducer.name}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[9px] uppercase font-bold tracking-wide">
                <ShieldCheck className="w-3 h-3" />
                Verified Host
              </span>
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              {selectedProducer.village}, {selectedProducer.region} · Producer ID: {selectedProducer.id}
            </div>
          </div>
        </div>

        {onSelectProducerForDrawer && (
          <button
            type="button"
            onClick={() => {
              onSelectProducerForDrawer(selectedProducer);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            View public page
          </button>
        )}
      </div>

      <div className="flex border-b border-white/10 px-5 sm:px-6 overflow-x-auto shrink-0">
        <button type="button" onClick={() => setActiveTab('overview')} className={tabClass('overview')}>Overview</button>
        <button type="button" onClick={() => setActiveTab('notice')} className={tabClass('notice')}>Visitor Notice</button>
        {runtimeConfig.hostMediaPrototype.enabled && (
          <button type="button" onClick={() => setActiveTab('photos')} className={tabClass('photos')}>
            Profile Photos {currentImages.length > 0 ? `(${currentImages.length})` : ''}
          </button>
        )}
        <button type="button" onClick={() => setActiveTab('account')} className={tabClass('account')}>Verification & Account</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Your listing
                </div>
                <p className="mt-2 text-xs text-stone-400 leading-relaxed">
                  You can manage producer-supplied visitor information for <strong className="text-stone-200">{selectedProducer.name}</strong>. Your account cannot switch to or edit another producer listing.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Protected TerroirTrail evidence
                </div>
                <p className="mt-2 text-xs text-stone-400 leading-relaxed">
                  Verified location, road access, visitor-access classification, audited Google Place identity, PDO evidence and TerroirTrail verification remain protected and cannot be self-declared by a host.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4">
              <h3 className="text-sm font-bold text-white">Current public identity</h3>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-stone-950/70 px-3 py-2"><span className="text-stone-500">Category</span><div className="text-stone-200 mt-1 capitalize">{selectedProducer.category.replaceAll('_', ' ')}</div></div>
                <div className="rounded-xl bg-stone-950/70 px-3 py-2"><span className="text-stone-500">Location</span><div className="text-stone-200 mt-1">{selectedProducer.village}, {selectedProducer.region}</div></div>
                <div className="rounded-xl bg-stone-950/70 px-3 py-2"><span className="text-stone-500">Visitor notice</span><div className="text-stone-200 mt-1">{currentOverride?.customNotice || 'No host notice published'}</div></div>
                <div className="rounded-xl bg-stone-950/70 px-3 py-2"><span className="text-stone-500">Host media</span><div className="text-stone-200 mt-1">{currentImages.length} submitted image{currentImages.length === 1 ? '' : 's'}</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notice' && (
          <form onSubmit={handleSaveNotice} className="max-w-2xl space-y-4">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Bell className="w-4 h-4" />
                Visitor Notice
              </div>
              <p className="mt-1 text-[11px] text-stone-300 leading-relaxed">
                Publish temporary, producer-supplied information such as seasonal opening notes, harvest activity, appointment requirements or an unexpected closure.
              </p>
            </div>

            {noticeSaved && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Visitor notice saved.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">Current announcement</label>
              <textarea
                value={customNotice}
                onChange={event => setCustomNotice(event.target.value)}
                rows={5}
                maxLength={800}
                placeholder="Example: Harvest work is underway this week. Visits remain available by appointment between 11:00 and 16:00."
                className="w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-3 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
              />
              <div className="mt-1 text-[10px] text-stone-600 text-right">{customNotice.length}/800</div>
            </div>

            <button
              type="submit"
              disabled={noticeSaving}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
            >
              {noticeSaving ? 'Saving…' : 'Save visitor notice'}
            </button>
          </form>
        )}

        {activeTab === 'photos' && runtimeConfig.hostMediaPrototype.enabled && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                <Camera className="w-4 h-4" />
                Profile Photos · prototype
              </div>
              <p className="mt-1 text-[11px] text-stone-300 leading-relaxed">
                Only upload images you own or are expressly licensed to use. New submissions are marked pending review rather than being treated as verified TerroirTrail media automatically.
              </p>
            </div>

            {mediaError && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{mediaError}</div>}
            {mediaSaved && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">Photo submission updated.</div>}

            <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-stone-900/60 p-3 text-xs text-stone-300 cursor-pointer">
              <input type="checkbox" checked={rightsConfirmed} onChange={event => setRightsConfirmed(event.target.checked)} className="mt-0.5" />
              <span>I confirm that this producer owns these images or has express permission to publish them on TerroirTrail.</span>
            </label>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white cursor-pointer">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                Submit cover image
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void handleAddPhoto(file, 'cover'); event.currentTarget.value = ''; }} />
              </label>
              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white cursor-pointer">
                <ImagePlus className="w-4 h-4 text-sky-400" />
                Submit gallery image
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void handleAddPhoto(file, 'gallery'); event.currentTarget.value = ''; }} />
              </label>
            </div>

            {currentImages.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-stone-900/50 px-4 py-8 text-center text-xs text-stone-500">No host-submitted photos yet.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentImages.map(image => (
                  <div key={image.id} className="rounded-xl overflow-hidden border border-white/10 bg-stone-900">
                    <img src={image.thumbnailUrl || image.url} alt={`${selectedProducer.name} ${image.type}`} className="w-full aspect-[4/3] object-cover" />
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-stone-200 capitalize">{image.type}</div>
                        <div className="text-[10px] text-stone-500 capitalize">{image.status.replaceAll('_', ' ')}</div>
                      </div>
                      <button type="button" onClick={() => void handleDeletePhoto(image.id)} className="w-8 h-8 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 flex items-center justify-center cursor-pointer" aria-label="Remove photo">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="max-w-2xl space-y-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                Trusted producer ownership active
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                Host permissions come from TerroirTrail's trusted producer ownership record, not from browser profile fields or a self-selected role.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-stone-900/60 divide-y divide-white/5">
              <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs"><span className="text-stone-500">Producer</span><span className="text-stone-200 font-semibold text-right">{selectedProducer.name}</span></div>
              <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs"><span className="text-stone-500">Host account</span><span className="text-stone-200 text-right">{user.email}</span></div>
              <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs"><span className="text-stone-500">Ownership</span><span className="text-emerald-300 font-semibold">Verified Host</span></div>
              <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs"><span className="text-stone-500">Official contact control</span><span className="text-stone-300 inline-flex items-center gap-1"><MailCheck className="w-3.5 h-3.5" /> Reviewed during claim</span></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
