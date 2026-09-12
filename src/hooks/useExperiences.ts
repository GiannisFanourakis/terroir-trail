import { useState, useEffect, useCallback } from 'react';
import { TastingExperience } from '../types/booking';
import { producerService } from '../services/producerService';

export interface UseExperiencesResult {
  experiences: TastingExperience[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
  refresh: () => Promise<void>;
}

/**
 * Authoritative hook for tasting experiences.
 *
 * When Supabase is configured and succeeds:
 * - Returns authoritative live experiences from Supabase.
 * - If Supabase returns zero rows, experiences is an empty array.
 *
 * When Supabase is unconfigured or request genuinely fails:
 * - Falls back to static bundled experiences (ALL_EXPERIENCES).
 */
export function useExperiences(producerId?: string): UseExperiencesResult {
  const [experiences, setExperiences] = useState<TastingExperience[]>(() =>
    producerService.getCachedExperiences(producerId)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(() => producerService.isLiveDb());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await producerService.getExperiences(producerId);
      setExperiences(data);
      setIsLive(producerService.isLiveDb());
    } catch (err: any) {
      setError(err.message || 'Failed to load experiences');
    } finally {
      setLoading(false);
    }
  }, [producerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    experiences,
    loading,
    error,
    isLive,
    refresh,
  };
}
