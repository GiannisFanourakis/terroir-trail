import { useState, useEffect, useCallback } from 'react';
import { ProducerOverride } from '../types/booking';
import { 
  getLocalProducerOverrides, 
  saveProducerOverride, 
  isFirebaseConfigured, 
  db 
} from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export const useProducerPortal = () => {
  const [overrides, setOverrides] = useState<Record<string, ProducerOverride>>(() =>
    getLocalProducerOverrides()
  );

  // Sync with Firestore public overrides (public read for map/details)
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      try {
        const unsubscribe = onSnapshot(collection(db, 'producer_overrides'), (snapshot) => {
          const map: Record<string, ProducerOverride> = {};
          snapshot.forEach((docSnap) => {
            map[docSnap.id] = docSnap.data() as ProducerOverride;
          });
          setOverrides(map);
        });
        return () => unsubscribe();
      } catch (e) {
        console.warn('Could not establish Firestore producer overrides listener:', e);
      }
    }
  }, []);

  const updateOverride = useCallback(
    async (override: ProducerOverride) => {
      const producerId = override.producerId;
      await saveProducerOverride(override);
      setOverrides((prev) => ({ ...prev, [producerId]: override }));
    },
    []
  );

  const getOverride = useCallback(
    (producerId: string): ProducerOverride | undefined => {
      return overrides[producerId];
    },
    [overrides]
  );

  return {
    overrides,
    updateOverride,
    getOverride,
  };
};
