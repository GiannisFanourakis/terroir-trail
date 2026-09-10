export type TravelerType = 
  | 'crete_local'
  | 'wine_enthusiast' 
  | 'craft_beer_explorer' 
  | 'culinary_nomad';

export type UserRole = 'traveler' | 'producer';

export type HostClaimStatus = 'unclaimed' | 'pending_verification' | 'verified_host';

export interface ProducerTaxDetails {
  vatNumber: string;               // e.g. "EL999999991" (Demo Greek ΑΦΜ) or "IT99999999990" (Demo Partita IVA)
  legalBusinessName: string;       // Official registered business entity name (Επωνυμία)
  taxOffice?: string;              // e.g. "Δ.Ο.Υ. Ηρακλείου"
  registeredAddress?: string;      // Official fiscal seat & courier pickup location
  dispatchContactPhone?: string;   // Cellar/dispatch contact for transport & courier logistics
  countryCode: 'GR' | 'IT' | string;
  isVatVerified: boolean;
  vatVerificationDate?: string;
  eoriNumber?: string;             // EU Customs EORI for international alcohol shipping
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
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

