export type TravelerType = 
  | 'crete_local'
  | 'wine_enthusiast' 
  | 'craft_beer_explorer' 
  | 'culinary_nomad';

export type UserRole = 'traveler' | 'producer';

export type HostClaimStatus = 'unclaimed' | 'pending_verification' | 'verified_host';

export interface LogisticsPickupDetails {
  facilityName: string;
  streetAddress: string;
  postalCode: string;
  cityOrVillage: string;
  region: string;
  countryCode: 'GR' | 'IT' | string;
  accessType: 'standard_courier_van' | 'large_truck_ramp' | 'narrow_street_van_only' | 'forklift_available';
  contactPersonName: string;
  dispatchPhone: string;
  dispatchEmail: string;
  pickupTimeWindow: string;
  loadingNotes?: string;
}

export interface PackagingCapabilities {
  supportsWineBottles?: boolean;
  supportsBeerBottles?: boolean;
  supportsColdChainCheese?: boolean;
  supportsHoneyJars?: boolean;
  supportsOliveOilTins?: boolean;
  maxDailyParcels: number;
  dispatchLeadTime: 'same_day' | 'next_day' | 'two_days';
}

export interface BankingDetails {
  accountHolderName: string;
  bankName: string;
  iban: string;
  swiftBic: string;
  payoutCurrency: 'EUR' | string;
}

export interface RegulatoryPermits {
  gemiNumber?: string;
  excisePermitNumber?: string;
  sanitaryPermitNumber?: string;
  organicCertificationBody?: string;
  organicCertNumber?: string;
}

/**
 * A producer registration starts as a minimal ownership claim. Commercial,
 * logistics, banking, packaging and regulatory details are optional until the
 * producer actually supplies them. Never manufacture placeholder values simply
 * to satisfy this interface.
 */
export interface ProducerRegistrationRecord {
  id: string;
  producerId: string;
  userId?: string;
  tradeBrandName: string;
  producerCategory?: 'winery' | 'brewery' | 'distillery' | 'cheese_dairy' | 'apiary' | 'olive_oil' | 'farm' | 'other';

  // Fiscal & legal evidence supplied by the claimant.
  legalBusinessName?: string;
  legalEntityType?: 'sole_proprietorship' | 'general_partnership_oe' | 'limited_partnership_ee' | 'private_company_ike' | 'corporation_ae' | 'agricultural_coop' | 'italian_srl' | 'other';
  vatNumber?: string;
  taxOffice?: string;
  countryCode?: 'GR' | 'IT' | string;
  isVatVerified: boolean;
  vatVerificationDate?: string;
  eoriNumber?: string;

  // Optional future operational/commercial details. These must be supplied by
  // the producer and must never be inferred from category or geography.
  logistics?: LogisticsPickupDetails;
  packaging?: PackagingCapabilities;
  banking?: BankingDetails;
  permits?: RegulatoryPermits;

  // Representative & audit trail.
  representativeName?: string;
  representativeRole?: string;
  officialEmail: string;
  websiteStoreUrl?: string;

  status: 'draft' | 'pending_verification' | 'verified_active';
  submittedAt: string;
  updatedAt: string;
  notesFromProducer?: string;
  termsAccepted: boolean;
}

export interface ProducerTaxDetails {
  vatNumber: string;
  legalBusinessName: string;
  taxOffice?: string;
  registeredAddress?: string;
  dispatchContactPhone?: string;
  countryCode: 'GR' | 'IT' | string;
  isVatVerified: boolean;
  vatVerificationDate?: string;
  eoriNumber?: string;
  gemiNumber?: string;
  iban?: string;
  registrationRecord?: Partial<ProducerRegistrationRecord>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  hometown?: string;
  role?: UserRole;
  isProducer?: boolean;
  claimedProducerId?: string;
  producerName?: string;
  claimStatus?: HostClaimStatus;
  taxDetails?: ProducerTaxDetails;
  travelerType: TravelerType;
  visitedProducers: string[];
  personalNotes: Record<string, string>;
  memberSince: string;
  hasExplorerPass?: boolean;
  explorerPassUntil?: string;
  explorerPassId?: string;
  explorerPassPlan?: 'holiday' | 'annual';
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}
