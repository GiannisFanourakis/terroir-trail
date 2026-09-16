import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, FilePenLine, RefreshCw, Send, XCircle } from 'lucide-react';
import type { Producer, FoodOption } from '../../types/terroir';
import type { ProducerOverride } from '../../types/booking';
import type { ProducerListingChanges, ProducerListingChangeRequest } from '../../types/producerListingChange';
import {
  fetchLatestProducerListingChange,
  submitProducerListingChanges,
} from '../../services/producerListingChangeApi';

interface ProducerListingContentEditorProps {
  producer: Producer;
  producerOverride?: ProducerOverride;
  readOnly?: boolean;
}

const FOOD_OPTIONS: Array<{ value: FoodOption | ''; label: string }> = [
  { value: '', label: 'No food option listed' },
  { value: 'full_taverna', label: 'Full taverna' },
  { value: 'tasting_board', label: 'Tasting board' },
  { value: 'dakos_snacks', label: 'Dakos / snacks' },
  { value: 'brewery_taproom', label: 'Brewery taproom' },
  { value: 'byo_picnic', label: 'Bring-your-own picnic' },
];

const requestStatusText = (request: ProducerListingChangeRequest) => {
  if (request.status === 'pending_review') return 'Pending Admin review';
  if (request.status === 'approved') return 'Last request approved';
  return 'Last request rejected';
};

export const ProducerListingContentEditor: React.FC<ProducerListingContentEditorProps> = ({
  producer,
  producerOverride,
  readOnly = false,
}) => {
  const published = useMemo(() => ({
    tagLine: producerOverride?.tagLine !== undefined ? producerOverride.tagLine : producer.tagLine,
    description: producerOverride?.description !== undefined ? producerOverride.description : producer.description,
    story: producerOverride?.story !== undefined ? producerOverride.story : producer.story,
    tastingHighlights: producerOverride?.tastingHighlights !== undefined ? producerOverride.tastingHighlights : producer.tastingHighlights,
    website: producerOverride?.website !== undefined ? producerOverride.website : (producer.website || ''),
    foodOption: producerOverride?.foodOption !== undefined ? producerOverride.foodOption : (producer.foodOption || null),
    dogFriendly: producerOverride?.dogFriendly !== undefined ? producerOverride.dogFriendly : producer.dogFriendly,
    kidFriendly: producerOverride?.kidFriendly !== undefined ? producerOverride.kidFriendly : producer.kidFriendly,
    walkIn: producerOverride?.walkIn !== undefined ? producerOverride.walkIn : producer.walkIn,
    campervanFriendly: producerOverride?.campervanFriendly !== undefined ? producerOverride.campervanFriendly : producer.campervanFriendly,
  }), [producer, producerOverride]);

  const [tagLine, setTagLine] = useState(published.tagLine || '');
  const [description, setDescription] = useState(published.description || '');
  const [story, setStory] = useState(published.story || '');
  const [products, setProducts] = useState((published.tastingHighlights || []).join('\n'));
  const [website, setWebsite] = useState(published.website || '');
  const [foodOption, setFoodOption] = useState<FoodOption | ''>(published.foodOption || '');
  const [dogFriendly, setDogFriendly] = useState(Boolean(published.dogFriendly));
  const [kidFriendly, setKidFriendly] = useState(Boolean(published.kidFriendly));
  const [walkIn, setWalkIn] = useState(Boolean(published.walkIn));
  const [campervanFriendly, setCampervanFriendly] = useState(Boolean(published.campervanFriendly));
  const [latestRequest, setLatestRequest] = useState<ProducerListingChangeRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const resetForm = () => {
    setTagLine(published.tagLine || '');
    setDescription(published.description || '');
    setStory(published.story || '');
    setProducts((published.tastingHighlights || []).join('\n'));
    setWebsite(published.website || '');
    setFoodOption(published.foodOption || '');
    setDogFriendly(Boolean(published.dogFriendly));
    setKidFriendly(Boolean(published.kidFriendly));
    setWalkIn(Boolean(published.walkIn));
    setCampervanFriendly(Boolean(published.campervanFriendly));
  };

  useEffect(() => {
    resetForm();
  }, [producer.id, published.tagLine, published.description, published.story, published.website, published.foodOption, published.dogFriendly, published.kidFriendly, published.walkIn, published.campervanFriendly, JSON.stringify(published.tastingHighlights)]);

  const loadLatest = async () => {
    if (readOnly) {
      setLatestRequest(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetchLatestProducerListingChange(producer.id);
      setLatestRequest(response.request);
    } catch (err) {
      setLatestRequest(null);
      setError(err instanceof Error ? err.message : 'Unable to load listing review status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLatest();
  }, [producer.id, readOnly]);

  const pending = latestRequest?.status === 'pending_review';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (readOnly || pending) return;

    const tastingHighlights = products.split('\n').map(item => item.trim()).filter(Boolean);
    const changes: ProducerListingChanges = {};
    if (tagLine.trim() !== (published.tagLine || '')) changes.tagLine = tagLine.trim();
    if (description.trim() !== (published.description || '')) changes.description = description.trim();
    if (story.trim() !== (published.story || '')) changes.story = story.trim();
    if (JSON.stringify(tastingHighlights) !== JSON.stringify(published.tastingHighlights || [])) changes.tastingHighlights = tastingHighlights;
    if (website.trim() !== (published.website || '')) changes.website = website.trim();
    if ((foodOption || null) !== (published.foodOption || null)) changes.foodOption = foodOption || null;
    if (dogFriendly !== Boolean(published.dogFriendly)) changes.dogFriendly = dogFriendly;
    if (kidFriendly !== Boolean(published.kidFriendly)) changes.kidFriendly = kidFriendly;
    if (walkIn !== Boolean(published.walkIn)) changes.walkIn = walkIn;
    if (campervanFriendly !== Boolean(published.campervanFriendly)) changes.campervanFriendly = campervanFriendly;

    if (Object.keys(changes).length === 0) {
      setNotice(null);
      setError('No reviewed listing fields have changed.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await submitProducerListingChanges(producer.id, changes);
      setLatestRequest(response.request);
      setNotice('Changes submitted. They will stay off the public listing until an Admin approves them.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit listing changes.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
        <div className="flex items-center gap-2 text-violet-200 font-bold text-sm">
          <FilePenLine className="w-4 h-4" />
          Public listing content
        </div>
        <p className="mt-1 text-[11px] text-stone-300 leading-relaxed">
          Story, tagline, products, website and amenities are review-controlled. Submitting here creates a change request; your currently approved public listing stays unchanged until TerroirTrail approves it.
        </p>
      </div>

      {readOnly && (
        <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-xs text-sky-200">
          Admin preview is read-only. A real verified Host can submit these fields for review.
        </div>
      )}

      {(error || notice) && (
        <div role={error ? 'alert' : 'status'} aria-live="polite" className={`rounded-xl border px-3 py-2 text-xs ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
          {error || notice}
        </div>
      )}

      {!readOnly && latestRequest && (
        <div className={`rounded-xl border px-3 py-3 text-xs ${pending ? 'border-amber-500/25 bg-amber-500/10 text-amber-200' : latestRequest.status === 'approved' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/25 bg-rose-500/10 text-rose-200'}`}>
          <div className="flex items-center gap-2 font-bold">
            {pending ? <Clock3 className="w-4 h-4" /> : latestRequest.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {requestStatusText(latestRequest)}
          </div>
          {latestRequest.rejectionReason && <p className="mt-1 text-[11px]">Reason: {latestRequest.rejectionReason}</p>}
        </div>
      )}

      <div className="grid gap-4">
        <label className="block text-xs font-semibold text-stone-300">
          Tagline
          <input value={tagLine} onChange={event => setTagLine(event.target.value)} maxLength={180} disabled={readOnly || pending} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white disabled:opacity-60" />
        </label>
        <label className="block text-xs font-semibold text-stone-300">
          Description
          <textarea value={description} onChange={event => setDescription(event.target.value)} maxLength={1600} rows={5} disabled={readOnly || pending} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white disabled:opacity-60" />
        </label>
        <label className="block text-xs font-semibold text-stone-300">
          Story
          <textarea value={story} onChange={event => setStory(event.target.value)} maxLength={6000} rows={7} disabled={readOnly || pending} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white disabled:opacity-60" />
        </label>
        <label className="block text-xs font-semibold text-stone-300">
          Products / what you make
          <textarea value={products} onChange={event => setProducts(event.target.value)} rows={6} disabled={readOnly || pending} placeholder="One product or highlight per line" className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white disabled:opacity-60" />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-stone-300">
            Website
            <input value={website} onChange={event => setWebsite(event.target.value)} maxLength={500} disabled={readOnly || pending} placeholder="https://…" className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white disabled:opacity-60" />
          </label>
          <label className="block text-xs font-semibold text-stone-300">
            Food option
            <select value={foodOption} onChange={event => setFoodOption(event.target.value as FoodOption | '')} disabled={readOnly || pending} className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-xs text-white disabled:opacity-60">
              {FOOD_OPTIONS.map(option => <option key={option.value || 'none'} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-stone-300 mb-2">Visitor amenities</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            ['dogFriendly', 'Dog friendly', dogFriendly, setDogFriendly],
            ['kidFriendly', 'Kid friendly', kidFriendly, setKidFriendly],
            ['walkIn', 'Walk-ins accepted', walkIn, setWalkIn],
            ['campervanFriendly', 'Campervan friendly', campervanFriendly, setCampervanFriendly],
          ].map(([key, label, checked, setter]) => (
            <label key={String(key)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-stone-900/60 px-3 py-2.5 text-xs text-stone-300">
              <input type="checkbox" checked={Boolean(checked)} onChange={event => (setter as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)} disabled={readOnly || pending} />
              {String(label)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={readOnly || pending || submitting || loading} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-400 disabled:opacity-50 cursor-pointer">
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting…' : pending ? 'Awaiting review' : 'Submit changes for review'}
        </button>
        {!readOnly && (
          <button type="button" onClick={() => void loadLatest()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-stone-900 px-4 py-2.5 text-xs font-semibold text-stone-300 disabled:opacity-50 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh status
          </button>
        )}
      </div>
    </form>
  );
};
