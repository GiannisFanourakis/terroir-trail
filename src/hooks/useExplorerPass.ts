import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { confirmExplorerPass, fetchExplorerPass, type ExplorerPass } from '../services/explorerPass';

export function useExplorerPass(userId?: string) {
  const [verified, setVerified] = useState<{ userId: string; pass: ExplorerPass } | null>(null);
  const sequence = useRef(0);
  const currentUserId = useRef(userId);
  currentUserId.current = userId;
  const refreshExplorerPass = useCallback(async (sessionId?: string) => {
    const requestId = ++sequence.current;
    try {
      await auth?.authStateReady();
      if (!userId || auth?.currentUser?.uid !== userId) {
        setVerified(null);
        if (sessionId) throw new Error('Sign in to the account that purchased this pass.');
        return null;
      }
      if (sessionId) await confirmExplorerPass(sessionId);
      const { pass } = await fetchExplorerPass();
      if (requestId === sequence.current && currentUserId.current === userId && auth.currentUser?.uid === userId) {
        setVerified(pass ? { userId, pass } : null);
      }
      return pass;
    } catch (error) {
      if (requestId === sequence.current) setVerified(null);
      throw error;
    }
  }, [userId]);

  useEffect(() => {
    setVerified(null);
    const refresh = () => { void refreshExplorerPass().catch(() => {}); };
    const unsubscribe = auth ? onAuthStateChanged(auth, refresh) : undefined;
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => {
      ++sequence.current;
      unsubscribe?.();
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refreshExplorerPass]);

  useEffect(() => {
    if (!verified) return;
    const delay = Date.parse(verified.pass.expiresAt) - Date.now();
    const timer = window.setTimeout(() => setVerified(null), Math.max(0, Math.min(delay, 2147483647)));
    return () => clearTimeout(timer);
  }, [verified]);

  const pass = verified && verified.userId === userId && Date.parse(verified.pass.expiresAt) > Date.now() ? verified.pass : null;
  return { pass, refreshExplorerPass };
}
