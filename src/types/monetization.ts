export interface ChauffeurBooking {
  id: string;
  circuitId?: string;
  circuitTitle?: string;
  producerId?: string;
  producerName?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  pickupLocation: string;
  date: string;
  vehicleType: 'mercedes_van' | 'luxury_sedan';
  vehicleName: string;
  durationHours: number;
  guestsCount: number;
  totalPrice: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
}

export interface CuratedWineBox {
  id: string;
  name: string;
  tagline: string;
  bottlesCount: number;
  priceEur: number;
  coverImage: string;
  wines: {
    name: string;
    variety: string;
    estate: string;
    vintage: string;
    profile: string;
  }[];
  includes: string[];
}

export interface WineBoxOrder {
  id: string;
  boxId: string;
  boxName: string;
  bottlesCount: number;
  priceEur: number;
  shippingCountry: string;
  shippingCostEur: number;
  totalEur: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  status: 'submitted' | 'processing' | 'shipped';
  createdAt: string;
}

export interface ExplorerPass {
  isActive: boolean;
  tier: 'free' | 'explorer_pass';
  passNumber: string;
  validUntil: string;
  purchasedAt: string;
  priceEur: number;
}
