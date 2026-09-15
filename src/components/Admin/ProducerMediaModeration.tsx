import React, { useCallback, useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  approveProducerMedia,
  fetchPendingProducerMedia,
  rejectProducerMedia,
  type PendingProducerMediaItem,
} from '../../services/adminApi';

interface ProducerMediaModerationProps {
  enabled: boolean;
  onChanged?: () => void;
}

const formatSubmittedAt = (value: string) => {
  if (!value) return 'Submission time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Submission time unavailable';
  return date.toLocaleString();
};

export const ProducerMediaModeration: React.FC<ProducerMediaModerationProps> = ({
  enabled,
  onChanged,
}) => {
  const [media, setMedia] = useState<PendingProducerMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [rejectingKey, setRejectingKey] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPendingProducerMedia();
      setMedia(response.media);
    } catch (err) {
      setMedia([]);
      setError(err instanceof Error ? err.message : 'Unable to load producer photos for review.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  if (!enabled) return null;

  const itemKey = (item: PendingProducerMediaItem) => `${item.producerId}:${item.imageId}`;

  const handleApprove = async (item: PendingProducerMediaItem) => {
    if (!window.confirm(`Approve this ${item.type} photo for ${item.producerName}?`)) return;
    const key = itemKey(item);
    setBusyKey(key);
    setError(null);
    setNotice(null);
    try {
      await approveProducerMedia(item.producerId, item.imageId);
      setMedia(current => current.filter(candidate => itemKey(candidate) !== key));
      setRejectingKey(null);
      setRejectionReason('');
      setNotice(`${item.producerName} photo approved. It is now eligible for the public listing.`);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo approval failed.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleReject = async (item: PendingProducerMediaItem) => {
    const reason = rejectionReason.trim();
    if (reason.length < 3) {
      setError('Add a short reason before rejecting this photo.');
      return;
    }
    if (!window.confirm(`Reject this ${item.type} photo from ${item.producerName}?`)) return;

    const key = itemKey(item);
    setBusyKey(key);
    setError(null);
    setNotice(null);
    try {
      await rejectProducerMedia(item.producerId, item.imageId, reason);
      setMedia(current => current.filter(candidate => itemKey(candidate) !== key));
      setRejectingKey(null);
      setRejectionReason('');
      setNotice(`${item.producerName} photo rejected. The producer can replace or remove it.`);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo rejection failed.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <ImageIcon className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Producer photo review</h3>
            {!loading && media.length > 0 && (
              <span className="px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[9px] uppercase font-bold tracking-wide">
                {media.length} pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Producer uploads remain off the public listing until an admin approves them. Review image relevance and rights confirmation before publishing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadMedia()}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-stone-900 text-stone-300 hover:text-white disabled:opacity-50 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {(error || notice) && (
        <div
          role="status"
          className={`mb-3 rounded-xl border px-3 py-2 text-xs ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}
        >
          {error || notice}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-8 text-center text-sm text-stone-400">
          Loading producer photos…
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-7 text-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-stone-200">No producer photos awaiting review</div>
          <div className="text-[11px] text-stone-500 mt-1">New cover and gallery uploads will appear here after the producer saves them.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {media.map(item => {
            const key = itemKey(item);
            const busy = busyKey === key;
            const rejecting = rejectingKey === key;
            return (
              <article key={key} className="overflow-hidden rounded-xl border border-white/10 bg-stone-900/70">
                <div className="relative aspect-[16/10] bg-stone-950">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={`${item.producerName} ${item.type} submission`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute left-2 top-2 flex gap-1.5">
                    <span className="px-2 py-1 rounded-lg border border-white/15 bg-black/70 text-white text-[9px] uppercase font-bold tracking-wide backdrop-blur-sm">
                      {item.type}
                    </span>
                    <span className="px-2 py-1 rounded-lg border border-amber-400/25 bg-black/70 text-amber-300 text-[9px] uppercase font-bold tracking-wide backdrop-blur-sm">
                      Pending review
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate" title={item.producerName}>{item.producerName}</h4>
                      <div className="text-[10px] text-stone-600 mt-0.5 truncate" title={item.producerId}>Listing ID: {item.producerId}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Rights confirmed
                    </div>
                  </div>

                  {item.caption && (
                    <p className="mt-2 text-[11px] leading-relaxed text-stone-300">{item.caption}</p>
                  )}

                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500">
                    <Clock3 className="w-3.5 h-3.5" />
                    {formatSubmittedAt(item.uploadedAt)}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleApprove(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 text-xs font-bold cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setRejectingKey(rejecting ? null : key);
                        setRejectionReason('');
                        setError(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-50 text-xs font-bold cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>

                  {rejecting && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      <textarea
                        value={rejectionReason}
                        onChange={event => setRejectionReason(event.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder="Reason shown in the moderation record…"
                        className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-rose-500/40 resize-y"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] text-stone-600">{rejectionReason.trim().length}/500</span>
                        <button
                          type="button"
                          disabled={busy || rejectionReason.trim().length < 3}
                          onClick={() => void handleReject(item)}
                          className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-40 text-xs font-bold cursor-pointer"
                        >
                          Confirm rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
