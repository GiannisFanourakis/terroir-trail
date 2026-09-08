import { useState, useEffect, useCallback } from 'react';
import { UserProfile, TravelerType } from '../types/auth';

const STORAGE_KEY = 'terroir_trail_user';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  giannis: {
    id: 'user_giannis',
    name: 'Giannis Fanourakis',
    email: 'giannis@terroirtrail.gr',
    avatar: '🇬🇷',
    hometown: 'Heraklion, Crete',
    travelerType: 'crete_local',
    visitedProducers: ['charma-brewery', 'paterianakis', 'gasparis-dairy', 'biolea-astrikas'],
    personalNotes: {
      'charma-brewery': 'Unpasteurized draft on the open-air deck is unbeatable on a warm Cretan afternoon.',
      'paterianakis': 'Their indigenous organic Vidiano fermented in oak has incredible minerality.',
    },
    memberSince: '2026',
  },
  elena: {
    id: 'user_elena',
    name: 'Elena Kazantzaki',
    email: 'elena.wine@sommelier.eu',
    avatar: '🍷',
    hometown: 'Athens / Santorini',
    travelerType: 'wine_enthusiast',
    visitedProducers: ['vassaltis-santorini', 'skouras-nemea', 'thymiopoulos-naoussa'],
    personalNotes: {
      'vassaltis-santorini': 'Pure basalt salinity and razor-sharp acidity. World-class Assyrtiko.',
    },
    memberSince: '2026',
  },
  markos: {
    id: 'user_markos',
    name: 'Markos V.',
    email: 'markos@craftbrews.gr',
    avatar: '🍺',
    hometown: 'Chania, Crete',
    travelerType: 'craft_beer_explorer',
    visitedProducers: ['solo-brewery', 'lafkas-brewery', 'santorini-brewing'],
    personalNotes: {
      'solo-brewery': 'Fourtouna Black IPA is arguably one of the best craft beers in Southern Europe.',
    },
    memberSince: '2026',
  },
};

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error reading auth from localStorage:', e);
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error writing auth to localStorage:', e);
    }
  }, [user]);

  const loginAsDemo = useCallback((demoKey: 'giannis' | 'elena' | 'markos') => {
    const profile = DEMO_PROFILES[demoKey] || DEMO_PROFILES.giannis;
    setUser({ ...profile });
  }, []);

  const login = useCallback((email: string, name?: string) => {
    const inferredName = name || email.split('@')[0];
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: inferredName.charAt(0).toUpperCase() + inferredName.slice(1),
      email,
      avatar: '🧭',
      hometown: 'Explorer',
      travelerType: 'culinary_nomad',
      visitedProducers: [],
      personalNotes: {},
      memberSince: '2026',
    };
    setUser(newUser);
  }, []);

  const signup = useCallback((name: string, email: string, travelerType: TravelerType = 'culinary_nomad') => {
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: travelerType === 'crete_local' ? '🇬🇷' : travelerType === 'craft_beer_explorer' ? '🍺' : '🍇',
      hometown: travelerType === 'crete_local' ? 'Crete, Greece' : 'World Traveler',
      travelerType,
      visitedProducers: [],
      personalNotes: {},
      memberSince: '2026',
    };
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Toggle visited / check-in stamp
  const toggleVisited = useCallback((producerId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const isAlready = prev.visitedProducers.includes(producerId);
      const updated = isAlready
        ? prev.visitedProducers.filter((id) => id !== producerId)
        : [...prev.visitedProducers, producerId];
      return {
        ...prev,
        visitedProducers: updated,
      };
    });
  }, []);

  const isVisited = useCallback((producerId: string) => {
    return user ? user.visitedProducers.includes(producerId) : false;
  }, [user]);

  // Save personal tasting note
  const saveTastingNote = useCallback((producerId: string, note: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newNotes = { ...prev.personalNotes };
      if (note.trim()) {
        newNotes[producerId] = note.trim();
      } else {
        delete newNotes[producerId];
      }
      return {
        ...prev,
        personalNotes: newNotes,
      };
    });
  }, []);

  const getTastingNote = useCallback((producerId: string) => {
    return user?.personalNotes[producerId] || '';
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    loginAsDemo,
    logout,
    toggleVisited,
    isVisited,
    saveTastingNote,
    getTastingNote,
  };
};
