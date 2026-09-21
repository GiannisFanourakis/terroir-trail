import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Compass,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  addProducerToTrip,
  createTrip,
  listTrips,
  type TripRecordV1,
  TripApiError,
} from '../../services/tripApi';
import type { Producer } from '../../types/terroir';
import { ProducerCategoryIcon } from '../Common/ProducerCategoryIcon';

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  producer: Producer | null;
  onOpenTrip?: (tripId: string) => void;
  initialTrips?: TripRecordV1[];
  initialCreatingNew?: boolean;
  initialCreatedTrip?: TripRecordV1 | null;
  initialCreateError?: string | null;
}

const formatDateSpan = (start: string | null, end: string | null): string => {
  if (!start && !end) return 'No dates set';
  if (start && !end) {
    const [y, m, d] = start.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date) + ' onwards';
  }
  if (start && end) {
    const [y1, m1, d1] = start.split('-').map(Number);
    const [y2, m2, d2] = end.split('-').map(Number);
    const dStart = new Date(Date.UTC(y1, m1 - 1, d1));
    const dEnd = new Date(Date.UTC(y2, m2 - 1, d2));
    const fStart = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(dStart);
    const fEnd = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(dEnd);
    return `${fStart} – ${fEnd}`;
  }
  return '';
};

const dateSpanDays = (startDate: string, endDate: string): number => {
  const start = Date.parse(startDate + 'T00:00:00Z');
  const end = Date.parse(endDate + 'T00:00:00Z');
  return Math.floor((end - start) / 86400000) + 1;
};

export const AddToTripModal: React.FC<AddToTripModalProps> = ({
  isOpen,
  onClose,
  producer,
  onOpenTrip,
  initialTrips,
  initialCreatingNew,
  initialCreatedTrip = null,
  initialCreateError = null,
}) => {
  const [trips, setTrips] = useState<TripRecordV1[]>(initialTrips ?? []);
  const [loading, setLoading] = useState<boolean>(initialTrips !== undefined ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [submittingTripId, setSubmittingTripId] = useState<string | null>(null);
  const [successTrip, setSuccessTrip] = useState<TripRecordV1 | null>(null);

  // New trip mode
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(
    initialCreatingNew ?? (initialTrips ? initialTrips.length === 0 : false)
  );
  const [createdTrip, setCreatedTrip] = useState<TripRecordV1 | null>(initialCreatedTrip);
  const [titleDraft, setTitleDraft] = useState<string>('');
  const [startDateDraft, setStartDateDraft] = useState<string>('');
  const [endDateDraft, setEndDateDraft] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(initialCreateError);
  const [isSubmittingNew, setIsSubmittingNew] = useState<boolean>(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTrips();
      setTrips(data);
      if (data.length === 0) {
        setIsCreatingNew(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trips.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSuccessTrip(null);
      setSubmittingTripId(null);
      setCreatedTrip(initialCreatedTrip);
      if (initialCreatingNew !== undefined) {
        setIsCreatingNew(initialCreatingNew);
      } else if (initialTrips !== undefined) {
        setIsCreatingNew(initialTrips.length === 0);
      } else {
        setIsCreatingNew(false);
      }
      setTitleDraft('');
      setStartDateDraft('');
      setEndDateDraft('');
      setCreateError(initialCreateError);
      if (initialTrips === undefined) {
        void fetchTrips();
      }
    }
  }, [isOpen, initialTrips, initialCreatingNew, initialCreatedTrip, initialCreateError, fetchTrips]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleAddToExisting = async (targetTrip: TripRecordV1) => {
    if (!producer || submittingTripId) return;
    setSubmittingTripId(targetTrip.id);
    setError(null);
    try {
      await addProducerToTrip(targetTrip.id, producer.id, targetTrip.revision, 'trip_add_flow');
      setSuccessTrip(targetTrip);
    } catch (err: any) {
      if (err instanceof TripApiError && err.code === 'conflict') {
        if (err.message.includes('already in the trip')) {
          setError(`“${producer.name}” is already in “${targetTrip.title}”.`);
        } else if (err.message.includes('another device or tab')) {
          setError('This trip changed elsewhere. Reloading trips…');
          void fetchTrips();
        } else {
          setError(err.message);
        }
      } else {
        setError(err.message || 'Failed to add producer to trip.');
      }
    } finally {
      setSubmittingTripId(null);
    }
  };

  const handleCreateAndAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!producer || isSubmittingNew) return;
    setCreateError(null);

    const cleanTitle = titleDraft.trim();
    if (!createdTrip && (!cleanTitle || cleanTitle.length > 80)) {
      setCreateError('Trip title must be between 1 and 80 characters.');
      return;
    }
    const cleanStart = startDateDraft.trim() || null;
    const cleanEnd = endDateDraft.trim() || null;

    if (!createdTrip && cleanEnd && !cleanStart) {
      setCreateError('An end date requires a start date.');
      return;
    }
    if (!createdTrip && cleanStart && cleanEnd) {
      const days = dateSpanDays(cleanStart, cleanEnd);
      if (days < 1) {
        setCreateError('End date cannot be before start date.');
        return;
      }
      if (days > 365) {
        setCreateError('Trip span cannot exceed 365 days.');
        return;
      }
    }

    setIsSubmittingNew(true);
    let targetTrip: TripRecordV1;

    try {
      if (createdTrip) {
        // Retry against existing created trip without creating another duplicate trip!
        targetTrip = createdTrip;
      } else {
        targetTrip = await createTrip(
          {
            title: cleanTitle,
            startDate: cleanStart,
            endDate: cleanEnd,
          },
          'trip_add_flow'
        );
        setCreatedTrip(targetTrip);
        setTrips((prev) => [targetTrip, ...prev.filter((t) => t.id !== targetTrip.id)]);
      }
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create trip.');
      setIsSubmittingNew(false);
      return;
    }

    try {
      await addProducerToTrip(targetTrip.id, producer.id, targetTrip.revision, 'trip_add_flow');
      setSuccessTrip(targetTrip);
      setCreatedTrip(null);
    } catch (err: any) {
      void fetchTrips();
      setCreateError(
        `Trip “${targetTrip.title}” was created, but adding “${producer.name}” failed: ${err.message || 'Please retry.'}`
      );
    } finally {
      setIsSubmittingNew(false);
    }
  };

  if (!isOpen || !producer) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto rounded-3xl bg-stone-950 border border-white/15 p-5 sm:p-6 shadow-2xl text-stone-100 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-trip-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 id="add-to-trip-title" className="font-bold text-sm text-white">
              Add to Trip
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Producer Card */}
        <div className="my-4 p-3 rounded-2xl bg-stone-900/80 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
            <ProducerCategoryIcon category={producer.category} className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-xs text-white truncate">{producer.name}</h3>
            <p className="text-[11px] text-stone-400 truncate capitalize">
              {producer.category.replace(/_/g, ' ')} · {producer.destination.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {successTrip ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Added to Trip!</h3>
              <p className="mt-1 text-xs text-stone-400">
                “{producer.name}” was added to “{successTrip.title}”.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-xs font-bold text-stone-200 border border-white/10 transition cursor-pointer"
              >
                Close
              </button>
              {onOpenTrip && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTrip(successTrip.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Open Trip Workspace
                </button>
              )}
            </div>
          </div>
        ) : isCreatingNew ? (
          <form onSubmit={handleCreateAndAdd} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">New Trip Details</span>
              {trips.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setCreateError(null);
                  }}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Choose existing trip
                </button>
              )}
            </div>

            {createdTrip && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{`Trip “${createdTrip.title}” was created. Retry adding “${producer.name}” below.`}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-400 mb-1">
                Trip Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={createdTrip ? createdTrip.title : titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                maxLength={80}
                placeholder="e.g. Aegean Coast & Highlands"
                disabled={Boolean(createdTrip)}
                className="w-full bg-stone-900 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 disabled:opacity-60"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Start Date (opt)
                </label>
                <input
                  type="date"
                  value={createdTrip ? (createdTrip.startDate || '') : startDateDraft}
                  onChange={(e) => setStartDateDraft(e.target.value)}
                  disabled={Boolean(createdTrip)}
                  className="w-full bg-stone-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  End Date (opt)
                </label>
                <input
                  type="date"
                  value={createdTrip ? (createdTrip.endDate || '') : endDateDraft}
                  onChange={(e) => setEndDateDraft(e.target.value)}
                  disabled={Boolean(createdTrip)}
                  className="w-full bg-stone-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>
            </div>

            {createError && (
              <p className="text-xs text-rose-400 font-medium">{createError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              {trips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-750 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmittingNew || (!createdTrip && !titleDraft.trim())}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingNew
                  ? createdTrip
                    ? 'Adding Stop…'
                    : 'Creating & Adding…'
                  : createdTrip
                    ? 'Retry Adding Stop'
                    : 'Create & Add Stop'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">Select destination trip:</span>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                  setError(null);
                }}
                disabled={trips.length >= 25}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Trip</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-stone-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Loading trips…</span>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {trips.map((targetTrip) => {
                  const isFull = targetTrip.itemCount >= 50;
                  const isCurrentSubmitting = submittingTripId === targetTrip.id;

                  return (
                    <button
                      key={targetTrip.id}
                      type="button"
                      onClick={() => void handleAddToExisting(targetTrip)}
                      disabled={isFull || Boolean(submittingTripId)}
                      className="w-full text-left p-3 rounded-2xl bg-stone-900/80 hover:bg-stone-850 border border-white/10 hover:border-amber-500/40 transition flex items-center justify-between gap-3 group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-white group-hover:text-amber-300 truncate">
                          {targetTrip.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-stone-400 flex items-center gap-2 flex-wrap">
                          <span>{formatDateSpan(targetTrip.startDate, targetTrip.endDate)}</span>
                          <span>·</span>
                          <span>{`${targetTrip.itemCount} / 50 stops`}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isCurrentSubmitting ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        ) : isFull ? (
                          <span className="text-[10px] font-bold text-stone-500">Full</span>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-stone-800 group-hover:bg-amber-500/20 text-stone-400 group-hover:text-amber-300 flex items-center justify-center transition">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
