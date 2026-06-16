/**
 * NULAP Design System - Neobrutalism × Editorial Dark
 * Colors, typography, and spacing tokens matching web frontend
 */

export const colors = {
  // Core colors (from design-requirements.md)
  base: '#1A1A18',
  surface: '#242420',
  surfaceRaised: '#2E2E29',
  border: '#3D3D38',
  borderStrong: '#F0EBD8',

  // Text colors
  textPrimary: '#F0EBD8',
  textSecondary: '#A09A8A',
  textMuted: '#5A5650',

  // Accent colors
  accentPrimary: '#C8622A',    // Orange - CTA, highlights
  accentSecondary: '#4A7C59',  // Green - success, progress
  accentTertiary: '#C4A951',   // Gold - badges, tags

  // Semantic colors
  success: '#4A7C59',
  warning: '#D4803A',
  danger: '#C0392B',
  info: '#2C6EAB',

  // Transparent variants
  accentPrimaryAlpha: 'rgba(200, 98, 42, 0.15)',
  accentSecondaryAlpha: 'rgba(74, 124, 89, 0.15)',
  accentTertiaryAlpha: 'rgba(196, 169, 81, 0.15)',
} as const;

export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  displayBlack: 'PlayfairDisplay_900Black',
  heading: 'SpaceMono_400Regular',
  headingBold: 'SpaceMono_700Bold',
  body: 'Lora_400Regular',
  bodyBold: 'Lora_700Bold',
  bodyItalic: 'Lora_400Regular_Italic',
  mono: 'SpaceMono_400Regular',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 16,
  md: 20,
  lg: 28,
  xl: 40,
  '2xl': 60,
} as const;

export const lineHeight = {
  xs: 11 * 1.4,
  sm: 13 * 1.5,
  base: 16 * 1.7,
  md: 20 * 1.5,
  lg: 28 * 1.3,
  xl: 40 * 1.1,
  '2xl': 60 * 1.0,
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const borderRadius = {
  none: 0,    // Default for Neobrutalism
  sm: 2,
  md: 4,      // Max for main elements per design doc
} as const;

export const shadows = {
  // Neobrutalism box shadows (offset, no blur)
  card: {
    shadowColor: colors.borderStrong,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHover: {
    shadowColor: colors.borderStrong,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

export const bottomNavHeight = 64;
export const cardPadding = 16;
export const screenPadding = 16;

export type Colors = typeof colors;
export type Fonts = typeof fonts;
export type FontSize = typeof fontSize;
export type Spacing = typeof spacing;
