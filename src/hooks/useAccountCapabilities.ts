import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchAccountCapabilities,
  type AccountCapabilities,
} from '../services/adminApi';

export function useAccountCapabilities(userId?: string) {
  const [capabilities, setCapabilities] = useState<AccountCapabilities | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sequence = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++sequence.current;
    if (!userId) {
      setCapabilities(null);
      setError(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const { capabilities: next } = await fetchAccountCapabilities();
      if (requestId === sequence.current && next.uid === userId) {
        setCapabilities(next);
      }
      return next;
    } catch (err) {
      if (requestId === sequence.current) {
        setCapabilities(null);
        setError(err instanceof Error ? err.message : 'Unable to verify account permissions.');
      }
      return null;
    } finally {
      if (requestId === sequence.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setCapabilities(null);
    setError(null);
    if (!userId) return;
    void refresh();
    return () => { ++sequence.current; };
  }, [refresh, userId]);

  return { capabilities, loading, error, refresh };
}
