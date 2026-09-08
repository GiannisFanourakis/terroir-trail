export type Category = 
  | 'winery' 
  | 'kazani' 
  | 'olive_mill' 
  | 'cheese_dairy' 
  | 'apiary';

export type Region = 
  | 'chania' 
  | 'rethymno' 
  | 'heraklion' 
  | 'lasithi';

export type RoadAccess = 
  | 'paved' 
  | 'gravel_ok' 
  | '4x4_required';

export type Ethos = 
  | 'organic' 
  | 'biodynamic' 
  | 'indigenous_only' 
  | 'amphora' 
  | 'family_estate' 
  | 'ancient_groves'
  | 'wood_fired'
  | 'raw_milk';

export type FoodOption = 
  | 'full_taverna' 
  | 'tasting_board' 
  | 'dakos_snacks' 
  | 'byo_picnic';

export interface Producer {
  id: string;
  name: string;
  greekName: string;
  category: Category;
  region: Region;
  village: string;
  coordinates: [number, number]; // [lat, lng]
  coverImage: string;
  gallery: string[];
  tagLine: string;
  description: string;
  story: string;
  indigenousVarieties: string[]; // e.g. ["Vidiano", "Liatiko", "Koroneiki", "Graviera"]
  tastingHighlights: string[];
  openingHours: string;
  bestSeason?: string;
  phone?: string;
  website?: string;
  googleMapsUrl: string;
  roadAccess: RoadAccess;
  ethos: Ethos[];
  foodOption: FoodOption;
  dogFriendly: boolean;
  kidFriendly: boolean;
  walkInFriendly: boolean;
  campervanFriendly: boolean;
  priceLevel: '€' | '€€' | '€€€';
  rating: number;
  reviewCount: number;
}

export interface DayTripLoop {
  id: string;
  title: string;
  greekTitle: string;
  subtitle: string;
  region: Region;
  totalDuration: string;
  drivingDistance: string;
  stops: {
    producerId: string;
    suggestedTime: string;
    activity: string;
  }[];
  description: string;
  highlightPointers: string[];
}

export interface FilterState {
  category: Category | 'all';
  region: Region | 'all';
  roadAccess: RoadAccess | 'all';
  ethos: Ethos | 'all';
  foodOption: FoodOption | 'all';
  searchQuery: string;
  dogFriendlyOnly: boolean;
  walkInOnly: boolean;
  campervanOnly: boolean;
}
