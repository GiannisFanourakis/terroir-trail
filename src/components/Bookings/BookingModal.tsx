import React, { useState } from 'react';
import { Producer } from '../../types/terroir';
import { UserProfile } from '../../types/auth';
import { TastingBooking, TastingExperience } from '../../types/booking';
import { getExperiencesForProducer } from '../../data/experiences';
import { 
  X, Calendar, Clock, Users, CheckCircle2, Sparkles, Navigation, 
  Wine, ShieldCheck, ArrowRight, Phone, Mail, User, AlertCircle 
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  producer: Producer | null;
  user: UserProfile | null;
  onBookTasting: (
    booking: Omit<TastingBooking, 'id' | 'createdAt' | 'status'>
  ) => Promise<TastingBooking>;
  onOpenAuth: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  producer,
  user,
  onBookTasting,
  onOpenAuth,
}) => {
  if (!isOpen || !producer) return null;

  const experiences = getExperiencesForProducer(producer.category);
  const [selectedExpId, setSelectedExpId] = useState<string>(experiences[0]?.id || '');
  
  // Tomorrow's date formatted as YYYY-MM-DD
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState<string>(getDefaultDate());
  const [timeSlot, setTimeSlot] = useState<string>('11:30 AM');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>('+30 ');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<TastingBooking | null>(null);
  const [error, setError] = useState<string>('');

  const selectedExp = experiences.find((e) => e.id === selectedExpId) || experiences[0];
  const totalEstimated = (selectedExp?.pricePerPerson || 0) * guestsCount;

  const availableSlots = [
    '10:30 AM',
    '11:30 AM',
    '01:00 PM',
    '03:00 PM',
    '05:00 PM (Sunset)',
    '06:30 PM (Golden Hour)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const created = await onBookTasting({
        producerId: producer.id,
        producerName: producer.name,
        producerCategory: producer.category,
        producerLocation: `${producer.village}, ${producer.region}`,
        userId: user?.id || `anon_${Date.now()}`,
        userName: name.trim(),
        userEmail: email.trim(),
        userPhone: phone.trim(),
        date,
        timeSlot,
        experienceId: selectedExp.id,
        experienceTitle: selectedExp.title,
        pricePerPerson: selectedExp.pricePerPerson,
        guestsCount,
        totalEstimated,
        specialRequests: specialRequests.trim() || undefined,
      });
      setConfirmedBooking(created);
    } catch (err: any) {
      setError(err.message || 'Failed to submit tasting reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setConfirmedBooking(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg font-bold">
              🍷
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight">
                  Book Tasting & Estate Visit
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Instant Request
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {producer.name} · {producer.village}, {producer.region}
              </p>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 text-xs">
          
          {confirmedBooking ? (
            /* Confirmation Screen */
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif-title text-xl font-bold text-white">
                  Tasting Request Sent to Estate!
                </h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Your tasting appointment has been received by <span className="text-amber-300 font-bold">{producer.name}</span>. The estate team will confirm availability directly with you.
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-stone-400 text-[11px]">Experience:</span>
                  <span className="font-bold text-white text-right">{confirmedBooking.experienceTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-[11px]">Date & Time:</span>
                  <span className="font-bold text-amber-300">{confirmedBooking.date} at {confirmedBooking.timeSlot}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-[11px]">Party Size:</span>
                  <span className="font-bold text-white">{confirmedBooking.guestsCount} {confirmedBooking.guestsCount === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-[11px]">Estimated Cost:</span>
                  <span className="font-bold text-emerald-400 text-sm">€{confirmedBooking.totalEstimated} total (€{confirmedBooking.pricePerPerson}/pers)</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500 border-t border-white/5">
                  <span>Booking ID: <code className="text-stone-400">{confirmedBooking.id.slice(0, 16)}...</code></span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase text-[9px]">
                    Status: {confirmedBooking.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                <a
                  href={producer.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Driving Route</span>
                </a>
                <button
                  onClick={resetAndClose}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs transition active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Choose Experience */}
              <div>
                <label className="block text-stone-400 text-[11px] font-semibold mb-1.5">
                  1. Choose Tasting Experience
                </label>
                <div className="space-y-2">
                  {experiences.map((exp) => (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setSelectedExpId(exp.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                        selectedExpId === exp.id
                          ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40'
                          : 'bg-stone-900 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{exp.title}</span>
                          <span className="text-[10px] text-stone-400">({exp.durationMinutes} min)</span>
                        </div>
                        <span className="font-bold text-amber-300 text-xs bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          €{exp.pricePerPerson} / person
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        {exp.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exp.includes.map((inc, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-stone-800/80 text-stone-300">
                            ✓ {inc}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                    2. Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                    3. Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer"
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Number of Guests */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-400 text-[11px] font-semibold">
                    4. Party Size
                  </label>
                  <span className="text-[11px] text-amber-300 font-bold">
                    €{selectedExp.pricePerPerson} × {guestsCount} = €{totalEstimated}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestsCount(num)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                        guestsCount === num
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : 'bg-stone-900 border border-white/10 text-stone-300 hover:text-white'
                      }`}
                    >
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Guest Contact Information */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <span className="block text-stone-400 text-[11px] font-semibold">
                  5. Explorer Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+30 Mobile Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Dietary requests (vegetarian, allergies...)"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xl shadow-amber-500/20 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isSubmitting ? (
                  <span>Sending request to estate...</span>
                ) : (
                  <>
                    <span>Request Tasting Reservation (€{totalEstimated})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero advance deposit required · Pay at the cellar door</span>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
