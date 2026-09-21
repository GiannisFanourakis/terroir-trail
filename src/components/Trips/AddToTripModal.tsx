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
  getTrip,
  listTrips,
  type TripRecordV1,
  type TripWithItems,
  TripApiError,
} from '../../services/tripApi';
import type { Producer } from '../../types/terroir';
import { trackIntent } from '../../services/intentAnalytics';
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
  initialAmbiguousCreate?: boolean;
  initialAmbiguousTripId?: string | null;
  initialSuccessTrip?: TripRecordV1 | null;
  initialError?: string | null;
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

export async function reconcileAddProducer(
  tripId: string,
  producerId: string
): Promise<
  | { status: 'added'; trip: TripWithItems }
  | { status: 'absent'; trip: TripWithItems }
  | { status: 'unconfirmed'; error: unknown }
> {
  try {
    const authoritativeTrip = await getTrip(tripId);
    const isPresent = authoritativeTrip.items.some((item) => item.producerId === producerId);
    if (isPresent) {
      return { status: 'added', trip: authoritativeTrip };
    }
    return { status: 'absent', trip: authoritativeTrip };
  } catch (reconcileErr) {
    return { status: 'unconfirmed', error: reconcileErr };
  }
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({
  isOpen,
  onClose,
  producer,
  onOpenTrip,
  initialTrips,
  initialCreatingNew,
  initialCreatedTrip = null,
  initialCreateError = null,
  initialAmbiguousCreate = false,
  initialAmbiguousTripId = null,
  initialSuccessTrip = null,
  initialError = null,
}) => {
  const [trips, setTrips] = useState<TripRecordV1[]>(initialTrips ?? []);
  const [loading, setLoading] = useState<boolean>(initialTrips !== undefined ? false : true);
  const [error, setError] = useState<string | null>(
    initialError ??
      (initialAmbiguousTripId
        ? "We couldn't confirm whether this stop was added. Reload the trip before trying again."
        : null)
  );
  const [submittingTripId, setSubmittingTripId] = useState<string | null>(null);
  const [successTrip, setSuccessTrip] = useState<TripRecordV1 | null>(initialSuccessTrip);

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
  const [isAmbiguousCreate, setIsAmbiguousCreate] = useState<boolean>(initialAmbiguousCreate);
  const [ambiguousTripId, setAmbiguousTripId] = useState<string | null>(initialAmbiguousTripId);

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
      setSuccessTrip(initialSuccessTrip);
      setSubmittingTripId(null);
      setCreatedTrip(initialCreatedTrip);
      setIsAmbiguousCreate(initialAmbiguousCreate);
      setAmbiguousTripId(initialAmbiguousTripId);
      setError(
        initialError ??
          (initialAmbiguousTripId
            ? "We couldn't confirm whether this stop was added. Reload the trip before trying again."
            : null)
      );
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
  }, [
    isOpen,
    initialTrips,
    initialCreatingNew,
    initialCreatedTrip,
    initialCreateError,
    initialAmbiguousCreate,
    initialAmbiguousTripId,
    initialSuccessTrip,
    initialError,
    fetchTrips,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleReconcileAmbiguousExisting = async (tripId: string) => {
    if (!producer || submittingTripId) return;
    setSubmittingTripId(tripId);
    setError(null);
    try {
      const reconciled = await reconcileAddProducer(tripId, producer.id);
      if (reconciled.status === 'added') {
        void trackIntent({
          event: 'trip_producer_added',
          sourceSurface: 'trip_add_flow',
          producerId: producer.id,
        });
        setTrips((prev) =>
          prev.map((t) => (t.id === reconciled.trip.id ? reconciled.trip : t))
        );
        setSuccessTrip(reconciled.trip);
        setAmbiguousTripId(null);
        setError(null);
      } else if (reconciled.status === 'absent') {
        setTrips((prev) =>
          prev.map((t) => (t.id === reconciled.trip.id ? reconciled.trip : t))
        );
        setAmbiguousTripId(null);
        setError(`“${producer.name}” was not added. You can try adding it now.`);
      } else {
        setAmbiguousTripId(tripId);
        setError("We couldn't confirm whether this stop was added. Reload the trip before trying again.");
      }
    } finally {
      setSubmittingTripId(null);
    }
  };

  const handleAddToExisting = async (targetTrip: TripRecordV1) => {
    if (!producer || submittingTripId) return;
    if (ambiguousTripId === targetTrip.id) {
      await handleReconcileAmbiguousExisting(targetTrip.id);
      return;
    }
    setSubmittingTripId(targetTrip.id);
    setError(null);
    try {
      const updated = await addProducerToTrip(
        targetTrip.id,
        producer.id,
        targetTrip.revision,
        'trip_add_flow'
      );
      setTrips((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setSuccessTrip(updated);
      setAmbiguousTripId(null);
    } catch (err: any) {
      const reconciled = await reconcileAddProducer(targetTrip.id, producer.id);
      if (reconciled.status === 'added') {
        void trackIntent({
          event: 'trip_producer_added',
          sourceSurface: 'trip_add_flow',
          producerId: producer.id,
        });
        setTrips((prev) =>
          prev.map((t) => (t.id === reconciled.trip.id ? reconciled.trip : t))
        );
        setSuccessTrip(reconciled.trip);
        setAmbiguousTripId(null);
        setError(null);
      } else if (reconciled.status === 'absent') {
        setTrips((prev) =>
          prev.map((t) => (t.id === reconciled.trip.id ? reconciled.trip : t))
        );
        setAmbiguousTripId(null);
        if (err instanceof TripApiError && err.code === 'conflict') {
          if (err.message.includes('already in the trip')) {
            setError(`“${producer.name}” is already in “${reconciled.trip.title}”.`);
          } else if (err.message.includes('another device or tab')) {
            setError('This trip changed elsewhere. Trip refreshed to latest version.');
          } else {
            setError(err.message);
          }
        } else {
          setError(err.message || 'Failed to add producer to trip.');
        }
      } else {
        setAmbiguousTripId(targetTrip.id);
        setError("We couldn't confirm whether this stop was added. Reload the trip before trying again.");
      }
    } finally {
      setSubmittingTripId(null);
    }
  };

  const handleReconcileAmbiguousCreated = async () => {
    if (!producer || !createdTrip || isSubmittingNew) return;
    setIsSubmittingNew(true);
    setCreateError(null);
    try {
      const reconciled = await reconcileAddProducer(createdTrip.id, producer.id);
      if (reconciled.status === 'added') {
        void trackIntent({
          event: 'trip_producer_added',
          sourceSurface: 'trip_add_flow',
          producerId: producer.id,
        });
        setTrips((prev) => [
          reconciled.trip,
          ...prev.filter((t) => t.id !== reconciled.trip.id),
        ]);
        setSuccessTrip(reconciled.trip);
        setCreatedTrip(null);
        setIsAmbiguousCreate(false);
        setCreateError(null);
      } else if (reconciled.status === 'absent') {
        setCreatedTrip(reconciled.trip);
        setTrips((prev) => [
          reconciled.trip,
          ...prev.filter((t) => t.id !== reconciled.trip.id),
        ]);
        setIsAmbiguousCreate(false);
        setCreateError(
          `Trip “${reconciled.trip.title}” was verified, but “${producer.name}” is not added. Retry adding below.`
        );
      } else {
        setIsAmbiguousCreate(true);
        setCreateError("We couldn't confirm whether this stop was added. Reload the trip before trying again.");
      }
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleCreateAndAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!producer || isSubmittingNew) return;

    if (isAmbiguousCreate && createdTrip) {
      await handleReconcileAmbiguousCreated();
      return;
    }

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
      const updated = await addProducerToTrip(targetTrip.id, producer.id, targetTrip.revision, 'trip_add_flow');
      setTrips((prev) => [updated, ...prev.filter((t) => t.id !== updated.id)]);
      setSuccessTrip(updated);
      setCreatedTrip(null);
      setIsAmbiguousCreate(false);
    } catch (err: any) {
      const reconciled = await reconcileAddProducer(targetTrip.id, producer.id);
      if (reconciled.status === 'added') {
        void trackIntent({
          event: 'trip_producer_added',
          sourceSurface: 'trip_add_flow',
          producerId: producer.id,
        });
        setTrips((prev) => [
          reconciled.trip,
          ...prev.filter((t) => t.id !== reconciled.trip.id),
        ]);
        setSuccessTrip(reconciled.trip);
        setCreatedTrip(null);
        setIsAmbiguousCreate(false);
        setCreateError(null);
      } else if (reconciled.status === 'absent') {
        setCreatedTrip(reconciled.trip);
        setTrips((prev) => [
          reconciled.trip,
          ...prev.filter((t) => t.id !== reconciled.trip.id),
        ]);
        setIsAmbiguousCreate(false);
        setCreateError(
          `Trip “${reconciled.trip.title}” was created, but adding “${producer.name}” failed: ${err.message || 'Please retry.'}`
        );
      } else {
        setIsAmbiguousCreate(true);
        setCreateError("We couldn't confirm whether this stop was added. Reload the trip before trying again.");
      }
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

            {createdTrip && !isAmbiguousCreate && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{`Trip “${createdTrip.title}” was created. Retry adding “${producer.name}” below.`}</span>
              </div>
            )}

            {createdTrip && isAmbiguousCreate && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{`We couldn't confirm whether “${producer.name}” was added to “${createdTrip.title}”. Reload the trip before trying again.`}</span>
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

            {createError && !isAmbiguousCreate && (
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
                  ? isAmbiguousCreate
                    ? 'Checking Status…'
                    : createdTrip
                      ? 'Adding Stop…'
                      : 'Creating & Adding…'
                  : isAmbiguousCreate
                    ? 'Reload Trip'
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
                <div className="flex-1">
                  <span>{error}</span>
                  {ambiguousTripId && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => void handleReconcileAmbiguousExisting(ambiguousTripId)}
                        disabled={Boolean(submittingTripId)}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 text-[11px] font-bold hover:bg-amber-300 transition cursor-pointer disabled:opacity-50"
                      >
                        {submittingTripId === ambiguousTripId ? 'Checking Status…' : 'Reload Trip'}
                      </button>
                    </div>
                  )}
                </div>
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
                  const isAmbiguous = ambiguousTripId === targetTrip.id;

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
                          {isAmbiguous && (
                            <>
                              <span>·</span>
                              <span className="text-amber-400 font-semibold">Tap to reload & verify</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isCurrentSubmitting ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        ) : isAmbiguous ? (
                          <div className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            Reload
                          </div>
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
