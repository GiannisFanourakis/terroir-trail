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
  pickupTimeWindow: string; // e.g. "09:00 - 15:00 Mon-Fri"
  loadingNotes?: string;
}

export interface PackagingCapabilities {
  supportsWineBottles?: boolean;       // Standard 0.75L wine bottles (1, 3, 6, 12 cartons)
  supportsBeerBottles?: boolean;       // 0.33L / 0.5L craft beer bottles
  supportsColdChainCheese?: boolean;   // Vacuum-sealed with thermal liner + ice packs
  supportsHoneyJars?: boolean;         // Break-resistant air-cushioned jar packaging
  supportsOliveOilTins?: boolean;      // Metal canisters / dark glass bottles
  maxDailyParcels: number;             // e.g. 25 parcels / day
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
  gemiNumber?: string;                 // National Commercial Company Registry
  excisePermitNumber?: string;         // Regulated Alcohol Production / Excise Warehouse Permit
  sanitaryPermitNumber?: string;       // Food & Health Safety Permit (HACCP / EFSA)
  organicCertificationBody?: string;   // e.g. BIO Hellas, DIO, ICEA, Ecocert
  organicCertNumber?: string;          // Certification serial
}

export interface ProducerRegistrationRecord {
  id: string;                          // Primary key, matches producerId
  producerId: string;                  // e.g. 'domaine-paterianakis'
  userId?: string;                     // Claiming user profile ID
  tradeBrandName: string;              // e.g. 'Domaine Paterianakis'
  producerCategory: 'winery' | 'brewery' | 'distillery' | 'cheese_dairy' | 'apiary' | 'olive_oil';
  
  // 1. Fiscal & Legal
  legalBusinessName: string;           // Registered corporate name
  legalEntityType: 'sole_proprietorship' | 'general_partnership_oe' | 'limited_partnership_ee' | 'private_company_ike' | 'corporation_ae' | 'agricultural_coop' | 'italian_srl' | 'other';
  vatNumber: string;                   // EU VAT or Tax ID
  taxOffice: string;                   // Competent Tax Authority / Office
  countryCode: 'GR' | 'IT' | string;
  isVatVerified: boolean;
  vatVerificationDate?: string;
  eoriNumber?: string;                 // Customs EORI
  
  // 2. Logistics & Courier Pickup
  logistics: LogisticsPickupDetails;
  
  // 3. Packaging & Box Capabilities
  packaging: PackagingCapabilities;
  
  // 4. Banking & Direct Payouts
  banking: BankingDetails;
  
  // 5. Licenses & Certifications
  permits: RegulatoryPermits;
  
  // 6. Representative & Audit
  representativeName: string;
  representativeRole: string;
  officialEmail: string;
  websiteStoreUrl?: string;
  
  status: 'draft' | 'pending_verification' | 'verified_active';
  submittedAt: string;
  updatedAt: string;
  notesFromProducer?: string;
  termsAccepted: boolean;
}

export interface ProducerTaxDetails {
  vatNumber: string;               // e.g. "EL999999991" (Demo VAT ID) or "IT99999999990" (Demo Partita IVA)
  legalBusinessName: string;       // Official registered business entity name
  taxOffice?: string;              // e.g. "Heraklion Tax Office" or "Tax Office of Siena"
  registeredAddress?: string;      // Official fiscal seat & courier pickup location
  dispatchContactPhone?: string;   // Cellar/dispatch contact for transport & courier logistics
  countryCode: 'GR' | 'IT' | string;
  isVatVerified: boolean;
  vatVerificationDate?: string;
  eoriNumber?: string;             // EU Customs EORI for international alcohol shipping
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
  claimedProducerId?: string; // Links to Producer.id (e.g. 'domaine-paterianakis')
  producerName?: string; // Cached display name of their estate
  claimStatus?: HostClaimStatus;
  taxDetails?: ProducerTaxDetails; // Fiscal, invoicing & shipping registration
  travelerType: TravelerType;
  visitedProducers: string[]; // List of producer IDs stamped/visited
  personalNotes: Record<string, string>; // producerId -> personal tasting note
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
