export type TravelerType = 
  | 'crete_local'
  | 'wine_enthusiast' 
  | 'craft_beer_explorer' 
  | 'culinary_nomad';

export type UserRole = 'traveler' | 'producer';

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
