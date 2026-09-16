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
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface AboutFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'faq' | 'contact';
  onOpenLoops?: () => void;
  onOpenAuth?: (role?: 'traveler' | 'producer') => void;
  onOpenProducerPortal?: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'licenses') => void;
}

type FaqCategory = 'about' | 'visiting' | 'passport' | 'routes' | 'producers';
type FaqAction = 'loops' | 'producer_portal' | 'auth_traveler';
type AboutTab = 'about' | 'faq' | 'contact';

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

const CONTACT_EMAIL = 'terroirtrail@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/terroirtrail/';

const FAQ_DATA: FaqItem[] = [
  {
    id: 'what-is-terroirtrail',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'What is TerroirTrail?',
    answer:
      'TerroirTrail is an independent producer and agritourism guide for culinary travelers, road-trippers and slow travelers. It helps people discover wineries, breweries, olive mills, dairies, apiaries, traditional distilleries and farms, with direct producer contact and clear information about visiting, location and access where those details are known.',
    highlight: 'Independent producer discovery built around useful, practical travel information.',
  },
  {
    id: 'categories-included',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'What categories of producers are included?',
    answer:
      'TerroirTrail curates seven first-class producer categories: Wineries, Breweries, Olive Mills, Dairies / Cheesemakers, Apiaries / Honey, Rakokazana / Traditional Distilleries, and Farms.',
    highlight: 'Seven producer categories are presented under the same research standard.',
  },
  {
    id: 'how-producers-selected',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'How are listings researched?',
    answer:
      'Listings are researched from producer websites, reliable public sources and direct evidence when available. TerroirTrail separates producer identity, visiting information, location and road access so uncertain details can be shown as uncertain rather than guessed.',
  },
  {
    id: 'coverage',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'Which regions are currently covered?',
    answer:
      'TerroirTrail currently includes 62 producer records across Crete, Santorini, the Peloponnese, Northern Greece and Tuscany. Coverage will expand across Greece, Italy and other European regions as new records meet the same research and presentation standard.',
    highlight: 'The catalogue already reaches beyond Greece while keeping a consistent research standard.',
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
    categoryLabel: 'Discovery Guides & Rural Access',
    question: 'Are Discovery Guides available?',
    answer:
      'Yes. Discovery Guides group researched producers into useful themed or geographic collections. They are discovery tools rather than a guarantee that every rural road is suitable for every vehicle, so individual access notes still matter.',
    highlight: 'Use Discovery Guides for inspiration, then check each producer’s current visit and access information.',
    actionText: 'Browse Discovery Guides',
    actionType: 'loops',
  },
  {
    id: 'road-access',
    category: 'routes',
    categoryLabel: 'Discovery Guides & Rural Access',
    question: 'How does TerroirTrail handle rural road access?',
    answer:
      'TerroirTrail treats location and road access as separate facts. When useful access information is available, it is shown on the listing; when it is not, the site does not invent a road condition.',
  },
  {
    id: 'producer-claim',
    category: 'producers',
    categoryLabel: 'For Producers',
    question: 'I own or represent a listed producer. How can I manage the listing?',
    answer:
      'Use the Host Portal to sign in or submit a producer claim. Host privileges are granted only from trusted ownership records after review; they cannot be self-assigned by changing browser or profile data.',
    highlight: 'Producer ownership is reviewed before host access is granted.',
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
  const [activeTab, setActiveTab] = useState<AboutTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | FaqCategory>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const categories: Array<{ id: 'all' | FaqCategory; label: string }> = [
    { id: 'all', label: 'All Questions' },
    { id: 'about', label: '🌍 About & Curation' },
    { id: 'visiting', label: '🍷 Visiting Producers' },
    { id: 'passport', label: '🎖️ Traveler Passport' },
    { id: 'routes', label: '🧭 Discovery Guides & Access' },
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
        <div className="px-3 sm:px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/logo.png" alt="TerroirTrail" className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md shrink-0" />
            <div className="min-w-0">
              <h2 className="font-serif-title text-sm sm:text-lg font-bold text-white">
                Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
              </h2>
              <p className="text-[11px] text-stone-400 hidden sm:block truncate">
                Independent Producer & Agritourism Guide
              </p>
            </div>
          </div>

          <div className="order-3 flex w-full min-w-0 max-w-full items-center justify-center gap-0.5 overflow-x-auto p-1 bg-stone-950 rounded-2xl border border-white/10 sm:order-none sm:w-auto sm:gap-1 sm:overflow-visible">
            <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<BookOpen className="w-3.5 h-3.5" />} label="About" />
            <TabButton active={activeTab === 'faq'} onClick={() => setActiveTab('faq')} icon={<HelpCircle className="w-3.5 h-3.5" />} label="FAQ" />
            <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} icon={<Mail className="w-3.5 h-3.5" />} label="Contact" />
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
                  <span>Independent discovery</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-white tracking-tight leading-snug max-w-3xl">
                  Discover independent makers and the places behind what they make.
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                  TerroirTrail helps culinary travelers find wineries, breweries, olive mills, dairies, apiaries, traditional distilleries and farms — with direct producer contact, clear visiting information and practical access notes.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-5 border-t border-white/10">
                  <Metric value="62" label="Producer records" />
                  <Metric value="7" label="Producer categories" />
                  <Metric value="Direct" label="Maker contact" />
                  <Metric value="Clear" label="Visit & access notes" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Principle
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title="Independent curation"
                  text="The catalogue is built for travelers who want to move beyond generic tourism directories and discover producers in their own setting."
                />
                <Principle
                  icon={<MapPin className="w-5 h-5" />}
                  title="Useful visiting information"
                  text="Visit status, location and access notes are shown when supported by evidence, while uncertain details stay clearly marked as uncertain."
                />
                <Principle
                  icon={<Award className="w-5 h-5" />}
                  title="Your travel journal"
                  text="Signed-in travelers can save places, record visits and keep private tasting or trip notes as they explore."
                />
                <Principle
                  icon={<Building2 className="w-5 h-5" />}
                  title="Direct producer connection"
                  text="Official contact details make it easier to reach makers directly and confirm current visiting arrangements before you travel."
                />
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>Across Greece and into Italy</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  The current catalogue spans Crete, Santorini, the Peloponnese, Northern Greece and Tuscany. TerroirTrail is designed to grow into more Mediterranean and European regions without losing the same research standard.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-stone-300 text-center sm:text-left">
                  Discovery Guides turn researched producers into themed and regional collections for trip inspiration. Check each producer’s current visiting and access information before setting out.
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
                      <span>Discovery Guides</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'faq' ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search visiting, guides, road access, passport, producer claims..."
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
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                  <h4 className="text-sm font-bold text-white">Still have a question?</h4>
                  <p className="mt-1 text-[11px] text-stone-400">Email us or find TerroirTrail on Instagram.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact us
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Mail className="w-4 h-4" />
                  <span>Get in touch</span>
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-bold font-serif-title text-white">Contact TerroirTrail</h1>
                <p className="mt-3 max-w-2xl text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Questions, listing corrections, producer enquiries or collaboration ideas are welcome. For current visit times, prices or same-day arrangements, contact the producer directly through the official details on its listing.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
                <div className="space-y-4">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="group block p-5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Email</div>
                        <div className="mt-1 text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition break-all">{CONTACT_EMAIL}</div>
                        <div className="mt-1 text-[11px] text-stone-400">Questions, corrections, producer enquiries and collaborations.</div>
                      </div>
                    </div>
                  </a>

                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group block p-5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 text-base font-black">
                        @
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Instagram</div>
                        <div className="mt-1 text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">@TERROIRTRAIL</div>
                        <div className="mt-1 text-[11px] text-stone-400">Follow the project and message us on Instagram.</div>
                      </div>
                    </div>
                  </a>

                  {(onOpenProducerPortal || onOpenAuth) && (
                    <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">Are you a listed producer?</div>
                        <p className="mt-1 text-[11px] text-stone-400">Use the Host Portal to claim or manage your producer presence.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAction('producer_portal')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
                      >
                        Host Portal
                      </button>
                    </div>
                  )}
                </div>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group p-4 rounded-2xl bg-stone-900 border border-white/10 text-center self-start"
                  aria-label="Open TerroirTrail on Instagram"
                >
                  <div className="rounded-2xl bg-white p-3 shadow-lg transition group-hover:scale-[1.01]">
                    <img
                      src="/terroirtrail-instagram-qr.svg"
                      alt="QR code for TerroirTrail on Instagram"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-stone-200 group-hover:text-amber-300 transition">
                    <span className="text-sm font-black">@</span>
                    @TERROIRTRAIL
                  </div>
                  <div className="mt-1 text-[10px] text-stone-500">Scan to open Instagram</div>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 py-2.5 bg-stone-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 shrink-0">
          <span>Copyright © 2026 TerroirTrail · Independent agritourism discovery</span>
          {onOpenLegal && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { onClose(); onOpenLegal('privacy'); }} className="hover:text-amber-400 underline transition cursor-pointer text-stone-400">Privacy</button>
              <span>·</span>
              <button type="button" onClick={() => { onClose(); onOpenLegal('terms'); }} className="hover:text-amber-400 underline transition cursor-pointer text-stone-400">Terms</button>
              <span>·</span>
              <button type="button" onClick={() => { onClose(); onOpenLegal('licenses'); }} className="hover:text-amber-400 underline transition cursor-pointer text-stone-400">Licenses</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer ${
      active ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

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
