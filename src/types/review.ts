export type ReviewReportReason = 'spam' | 'abuse' | 'privacy' | 'other';

export interface PublicHostReply {
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProducerReview {
  id: string;
  producerId: string;
  travelerName: string;
  rating: number;
  comment: string;
  verifiedVisit: boolean;
  createdAt: string;
  updatedAt: string;
  hostReply?: PublicHostReply;
  isOwnReview: boolean;
}
