import type { FoodOption } from './terroir';

export type ProducerListingChangeStatus = 'pending_review' | 'approved' | 'rejected';

export interface ProducerListingChanges {
  tagLine?: string;
  description?: string;
  story?: string;
  tastingHighlights?: string[];
  website?: string;
  foodOption?: FoodOption | null;
  dogFriendly?: boolean;
  kidFriendly?: boolean;
  walkIn?: boolean;
  campervanFriendly?: boolean;
}

export interface ProducerListingChangeRequest {
  id: string;
  producerId: string;
  producerName: string;
  requesterUid: string;
  requesterEmail?: string;
  status: ProducerListingChangeStatus;
  changes: ProducerListingChanges;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByUid?: string;
  rejectionReason?: string;
}
