import React, { useEffect } from 'react';
import { Producer } from '../../types/terroir';
import { 
  X, MapPin, Star, Phone, Globe, Navigation, Clock, ShieldCheck, 
  Dog, Footprints, Caravan, Utensils, Car, Sparkles, ExternalLink 
} from 'lucide-react';

interface ProducerDetailDrawerProps {
  producer: Producer | null;
  onClose: () => void;
}

export const ProducerDetailDrawer: React.FC<ProducerDetailDrawerProps> = ({
  producer,
  onClose,
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!producer) return null;

  const getCategoryDetails = (cat: Producer['category']) => {
    switch (cat) {
      case 'winery':
        return { label: 'Boutique Winery', icon: '🍇', bg: 'bg-rose-100 text-rose-900 border-rose-200' };
      case 'kazani':
        return { label: 'Traditional Rakokazano', icon: '🏺', bg: 'bg-amber-100 text-amber-950 border-amber-300' };
      case 'olive_mill':
        return { label: 'Artisanal Olive Mill', icon: '🫒', bg: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      case 'cheese_dairy':
        return { label: 'Mountain Shepherd Dairy (Mitato)', icon: '🧀', bg: 'bg-yellow-100 text-yellow-950 border-yellow-300' };
      case 'apiary':
        return { label: 'Wild Apiary & Herbalist', icon: '🍯', bg: 'bg-orange-100 text-orange-950 border-orange-300' };
    }
  };

  const getRoadAccessExplanation = (access: Producer['roadAccess']) => {
    switch (access) {
      case 'paved':
        return {
          title: 'Smooth Paved Road',
          desc: '100% asphalt road all the way to the estate. Perfect for all standard rental cars.',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'gravel_ok':
        return {
          title: 'Short Gravel Section',
          desc: 'Manageable hard-packed dirt road for the last 500m. Drive slowly with standard car.',
          color: 'text-amber-800 bg-amber-50 border-amber-200',
        };
      case '4x4_required':
        return {
          title: 'High-Clearance or 4x4 Required',
          desc: 'Steep mountain dirt track with rocks. High clearance SUV or 4x4 strongly recommended.',
          color: 'text-rose-800 bg-rose-50 border-rose-200',
        };
    }
  };

  const cat = getCategoryDetails(producer.category);
  const road = getRoadAccessExplanation(producer.roadAccess);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] bg-white shadow-2xl flex flex-col border-l border-stone-200 transition-all duration-300 animate-in slide-in-from-right">
      
      {/* Drawer Header with Cover Image */}
      <div className="relative h-64 sm:h-72 w-full shrink-0 bg-stone-900">
        <img
          src={producer.coverImage}
          alt={producer.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/20" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Floating Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${cat.bg}`}>
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </span>
        </div>

        {/* Bottom Cover Content */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{producer.village} · {producer.region.toUpperCase()}, CRETE</span>
          </div>

          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
            {producer.name}
          </h2>
          <p className="text-stone-300 text-sm font-medium opacity-90 mt-0.5">
            {producer.greekName}
          </p>
        </div>
      </div>

      {/* Drawer Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-stone-800">
        
        {/* Rating, Price & Quick Stats */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-400/20 text-amber-950 font-bold px-2.5 py-1 rounded-lg border border-amber-300/40">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{producer.rating}</span>
            </div>
            <span className="text-stone-500">({producer.reviewCount} verified visits)</span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span className="text-stone-500">Price Level:</span>
            <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
              {producer.priceLevel}
            </span>
          </div>
        </div>

        {/* Tagline quote */}
        <div className="border-l-4 border-amber-500 pl-3.5 py-1">
          <p className="text-sm font-serif-title italic text-stone-800 font-medium leading-relaxed">
            "{producer.tagLine}"
          </p>
        </div>

        {/* Road & Rental Car Accessibility Warning Card */}
        <div className={`p-4 rounded-xl border ${road.color}`}>
          <div className="flex items-center gap-2 font-bold text-xs mb-1">
            <Car className="w-4 h-4 shrink-0" />
            <span>{road.title}</span>
          </div>
          <p className="text-xs leading-relaxed opacity-95">
            {road.desc}
          </p>
        </div>

        {/* The Heritage & Story */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            The Terroir Story & Heritage
          </h3>
          <p className="text-sm text-stone-700 leading-relaxed font-normal">
            {producer.story}
          </p>
        </div>

        {/* Indigenous Varieties & Products */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5">
            Indigenous Grapes & Terroir Specialties
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {producer.indigenousVarieties.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 font-medium text-xs shadow-2xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Tasting Highlights */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
            Must-Try Tastings
          </h3>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {producer.tastingHighlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Practical Logistics & Visiting Rules */}
        <div className="space-y-2.5 pt-2 border-t border-stone-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
            Visiting Logistics
          </h3>

          <div className="flex items-center gap-2.5 text-xs text-stone-700">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <span><strong>Hours:</strong> {producer.openingHours}</span>
          </div>

          {producer.bestSeason && (
            <div className="flex items-center gap-2.5 text-xs text-stone-700">
              <Sparkles className="w-4 h-4 text-stone-400 shrink-0" />
              <span><strong>Prime Season:</strong> {producer.bestSeason}</span>
            </div>
          )}

          {/* Quick Hospitality Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
              producer.dogFriendly ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}>
              <Dog className="w-3.5 h-3.5" />
              {producer.dogFriendly ? 'Dog Friendly' : 'No Pets'}
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
              producer.walkInFriendly ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <Footprints className="w-3.5 h-3.5" />
              {producer.walkInFriendly ? 'Walk-ins Welcome' : 'Appt Recommended'}
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
              producer.campervanFriendly ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}>
              <Caravan className="w-3.5 h-3.5" />
              {producer.campervanFriendly ? 'Campervan Friendly' : 'No Campervans'}
            </span>
          </div>
        </div>

      </div>

      {/* Drawer Sticky Footer / Action CTAs */}
      <div className="p-4 bg-stone-900 text-white border-t border-stone-800 shrink-0 flex items-center gap-3">
        <a
          href={producer.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition transform active:scale-98"
        >
          <Navigation className="w-4 h-4 fill-stone-950" />
          <span>Open in Google Maps</span>
        </a>

        {producer.phone && (
          <a
            href={`tel:${producer.phone}`}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 transition"
            title={`Call ${producer.phone}`}
          >
            <Phone className="w-4 h-4" />
          </a>
        )}

        {producer.website && (
          <a
            href={producer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 transition"
            title="Visit Website"
          >
            <Globe className="w-4 h-4" />
          </a>
        )}
      </div>

    </div>
  );
};
