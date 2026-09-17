import React, { useEffect, useState } from 'react';
import { MessageSquareText, X } from 'lucide-react';
import { ProducerReviewsPanel } from '../Reviews/ProducerReviewsPanel';
import { ProducerDetailDrawer } from './ProducerDetailDrawer';

type ProducerDetailDrawerProps = React.ComponentProps<typeof ProducerDetailDrawer>;

const replaceProducerUrl = (producerId?: string) => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  if (producerId) {
    url.searchParams.set('producer', producerId);
  } else {
    url.searchParams.delete('producer');
  }

  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
};

export const ProducerDetailDrawerWithReviews: React.FC<ProducerDetailDrawerProps> = (props) => {
  const [reviewsOpen, setReviewsOpen] = useState(false);

  useEffect(() => {
    setReviewsOpen(false);
  }, [props.producer?.id]);

  // Keep the browser URL in sync with the open estate. The inner drawer's
  // Share action copies window.location.href, so this also makes every shared
  // link a stable producer deep link that App.tsx can already reopen.
  useEffect(() => {
    const producerId = props.producer?.id;
    if (!producerId || typeof window === 'undefined') return;

    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get('producer') !== producerId) {
      replaceProducerUrl(producerId);
    }

    return () => {
      if (typeof window === 'undefined') return;
      const urlAtCleanup = new URL(window.location.href);
      if (urlAtCleanup.searchParams.get('producer') === producerId) {
        replaceProducerUrl();
      }
    };
  }, [props.producer?.id]);

  return (
    <>
      <ProducerDetailDrawer {...props} />

      {props.producer && (
        <button
          type="button"
          onClick={() => setReviewsOpen(true)}
          className="fixed right-4 sm:right-5 bottom-20 sm:bottom-24 z-[60] inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-stone-950/95 px-4 py-2.5 text-xs font-bold text-amber-200 shadow-2xl backdrop-blur-xl hover:border-amber-400/60 hover:bg-stone-900 cursor-pointer"
          aria-label={`Open ratings and traveler comments for ${props.producer.name}`}
        >
          <MessageSquareText className="w-4 h-4 text-amber-400" />
          Reviews
        </button>
      )}

      {reviewsOpen && props.producer && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="producer-community-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/15 bg-stone-950 text-stone-100 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-stone-900/70 px-5 py-4">
              <div className="min-w-0">
                <h2 id="producer-community-title" className="font-serif-title text-lg font-bold text-white">
                  {props.producer.name}
                </h2>
                <p className="mt-0.5 text-[11px] text-stone-500">TerroirTrail community reviews & Host responses</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewsOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-stone-950 text-stone-400 hover:text-white cursor-pointer"
                aria-label="Close community reviews"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <ProducerReviewsPanel
                producerId={props.producer.id}
                producerName={props.producer.name}
                viewer={props.user}
                onOpenAuth={(role) => {
                  setReviewsOpen(false);
                  props.onOpenAuth?.(role);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
