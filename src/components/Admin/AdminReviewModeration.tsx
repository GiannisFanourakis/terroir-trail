import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Flag, Loader2, ShieldAlert, Star } from 'lucide-react';
import {
  dismissCommunityReviewReport,
  fetchPendingReviewReports,
  moderateCommunityReview,
  type PendingReviewReport,
} from '../../services/adminReviewApi';

interface AdminReviewModerationProps {
  enabled: boolean;
  onChanged?: () => void;
}

const Rating = ({ value }: { value: number }) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300">
    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {value}/5
  </span>
);

export const AdminReviewModeration: React.FC<AdminReviewModerationProps> = ({
  enabled,
  onChanged,
}) => {
  const [reports, setReports] = useState<PendingReviewReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPendingReviewReports();
      setReports(response.reports);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load review reports.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (report: PendingReviewReport, action: 'hide' | 'dismiss') => {
    const reason = (reasons[report.reportId] || '').trim();
    if (reason.length < 3) {
      setError('Add a short moderation reason before resolving a review report.');
      return;
    }

    setBusyId(report.reportId);
    setError(null);
    try {
      if (action === 'hide') {
        await moderateCommunityReview(report.reviewId, 'hide', reason);
      } else {
        await dismissCommunityReviewReport(report.reportId, reason);
      }
      setReasons(current => {
        const next = { ...current };
        delete next[report.reportId];
        return next;
      });
      await load();
      onChanged?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to resolve the review report.');
    } finally {
      setBusyId(null);
    }
  };

  if (!enabled) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-stone-900/50 p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <h3 className="text-sm font-bold text-white">Community review moderation</h3>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
            Resolve traveler reports without exposing private account data. Hiding a review removes it from the public community feed and records the Admin action.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg border border-white/10 bg-stone-950 px-3 py-1.5 text-[10px] font-semibold text-stone-300 hover:text-white disabled:opacity-50 cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-[11px] text-rose-200">
          {error}
        </div>
      )}

      {loading && reports.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-xs text-stone-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading reported reviews…
        </div>
      ) : reports.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 text-[11px] text-emerald-300">
          <CheckCircle2 className="w-4 h-4" /> No pending community review reports.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => {
            const busy = busyId === report.reportId;
            return (
              <article key={report.reportId} className="rounded-2xl border border-white/10 bg-stone-950/80 p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                        <Flag className="w-3 h-3" /> {report.reason}
                      </span>
                      <Rating value={report.review.rating} />
                      {report.review.verifiedVisit && (
                        <span className="text-[9px] font-semibold text-emerald-300">Verified visit</span>
                      )}
                    </div>
                    <div className="mt-1 text-[10px] text-stone-600">Producer: {report.producerId}</div>
                  </div>
                  <span className="text-[9px] text-stone-600">
                    {report.reportedAt ? new Date(report.reportedAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-stone-900/70 p-3">
                  <div className="text-[10px] font-bold text-stone-300">{report.review.travelerName}</div>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-stone-300">{report.review.comment}</p>
                  {report.review.hostReply?.comment && (
                    <div className="mt-2 border-l-2 border-amber-500/30 pl-2 text-[10px] text-stone-400">
                      Host response: {report.review.hostReply.comment}
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="text-[10px] font-semibold text-stone-400">Admin resolution reason</span>
                  <input
                    value={reasons[report.reportId] || ''}
                    onChange={event => setReasons(current => ({
                      ...current,
                      [report.reportId]: event.target.value,
                    }))}
                    maxLength={1000}
                    placeholder="Why is this review being hidden or the report dismissed?"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2 text-[11px] text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50"
                  />
                </label>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void act(report, 'dismiss')}
                    disabled={busy}
                    className="rounded-lg border border-white/10 bg-stone-900 px-3 py-2 text-[10px] font-semibold text-stone-300 hover:text-white disabled:opacity-50 cursor-pointer"
                  >
                    Dismiss report
                  </button>
                  <button
                    type="button"
                    onClick={() => void act(report, 'hide')}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[10px] font-bold text-rose-200 hover:bg-rose-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                    Hide review
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
