/**
 * Enkel designtoken-uppsättning. Slutlig grafisk profil tas fram separat —
 * färgerna utgår tills vidare från Länstrafikens lila profilfärg.
 */
export const colors = {
  primary: '#4F2D7F',
  primaryDark: '#3A2160',
  accent: '#FFC845',
  background: '#F6F5F8',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#5F5C6B',
  border: '#E3E1E8',
  success: '#1E8A44',
  warning: '#B7791F',
  danger: '#C0392B',
  realtime: '#1E8A44',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;
