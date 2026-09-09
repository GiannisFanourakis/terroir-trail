import React, { useEffect, useState } from 'react';
import { Producer } from '../../types/terroir';
import { UserProfile } from '../../types/auth';
import { getExperiencesForProducer } from '../../data/experiences';
import { 
  X, MapPin, Star, Phone, Globe, Navigation, Clock, 
  Dog, Footprints, Caravan, Car, Sparkles, Share2, Check, Heart, Award, 
  CheckCircle2, Wine, ShoppingBag, ArrowRight, Crown, Building2,
  Camera, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useProducerPhotos } from '../../services/googlePlacesPhotos';

interface ProducerDetailDrawerProps {
  producer: Producer | null;
  onClose: () => void;
  user?: UserProfile | null;
  onOpenProducerPortal?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isVisited?: boolean;
  onToggleVisited?: (id: string) => void;
  tastingNote?: string;
  onSaveTastingNote?: (id: string, note: string) => void;
  isAuthenticated?: boolean;
  onOpenAuth?: (role?: 'traveler' | 'producer') => void;
  onOpenBooking?: (producer: Producer, initialExperienceId?: string) => void;
  customNotice?: string;
  isProTier?: boolean;
  directBottleShopUrl?: string;
  onOpenWineBoxes?: () => void;
  hasExplorerPass?: boolean;
  onOpenExplorerPass?: () => void;
}

export const ProducerDetailDrawer: React.FC<ProducerDetailDrawerProps> = ({
  producer,
  onClose,
  user,
  onOpenProducerPortal,
  isFavorite = false,
  onToggleFavorite,
  isVisited = false,
  onToggleVisited,
  tastingNote = '',
  onSaveTastingNote,
  isAuthenticated = false,
  onOpenAuth,
  onOpenBooking,
  customNotice,
  isProTier = false,
  directBottleShopUrl,
  onOpenWineBoxes,
  hasExplorerPass = false,
  onOpenExplorerPass,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'story' | 'tastings' | 'visit'>('story');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [noteDraft, setNoteDraft] = useState<string>('');

  const {
    photos,
    activePhoto,
    activeCredit,
    activePhotoIndex,
    setActivePhotoIndex,
  } = useProducerPhotos(producer);

  useEffect(() => {
    if (producer) {
      setActiveTab('story');
      setIsEditingNote(false);
      setNoteDraft(tastingNote);
    }
  }, [producer, tastingNote]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!producer) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getCategoryDetails = (cat: Producer['category']) => {
    switch (cat) {
      case 'winery':
        return { label: 'Boutique Winery', icon: '🍇', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'brewery':
        return { label: 'Craft Microbrewery', icon: '🍺', color: 'text-amber-300 bg-amber-400/15 border-amber-400/30' };
      case 'kazani':
        return { label: 'Traditional Rakokazano', icon: '🏺', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'olive_mill':
        return { label: 'Artisanal Olive Mill', icon: '🫒', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'cheese_dairy':
        return { label: 'Mountain Shepherd Mitato', icon: '🧀', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
      case 'apiary':
        return { label: 'Wild Apiary & Herbalist', icon: '🍯', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }
  };

  const getRoadAccessDetails = (access: Producer['roadAccess']) => {
    switch (access) {
      case 'paved':
        return {
          title: 'Smooth Asphalt (Standard Car)',
          desc: '100% paved road directly to the courtyard. Ideal for all standard economy rental cars.',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'gravel_ok':
        return {
          title: 'Compact Gravel Section',
          desc: 'Manageable unpaved country track for the last 500m. Drive slowly; standard cars can pass.',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case '4x4_required':
        return {
          title: 'High Mountain Dirt Track (4x4 Recommended)',
          desc: 'Steep rocky mountain dirt road. Requires high clearance vehicle or 4x4.',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
    }
  };

  const getVipPerks = (p: Producer) => {
    if (p.vipPerks) return p.vipPerks;
    switch (p.category) {
      case 'winery':
        return {
          welcomePour: 'Complimentary cellar pour of aged library vintage',
          freeMeze: 'Artisanal Cretan Graviera & wild olive pairing',
          discountPercent: 10,
        };
      case 'brewery':
        return {
          welcomePour: 'Free seasonal draft flight taster',
          freeMeze: 'Warm pretzel snack & house apaki bite',
          discountPercent: 10,
        };
      case 'olive_mill':
        return {
          welcomePour: 'Private reserve cold-pressed olive oil flight',
          freeMeze: 'Wood-fired warm sourdough with sea salt',
          discountPercent: 10,
        };
      case 'kazani':
        return {
          welcomePour: 'Warm first-run Tsikoudia straight from copper still',
          freeMeze: 'Roasted village chestnuts & grilled sourdough',
          discountPercent: 10,
        };
      case 'cheese_dairy':
        return {
          welcomePour: 'Fresh warm anthotyro tasting directly from vat',
          freeMeze: 'Thyme honey drizzled mountain mizithra',
          discountPercent: 10,
        };
      default:
        return {
          welcomePour: 'Complimentary reserve tasting pour',
          freeMeze: 'Artisanal local meze platter',
          discountPercent: 10,
        };
    }
  };

  const cat = getCategoryDetails(producer.category);
  const road = getRoadAccessDetails(producer.roadAccess);
  const vipPerks = getVipPerks(producer);

  return (
    <>
      {/* Backdrop overlay for small screens / tablets */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] max-w-full bg-stone-950 text-stone-100 shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300 select-none">
        
        {/* 1. Hero Gallery & Header */}
        <div className="relative h-48 sm:h-60 lg:h-64 w-full shrink-0 bg-stone-900 overflow-hidden group">
          <img
            src={activePhoto?.url || producer.coverImage}
            alt={producer.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30" />

          {/* Carousel Arrows (if multiple photos) */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((activePhotoIndex - 1 + photos.length) % photos.length);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20 shadow-lg"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((activePhotoIndex + 1) % photos.length);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20 shadow-lg"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Photo indicator dots / counter */}
              <div className="absolute bottom-20 right-4 z-10 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] font-mono text-stone-300 border border-white/10 flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-amber-400" />
                <span>{activePhotoIndex + 1} / {photos.length}</span>
              </div>
            </>
          )}

          {/* Top Control Icons */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(producer.id)}
                className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition ${
                  isFavorite
                    ? 'bg-rose-500/80 border-rose-400/50 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-black/60 hover:bg-black/80 text-stone-200 border-white/10 hover:text-white'
                }`}
                title={isFavorite ? 'Remove from Saved' : 'Save to My Trip'}
                aria-label={isFavorite ? 'Remove from Saved' : 'Save to My Trip'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-white' : ''}`} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition"
              title="Copy Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category & Pro Badge & Google Maps attribution */}
          <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-1.5 max-w-[calc(100%-130px)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${cat.color}`}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              {isProTier && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 border border-amber-300">
                  <span>👑</span>
                  <span>Pro Estate</span>
                </span>
              )}
            </div>

            {/* Verified Photographer & Estate Media Attribution */}
            {(activeCredit || activePhoto?.attributions?.[0]) && (
              <div className="flex items-center">
                {activeCredit?.url ? (
                  <a
                    href={activeCredit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-[10px] text-stone-300 hover:text-white border border-white/15 transition shadow-sm truncate max-w-[240px] sm:max-w-[300px]"
                    title="View photo source & license"
                  >
                    <Camera className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Photo: {activeCredit.author}</span>
                    <span className="text-[9px] text-amber-400/90 font-medium shrink-0">· {activeCredit.license || activeCredit.source}</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] text-stone-300 border border-white/15 shadow-sm truncate max-w-[240px] sm:max-w-[300px]">
                    <Camera className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Photo: {activeCredit?.author || activePhoto?.attributions?.[0]?.displayName}</span>
                    <span className="text-[9px] text-amber-400/90 font-medium shrink-0">· {activeCredit?.license || activeCredit?.source || 'Verified Media'}</span>
                  </span>
                )}
              </div>
            )}
          </div>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {producer.countryCode === 'IT' ? '🇮🇹 ' : ''}
              {producer.village} · {producer.region.toUpperCase()}
              {producer.country ? ` · ${producer.country.toUpperCase()}` : ''}
            </span>
          </div>

          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white leading-tight">
            {producer.name}
          </h2>
          {producer.greekName && producer.greekName !== producer.name && (
            <p className="text-stone-300 text-xs font-medium opacity-80 mt-0.5">
              {producer.greekName}
            </p>
          )}
        </div>
      </div>

      {/* 1b. Verified Estate Host Banner (Visible if user owns this estate) */}
      {user?.isProducer && user.claimedProducerId === producer.id && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">🏛️</span>
            <div className="min-w-0">
              <div className="font-bold text-white text-xs truncate">You are the verified host of this estate</div>
              <div className="text-[10px] text-amber-300/90 truncate">Manage hours, notices, tasting bookings & bottle shop</div>
            </div>
          </div>
          {onOpenProducerPortal && (
            <button
              onClick={onOpenProducerPortal}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs transition shrink-0 cursor-pointer shadow-md"
            >
              Host Dashboard
            </button>
          )}
        </div>
      )}

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-stone-900/60 px-3 sm:px-4 shrink-0 text-xs font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('story')}
          className={`px-3 sm:px-4 py-3 border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'story'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          The Story
        </button>
        <button
          onClick={() => setActiveTab('tastings')}
          className={`px-3 sm:px-4 py-3 border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'tastings'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          Tastings & Crafts
        </button>
        <button
          onClick={() => setActiveTab('visit')}
          className={`px-3 sm:px-4 py-3 border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'visit'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          Visiting & Access
        </button>
      </div>

      {/* 3. Tab Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-stone-200">
        
        {/* Live Producer Announcement Bulletin */}
        {customNotice && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 shadow-md animate-in fade-in">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider mb-0.5">
                Live Estate Bulletin
              </span>
              <p className="text-xs leading-relaxed text-stone-200">
                {customNotice}
              </p>
            </div>
          </div>
        )}

        {/* Rating & Quick Metrics Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-xl border border-amber-400/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{producer.rating}</span>
            </div>
            <span className="text-stone-400">({producer.reviewCount} verified visits)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400">Price Tier:</span>
            <span className="font-mono font-bold text-amber-400 bg-stone-800 px-2 py-0.5 rounded border border-white/10">
              {producer.priceLevel}
            </span>
          </div>
        </div>

        {/* Passport Stamp & Tasting Notes Action */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-stone-900 border border-amber-500/20 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <div>
                <div className="text-xs font-bold text-white">Terroir Passport Check-In</div>
                <div className="text-[10px] text-stone-400">
                  {isVisited ? 'Stamped in your collection' : 'Mark this artisan as visited'}
                </div>
              </div>
            </div>

            {onToggleVisited && (
              <button
                onClick={() => {
                  if (!isAuthenticated && onOpenAuth) {
                    onOpenAuth();
                  } else {
                    onToggleVisited(producer.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                  isVisited
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white border border-white/10'
                }`}
              >
                {isVisited ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Stamped ✓</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>Stamp Passport</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tasting Note Box */}
          {isAuthenticated ? (
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-stone-300">
                <span>My Private Tasting Notes</span>
                {isEditingNote ? (
                  <button
                    onClick={() => {
                      onSaveTastingNote?.(producer.id, noteDraft);
                      setIsEditingNote(false);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingNote(true)}
                    className="text-stone-400 hover:text-white"
                  >
                    {tastingNote ? 'Edit' : '+ Add note'}
                  </button>
                )}
              </div>
              {isEditingNote ? (
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Record your thoughts on their wines, food pairings, or best vintage..."
                  rows={2}
                  className="w-full p-2 bg-stone-900 border border-white/10 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              ) : tastingNote ? (
                <div className="text-[11px] text-amber-200/90 italic p-2 rounded-xl bg-stone-900/80 border border-white/5">
                  &ldquo;{tastingNote}&rdquo;
                </div>
              ) : null}
            </div>
          ) : (
            <div className="pt-1 text-[10px] text-stone-500 flex items-center justify-between">
              <span>Sign in to record personal tasting notes</span>
              <button
                type="button"
                onClick={() => onOpenAuth?.('traveler')}
                className="text-amber-400 hover:underline font-bold cursor-pointer"
              >
                Sign In →
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: The Story */}
        {activeTab === 'story' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-l-2 border-amber-500 pl-3.5 py-1">
              <p className="text-sm font-serif-title italic text-stone-200 leading-relaxed">
                "{producer.tagLine}"
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Heritage & Philosophy
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed font-normal">
                {producer.story}
              </p>
            </div>

            {/* Gallery Thumbnails */}
            {photos.length > 1 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Estate Visual Portfolio</span>
                    <span className="text-[10px] text-stone-400 normal-case font-normal">({photos.length} photos)</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-400/90 flex items-center gap-1">
                    <span>✓</span>
                    <span>Verified Archival Media</span>
                  </span>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {photos.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhotoIndex(i)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activePhotoIndex === i
                          ? 'border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/30'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={item.thumbUrl || item.url}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>

                {/* Verified Estate Media & Photographer Credit */}
                {activeCredit && (
                  <div className="p-2.5 rounded-xl bg-stone-900/90 border border-white/5 text-[10px] text-stone-400 flex items-center justify-between">
                    <span className="truncate pr-2">
                      Photo credit:{' '}
                      {activeCredit.url ? (
                        <a
                          href={activeCredit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline font-medium"
                        >
                          {activeCredit.author}
                        </a>
                      ) : (
                        <span className="text-stone-300 font-medium">
                          {activeCredit.author}
                        </span>
                      )}
                      {' '}· {activeCredit.source} {activeCredit.license ? `(${activeCredit.license})` : ''}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/90 shrink-0">
                      Clear Rights
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Tastings & Grapes/Crafts */}
        {activeTab === 'tastings' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5">
                Specialties & Varieties
              </h3>
              <div className="flex flex-wrap gap-2">
                {producer.indigenousVarieties.map((v, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-xs"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Signature Tastings & Pours
              </h3>
              <div className="space-y-2">
                {producer.tastingHighlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-900 border border-white/5 text-xs text-stone-200">
                    <span className="text-amber-400 font-bold text-sm">✦</span>
                    <span className="leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curated Bookable Experiences */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Wine className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Curated Experiences & Tastings
                </h3>
                <span className="text-[10px] text-amber-400/80 font-medium">Instant Reserve</span>
              </div>

              <div className="space-y-2.5">
                {getExperiencesForProducer(producer).map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-2xl bg-stone-900/90 border border-white/10 hover:border-amber-500/40 transition flex flex-col gap-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {exp.badge && (
                          <span className="inline-block px-2 py-0.5 mb-1 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {exp.badge}
                          </span>
                        )}
                        <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                          {exp.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{exp.durationMinutes} mins</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono font-bold text-amber-300">€{exp.pricePerPerson} / person</span>
                        </div>
                      </div>

                      {onOpenBooking && (
                        <button
                          type="button"
                          onClick={() => onOpenBooking(producer, exp.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
                        >
                          Book Now
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Includes checklist */}
                    <div className="pt-1.5 border-t border-white/5 space-y-1">
                      {exp.includes.map((inc, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-stone-400">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Terroir Explorer Pass Perks Card (Freemium Privilege) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              hasExplorerPass
                ? 'bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-950/30 border-amber-400/50 shadow-lg'
                : 'bg-stone-900/90 border-amber-500/30'
            }`}>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-amber-200 flex items-center gap-1.5">
                      VIP Pass Privileges
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                        {hasExplorerPass ? 'ACTIVE' : 'MEMBER EXCLUSIVE'}
                      </span>
                    </h4>
                    <span className="text-[10px] text-stone-400">
                      {hasExplorerPass
                        ? 'Show digital card at counter to claim'
                        : 'Included with Terroir Holiday Pass (€14.99)'}
                    </span>
                  </div>
                </div>

                {hasExplorerPass ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 shrink-0">
                    CLAIMABLE
                  </span>
                ) : onOpenExplorerPass && (
                  <button
                    type="button"
                    onClick={onOpenExplorerPass}
                    className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] shadow-sm transition shrink-0 cursor-pointer"
                  >
                    Unlock VIP
                  </button>
                )}
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center gap-2 text-stone-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Welcome Pour:</strong> {vipPerks.welcomePour}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Free Meze:</strong> {vipPerks.freeMeze}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Cellar Discount:</strong> {vipPerks.discountPercent}% off all bottle purchases</span>
                </div>
              </div>
            </div>

            {/* Direct Bottle Shop Link (Pro Tier) */}
            {directBottleShopUrl && (
              <a
                href={directBottleShopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/30 hover:border-amber-400/60 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                      Direct Estate Bottle Store
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-normal">0% Commission</span>
                    </div>
                    <div className="text-[11px] text-stone-400">Order directly from {producer.name}'s cellar</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition" />
              </a>
            )}

            {/* Taste of the Trail - International Delivery */}
            {onOpenWineBoxes && (
              <div
                onClick={onOpenWineBoxes}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 via-rose-950/20 to-stone-900 border border-rose-500/20 hover:border-rose-500/40 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300 shrink-0 text-base">
                      ✈️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        International Cellar Delivery
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-medium">EU / UK / US</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Temperature-controlled insulated boxes shipped straight to your doorstep.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                </div>
              </div>
            )}

            {/* Producer / Winemaker Login Prompt */}
            {(!user?.isProducer || user.claimedProducerId !== producer.id) && (
              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('producer')}
                  className="text-[11px] text-stone-400 hover:text-amber-300 transition cursor-pointer inline-flex items-center gap-1.5 hover:underline"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Are you the winemaker or owner of {producer.name}? Log in to manage this estate</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Visiting & Road */}
        {activeTab === 'visit' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Road Warning Card */}
            <div className={`p-4 rounded-2xl border ${road.color}`}>
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                <Car className="w-4 h-4 shrink-0" />
                <span>{road.title}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {road.desc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Hours:</strong> {producer.openingHours}</span>
              </div>

              {producer.bestSeason && (
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Best Season:</strong> {producer.bestSeason}</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                producer.dogFriendly ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-stone-900 text-stone-500 border-white/5'
              }`}>
                <Dog className="w-3.5 h-3.5" />
                {producer.dogFriendly ? 'Dog Friendly' : 'No Pets'}
              </span>

              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                producer.walkInFriendly ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                <Footprints className="w-3.5 h-3.5" />
                {producer.walkInFriendly ? 'Walk-in Welcome' : 'By Appointment'}
              </span>

              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                producer.campervanFriendly ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-stone-900 text-stone-500 border-white/5'
              }`}>
                <Caravan className="w-3.5 h-3.5" />
                {producer.campervanFriendly ? 'Campervan Friendly' : 'No Campervans'}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* 4. Action Bar (Sticky Footer) */}
      <div className="p-3 sm:p-4 bg-stone-900/95 backdrop-blur-xl border-t border-white/10 shrink-0 flex items-center gap-1.5 sm:gap-2.5">
        {onOpenBooking && (
          <button
            type="button"
            onClick={() => onOpenBooking(producer)}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-98 cursor-pointer whitespace-nowrap"
          >
            <Wine className="w-4 h-4 shrink-0" />
            <span className="truncate">Book Tasting</span>
          </button>
        )}

        <a
          href={producer.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs rounded-2xl border border-white/10 transition transform active:scale-98 whitespace-nowrap"
        >
          <Navigation className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">Directions</span>
        </a>

        {directBottleShopUrl && (
          <a
            href={directBottleShopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 transition shrink-0"
            title="Buy Bottles Directly from Estate"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
          </a>
        )}

        {producer.phone && (
          <a
            href={`tel:${producer.phone}`}
            className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 border border-white/10 text-stone-200 transition shrink-0"
            title={`Call ${producer.phone}`}
          >
            <Phone className="w-4 h-4 shrink-0" />
          </a>
        )}

        {producer.website && (
          <a
            href={producer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 border border-white/10 text-stone-200 transition shrink-0"
            title="Visit Website"
          >
            <Globe className="w-4 h-4 shrink-0" />
          </a>
        )}
      </div>

    </div>
    </>
  );
};
