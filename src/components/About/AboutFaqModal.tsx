import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  Compass,
  HelpCircle,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface AboutFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'faq';
  onOpenLoops?: () => void;
  onOpenAuth?: (role?: 'traveler' | 'producer') => void;
  onOpenProducerPortal?: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'licenses') => void;
}

type FaqCategory = 'about' | 'visiting' | 'passport' | 'routes' | 'producers';
type FaqAction = 'loops' | 'producer_portal' | 'auth_traveler';

interface FaqItem {
  id: string;
  category: FaqCategory;
  categoryLabel: string;
  question: string;
  answer: string;
  highlight?: string;
  actionText?: string;
  actionType?: FaqAction;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'what-is-terroirtrail',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'What is TerroirTrail?',
    answer:
      'TerroirTrail is an independent producer and agritourism discovery guide for culinary travelers, road-trippers and slow travelers. It connects travelers directly with verified wineries, craft breweries, olive mills, dairies, apiaries, traditional distilleries, and farms, focusing on source-backed producer information, direct maker contact, and conservative rural-navigation guidance rather than mass-tourism listings or unverified travel claims.',
    highlight: 'Discovery first: useful producer information without turning unknowns into promises.',
  },
  {
    id: 'categories-included',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'What categories of producers are included?',
    answer:
      'TerroirTrail curates seven first-class producer categories: Wineries, Breweries, Olive Mills, Dairies / Cheesemakers, Apiaries / Honey, Rakokazana / Traditional Distilleries, and Farms.',
    highlight: 'Seven independent agricultural categories curated under equal verification standards.',
  },
  {
    id: 'how-producers-selected',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'How are listings researched and verified?',
    answer:
      'Listings are assembled from producer websites, reliable public sources and direct evidence where available. Visitability, exact location and road access are tracked separately. A producer being publicly visitable does not mean that producer has a TerroirTrail partnership or bookable Experience.',
  },
  {
    id: 'coverage',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'Which regions are currently covered?',
    answer:
      'Crete is the current reference-quality catalogue, with 27 audited producer and agricultural-project records. TerroirTrail is designed to expand across Greece, Italy and wider Europe, but expansion data is not treated as equivalent to the audited Crete reference set until it passes the same verification process.',
    highlight: 'Crete is the verification standard that future regions must match.',
  },
  {
    id: 'visits',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'Do I need to contact a producer before visiting?',
    answer:
      'It depends on the producer. TerroirTrail records public-visit, appointment-only and uncertain visit states where evidence supports them. Check the individual listing and use the producer’s official phone or website before travelling when advance contact is recommended or current access is uncertain.',
    highlight: 'Use the producer’s official contact channel for current visiting arrangements.',
  },
  {
    id: 'tasting-costs',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'How much do tastings or visits cost?',
    answer:
      'TerroirTrail does not publish generic tasting-price ranges. Prices, inclusions and visiting terms vary by producer and can change seasonally. Confirm current prices and arrangements directly with the producer unless a listing contains current source-backed information.',
  },
  {
    id: 'family-accessibility',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'Are producers family-friendly or accessible?',
    answer:
      'Facilities vary significantly between rural estates. TerroirTrail does not assume family suitability, step-free access, parking conditions or other facilities simply because a producer is publicly visitable. Confirm any requirement that matters to your trip directly with the producer.',
  },
  {
    id: 'passport',
    category: 'passport',
    categoryLabel: 'Traveler Passport',
    question: 'What is the Terroir Passport?',
    answer:
      'The Terroir Passport is a personal travel journal inside your account. You can mark places as visited and keep private tasting or visit notes. Passport stamps are part of the current account experience and are not limited by a paid stamp tier.',
    actionText: 'Sign In / Create Account',
    actionType: 'auth_traveler',
  },
  {
    id: 'routes-status',
    category: 'routes',
    categoryLabel: 'Routes & Rural Access',
    question: 'Are curated driving routes available?',
    answer:
      'Curated routes are currently under verification. Draft routes are not published as turn-by-turn itineraries. A route can only expose navigation after its stops, exact locations and relevant road-access evidence satisfy the safety checks.',
    highlight: 'No draft route is silently converted into turn-by-turn navigation.',
  },
  {
    id: 'road-access',
    category: 'routes',
    categoryLabel: 'Routes & Rural Access',
    question: 'How does TerroirTrail handle rural road access?',
    answer:
      'Location confidence and road-access confidence are separate. Road classifications are only shown when supported by evidence; reviewed locations without publishable road evidence remain explicitly unclassified. Current-access uncertainty is shown rather than replaced with a guess.',
  },
  {
    id: 'producer-claim',
    category: 'producers',
    categoryLabel: 'For Producers',
    question: 'I own or represent a listed producer. How can I manage the listing?',
    answer:
      'Use the Host Portal to sign in or submit a producer claim. Host privileges are granted only from trusted ownership records after review; they cannot be self-assigned by changing browser or profile data.',
    highlight: 'Producer ownership is server-trusted and reviewed before host access is granted.',
    actionText: 'Open Host Portal',
    actionType: 'producer_portal',
  },
  {
    id: 'bookings-commercial',
    category: 'producers',
    categoryLabel: 'For Producers',
    question: 'Does TerroirTrail currently sell tastings, paid passes or Host Pro subscriptions?',
    answer:
      'No public TerroirTrail tasting Experiences, Explorer Pass sales or Host Pro subscriptions are part of the current launch product. The codebase contains dormant infrastructure for future pilots, but commercial features remain private until they are validated and, where relevant, backed by producer agreements.',
  },
];

export const AboutFaqModal: React.FC<AboutFaqModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
  onOpenLoops,
  onOpenAuth,
  onOpenProducerPortal,
  onOpenLegal,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'faq'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | FaqCategory>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const categories: Array<{ id: 'all' | FaqCategory; label: string }> = [
    { id: 'all', label: 'All Questions' },
    { id: 'about', label: '🌍 About & Curation' },
    { id: 'visiting', label: '🍷 Visiting Producers' },
    { id: 'passport', label: '🎖️ Traveler Passport' },
    { id: 'routes', label: '🧭 Routes & Access' },
    { id: 'producers', label: '🏛️ For Producers' },
  ];

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return FAQ_DATA.filter((faq) => {
      const categoryMatches = selectedCategory === 'all' || faq.category === selectedCategory;
      const searchMatches =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.categoryLabel.toLowerCase().includes(query) ||
        faq.highlight?.toLowerCase().includes(query);
      return categoryMatches && searchMatches;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleAction = (action?: FaqAction) => {
    if (!action) return;
    onClose();
    if (action === 'loops') onOpenLoops?.();
    if (action === 'producer_portal') {
      if (onOpenProducerPortal) onOpenProducerPortal();
      else onOpenAuth?.('producer');
    }
    if (action === 'auth_traveler') onOpenAuth?.('traveler');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 sm:px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="TerroirTrail" className="w-9 h-9 object-contain drop-shadow-md shrink-0" />
            <div className="min-w-0">
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-white">
                Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
              </h2>
              <p className="text-[11px] text-stone-400 hidden sm:block truncate">
                Source-backed producer discovery and safer rural exploration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'about' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'faq' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 text-stone-200">
          {activeTab === 'about' ? (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 p-6 sm:p-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discovery first</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-white tracking-tight leading-snug max-w-3xl">
                  Find real makers without turning missing evidence into travel promises.
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                  TerroirTrail connects independent culinary travelers with wineries, breweries, olive mills, dairies, apiaries, traditional distilleries, and farms. The product separates what is known from what is merely assumed: producer identity, visitability, exact location and rural-road access are reviewed as distinct facts.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-5 border-t border-white/10">
                  <Metric value="27" label="Audited Crete records" />
                  <Metric value="7" label="Producer categories" />
                  <Metric value="Source-backed" label="Access confidence" />
                  <Metric value="Direct" label="Producer contact" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Principle
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title="Source-backed curation"
                  text="Unknown facts remain unknown. Public visitability is not presented as a partnership, and unsupported producer or road claims are withheld."
                />
                <Principle
                  icon={<MapPin className="w-5 h-5" />}
                  title="Rural navigation safety"
                  text="Exact location confidence and road-access confidence are separate. Draft routes and uncertain access fail closed rather than generating confident directions."
                />
                <Principle
                  icon={<Award className="w-5 h-5" />}
                  title="Personal travel journal"
                  text="Signed-in travelers can save places, record visits and keep private tasting or trip notes without a paid stamp limit."
                />
                <Principle
                  icon={<Building2 className="w-5 h-5" />}
                  title="Trusted producer ownership"
                  text="Producer claims are reviewed, and host privileges come from trusted ownership records instead of client-side profile switches."
                />
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>Greece first, then outward</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Crete is the current reference-quality catalogue, with 27 audited records. TerroirTrail is designed for Mediterranean and European expansion, but new regions must earn the same level of data, location and access confidence before they are treated as reference-quality coverage.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-stone-300 text-center sm:text-left">
                  Curated driving routes are not currently published as a public route feature while their stops and access conditions are being re-verified.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('faq')}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-white/15 text-xs font-bold transition cursor-pointer"
                  >
                    Read FAQ
                  </button>
                  {onOpenLoops && (
                    <button
                      type="button"
                      onClick={() => handleAction('loops')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Route status</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search visiting, routes, road access, passport, producer claims..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-900 border border-white/15 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400/80 transition"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                        selectedCategory === category.id
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-900 text-stone-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredFaqs.length === 0 ? (
                  <div className="p-8 text-center bg-stone-900/50 rounded-2xl border border-white/10 space-y-2">
                    <HelpCircle className="w-8 h-8 text-stone-500 mx-auto" />
                    <p className="text-sm font-bold text-white">No matching questions found</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 text-amber-300 text-xs font-bold cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isExpanded
                            ? 'bg-stone-900 border-amber-500/40 shadow-lg'
                            : 'bg-stone-900/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                              {faq.categoryLabel}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                              {faq.question}
                            </h4>
                          </div>
                          <div className="p-1 rounded-lg bg-stone-800 text-stone-300 shrink-0 mt-0.5">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-3 text-xs text-stone-300 space-y-3 border-t border-white/5">
                            <p className="leading-relaxed">{faq.answer}</p>
                            {faq.highlight && (
                              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-medium">
                                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                <span>{faq.highlight}</span>
                              </div>
                            )}
                            {faq.actionText && (
                              <button
                                type="button"
                                onClick={() => handleAction(faq.actionType)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition border border-white/10 cursor-pointer"
                              >
                                <span>{faq.actionText}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold text-white">Need to correct a listing or ask a question?</h4>
                  <p className="text-[11px] text-stone-400">Contact TerroirTrail or use the Host Portal for producer claims.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="mailto:terroirtrail@gmail.com"
                    className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-white/15 text-xs font-bold transition"
                  >
                    Email
                  </a>
                  {(onOpenProducerPortal || onOpenAuth) && (
                    <button
                      type="button"
                      onClick={() => handleAction('producer_portal')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      Host Portal
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 py-2.5 bg-stone-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 shrink-0">
          <span>Copyright © 2026 TerroirTrail · Independent agritourism discovery</span>
          {onOpenLegal && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal('privacy');
                }}
                className="hover:text-amber-400 underline transition cursor-pointer text-stone-400"
              >
                Privacy
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal('terms');
                }}
                className="hover:text-amber-400 underline transition cursor-pointer text-stone-400"
              >
                Terms
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal('licenses');
                }}
                className="hover:text-amber-400 underline transition cursor-pointer text-stone-400"
              >
                Licenses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="p-3 rounded-2xl bg-stone-950/60 border border-white/10 text-center">
    <div className="text-amber-400 text-sm sm:text-base font-mono font-bold break-words">{value}</div>
    <div className="text-[9px] text-stone-400 uppercase font-semibold tracking-wider mt-1">{label}</div>
  </div>
);

const Principle: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 space-y-2.5">
    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="font-bold text-white text-sm">{title}</h3>
    <p className="text-xs text-stone-300 leading-relaxed">{text}</p>
  </div>
);
