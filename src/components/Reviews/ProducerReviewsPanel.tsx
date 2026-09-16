import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Flag, Loader2, MessageSquareReply, Star, Trash2 } from 'lucide-react';
import type { UserProfile } from '../../types/auth';
import type { PublicProducerReview, ReviewReportReason } from '../../types/review';
import {
  deleteMyProducerReview,
  fetchProducerReviews,
  reportReview,
  saveHostReviewReply,
  saveMyProducerReview,
} from '../../services/reviewApi';

interface ProducerReviewsPanelProps {
  producerId: string;
  producerName: string;
  viewer?: UserProfile | null;
  onOpenAuth?: (role?: 'traveler' | 'producer') => void;
}

const formatDate = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const Stars: React.FC<{ rating: number; interactive?: boolean; onChange?: (rating: number) => void }> = ({
  rating,
  interactive = false,
  onChange,
}) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((value) => {
      const icon = (
        <Star
          className={`w-4 h-4 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`}
        />
      );
      return interactive ? (
        <button
          key={value}
          type="button"
          onClick={() => onChange?.(value)}
          className="p-0.5 rounded hover:bg-white/5 cursor-pointer"
          aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
        >
          {icon}
        </button>
      ) : (
        <span key={value}>{icon}</span>
      );
    })}
  </div>
);

const HostReplyEditor: React.FC<{
  review: PublicProducerReview;
  producerName: string;
  onSaved: () => Promise<void>;
}> = ({ review, producerName, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(review.hostReply?.comment || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(review.hostReply?.comment || '');
  }, [review.hostReply?.comment]);

  const save = async () => {
    if (draft.trim().length < 3) {
      setError('Write at least 3 characters.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveHostReviewReply(review.id, draft);
      setEditing(false);
      await onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save the Host reply.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
          Response from {producerName}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[10px] font-semibold text-amber-300 hover:text-amber-200 cursor-pointer"
          >
            {review.hostReply ? 'Edit response' : 'Reply as Host'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            maxLength={1200}
            placeholder="Reply publicly as the verified Host…"
            className="w-full rounded-xl border border-white/10 bg-stone-950 p-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-400/60"
          />
          {error && <p className="text-[10px] text-rose-300">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraft(review.hostReply?.comment || '');
                setError(null);
              }}
              className="px-2.5 py-1.5 text-[10px] text-stone-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold text-stone-950 disabled:opacity-50 cursor-pointer"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              Publish response
            </button>
          </div>
        </div>
      ) : review.hostReply ? (
        <p className="mt-1.5 text-xs leading-relaxed text-stone-300">{review.hostReply.comment}</p>
      ) : (
        <p className="mt-1.5 text-[11px] text-stone-500">No official Host response yet.</p>
      )}
    </div>
  );
};

const ReportReview: React.FC<{ reviewId: string }> = ({ reviewId }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReviewReportReason>('other');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setStatus('sending');
    setError(null);
    try {
      await reportReview(reviewId, reason);
      setStatus('sent');
      setOpen(false);
    } catch (caught) {
      setStatus('idle');
      setError(caught instanceof Error ? caught.message : 'Unable to report this review.');
    }
  };

  if (status === 'sent') {
    return <span className="text-[10px] text-stone-500">Reported for review</span>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-300 cursor-pointer"
      >
        <Flag className="w-3 h-3" /> Report
      </button>
      {open && (
        <div className="absolute right-0 bottom-6 z-20 w-48 rounded-xl border border-white/10 bg-stone-950 p-2.5 shadow-xl">
          <label className="block text-[10px] text-stone-400">
            Reason
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as ReviewReportReason)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-stone-900 px-2 py-1.5 text-[10px] text-stone-200"
            >
              <option value="spam">Spam</option>
              <option value="abuse">Abusive content</option>
              <option value="privacy">Privacy concern</option>
              <option value="other">Other</option>
            </select>
          </label>
          {error && <p className="mt-1 text-[9px] text-rose-300">{error}</p>}
          <button
            type="button"
            onClick={() => void submit()}
            disabled={status === 'sending'}
            className="mt-2 w-full rounded-lg bg-stone-800 px-2 py-1.5 text-[10px] font-semibold text-stone-200 disabled:opacity-50 cursor-pointer"
          >
            Submit report
          </button>
        </div>
      )}
    </div>
  );
};

export const ProducerReviewsPanel: React.FC<ProducerReviewsPanelProps> = ({
  producerId,
  producerName,
  viewer,
  onOpenAuth,
}) => {
  const [reviews, setReviews] = useState<PublicProducerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProducerReviews(producerId);
      setReviews(response.reviews);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Community reviews are unavailable.');
    } finally {
      setLoading(false);
    }
  }, [producerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const ownReview = reviews.find((review) => review.isOwnReview);
  const isHostForProducer = Boolean(viewer?.producerIds?.includes(producerId));

  useEffect(() => {
    if (ownReview) {
      setRating(ownReview.rating);
      setComment(ownReview.comment);
    } else {
      setRating(5);
      setComment('');
    }
  }, [ownReview?.id, ownReview?.rating, ownReview?.comment]);

  const average = useMemo(() => {
    if (reviews.length === 0) return null;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  const saveReview = async () => {
    if (!viewer) {
      onOpenAuth?.('traveler');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveMyProducerReview(producerId, rating, comment);
      await reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save your review.');
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async () => {
    if (!ownReview || !window.confirm('Delete your review permanently?')) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteMyProducerReview(producerId);
      await reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to delete your review.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="terroirtrail-reviews-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="terroirtrail-reviews-heading" className="text-sm font-bold text-white">
            Ratings & traveler comments
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
            TerroirTrail community reviews are separate from third-party ratings. Hosts may respond, but cannot edit traveler reviews or rate their own listing.
          </p>
        </div>
        {average != null && (
          <div className="shrink-0 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-center">
            <div className="text-lg font-black text-amber-300">{average.toFixed(1)}</div>
            <div className="text-[9px] text-stone-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</div>
          </div>
        )}
      </div>

      {!isHostForProducer && (
        <div className="rounded-2xl border border-white/10 bg-stone-900/70 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-white">{ownReview ? 'Edit your review' : 'Share your experience'}</div>
            <Stars rating={rating} interactive onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What should another independent traveler know about this place?"
            disabled={!viewer}
            className="w-full rounded-xl border border-white/10 bg-stone-950 p-2.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60 disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-stone-600">One public review per traveler per producer.</span>
            <div className="flex items-center gap-2">
              {ownReview && (
                <button
                  type="button"
                  onClick={() => void deleteReview()}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 px-2.5 py-1.5 text-[10px] font-semibold text-rose-300 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => void saveReview()}
                disabled={saving || (viewer ? comment.trim().length < 3 : false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold text-stone-950 disabled:opacity-50 cursor-pointer"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {viewer ? (ownReview ? 'Update review' : 'Publish review') : 'Sign in to review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isHostForProducer && (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[11px] leading-relaxed text-sky-200">
          You manage this listing, so you cannot rate it. You can publish an official Host response beneath each traveler review.
        </div>
      )}

      {error && <div role="alert" className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-[11px] text-rose-200">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-stone-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading community reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-stone-900/40 p-5 text-center text-xs text-stone-500">
          No TerroirTrail traveler reviews yet. Be the first to share a useful, factual visit experience.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-white/10 bg-stone-900/60 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{review.travelerName}</span>
                    {review.verifiedVisit && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified visit
                      </span>
                    )}
                    {review.isOwnReview && <span className="text-[9px] text-stone-500">Your review</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={review.rating} />
                    <span className="text-[9px] text-stone-600">{formatDate(review.updatedAt || review.createdAt)}</span>
                  </div>
                </div>
                {viewer && !review.isOwnReview && <ReportReview reviewId={review.id} />}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-stone-300">{review.comment}</p>

              {isHostForProducer ? (
                <HostReplyEditor review={review} producerName={producerName} onSaved={reload} />
              ) : review.hostReply ? (
                <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    <MessageSquareReply className="w-3 h-3" /> Response from {producerName}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-300">{review.hostReply.comment}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
