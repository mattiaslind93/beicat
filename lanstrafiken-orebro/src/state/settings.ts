import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Language } from '@/i18n/translations';

interface SettingsState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'sv',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
