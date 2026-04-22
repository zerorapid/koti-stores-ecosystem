// ─── Design System Tokens ────────────────────────────────────────────────────
// Single source of truth for all colors, spacing, typography, and radii.
// Import from here — never hardcode values in screen files.

export const Colors = {
  // Brand
  primary:        '#d32f2f',
  primaryLight:   '#ffebee',
  primaryDark:    '#b71c1c',

  // Semantic
  success:        '#4caf50',
  successLight:   '#e8f5e9',
  warning:        '#f59e0b',
  warningLight:   '#fffbeb',
  error:          '#ef4444',
  errorLight:     '#fef2f2',
  info:           '#0284c7',
  infoLight:      '#e0f2fe',

  // Neutrals
  black:          '#111111',
  dark:           '#1a1a1a',
  text:           '#333333',
  textSecondary:  '#666666',
  textTertiary:   '#888888',
  placeholder:    '#aaaaaa',
  border:         '#eeeeee',
  divider:        '#f0f0f0',
  surfaceGray:    '#f8f9fa',
  surface:        '#ffffff',
  overlay:        'rgba(0,0,0,0.4)',

  // Luxury
  gold:           '#D4AF37', // Metallic Gold
  goldLight:      '#F3E5AB', // Silk Gold
  goldDark:       '#AA771C', // Deep Gold
  goldGlow:       '#FFD700', // Bright Gold

  // New Luxury Tiers
  platinum:       '#E5E4E2',
  platinumDark:   '#708090',
  violet:         '#7C3AED', // Luxury Violet
  violetLight:    '#EDE9FE',
  
  // Gradients (Represented as primary colors for now)
  grandRed:       '#E11D48', // Zomato-inspired Red
  grandRedDark:   '#9F1239',
};

export const Spacing = {
  xxs: 4,
  xs:  8,
  sm:  12,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const Typography = {
  // Display
  display:  { fontSize: 28, fontWeight: '700' as const, color: Colors.text },
  // Headings
  h1:       { fontSize: 24, fontWeight: '700' as const, color: Colors.text },
  h2:       { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  h3:       { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  // Body
  bodyLg:   { fontSize: 16, fontWeight: '400' as const, color: Colors.text },
  body:     { fontSize: 14, fontWeight: '400' as const, color: Colors.text },
  bodySm:   { fontSize: 13, fontWeight: '400' as const, color: Colors.textSecondary },
  // Labels
  label:    { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  labelSm:  { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
  // Caption
  caption:  { fontSize: 12, fontWeight: '400' as const, color: Colors.textTertiary },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  premium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 5,
  }
};
