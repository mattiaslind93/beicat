import { useSettings } from '@/state/settings';
import { translations, type Translations } from './translations';

/** Hook som ger aktuell översättningstabell utifrån valt språk. */
export function useT(): Translations {
  const language = useSettings((s) => s.language);
  return translations[language];
}

export type { Language } from './translations';
