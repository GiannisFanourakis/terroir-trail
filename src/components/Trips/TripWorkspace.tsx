import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Edit2,
  Layers,
  MapPin,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import {
  assignTripItemDay,
  deleteTrip,
  getTrip,
  getTripProducerStates,
  removeProducerFromTrip,
  reorderTripItems,
  trackTripOpened,
  type TripProducerState,
  type TripWithItems,
  updateTrip,
  TripApiError,
} from '../../services/tripApi';
import type { Producer } from '../../types/terroir';
import { TripProducerItem } from './TripProducerItem';

interface TripWorkspaceProps {
  tripId: string;
  onBack: () => void;
  onSelectProducer: (producer: Producer) => void;
  publicProducers: Producer[];
  catalogueIsLive?: boolean;
  initialTrip?: TripWithItems;
  initialProducerStates?: Record<string, TripProducerState>;
  onTripDeleted?: (tripId: string) => void;
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

export const TripWorkspace: React.FC<TripWorkspaceProps> = ({
  tripId,
  onBack,
  onSelectProducer,
  publicProducers,
  catalogueIsLive = true,
  initialTrip,
  initialProducerStates,
  onTripDeleted,
}) => {
  const [trip, setTrip] = useState<TripWithItems | null>(initialTrip ?? null);
  const [producerStates, setProducerStates] = useState<Record<string, TripProducerState>>(initialProducerStates ?? {});
  const [loading, setLoading] = useState<boolean>(initialTrip !== undefined ? false : true);
  const [statesLoading, setStatesLoading] = useState<boolean>(false);
  const [statesError, setStatesError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [mutationPending, setMutationPending] = useState<boolean>(false);

  // Rename / Edit state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [titleDraft, setTitleDraft] = useState<string>(initialTrip?.title ?? '');
  const [startDateDraft, setStartDateDraft] = useState<string>(initialTrip?.startDate || '');
  const [endDateDraft, setEndDateDraft] = useState<string>(initialTrip?.endDate || '');
  const [editError, setEditError] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Day filter
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all' | 'unassigned'>('all');

  // Producer catalogue map for fast lookup
  const catalogueMap = useMemo(() => {
    const map = new Map<string, Producer>();
    for (const p of publicProducers) map.set(p.id, p);
    return map;
  }, [publicProducers]);

  const loadStates = useCallback(async (currentTripId: string) => {
    setStatesLoading(true);
    setStatesError(false);
    try {
      const states = await getTripProducerStates(currentTripId);
      setProducerStates(states);
    } catch {
      setStatesError(true);
    } finally {
      setStatesLoading(false);
    }
  }, []);

  const loadTripData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    setConflictMessage(null);
    try {
      const data = await getTrip(tripId);
      setTrip(data);
      setTitleDraft(data.title);
      setStartDateDraft(data.startDate || '');
      setEndDateDraft(data.endDate || '');
      if (isInitial) {
        trackTripOpened('my_trips');
      }
      void loadStates(tripId);
    } catch (err: any) {
      if (err instanceof TripApiError && err.status === 404) {
        setError('This trip was deleted or is no longer available.');
      } else {
        setError(err.message || 'Failed to load trip.');
      }
    } finally {
      setLoading(false);
    }
  }, [tripId, loadStates]);

  useEffect(() => {
    if (initialTrip === undefined) {
      void loadTripData(true);
    }
  }, [loadTripData, initialTrip]);

  const tripDurationDays = useMemo(() => {
    if (trip?.startDate && trip?.endDate) {
      return dateSpanDays(trip.startDate, trip.endDate);
    }
    return undefined;
  }, [trip?.startDate, trip?.endDate]);

  // Handle reorder
  const handleMove = async (producerId: string, direction: 'up' | 'down') => {
    if (!trip || mutationPending) return;
    const sorted = [...trip.items].sort((a, b) => a.position - b.position);
    const currentIndex = sorted.findIndex((item) => item.producerId === producerId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap
    const newItems = [...sorted];
    const [moved] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, moved);
    const newProducerIds = newItems.map((item) => item.producerId);

    setMutationPending(true);
    setConflictMessage(null);
    try {
      const updated = await reorderTripItems(trip.id, newProducerIds, trip.revision);
      setTrip(updated);
    } catch (err: any) {
      if (err instanceof TripApiError && err.status === 409) {
        setConflictMessage('This trip changed in another tab or device. Reload it before trying again.');
      } else {
        setError(err.message || 'Failed to reorder items.');
      }
    } finally {
      setMutationPending(false);
    }
  };

  // Handle day assignment
  const handleAssignDay = async (producerId: string, dayNumber: number | null) => {
    if (!trip || mutationPending) return;
    setMutationPending(true);
    setConflictMessage(null);
    try {
      const updated = await assignTripItemDay(trip.id, producerId, dayNumber, trip.revision);
      setTrip(updated);
    } catch (err: any) {
      if (err instanceof TripApiError && err.status === 409) {
        setConflictMessage('This trip changed in another tab or device. Reload it before trying again.');
      } else {
        setError(err.message || 'Failed to assign day.');
      }
    } finally {
      setMutationPending(false);
    }
  };

  // Handle item removal
  const handleRemove = async (producerId: string) => {
    if (!trip || mutationPending) return;
    setMutationPending(true);
    setConflictMessage(null);
    try {
      const updated = await removeProducerFromTrip(trip.id, producerId, trip.revision);
      setTrip(updated);
    } catch (err: any) {
      if (err instanceof TripApiError && err.status === 409) {
        setConflictMessage('This trip changed in another tab or device. Reload it before trying again.');
      } else {
        setError(err.message || 'Failed to remove producer.');
      }
    } finally {
      setMutationPending(false);
    }
  };

  // Handle metadata edit (rename & dates)
  const handleSaveEdit = async () => {
    if (!trip || mutationPending) return;
    setEditError(null);
    const cleanTitle = titleDraft.trim();
    if (!cleanTitle || cleanTitle.length > 80) {
      setEditError('Title must be between 1 and 80 characters.');
      return;
    }
    const cleanStart = startDateDraft.trim() || null;
    const cleanEnd = endDateDraft.trim() || null;

    if (cleanEnd && !cleanStart) {
      setEditError('An end date requires a start date.');
      return;
    }
    if (cleanStart && cleanEnd) {
      const days = dateSpanDays(cleanStart, cleanEnd);
      if (days < 1) {
        setEditError('End date cannot be before start date.');
        return;
      }
      if (days > 365) {
        setEditError('Trip span cannot exceed 365 days.');
        return;
      }
    }

    setMutationPending(true);
    try {
      const updated = await updateTrip(trip.id, {
        expectedRevision: trip.revision,
        title: cleanTitle,
        startDate: cleanStart,
        endDate: cleanEnd,
      });
      setTrip({ ...trip, ...updated });
      setIsEditing(false);
    } catch (err: any) {
      if (err instanceof TripApiError && err.status === 409) {
        setConflictMessage('This trip changed in another tab or device. Reload it before trying again.');
      } else {
        setEditError(err.message || 'Failed to update trip.');
      }
    } finally {
      setMutationPending(false);
    }
  };

  // Handle trip delete
  const handleDeleteTrip = async () => {
    if (!trip || mutationPending) return;
    setMutationPending(true);
    try {
      await deleteTrip(trip.id, trip.revision);
      onTripDeleted?.(trip.id);
      onBack();
    } catch (err: any) {
      if (err instanceof TripApiError && err.status === 409) {
        setConflictMessage('This trip changed in another tab or device. Reload it before trying again.');
        setShowDeleteConfirm(false);
      } else {
        setError(err.message || 'Failed to delete trip.');
        setShowDeleteConfirm(false);
      }
    } finally {
      setMutationPending(false);
    }
  };

  // Filter items for display
  const displayedItems = useMemo(() => {
    if (!trip) return [];
    const sorted = [...trip.items].sort((a, b) => a.position - b.position);
    if (selectedDayFilter === 'all') return sorted;
    if (selectedDayFilter === 'unassigned') {
      return sorted.filter((item) => item.dayNumber == null);
    }
    return sorted.filter((item) => item.dayNumber === selectedDayFilter);
  }, [trip, selectedDayFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-stone-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
        <span className="text-sm font-semibold">Loading trip workspace…</span>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-center mx-auto text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base text-white">Trip Unavailable</h3>
          <p className="mt-1 text-xs text-stone-400 max-w-sm mx-auto">
            {error || 'Unable to display this trip.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-xs font-bold text-stone-200 border border-white/10 transition cursor-pointer"
          >
            Back to My Trips
          </button>
          <button
            type="button"
            onClick={() => void loadTripData()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Bar: Back & Quick Actions */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-xs font-bold text-stone-200 border border-white/10 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>All Trips</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadTripData()}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border border-white/10 transition cursor-pointer"
            title="Reload authoritative state"
            aria-label="Reload trip"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl bg-stone-900 hover:bg-rose-500/15 text-stone-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition cursor-pointer"
            title="Delete trip"
            aria-label="Delete trip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 409 Stale Revision Conflict Banner */}
      {conflictMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start justify-between gap-3 text-xs text-amber-200 animate-in fade-in">
          <div className="flex items-start gap-2.5 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-300">Sync Notice</span>
              <p className="text-[11px] text-stone-300">{conflictMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadTripData()}
            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shrink-0 cursor-pointer transition"
          >
            Reload
          </button>
        </div>
      )}

      {/* Header Info or Inline Editing */}
      {isEditing ? (
        <div className="p-4 rounded-2xl bg-stone-900/90 border border-amber-500/30 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Trip Title
            </label>
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              maxLength={80}
              placeholder="e.g. Autumn Harvest in Crete"
              className="w-full bg-stone-950 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-400 mb-1">
                Start Date (optional)
              </label>
              <input
                type="date"
                value={startDateDraft}
                onChange={(e) => setStartDateDraft(e.target.value)}
                className="w-full bg-stone-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                value={endDateDraft}
                onChange={(e) => setEndDateDraft(e.target.value)}
                className="w-full bg-stone-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {editError && (
            <p className="text-xs text-rose-400 font-medium">{editError}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setTitleDraft(trip.title);
                setStartDateDraft(trip.startDate || '');
                setEndDateDraft(trip.endDate || '');
                setEditError(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-750 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSaveEdit()}
              disabled={mutationPending}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-stone-900/60 border border-white/10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                {trip.title}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-white/5 transition cursor-pointer"
                title="Edit title & dates"
                aria-label="Edit title and dates"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-stone-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatDateSpan(trip.startDate, trip.endDate)}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {trip.itemCount} / 50 producers
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Live catalogue offline / fallback notice */}
      {!catalogueIsLive && (
        <div className="p-3 rounded-xl bg-stone-900/90 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Live catalogue is currently unavailable. Preserved trip items are shown without unverified fallback facts.</span>
        </div>
      )}

      {/* Filter / Day Buckets Tab Bar */}
      {trip.itemCount > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-white/10'
            }`}
          >
            All Stops ({trip.itemCount})
          </button>

          {tripDurationDays ? (
            Array.from({ length: tripDurationDays }, (_, i) => i + 1).map((day) => {
              const count = trip.items.filter((item) => item.dayNumber === day).length;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDayFilter(day)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedDayFilter === day
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-white/10'
                  }`}
                >
                  Day {day} {count > 0 && `(${count})`}
                </button>
              );
            })
          ) : null}

          <button
            type="button"
            onClick={() => setSelectedDayFilter('unassigned')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDayFilter === 'unassigned'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-white/10'
            }`}
          >
            Unassigned (
            {trip.items.filter((item) => item.dayNumber == null).length}
            )
          </button>
        </div>
      )}

      {/* Producer items list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {trip.itemCount === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-stone-900/40 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-center mx-auto text-amber-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">No producers added yet</h3>
              <p className="mt-1 text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                Explore the map or catalogue, open any producer drawer, and tap “Add to trip” to build your trail.
              </p>
            </div>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-stone-900/30 border border-white/10 text-xs text-stone-400">
            No producers assigned to this day bucket.
          </div>
        ) : (
          displayedItems.map((item) => {
            const canonicalProducer = catalogueMap.get(item.producerId);
            const state = producerStates[item.producerId];

            return (
              <TripProducerItem
                key={item.producerId}
                item={item}
                position={item.position}
                totalCount={trip.itemCount}
                producerState={state}
                producer={canonicalProducer}
                catalogueIsLive={catalogueIsLive}
                isStateLoading={statesLoading}
                isStateError={statesError}
                maxDays={tripDurationDays}
                onMoveUp={(id) => void handleMove(id, 'up')}
                onMoveDown={(id) => void handleMove(id, 'down')}
                onAssignDay={(id, day) => void handleAssignDay(id, day)}
                onRemove={(id) => void handleRemove(id)}
                onSelectProducer={onSelectProducer}
                disabled={mutationPending}
              />
            );
          })
        )}
      </div>

      {/* Deliberate Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-stone-950 border border-white/15 p-5 shadow-2xl space-y-4 text-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Delete Trip
              </span>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {`Are you sure you want to delete “${trip.title}”? All ${trip.itemCount} producer stops in this trip will be permanently removed.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={mutationPending}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-xs font-bold text-stone-300 transition cursor-pointer"
              >
                Keep Trip
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteTrip()}
                disabled={mutationPending}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-950/40 transition cursor-pointer disabled:opacity-50"
              >
                {mutationPending ? 'Deleting…' : 'Yes, Delete Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
