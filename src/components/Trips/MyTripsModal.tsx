import React, { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Compass,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  createTrip,
  deleteTrip,
  listTrips,
  type TripRecordV1,
} from '../../services/tripApi';
import type { Producer } from '../../types/terroir';
import { TripWorkspace } from './TripWorkspace';

interface MyTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProducer: (producer: Producer) => void;
  publicProducers: Producer[];
  catalogueIsLive?: boolean;
  hasExplorerPass?: boolean;
  onOpenExplorerPass?: () => void;
  initialTripId?: string;
  initialMode?: 'default' | 'optimize';
  initialTrips?: TripRecordV1[];
  initialCreating?: boolean;
}

const formatDateSpan = (start: string | null, end: string | null): string => {
  if (!start && !end) return 'No dates set';
  if (start && !end) {
    const [y, m, d] = start.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date) + ' onwards'
    );
  }
  if (start && end) {
    const [y1, m1, d1] = start.split('-').map(Number);
    const [y2, m2, d2] = end.split('-').map(Number);
    const dStart = new Date(Date.UTC(y1, m1 - 1, d1));
    const dEnd = new Date(Date.UTC(y2, m2 - 1, d2));
    const fStart = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(dStart);
    const fEnd = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(dEnd);
    return `${fStart} – ${fEnd}`;
  }
  return '';
};

const dateSpanDays = (startDate: string, endDate: string): number => {
  const start = Date.parse(startDate + 'T00:00:00Z');
  const end = Date.parse(endDate + 'T00:00:00Z');
  return Math.floor((end - start) / 86400000) + 1;
};

export const MyTripsModal: React.FC<MyTripsModalProps> = ({
  isOpen,
  onClose,
  onSelectProducer,
  publicProducers,
  catalogueIsLive = true,
  hasExplorerPass = false,
  onOpenExplorerPass,
  initialTripId,
  initialMode = 'default',
  initialTrips,
  initialCreating,
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    initialTripId || null
  );
  const [trips, setTrips] = useState<TripRecordV1[]>(initialTrips ?? []);
  const [loading, setLoading] = useState<boolean>(
    initialTrips !== undefined ? false : true
  );
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [isCreating, setIsCreating] = useState<boolean>(
    initialCreating ?? false
  );
  const [titleDraft, setTitleDraft] = useState<string>('');
  const [startDateDraft, setStartDateDraft] = useState<string>('');
  const [endDateDraft, setEndDateDraft] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete confirmation state
  const [deletingTrip, setDeletingTrip] = useState<TripRecordV1 | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTrips();
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your trips.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialTrips === undefined) {
        void fetchTrips();
      }
      if (initialTripId) {
        setSelectedTripId(initialTripId);
      }
    }
  }, [isOpen, initialTripId, initialTrips, fetchTrips]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deletingTrip) {
          setDeletingTrip(null);
        } else if (isCreating) {
          setIsCreating(false);
        } else if (selectedTripId) {
          setSelectedTripId(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, deletingTrip, isCreating, selectedTripId, onClose]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cleanTitle = titleDraft.trim();
    if (!cleanTitle || cleanTitle.length > 80) {
      setFormError('Trip title must be between 1 and 80 characters.');
      return;
    }
    const cleanStart = startDateDraft.trim() || null;
    const cleanEnd = endDateDraft.trim() || null;

    if (cleanEnd && !cleanStart) {
      setFormError('An end date requires a start date.');
      return;
    }
    if (cleanStart && cleanEnd) {
      const days = dateSpanDays(cleanStart, cleanEnd);
      if (days < 1) {
        setFormError('End date cannot be before start date.');
        return;
      }
      if (days > 365) {
        setFormError('Trip span cannot exceed 365 days.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const newTrip = await createTrip(
        {
          title: cleanTitle,
          startDate: cleanStart,
          endDate: cleanEnd,
        },
        'my_trips'
      );
      setTrips((prev) => [newTrip, ...prev]);
      setIsCreating(false);
      setTitleDraft('');
      setStartDateDraft('');
      setEndDateDraft('');
      setSelectedTripId(newTrip.id);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTrip || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteTrip(deletingTrip.id, deletingTrip.revision);
      setTrips((prev) => prev.filter((t) => t.id !== deletingTrip.id));
      if (selectedTripId === deletingTrip.id) {
        setSelectedTripId(null);
      }
      setDeletingTrip(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete trip.');
      setDeletingTrip(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => {
          if (!deletingTrip) onClose();
        }}
      />

      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-stone-950 border-l border-white/10 shadow-2xl flex flex-col text-stone-100 animate-in slide-in-from-right duration-200"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">My Trips</h1>
              <p className="text-[11px] text-stone-400">
                Plan producer trails, day stops & visit readiness
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close My Trips"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {selectedTripId ? (
            <TripWorkspace
              tripId={selectedTripId}
              onBack={() => {
                setSelectedTripId(null);
                void fetchTrips();
              }}
              onSelectProducer={onSelectProducer}
              publicProducers={publicProducers}
              catalogueIsLive={catalogueIsLive}
              hasExplorerPass={hasExplorerPass}
              onOpenExplorerPass={onOpenExplorerPass}
              initialOptimizationMode={initialMode === 'optimize'}
              onTripDeleted={(deletedId) => {
                setTrips((prev) => prev.filter((t) => t.id !== deletedId));
                setSelectedTripId(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              {initialMode === 'optimize' && hasExplorerPass && (
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10">
                      <Sparkles className="h-4 w-4 text-emerald-300" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-100">
                        Optimize My Day
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-stone-300">
                        Choose a trip, then select an assigned day with at least
                        two stops. TerroirTrail will suggest a more efficient
                        route without changing your trip until you approve it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Action Bar */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-stone-400 font-medium">
                  {`${trips.length} / 25 trips`}
                </span>

                {!isCreating && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(true);
                      setFormError(null);
                    }}
                    disabled={trips.length >= 25}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Trip</span>
                  </button>
                )}
              </div>

              {/* 25 trips limit warning if reached */}
              {trips.length >= 25 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    You have reached the maximum of 25 trips per account. Delete
                    an existing trip to create a new one.
                  </span>
                </div>
              )}

              {/* Inline Create Form */}
              {isCreating && (
                <form
                  onSubmit={handleCreateTrip}
                  className="p-4 rounded-2xl bg-stone-900 border border-amber-500/30 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <span className="font-bold text-xs text-white">
                      Create New Trip
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setFormError(null);
                      }}
                      className="text-stone-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-400 mb-1">
                      Trip Title <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      maxLength={80}
                      placeholder="e.g. Nemea Wine & Olive Trail"
                      className="w-full bg-stone-950 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                      autoFocus
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

                  {formError && (
                    <p className="text-xs text-rose-400 font-medium">
                      {formError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setFormError(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-750 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !titleDraft.trim()}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating…' : 'Create Trip'}
                    </button>
                  </div>
                </form>
              )}

              {/* Trips List States */}
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-stone-400 gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-sm font-semibold">
                    Loading your trips…
                  </span>
                </div>
              ) : error ? (
                <div className="p-6 text-center rounded-2xl bg-stone-900 border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center mx-auto text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-stone-300">{error}</p>
                  <button
                    type="button"
                    onClick={() => void fetchTrips()}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : trips.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-stone-900/50 border border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-center mx-auto text-amber-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Start planning a producer trail.
                    </h3>
                    <p className="mt-1 text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                      Save multiple makers to a dedicated trip, bucket stops by
                      day, and check verified road and visitor readiness.
                    </p>
                  </div>
                  {!isCreating && (
                    <button
                      type="button"
                      onClick={() => setIsCreating(true)}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Your First Trip</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="group relative rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-white/10 hover:border-amber-500/40 p-4 transition-all shadow-md flex items-center justify-between gap-4 cursor-pointer"
                      onClick={() => setSelectedTripId(trip.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                          {trip.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                            <span>
                              {formatDateSpan(trip.startDate, trip.endDate)}
                            </span>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-amber-400/80" />
                            <span>{`${trip.itemCount} producers`}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTrip(trip);
                          }}
                          className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                          title="Delete trip"
                          aria-label={`Delete ${trip.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-xl bg-stone-800 group-hover:bg-amber-500/20 text-stone-400 group-hover:text-amber-300 flex items-center justify-center transition">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingTrip && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-stone-950 border border-white/15 p-5 shadow-2xl space-y-4 text-stone-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Delete Trip
                </span>
                <button
                  type="button"
                  onClick={() => setDeletingTrip(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-white">“{deletingTrip.title}”</strong>?
                All {deletingTrip.itemCount} producer stops in this trip will be
                permanently removed.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingTrip(null)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-xs font-bold text-stone-300 transition cursor-pointer"
                >
                  Keep Trip
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmDelete()}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-950/40 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting…' : 'Yes, Delete Trip'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
