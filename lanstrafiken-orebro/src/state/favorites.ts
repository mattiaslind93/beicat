import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { StopLocation } from '@/api/resrobot';

interface FavoritesState {
  stops: StopLocation[];
  isFavorite: (extId: string) => boolean;
  toggle: (stop: StopLocation) => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      stops: [],
      isFavorite: (extId) => get().stops.some((s) => s.extId === extId),
      toggle: (stop) =>
        set((state) => ({
          stops: state.stops.some((s) => s.extId === stop.extId)
            ? state.stops.filter((s) => s.extId !== stop.extId)
            : [...state.stops, stop],
        })),
    }),
    {
      name: 'favorite-stops',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
