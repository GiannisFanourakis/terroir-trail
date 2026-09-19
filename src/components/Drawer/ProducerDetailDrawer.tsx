import React, { useEffect, useState } from 'react';
import { Producer, VisitStatus } from '../../types/terroir';
import { UserProfile } from '../../types/auth';
import { ProducerOverride } from '../../types/booking';
import {
  X, MapPin, Star, Phone, Mail, Globe, Navigation, Clock,
  Dog, Footprints, Caravan, Car, Sparkles, Share2, Check, Heart, Award,
  CheckCircle2, Wine, ShoppingBag, ArrowRight, Building2,
  Camera, ChevronLeft, ChevronRight, Beer
} from 'lucide-react';
import { useProducerPhotos } from '../../services/googlePlacesPhotos';
import { getCategoryFallbackImage } from '../../utils/imageFallbacks';
import { getEffectiveProducerCategory } from '../../utils/producerCategory';
import { getProducerRoadAccessWarning } from '../../utils/producerAccess';
import { resolveProducerCover, resolveProducerGallery } from '../../utils/producerMediaResolver';
import { GooglePlaceMedia } from '../GooglePlaces/GooglePlaceMedia';
import { GooglePlacePhotoCarousel } from '../GooglePlaces/GooglePlacePhotoCarousel';
import { isGooglePlacesEligible } from '../../config/googlePlacesAllowlist';
import { runtimeConfig } from '../../config/runtimeConfig';
import { ProducerCategoryIcon } from '../Common/ProducerCategoryIcon';

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
  customNotice?: string;
  isProTier?: boolean;
  directBottleShopUrl?: string;
  hasExplorerPass?: boolean;
  onOpenExplorerPass?: () => void;
  onOpenDigitalPass?: () => void;
  initialTab?: 'story' | 'tastings' | 'visit';
  producerOverride?: ProducerOverride;
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
  customNotice,
  isProTier = false,
  directBottleShopUrl,
  hasExplorerPass = false,
  onOpenExplorerPass,
  onOpenDigitalPass,
  initialTab = 'story',
  producerOverride,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'story' | 'tastings' | 'visit'>(initialTab);
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [noteDraft, setNoteDraft] = useState<string>('');

  const {
    photos,
    activePhoto,
    activeCredit,
    activePhotoIndex,
    setActivePhotoIndex,
  } = useProducerPhotos(producer);

  const resolvedCover = producer ? resolveProducerCover(producer, producerOverride) : null;
  const resolvedGallery = producer ? resolveProducerGallery(producer, producerOverride) : [];
  const hasHostMedia = Boolean(
    resolvedCover?.isHostManaged || resolvedGallery.some((g) => g.isHostManaged)
  );
  const hasTrustedLocalPhoto =
    resolvedCover?.source === 'host_upload' ||
    resolvedCover?.source === 'curated_estate';
  const canUseGoogleHero = Boolean(
    producer &&
      !hasTrustedLocalPhoto &&
      runtimeConfig.googlePlacesMedia.enabled &&
      producer.googlePlaceId?.trim() &&
      isGooglePlacesEligible(producer)
  );

  const [heroImgSrc, setHeroImgSrc] = useState<string>('');

  useEffect(() => {
    if (producer) {
      setActiveTab('story');
      setIsEditingNote(false);
      setNoteDraft(tastingNote);
      setHeroImgSrc(
        resolvedCover?.url ||
          activePhoto?.url ||
          getCategoryFallbackImage(getEffectiveProducerCategory(producer))
      );
    }
  }, [producer, tastingNote, activePhoto, resolvedCover?.url]);

  const handleHeroImgError = () => {
    if (producer) {
      const fallback = getCategoryFallbackImage(getEffectiveProducerCategory(producer));
      if (heroImgSrc !== fallback) {
        setHeroImgSrc(fallback);
      }
    }
  };

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

  const getCategoryDetails = (p: Producer) => {
    switch (getEffectiveProducerCategory(p)) {
      case 'winery': return { label: 'Winery', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'brewery': return { label: 'Brewery', color: 'text-amber-300 bg-amber-400/15 border-amber-400/30' };
      case 'distillery': return { label: 'Distillery', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'cidery': return { label: 'Cidery', color: 'text-lime-400 bg-lime-500/10 border-lime-500/20' };
      case 'confectionery': return { label: 'Confectionery Producer', color: 'text-amber-300 bg-amber-700/10 border-amber-700/20' };
      case 'oil_mill': return { label: 'Oil Mill', color: 'text-yellow-400 bg-yellow-600/10 border-yellow-600/20' };
      case 'herb_farm': return { label: 'Herb Farm', color: 'text-green-400 bg-green-500/10 border-green-500/20' };
      case 'mushroom_farm': return { label: 'Mushroom Farm', color: 'text-stone-300 bg-stone-500/10 border-stone-500/20' };
      case 'olive_mill': return { label: 'Olive Mill', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'olive_oil_producer': return { label: 'Olive Oil Producer', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'cheese_dairy': return { label: 'Dairy', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
      case 'apiary': return { label: 'Apiary / Honey', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'farm': return { label: 'Farm', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      default: return { label: 'Producer', color: 'text-stone-300 bg-stone-500/10 border-white/10' };
    }
  };

  const getRoadAccessDetails = (p: Producer) => {
    if (p.roadAccessStatus !== 'verified' || !p.roadAccess) return undefined;

    const labels: Record<NonNullable<Producer['roadAccess']>, { title: string; color: string }> = {
      paved: {
        title: 'Paved road access',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      narrow_paved: {
        title: 'Narrow paved road access',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      gravel_ok: {
        title: 'Passable gravel road access',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      unpaved_passable: {
        title: 'Passable unpaved road access',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      high_clearance_recommended: {
        title: 'High-clearance vehicle recommended',
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      },
      '4x4_required': {
        title: '4x4 access required',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      },
    };

    return {
      ...labels[p.roadAccess],
      desc: p.roadAccessNotes,
      sourceUrl: p.roadAccessSourceUrl,
    };
  };

  const getCategoryTerminology = (category: Producer['category'], name: string) => {
    switch (category) {
      case 'brewery':
        return {
          makerTitle: 'head brewer or owner',
          venueName: 'brewery',
          productPlural: 'can & bottle',
          whatTheyMakeTitle: 'Craft Beers & Seasonal Brews',
          specialtiesLabel: 'Beer Styles & Hop Profiles',
          highlightsLabel: 'Brewery & Taproom Highlights',
          storeLabel: 'Direct Brewery Bottle Shop',
          storeSub: `Order fresh craft brews directly from ${name}'s taproom`,
          discountLabel: 'Taproom Discount',
          tastingNotePlaceholder: 'Record your thoughts on their craft beers, hop profiles, or seasonal releases...',
          visitingTitle: 'Brewery & Visiting',
          callAction: 'Call Brewery',
          callShortLabel: 'Call Brewery',
          hasDeliveryBoxes: true,
          deliveryCategory: 'beer' as const,
          deliveryBoxTitle: 'Craft Beer Cold-Pack Delivery',
          deliveryBadge: 'Fresh Brews',
          deliveryBoxDesc: 'Brewery-fresh unpasteurized craft cans and ales shipped direct to your home.',
        };
      case 'olive_mill':
        return {
          makerTitle: 'master miller or grower',
          venueName: 'estate & mill',
          productPlural: 'bottle & tin',
          whatTheyMakeTitle: 'Extra Virgin Olive Oils & Harvests',
          specialtiesLabel: 'Olive Cultivars & Pressings',
          highlightsLabel: 'Mill & Grove Highlights',
          storeLabel: 'Direct Mill Farm Shop',
          storeSub: `Order harvest-fresh EVOO directly from ${name}'s mill`,
          discountLabel: 'Mill Discount',
          tastingNotePlaceholder: 'Record your thoughts on their olive oil harvest, polyphenols, or olive varieties...',
          visitingTitle: 'Mill & Visiting',
          callAction: 'Call Olive Mill',
          callShortLabel: 'Call Mill',
          hasDeliveryBoxes: true,
          deliveryCategory: 'olive_oil' as const,
          deliveryBoxTitle: 'Single-Estate EVOO Delivery',
          deliveryBadge: 'Harvest Fresh',
          deliveryBoxDesc: 'Certified cold-pressed extra virgin olive oils shipped direct from the grove.',
        };
      case 'olive_oil_producer':
        return {
          makerTitle: 'olive grower or producer',
          venueName: 'producer',
          productPlural: 'bottle & tin',
          whatTheyMakeTitle: 'Olive Oils & Harvests',
          specialtiesLabel: 'Olive Cultivars & Oils',
          highlightsLabel: 'Producer & Harvest Highlights',
          storeLabel: 'Direct Producer Shop',
          storeSub: `Order olive oil directly from ${name}`,
          discountLabel: 'Producer Discount',
          tastingNotePlaceholder: 'Record your thoughts on their olive oils, harvests, olive varieties, or your visit...',
          visitingTitle: 'Producer & Visiting',
          callAction: 'Call Producer',
          callShortLabel: 'Call Producer',
          hasDeliveryBoxes: true,
          deliveryCategory: 'olive_oil' as const,
          deliveryBoxTitle: 'Olive Oil Delivery',
          deliveryBadge: 'Producer Direct',
          deliveryBoxDesc: 'Olive-oil products offered directly by the producer, subject to its current delivery terms.',
        };
      case 'distillery':
        return {
          makerTitle: 'master distiller or producer',
          venueName: 'distillery',
          productPlural: 'bottle',
          whatTheyMakeTitle: 'Distillates & Traditional Spirits',
          specialtiesLabel: 'Spirits & Alembic Distillations',
          highlightsLabel: 'Distillery & Still House Highlights',
          storeLabel: 'Direct Distillery Store',
          storeSub: `Order artisan spirits directly from ${name}'s still`,
          discountLabel: 'Distillery Discount',
          tastingNotePlaceholder: 'Record your thoughts on their tsikoudia distillation, botanicals, or aged spirits...',
          visitingTitle: 'Distillery & Visiting',
          callAction: 'Call Distillery',
          callShortLabel: 'Call Distillery',
          hasDeliveryBoxes: false,
          deliveryCategory: undefined,
          deliveryBoxTitle: '',
          deliveryBadge: '',
          deliveryBoxDesc: '',
        };
      case 'cheese_dairy':
        return {
          makerTitle: 'master cheesemaker or shepherd',
          venueName: 'mitato & dairy',
          productPlural: 'cheese wheel & purchase',
          whatTheyMakeTitle: 'Artisanal Mountain Cheeses & Dairy',
          specialtiesLabel: 'Cheeses & Milk Traditions',
          highlightsLabel: 'Dairy & Mitato Highlights',
          storeLabel: 'Direct Dairy Store',
          storeSub: `Order artisanal mountain cheeses directly from ${name}`,
          discountLabel: 'Dairy Discount',
          tastingNotePlaceholder: 'Record your thoughts on their graviera, mizithra, or mountain milk traditions...',
          visitingTitle: 'Dairy & Visiting',
          callAction: 'Call Dairy',
          callShortLabel: 'Call Dairy',
          hasDeliveryBoxes: true,
          deliveryCategory: 'cheese' as const,
          deliveryBoxTitle: 'Cave-Aged Cheese & Pantry Delivery',
          deliveryBadge: 'Vacuum Sealed',
          deliveryBoxDesc: 'Certified vacuum-packed cave-cured graviera & shepherd pantry pairings shipped with cold-packs.',
        };
      case 'apiary':
        return {
          makerTitle: 'beekeeper or apiary owner',
          venueName: 'apiary',
          productPlural: 'jar & product',
          whatTheyMakeTitle: 'Honeys & Bee Products',
          specialtiesLabel: 'Honey Botanicals & Nectars',
          highlightsLabel: 'Apiary & Harvest Highlights',
          storeLabel: 'Direct Apiary Store',
          storeSub: `Order raw wild thyme honey directly from ${name}`,
          discountLabel: 'Farm Discount',
          tastingNotePlaceholder: 'Record your thoughts on their thyme honey, aroma, or wild botanicals...',
          visitingTitle: 'Apiary & Visiting',
          callAction: 'Call Apiary',
          callShortLabel: 'Call Apiary',
          hasDeliveryBoxes: true,
          deliveryCategory: 'honey' as const,
          deliveryBoxTitle: 'Raw Mountain Honey & Herb Delivery',
          deliveryBadge: 'Harvest Jars',
          deliveryBoxDesc: 'Pure raw thyme honey & wild foraged herbs shipped direct to your door.',
        };
      case 'cidery':
        return {
          makerTitle: 'cider maker or orchardist',
          venueName: 'cidery',
          productPlural: 'bottle',
          whatTheyMakeTitle: 'Ciders, Juices & Orchard Ferments',
          specialtiesLabel: 'Cider Styles & Orchard Fruit',
          highlightsLabel: 'Cidery & Orchard Highlights',
          storeLabel: 'Direct Cidery Store',
          storeSub: `Order cider directly from ${name}`,
          discountLabel: 'Cidery Discount',
          tastingNotePlaceholder: 'Record your thoughts on their cider, orchard fruit, fermentation, or visit...',
          visitingTitle: 'Cidery & Visiting',
          callAction: 'Call Cidery',
          callShortLabel: 'Call Cidery',
          hasDeliveryBoxes: false,
          deliveryCategory: undefined,
          deliveryBoxTitle: '',
          deliveryBadge: '',
          deliveryBoxDesc: '',
        };
      case 'confectionery':
        return {
          makerTitle: 'confectioner or producer',
          venueName: 'workshop',
          productPlural: 'product',
          whatTheyMakeTitle: 'Artisan Confectionery & Local Sweets',
          specialtiesLabel: 'Confections & Ingredients',
          highlightsLabel: 'Workshop & Producer Highlights',
          storeLabel: 'Direct Producer Store',
          storeSub: `Order artisan confectionery directly from ${name}`,
          discountLabel: 'Producer Discount',
          tastingNotePlaceholder: 'Record your thoughts on their chocolate, nougat, ingredients, or visit...',
          visitingTitle: 'Workshop & Visiting',
          callAction: 'Call Producer',
          callShortLabel: 'Call Producer',
          hasDeliveryBoxes: false,
          deliveryCategory: undefined,
          deliveryBoxTitle: '',
          deliveryBadge: '',
          deliveryBoxDesc: '',
        };
      case 'oil_mill':
        return {
          makerTitle: 'miller or seed-oil producer',
          venueName: 'oil mill',
          productPlural: 'bottle',
          whatTheyMakeTitle: 'Pressed Oils & Seed Specialties',
          specialtiesLabel: 'Seeds, Oils & Pressings',
          highlightsLabel: 'Mill & Producer Highlights',
          storeLabel: 'Direct Mill Store',
          storeSub: `Order pressed oils directly from ${name}`,
          discountLabel: 'Mill Discount',
          tastingNotePlaceholder: 'Record your thoughts on their oils, seeds, pressing method, or visit...',
          visitingTitle: 'Oil Mill & Visiting',
          callAction: 'Call Oil Mill',
          callShortLabel: 'Call Mill',
          hasDeliveryBoxes: false,
          deliveryCategory: undefined,
          deliveryBoxTitle: '',
          deliveryBadge: '',
          deliveryBoxDesc: '',
        };
      case 'herb_farm':
        return {
          makerTitle: 'herb grower or producer',
          venueName: 'herb farm',
          productPlural: 'herb product',
          whatTheyMakeTitle: 'Herbs, Teas & Botanical Products',
          specialtiesLabel: 'Herbs & Botanicals',
          highlightsLabel: 'Farm & Botanical Highlights',
          storeLabel: 'Direct Farm Store',
          storeSub: `Order botanical products directly from ${name}`,
          discountLabel: 'Farm Discount',
          tastingNotePlaceholder: 'Record your thoughts on their herbs, teas, botanicals, or visit...',
          visitingTitle: 'Herb Farm & Visiting',
          callAction: 'Call Farm',
          callShortLabel: 'Call Farm',
          hasDeliveryBoxes: false,
          deliveryCategory: undefined,
          deliveryBoxTitle: '',
          deliveryBadge: '',
          deliveryBoxDesc: '',
        };
      case 'mushroom_farm':
        return {
          makerTitle: 'mushroom grower or producer',
          venueName: 'mushroom farm',
          productPlural: 'mushroom product',
          whatTheyMakeTitle: 'Cultivated Mushrooms & Farm Products',
          specialtiesLabel: 'Mushroom Varieties & Cultivation',
          highlightsLabel: 'Farm & Cultivation Highlights',
          storeLabel: 'Direct Farm Store',
          storeSub: `Order mushroom products directly from ${name}`,
          discountLabel: 'Farm Discount',
          tastingNotePlaceholder: 'Record your thoughts on their mushrooms, cultivation, products, or visit...',
          visitingTitle: 'Mushroom Farm & Visiting',
          callAction: 'Call Farm',
          callShortLabel: 'Call Farm',
          hasDeliveryBoxes: false,
          deliveryCategory: undefined,
          deliveryBoxTitle: '',
          deliveryBadge: '',
          deliveryBoxDesc: '',
        };
      case 'farm':
        return {
          makerTitle: 'farmer or grower',
          venueName: 'farm',
          productPlural: 'farm produce',
          whatTheyMakeTitle: 'Farm Produce & Agricultural Harvests',
          specialtiesLabel: 'Cultivations & Crops',
          highlightsLabel: 'Farm & Estate Highlights',
          storeLabel: 'Direct Farm Shop',
          storeSub: `Order farm products directly from ${name}`,
          discountLabel: 'Farm Discount',
          tastingNotePlaceholder: 'Record your thoughts on the farm, its cultivation, products, or your visit...',
          visitingTitle: 'Farm & Visiting',
          callAction: 'Call Farm',
          callShortLabel: 'Call Farm',
          hasDeliveryBoxes: false,
          deliveryCategory: undefined,
          deliveryBoxTitle: '',
          deliveryBadge: '',
          deliveryBoxDesc: '',
        };
      case 'winery':
      default:
        return {
          makerTitle: 'winemaker or estate host',
          venueName: 'estate',
          productPlural: 'bottle',
          whatTheyMakeTitle: 'Wines & Indigenous Grape Varieties',
          specialtiesLabel: 'Indigenous Grape Varieties',
          highlightsLabel: 'Cellar & Tasting Highlights',
          storeLabel: 'Direct Estate Bottle Store',
          storeSub: `Order directly from ${name}'s cellar`,
          discountLabel: 'Cellar Discount',
          tastingNotePlaceholder: 'Record your thoughts on their wines, food pairings, or best vintage...',
          visitingTitle: 'Cellar Door & Visiting',
          callAction: 'Call Cellar Door',
          callShortLabel: 'Call Cellar',
          hasDeliveryBoxes: true,
          deliveryCategory: 'wine' as const,
          deliveryBoxTitle: 'International Cellar Delivery',
          deliveryBadge: 'EU / UK / US',
          deliveryBoxDesc: 'Temperature-controlled insulated boxes shipped straight to your doorstep.',
        };
    }
  };

  const getVisitStatusDetails = (
    status: VisitStatus | string | undefined,
    p: Producer
  ) => {
    switch (status) {
      case 'public_visits':
        return {
          badgeLabel: 'Visitors Welcome',
          badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          description: `${p.name} publicly welcomes visitors. Verified opening information is listed below, or contact the producer directly.`,
          visitingStyle: p.walkInFriendly === true ? 'Walk-ins welcome' : 'Public visits welcome',
        };
      case 'seasonal_public':
        return {
          badgeLabel: 'Seasonal Public Visits',
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          description: `Public visits to ${p.name} are seasonal. Please check verified seasonal opening information or contact the estate before travelling.`,
          visitingStyle: p.bestSeason ? `Seasonal (${p.bestSeason})` : 'Seasonal opening hours',
        };
      case 'appointment_only':
        return {
          badgeLabel: 'Visits by Appointment',
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          description: `Visits to ${p.name} are by appointment only. Please contact the producer in advance to arrange your visit.`,
          visitingStyle: 'Advance appointment required',
        };
      case 'not_publicly_confirmed':
        return {
          badgeLabel: 'Public Visits Not Confirmed',
          badgeClass: 'bg-stone-500/15 text-stone-300 border-stone-500/30',
          description: 'Public visits not currently confirmed — contact the producer directly for information.',
          visitingStyle: undefined,
        };
      case 'current_access_uncertain':
        return {
          badgeLabel: 'Access Uncertain',
          badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
          description: 'Current visitor access should be confirmed directly with the producer before travelling.',
          visitingStyle: undefined,
        };
      case 'unreviewed':
      default:
        return {
          badgeLabel: 'Visit Status Unreviewed',
          badgeClass: 'bg-stone-500/15 text-stone-300 border-stone-500/30',
          description: 'Visitor access details have not been independently confirmed. Please contact the producer directly before travelling.',
          visitingStyle: undefined,
        };
    }
  };

  const effectiveCategory = getEffectiveProducerCategory(producer);
  const cat = getCategoryDetails(producer);
  const road = getRoadAccessDetails(producer);
  const roadWarning = getProducerRoadAccessWarning(producer);
  const roadAccessBlocksDirections =
    producer.roadAccessStatus === 'current_access_uncertain' ||
    producer.roadAccess === 'high_clearance_recommended' ||
    producer.roadAccess === '4x4_required';
  const hasVerifiedStandardRoad =
    producer.roadAccessStatus === 'verified' &&
    (producer.roadAccess === 'paved' ||
      producer.roadAccess === 'narrow_paved' ||
      producer.roadAccess === 'gravel_ok');
  const term = getCategoryTerminology(
    getEffectiveProducerCategory(producer),
    producer.name
  );
  const visitDetails = getVisitStatusDetails(producer.visitStatus, producer);
  const effectiveOpeningHours =
    producerOverride?.customHours !== undefined
      ? producerOverride.customHours.trim()
      : producer.openingHours?.trim() || '';
  const effectivePhone =
    producerOverride?.contactPhone !== undefined
      ? producerOverride.contactPhone.trim()
      : producer.phone?.trim() || '';
  const effectiveEmail =
    producerOverride?.contactEmail !== undefined
      ? producerOverride.contactEmail.trim()
      : '';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] max-w-full bg-stone-950 text-stone-100 shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300 select-none"
        role="dialog"
        aria-modal="true"
        aria-label={`Producer details: ${producer.name}`}
      >

        <div className="relative h-48 sm:h-60 lg:h-64 w-full shrink-0 bg-stone-900 overflow-hidden group">
          {canUseGoogleHero ? (
            <GooglePlacePhotoCarousel
              producer={producer}
              className="w-full h-full"
              imageClassName="w-full h-full object-cover transition-all duration-500"
              fallbackUrl={
                resolvedCover?.url ||
                getCategoryFallbackImage(getEffectiveProducerCategory(producer))
              }
              fallbackAlt={producer.name}
              maxPhotos={10}
              autoPlay
              intervalMs={5200}
              showControls
              showCounter
              showDots={false}
              showAttribution
              pauseOnHover={false}
            />
          ) : (
            <img
              src={
                heroImgSrc ||
                activePhoto?.url ||
                getCategoryFallbackImage(getEffectiveProducerCategory(producer))
              }
              alt={producer.name}
              className="w-full h-full object-cover transition-all duration-300"
              decoding="async"
              onError={handleHeroImgError}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30 pointer-events-none" />

          {!canUseGoogleHero && photos.length > 1 && (
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

              <div className="absolute bottom-20 right-4 z-10 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] font-mono text-stone-300 border border-white/10 flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-amber-400" />
                <span>{activePhotoIndex + 1} / {photos.length}</span>
              </div>
            </>
          )}

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
              aria-label={copiedLink ? 'Producer link copied' : 'Copy producer link'}
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

          <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-1.5 max-w-[calc(100%-130px)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${cat.color}`}>
                <ProducerCategoryIcon category={effectiveCategory} className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </span>
              {producer.publicPointType === 'producer_shop' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-200 border border-sky-400/30 backdrop-blur-md">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Mapped point: Producer Shop</span>
                </span>
              )}
              {isProTier && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 border border-amber-300">
                  <Award className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Host Pro</span>
                </span>
              )}
            </div>

            {canUseGoogleHero ? (
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] text-stone-200 border border-white/15 shadow-sm">
                  <Camera className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Google Maps imagery</span>
                </span>
              </div>
            ) : resolvedCover?.isHostManaged ? (
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/85 backdrop-blur-md text-[10px] text-emerald-300 border border-emerald-500/30 shadow-sm truncate max-w-[240px] sm:max-w-[300px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Provided by the producer</span>
                  <span className="text-[9px] text-emerald-400/90 font-medium shrink-0">· Host verified</span>
                </span>
              </div>
            ) : activeCredit ? (
              <div className="flex items-center">
                {activeCredit.url ? (
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
                    <span className="truncate">Photo: {activeCredit.author}</span>
                    <span className="text-[9px] text-amber-400/90 font-medium shrink-0">· {activeCredit.license || activeCredit.source}</span>
                  </span>
                )}
              </div>
            ) : resolvedCover?.source === 'category_fallback' ? (
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] text-stone-300 border border-white/15 shadow-sm">
                  <Camera className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>Producer photo pending</span>
                </span>
              </div>
            ) : null}
          </div>

        <div className={`absolute ${canUseGoogleHero ? 'bottom-9' : 'bottom-4'} left-4 right-4 z-10`}>
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              
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

      {user?.isProducer && user.claimedProducerId === producer.id && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5 min-w-0">
            <Building2 className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <div className="font-bold text-white text-xs truncate">You are the verified host of this producer profile</div>
              <div className="text-[10px] text-amber-300/90 truncate">Manage visitor notices and reviewed profile access</div>
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
          What They Make
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

      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-stone-200">

        {customNotice && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 shadow-md animate-in fade-in">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider mb-0.5">
                Visitor Notice
              </span>
              <p className="text-xs leading-relaxed text-stone-200">
                {customNotice}
              </p>
            </div>
          </div>
        )}

        {(producer.rating != null || producer.priceLevel != null) && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 border border-white/10 text-xs">
            {producer.rating != null ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-xl border border-amber-400/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{producer.rating}</span>
                </div>
                {producer.reviewCount != null && producer.reviewCount > 0 && (
                  <span className="text-stone-400">({producer.reviewCount} reviews)</span>
                )}
              </div>
            ) : <div />}

            {producer.priceLevel && (
              <div className="flex items-center gap-2">
                <span className="text-stone-400">Price Tier:</span>
                <span className="font-mono font-bold text-amber-400 bg-stone-800 px-2 py-0.5 rounded border border-white/10">
                  {producer.priceLevel}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-stone-900 border border-amber-500/20 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-xs font-bold text-white">Terroir Passport Check-In</div>
                <div className="text-[10px] text-stone-400">
                  {isVisited ? 'Stamped in your collection' : 'Mark this place as visited'}
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
                    <span>Stamped</span>
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

          {isAuthenticated ? (
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-stone-300">
                <span>My Private Visit Notes</span>
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
                  placeholder={term.tastingNotePlaceholder}
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
              <span>Sign in to record personal visit notes</span>
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

        {activeTab === 'story' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <GooglePlaceMedia producer={producer} />

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

            {photos.length > 1 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Producer Photos</span>
                    <span className="text-[10px] text-stone-400 normal-case font-normal">({photos.length} photos)</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-400/90 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{hasHostMedia ? 'Host-verified media' : 'Source-listed media'}</span>
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
                        decoding="async"
                        onError={(e) => {
                          const fallback = getCategoryFallbackImage(getEffectiveProducerCategory(producer));
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>

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
                      Source listed
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tastings' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-1 border-b border-white/5">
              <ProducerCategoryIcon category={effectiveCategory} className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif-title font-bold text-sm text-white">
                {term.whatTheyMakeTitle}
              </h3>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5">
                {term.specialtiesLabel}
              </h4>
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                {term.highlightsLabel}
              </h4>
              <div className="space-y-2">
                {producer.tastingHighlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-900 border border-white/5 text-xs text-stone-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

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
                      {term.storeLabel}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-normal">0% Commission</span>
                    </div>
                    <div className="text-[11px] text-stone-400">{term.storeSub}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition" />
              </a>
            )}

            {(!user?.isProducer || user.claimedProducerId !== producer.id) && (
              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('producer')}
                  className="text-[11px] text-stone-400 hover:text-amber-300 transition cursor-pointer inline-flex items-center gap-1.5 hover:underline"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Represent {producer.name}? Sign in to claim or manage this producer profile</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'visit' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <ProducerCategoryIcon category={effectiveCategory} className="w-4 h-4 text-amber-400" />
                  <span>{term.visitingTitle || 'Visiting & Contact'}</span>
                </h3>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${visitDetails.badgeClass}`}>
                  {visitDetails.badgeLabel}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-white/10 space-y-3">
                <p className="text-xs text-stone-300 leading-relaxed">
                  {visitDetails.description}
                </p>

                {producer.publicPointType === 'producer_shop' && (
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 text-[11px] text-sky-100 leading-relaxed">
                    <span className="font-semibold text-sky-300 block text-[10px] uppercase tracking-wider mb-0.5">Verified mapped point</span>
                    Producer Shop — this map point is a producer-owned public-facing shop. It does not by itself confirm ordinary public access to the farm, orchards, mill, or other production site.
                  </div>
                )}

                {producer.visitNotes && (
                  <div className="p-2.5 rounded-xl bg-stone-800/60 border border-white/5 text-[11px] text-stone-300 leading-relaxed">
                    <span className="font-semibold text-amber-300/90 block text-[10px] uppercase tracking-wider mb-0.5">Visit Notes</span>
                    {producer.visitNotes}
                  </div>
                )}

                {(visitDetails.visitingStyle || effectiveOpeningHours || producer.bestSeason) && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5">
                    {visitDetails.visitingStyle && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-400 block font-medium">Visiting Style</span>
                        <span className="font-semibold text-stone-200">
                          {visitDetails.visitingStyle}
                        </span>
                      </div>
                    )}
                    {effectiveOpeningHours && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-400 block font-medium">Opening Hours</span>
                        <span className="font-semibold text-stone-200 block whitespace-pre-line">
                          {effectiveOpeningHours}
                        </span>
                      </div>
                    )}
                    {producer.bestSeason && (
                      <div className="space-y-0.5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-stone-400 block font-medium">Best Season</span>
                        <span className="font-semibold text-stone-200 truncate block">
                          {producer.bestSeason}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {producer.website && (
                    <a
                      href={producer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 border border-white/10 text-stone-200 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span>Visit Producer Website</span>
                    </a>
                  )}
                  {effectivePhone && (
                    <a
                      href={`tel:${effectivePhone}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{term.callAction}</span>
                    </a>
                  )}
                  {effectiveEmail && (
                    <a
                      href={`mailto:${effectiveEmail}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-200 font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Producer</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
                <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Road & Navigation Access</span>
              </div>

              {road ? (
                <div className={`p-4 rounded-2xl border ${road.color}`}>
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <Car className="w-4 h-4 shrink-0" />
                    <span>{road.title}</span>
                  </div>
                  {road.desc && (
                    <p className="text-xs leading-relaxed opacity-90">{road.desc}</p>
                  )}
                  {road.sourceUrl && (
                    <a
                      href={road.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-[11px] font-semibold underline underline-offset-2 opacity-90 hover:opacity-100"
                    >
                      Access source
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/5 text-xs text-stone-400">
                  <div className="flex items-center gap-2 font-semibold text-stone-300 mb-1">
                    <Car className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>Road Access Not Independently Classified</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Road access conditions to this mapped point have not been independently confirmed. Rural access routes may involve narrow roads or unpaved segments.
                  </p>
                </div>
              )}

              {roadWarning && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <div className="flex items-start gap-2">
                    <Car className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{roadWarning}</p>
                  </div>
                </div>
              )}

              {producer.locationStatus === 'unresolved' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <MapPin className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Exact Navigation Point Under Verification</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    The precise public point for this producer is still being verified. Please contact the producer directly or check their official website for directions.
                  </p>
                </div>
              )}

              {producer.locationStatus === 'verified_entrance' && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Verified visitor entrance coordinates</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-stone-900/60 border border-white/5 text-[10px] text-stone-400 leading-relaxed">
                <span className="font-semibold text-stone-300 block text-[10px] uppercase tracking-wider mb-0.5">Route Safety Notice</span>
                A verified map pin identifies the audited public point for this producer. It may be an estate, production site, visitor center, or producer-owned shop; it does not by itself establish road conditions or the location of every production asset. Always review road access information before travelling.
              </div>
            </div>

            {(producer.dogFriendly != null || producer.campervanFriendly != null || producer.kidFriendly != null || (producer.visitStatus === 'public_visits' && producer.walkInFriendly === true)) && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                {producer.dogFriendly != null && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                    producer.dogFriendly ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-stone-900 text-stone-400 border-white/5'
                  }`}>
                    <Dog className="w-3.5 h-3.5" />
                    {producer.dogFriendly ? 'Dog Friendly' : 'No Pets'}
                  </span>
                )}

                {producer.kidFriendly != null && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                    producer.kidFriendly ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-stone-900 text-stone-400 border-white/5'
                  }`}>
                    <Footprints className="w-3.5 h-3.5" />
                    {producer.kidFriendly ? 'Family Friendly' : 'Adults Only'}
                  </span>
                )}

                {producer.visitStatus === 'public_visits' && producer.walkInFriendly === true && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Walk-in Welcome
                  </span>
                )}

                {producer.campervanFriendly != null && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                    producer.campervanFriendly ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-stone-900 text-stone-400 border-white/5'
                  }`}>
                    <Caravan className="w-3.5 h-3.5" />
                    {producer.campervanFriendly ? 'Campervan Friendly' : 'No Campervans'}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      <div
        className="p-3 sm:p-4 bg-stone-900/95 backdrop-blur-xl border-t border-white/10 shrink-0 flex items-center gap-1.5 sm:gap-2.5"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
      >
        {producer.locationStatus === 'unresolved' ? (
          <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 text-stone-400 font-medium text-xs rounded-2xl border border-white/5 whitespace-nowrap" title="Exact navigation point still being verified">
            <MapPin className="w-4 h-4 text-amber-400/70 shrink-0" />
            <span className="truncate">Navigation Pending</span>
          </div>
        ) : producer.googleMapsUrl && roadAccessBlocksDirections ? (
          <div
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 text-amber-300 font-medium text-xs rounded-2xl border border-amber-500/20 whitespace-nowrap"
            title={roadWarning || 'Check access conditions before driving'}
          >
            <Car className="w-4 h-4 shrink-0" />
            <span className="truncate">Access Check Needed</span>
          </div>
        ) : producer.googleMapsUrl ? (
          <a
            href={producer.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-98 whitespace-nowrap"
            title={roadWarning}
          >
            {hasVerifiedStandardRoad ? (
              <Navigation className="w-4 h-4 text-stone-950 shrink-0" />
            ) : (
              <MapPin className="w-4 h-4 text-stone-950 shrink-0" />
            )}
            <span className="truncate">
              {hasVerifiedStandardRoad ? 'Directions' : 'Open Map'}
            </span>
          </a>
        ) : null}

        {effectivePhone ? (
          <a
            href={`tel:${effectivePhone}`}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 hover:bg-stone-750 text-stone-100 font-bold text-xs rounded-2xl border border-white/10 transition transform active:scale-98 whitespace-nowrap"
            title={`Call ${effectivePhone}`}
          >
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{term.callShortLabel || 'Call'}</span>
          </a>
        ) : effectiveEmail ? (
          <a
            href={`mailto:${effectiveEmail}`}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 hover:bg-stone-750 text-stone-100 font-bold text-xs rounded-2xl border border-white/10 transition transform active:scale-98 whitespace-nowrap"
            title={`Email ${effectiveEmail}`}
          >
            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Email</span>
          </a>
        ) : producer.website ? (
          <a
            href={producer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 hover:bg-stone-750 text-stone-100 font-bold text-xs rounded-2xl border border-white/10 transition transform active:scale-98 whitespace-nowrap"
            title="Visit Website"
          >
            <Globe className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Website</span>
          </a>
        ) : null}

        {directBottleShopUrl && (
          <a
            href={directBottleShopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 transition shrink-0"
            title="Buy Directly from Producer"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
          </a>
        )}

        {(effectivePhone || effectiveEmail) && producer.website && (
          <a
            href={producer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-750 border border-white/10 text-stone-200 transition shrink-0"
            title="Visit Official Website"
          >
            <Globe className="w-4 h-4 shrink-0" />
          </a>
        )}

      </div>

    </div>
    </>
  );
};
