import { useState, useEffect, useCallback } from 'react';
import { Producer, Destination, Category } from '../types/terroir';
import { producerService, ViewportBounds } from '../services/producerService';

export interface UseProducersOptions {
  destination?: Destination | 'all';
  category?: Category | 'all';
  searchQuery?: string;
}

export function useProducers(options: UseProducersOptions = {}) {
  const [producers, setProducers] = useState<Producer[]>(() => producerService.getCachedProducers());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(() => producerService.getCacheProvenance() === 'live');

  const refresh = useCallback(
    async (bounds?: ViewportBounds) => {
      setLoading(true);
      setError(null);
      try {
        const data = await producerService.getProducers({
          destination: options.destination,
          category: options.category,
          searchQuery: options.searchQuery,
          bounds,
        });
        const live = producerService.getCacheProvenance() === 'live';
        setProducers(data);
        setIsLive(live);

        if (producerService.isLiveDb() && !live) {
          setError('Live catalogue unavailable. Showing the audited offline catalogue.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load producers');
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    },
    [options.destination, options.category, options.searchQuery]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getProducer = useCallback((id: string): Producer | undefined => {
    return producerService.getCachedProducer(id);
  }, []);

  return {
    producers,
    loading,
    error,
    isLive,
    refresh,
    getProducer,
    totalCount: producers.length,
  };
}
