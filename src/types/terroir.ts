export type Category = 
  | 'winery' 
  | 'kazani' 
  | 'olive_mill' 
  | 'olive_oil_producer'
  | 'cheese_dairy' 
  | 'apiary'
  | 'brewery'
  | 'farm';

export type ProducerCategory = Category;

export type Destination = 
  | 'crete' 
  | 'santorini' 
  | 'peloponnese' 
  | 'northern_greece'
  | 'tuscany';

export type RoadAccess = 
  | 'paved'
  | 'narrow_paved'
  | 'gravel_ok'
  | 'unpaved_passable'
  | 'high_clearance_recommended'
  | '4x4_required';

export type RoadAccessStatus =
  | 'unreviewed'
  | 'verified'
  | 'not_publicly_confirmed'
  | 'current_access_uncertain';

export type Ethos = 
  | 'organic' 
  | 'biodynamic' 
  | 'indigenous_only' 
  | 'amphora' 
  | 'family_estate' 
  | 'ancient_groves'
  | 'wood_fired'
  | 'raw_milk'
  | 'unpasteurized'
  | 'craft_batch';

export type FoodOption = 
  | 'full_taverna' 
  | 'tasting_board' 
  | 'dakos_snacks' 
  | 'brewery_taproom'
  | 'byo_picnic';

export type PublicPointType =
  | 'production_site'
  | 'producer_shop'
  | 'estate'
  | 'visitor_center'
  | 'other_verified_point';

export interface VipPerks {
  welcomePour?: string;
  freeMeze?: string;
  discountPercent?: number;
}

export interface PhotoCredit {
  author: string;
  source: string; // e.g. "Wikimedia Commons", "Estate Press Kit", "Unsplash Free License"
  license?: string; // e.g. "CC BY-SA 4.0", "CC BY 2.0", "Press License"
  url?: string;
}

export type LocationStatus = 
  | 'unreviewed'
  | 'verified_entrance' 
  | 'verified_location' 
  | 'unresolved';

export type VisitStatus = 
  | 'public_visits' 
  | 'seasonal_public' 
  | 'appointment_only' 
  | 'not_publicly_confirmed' 
  | 'current_access_uncertain' 
  | 'unreviewed';

export interface Producer {
  id: string;
  name: string;
  greekName: string;
  category: Category;
  destination: Destination;
  country?: string; // e.g. "Greece", "Italy"
  countryCode?: string; // e.g. "GR", "IT"
  region: string; // e.g. "Chania", "Heraklion", "Tuscany", "Nemea", "Naoussa"
  village: string; // Locality / Village
  locality?: string; // Explicit locality alias
  coordinates: [number, number]; // [lat, lng]
  coverImage: string;
  gallery: string[];
  photoCredit?: PhotoCredit;
  galleryCredits?: PhotoCredit[];
  tagLine: string;
  description: string;
  story: string;
  indigenousVarieties: string[]; // e.g. ["Vidiano", "Assyrtiko", "Agiorgitiko", "Craft IPA", "Fresh Lager"]
  tastingHighlights: string[];
  openingHours: string;
  bestSeason?: string;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  /** Manually audited Google Maps business identity. Never inferred from coordinates. */
  googlePlaceId?: string;
  roadAccess?: RoadAccess;
  roadAccessStatus?: RoadAccessStatus | string;
  roadAccessSourceUrl?: string;
  roadAccessNotes?: string;
  ethos: Ethos[];
  foodOption?: FoodOption;
  dogFriendly?: boolean;
  kidFriendly?: boolean;
  walkInFriendly?: boolean;
  campervanFriendly?: boolean;
  priceLevel?: '€' | '€€' | '€€€';
  rating?: number;
  reviewCount?: number;
  vipPerks?: VipPerks;

  // Verification & Visitability Authority
  locationStatus?: LocationStatus | string;
  locationSourceUrl?: string;
  locationNotes?: string;
  /** Role of the verified mapped point. This is separate from producer category and producer visitability. */
  publicPointType?: PublicPointType | string;
  visitStatus?: VisitStatus | string;
  visitSourceUrl?: string;
  visitNotes?: string;
}

export interface DayTripLoop {
  id: string;
  title: string;
  greekTitle: string;
  subtitle: string;
  destination: Destination;
  region: string;
  totalDuration: string;
  drivingDistance: string;
  stops: {
    producerId: string;
    suggestedTime: string;
    activity: string;
  }[];
  description: string;
  highlightPointers: string[];
  isVipOnly?: boolean;
  /**
   * Route publication and driving verification are intentionally separate:
   * - draft: not published as a usable guide
   * - verified_stops: stop identities/locations are verified, but route driving is withheld
   * - verified: stop locations and normal-road access have passed the driving audit
   *
   * Only fully verified routes may expose multi-stop turn-by-turn navigation.
   */
  verificationStatus?: 'draft' | 'verified_stops' | 'verified';
}

export interface FilterState {
  category: Category | 'all';
  destination: Destination | 'all';
  roadAccess: RoadAccess | 'all';
  ethos: Ethos | 'all';
  foodOption: FoodOption | 'all';
  searchQuery: string;
  dogFriendlyOnly: boolean;
  walkInOnly: boolean;
  campervanOnly: boolean;
  favoritesOnly: boolean;
}
