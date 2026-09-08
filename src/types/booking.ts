import { ProducerCategory, Destination } from './terroir';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface TastingExperience {
  id: string;
  title: string;
  durationMinutes: number;
  pricePerPerson: number;
  description: string;
  includes: string[];
  producerId?: string;
  producerName?: string;
  producerGreekName?: string;
  category?: ProducerCategory;
  destination?: Destination;
  location?: string;
  badge?: string;
}

export interface TastingBooking {
  id: string;
  producerId: string;
  producerName: string;
  producerCategory: ProducerCategory;
  producerLocation: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "11:30 AM"
  experienceId: string;
  experienceTitle: string;
  pricePerPerson: number;
  guestsCount: number;
  totalEstimated: number;
  specialRequests?: string;
  status: BookingStatus;
  createdAt: string;
  confirmedAt?: string;
}

export interface ProducerOverride {
  producerId: string;
  customNotice?: string;
  customHours?: string;
  isAcceptingBookings: boolean;
  contactEmail?: string;
  contactPhone?: string;
  isProTier?: boolean;
  directBottleShopUrl?: string;
  hasChauffeurPartnership?: boolean;
  updatedAt: string;
}
