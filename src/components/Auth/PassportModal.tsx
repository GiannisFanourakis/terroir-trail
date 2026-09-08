import React, { useState } from 'react';
import { Producer } from '../../types/terroir';
import { UserProfile } from '../../types/auth';
import { X, Award, CheckCircle2, Circle, MapPin, Edit3, Save, Compass, Crown, Sparkles } from 'lucide-react';

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  producers: Producer[];
  onToggleVisited: (producerId: string) => void;
  onSaveTastingNote: (producerId: string, note: string) => void;
  onSelectProducer: (producer: Producer) => void;
  onOpenExplorerPass?: () => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  onClose,
  user,
  producers,
  onToggleVisited,
  onSaveTastingNote,
  onSelectProducer,
  onOpenExplorerPass,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'stamped' | 'unstamped'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState<string>('');

  if (!isOpen || !user) return null;

  const visitedCount = user.visitedProducers.length;
  const progressPercent = Math.round((visitedCount / producers.length) * 100);

  const filteredProducers = producers.filter((p) => {
    const isStamped = user.visitedProducers.includes(p.id);
    if (filterMode === 'stamped') return isStamped;
    if (filterMode === 'unstamped') return !isStamped;
    return true;
  });

  const handleStartEditNote = (producerId: string) => {
    setEditingNoteId(producerId);
    setDraftNote(user.personalNotes[producerId] || '');
  };

  const handleSaveNote = (producerId: string) => {
    onSaveTastingNote(producerId, draftNote);
    setEditingNoteId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Passport Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shadow-lg shadow-amber-500/10">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-base sm:text-lg font-bold text-white">
                  {user.name}&apos;s Terroir Passport
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider">
                  Official
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {visitedCount} of {producers.length} Greek Artisans Stamped ({progressPercent}%)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Passport Progress & Filter Tabs */}
        <div className="px-5 py-3.5 bg-stone-900/60 border-b border-white/10 shrink-0 space-y-3">
          {/* VIP Explorer Pass Banner */}
          {user.hasExplorerPass ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-900/25 border border-amber-400/40 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <span>VIP Terroir Explorer Pass Active</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 font-semibold uppercase">VIP</span>
                  </div>
                  <div className="text-[11px] text-stone-300">
                    Complimentary pours, artisan meze &amp; 10% cellar discount enabled
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-amber-300 font-bold px-2 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 shrink-0">
                ACTIVE
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-stone-900 to-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-200">
                    Terroir Explorer Pass (€19.99)
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Free welcome pours, artisanal meze &amp; 10% off cellar bottles
                  </div>
                </div>
              </div>
              {onOpenExplorerPass && (
                <button
                  type="button"
                  onClick={onOpenExplorerPass}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 transition shrink-0 cursor-pointer"
                >
                  Upgrade
                </button>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  filterMode === 'all'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                All ({producers.length})
              </button>
              <button
                onClick={() => setFilterMode('stamped')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  filterMode === 'stamped'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                Stamped ({visitedCount})
              </button>
              <button
                onClick={() => setFilterMode('unstamped')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  filterMode === 'unstamped'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                Remaining ({producers.length - visitedCount})
              </button>
            </div>

            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Tap stamp to mark visited
            </span>
          </div>
        </div>

        {/* Passport Entries List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3">
          {filteredProducers.map((producer) => {
            const isStamped = user.visitedProducers.includes(producer.id);
            const note = user.personalNotes[producer.id];
            const isEditing = editingNoteId === producer.id;

            return (
              <div
                key={producer.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isStamped
                    ? 'bg-amber-950/20 border-amber-500/30 text-stone-100'
                    : 'bg-stone-900/60 border-white/5 text-stone-300 hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => {
                      onSelectProducer(producer);
                      onClose();
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-stone-800 border border-white/10">
                      <img
                        src={producer.coverImage}
                        alt={producer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{producer.village} · {producer.region}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                        {producer.name}
                      </h4>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {producer.tagLine}
                      </p>
                    </div>
                  </div>

                  {/* Stamp Toggle Action */}
                  <button
                    onClick={() => onToggleVisited(producer.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      isStamped
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white border border-white/10'
                    }`}
                    title={isStamped ? 'Remove stamp' : 'Stamp this passport entry'}
                  >
                    {isStamped ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Stamped</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" />
                        <span>Stamp</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Personal Tasting Note Section */}
                <div className="mt-2.5 pt-2.5 border-t border-white/5 text-xs">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={draftNote}
                        onChange={(e) => setDraftNote(e.target.value)}
                        placeholder="Write your personal tasting impressions, vintage notes, pairing recommendations..."
                        className="w-full p-2.5 rounded-xl bg-stone-900 border border-white/15 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                        rows={2}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 text-[11px] text-stone-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNote(producer.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 text-stone-950 font-bold text-[11px]"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>
                  ) : note ? (
                    <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-stone-900/80 border border-white/5">
                      <div className="text-[11px] text-amber-200/90 italic">
                        &ldquo;{note}&rdquo;
                      </div>
                      <button
                        onClick={() => handleStartEditNote(producer.id)}
                        className="text-stone-400 hover:text-white p-1 shrink-0"
                        title="Edit note"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEditNote(producer.id)}
                      className="text-[11px] text-stone-500 hover:text-amber-400 flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Add personal tasting note...</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
