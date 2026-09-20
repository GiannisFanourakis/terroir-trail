import React, { useState } from 'react';
import { Building2, FileText, Scale, ShieldCheck, X } from 'lucide-react';

type LegalTab = 'privacy' | 'terms' | 'producers' | 'licenses';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

const tabLabel: Record<LegalTab, string> = {
  privacy: 'Privacy',
  terms: 'Terms',
  producers: 'Producer Policy',
  licenses: 'Licenses',
};

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 sm:px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-white truncate">
                Legal & Transparency
              </h2>
              <p className="text-[11px] text-stone-400 truncate">
                Current launch-state privacy, terms and producer-policy information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer shrink-0"
            aria-label="Close legal information"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 border-b border-white/10 bg-stone-900/60 p-1.5 text-[10px] sm:text-xs font-semibold gap-1 shrink-0">
          {(Object.keys(tabLabel) as LegalTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 rounded-lg text-center transition ${
                activeTab === tab
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tabLabel[tab]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-xs sm:text-sm text-stone-300 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">Privacy at the current launch stage</h3>
                  <p className="text-[11px] text-stone-300 mt-1">
                    TerroirTrail is currently a discovery-first product across Greece and Italy (Crete, Santorini, Peloponnese, Macedonia, Greece, and Tuscany). Public tasting reservations, consumer Explorer Pass purchases via Stripe, and display advertising are dormant or inactive in this release.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Information used by traveler accounts</h4>
                <p>
                  Authentication and account features may use your name, email address, authentication identifier, optional profile information, Passport stamp IDs and private tasting notes. Passport stamps and notes can be stored in the authenticated cloud profile.
                </p>
                <p>
                  Saved favorites are currently device-local. Signed-in favorites are separated by account on that browser.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Producer claims</h4>
                <p>
                  A producer claimant may submit their account identity, selected estate and optional business evidence. A submitted email, Google sign-in or correctly formatted VAT / tax identifier is evidence only and does not automatically grant host authority.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Location, storage, affiliates and advertising</h4>
                <p>
                  User-initiated device location can be used to support map features; TerroirTrail does not intentionally run background location tracking. Browser local storage is used for device-local preferences such as favorites.
                </p>
                <p>
                  Outbound links to third-party travel services (such as car rentals, transfers, or ferries via Travelpayouts) do not transmit personal profile data or set tracking cookies. Explorer Pass holders enjoy an ad-free experience. Display advertising (Google AdSense) and live consumer pass purchases (Stripe) are currently disabled/dormant.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">First-party intent analytics</h4>
                <p>
                  TerroirTrail records narrow first-party interaction events to improve the discovery guide. Pseudonymous raw events are kept for up to 180 days; non-identifying daily aggregates for up to 24 months.
                </p>
                <p>
                  Session identifiers rotate in session storage; signed-in account IDs are HMAC-pseudonymized server-side. Account export includes retained linked events, and account deletion removes them while non-identifying aggregates remain. We do not use third-party behavioral analytics or ad-network pixels.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Privacy requests & account deletion</h4>
                <p>
                  Authenticated users may download a machine-readable data export or permanently delete their account at any time via the in-app <strong>Account & privacy</strong> settings. Requests to access, correct or delete account-related personal information can also be sent to{' '}
                  <a href="mailto:terroirtrail@gmail.com" className="text-amber-400 underline">
                    terroirtrail@gmail.com
                  </a>.
                </p>
                <p className="text-[11px] text-stone-400">
                  The fuller public privacy notice is available at <a href="/privacy.html" className="text-amber-400 underline">/privacy.html</a>.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">Current service terms</h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    TerroirTrail is a curated discovery guide, not the operator of the independent businesses listed on the platform.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Discovery, not guaranteed availability</h4>
                <p>
                  Producer listings, contact details, visit information and access notes are researched for usefulness, but business hours, seasonal access and availability can change. Travelers should confirm time-sensitive visit details directly with the producer using producer-controlled contact channels.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">No public TerroirTrail booking promise</h4>
                <p>
                  The current launch product does not promise TerroirTrail-operated tasting reservations, payments, deposits, chauffeur services or published commercial Experiences. Those workflows remain future features unless explicitly introduced with the relevant producer or service-provider agreement.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Rural travel and navigation</h4>
                <p>
                  Location and road-access confidence are separate. TerroirTrail suppresses or limits normal navigation when exact location or access confidence is unresolved, uncertain or requires special vehicle review. Travelers remain responsible for current road conditions, vehicle restrictions, local rules and safe driving decisions.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Independent third parties</h4>
                <p>
                  Producers, map providers, linked websites and other third parties operate independently. A researched listing does not itself mean that the producer has entered a commercial partnership with TerroirTrail.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Travel affiliate links</h4>
                <p>
                  TerroirTrail may feature outbound affiliate links for travel services (car hire, transfers, ferries, connectivity via Travelpayouts). TerroirTrail is not an online travel agency or transportation provider; third-party bookings are fulfilled directly by independent providers under their own terms.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'producers' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">Producer listing & claim policy</h3>
                  <p className="text-[11px] text-stone-300 mt-1">
                    Discovery listings and verified host ownership are separate states.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Researched listings</h4>
                <p>
                  TerroirTrail may include an independent producer or rural project using source-backed public information. Inclusion is editorial discovery coverage and does not imply sponsorship, endorsement, booking permission or a paid relationship.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Claiming a listing</h4>
                <p>
                  A claimant can submit evidence that they represent an estate. Claims remain pending until reviewed. Trusted producer ownership is assigned through the backend/operator workflow and cannot be self-assigned from ordinary frontend profile fields.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Corrections and disputes</h4>
                <p>
                  Producers may request factual corrections, provide updated official information or dispute a listing by contacting{' '}
                  <a href="mailto:terroirtrail@gmail.com" className="text-amber-400 underline">
                    terroirtrail@gmail.com
                  </a>. TerroirTrail may correct, quarantine or remove unsupported content while a dispute is reviewed.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Future Experiences</h4>
                <p>
                  Public visitability is not TerroirTrail booking permission. A TerroirTrail Experience should only be published after explicit producer agreement covering the activity, pricing, schedule, capacity, inclusions and booking process.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'licenses' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 flex items-start gap-3">
                <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">Open-source & content notices</h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Application code, map data, third-party packages and producer imagery can have different rights and licenses.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-white">TerroirTrail software</h4>
                <p>
                  The TerroirTrail application, proprietary schemas, and brand assets are proprietary works owned by TerroirTrail (All Rights Reserved). Open-source libraries and bundled dependencies remain subject to their respective licenses. See LICENSE.md for complete terms.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Geospatial and map data</h4>
                <p>
                  Map layers include regional terroir boundaries sourced from geoBoundaries (CC BY 4.0), Eurostat GISCO NUTS, and base tiles from OpenStreetMap (ODbL), CARTO, and Esri. Third-party attributions remain visible across all interactive maps.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">Producer images and editorial content</h4>
                <p>
                  A software license does not automatically grant rights to third-party photographs, producer logos or editorial source material. Official producer photos may also be loaded via verified Google Places media.
                </p>
              </section>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-7 py-3 border-t border-white/10 bg-stone-900/50 text-[10px] text-stone-500 flex items-center justify-between gap-3 shrink-0">
          <span>Last product-alignment review: 17 Sep 2026</span>
          <a href="mailto:terroirtrail@gmail.com" className="text-amber-400 hover:text-amber-300 underline">
            Contact TerroirTrail
          </a>
        </div>
      </div>
    </div>
  );
};
