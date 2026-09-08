import React from 'react';
import { TastingBooking } from '../../types/booking';
import { Producer } from '../../types/terroir';
import { 
  X, Calendar, Clock, Users, Navigation, CheckCircle2, 
  AlertCircle, Wine, ArrowRight, Phone, Mail 
} from 'lucide-react';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: TastingBooking[];
  producers: Producer[];
  onCancelBooking: (bookingId: string) => Promise<void>;
  onSelectProducer: (producer: Producer) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  producers,
  onCancelBooking,
  onSelectProducer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg font-bold">
              🗓️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight">
                  My Tasting Reservations
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Your planned winery, microbrewery & distillery visits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-3 text-xs">
          {bookings.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <Wine className="w-10 h-10 mx-auto text-stone-600 stroke-[1.5]" />
              <p className="text-sm font-medium">No tasting reservations yet.</p>
              <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                Explore wineries, craft breweries, and rakokazana on the map and click "Book Tasting" to arrange your personalized visits.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const producer = producers.find((p) => p.id === booking.producerId);
              return (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-3 hover:border-amber-500/30 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {booking.producerName}
                        </h4>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : booking.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {booking.producerLocation}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-sm">
                        €{booking.totalEstimated}
                      </span>
                      <div className="text-[10px] text-stone-400">
                        {booking.guestsCount} {booking.guestsCount === 1 ? 'Guest' : 'Guests'}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-white/5 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Experience:</span>
                      <span className="font-semibold text-white">{booking.experienceTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Date & Time:</span>
                      <span className="font-bold text-amber-300">
                        {booking.date} · {booking.timeSlot}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    {producer && (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProducer(producer);
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Estate Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {producer?.googleMapsUrl && (
                        <a
                          href={producer.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1 transition"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Directions</span>
                        </a>
                      )}

                      {booking.status === 'pending' && (
                        <button
                          onClick={() => onCancelBooking(booking.id)}
                          className="px-2.5 py-1.5 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
