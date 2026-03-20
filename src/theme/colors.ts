// Design System: "Warm Sommelier" — DESIGN.md is the single source of truth

export const colors = {
  // Core 5
  coral: '#F28482',
  honey: '#F6BD60',
  linen: '#F7EDE2',
  rose: '#F5CAC3',
  teal: '#84A59D',

  // Derived
  coralDark: '#e85d75',
  coralShadow: 'rgba(242, 132, 130, 0.4)',
  coralLight: 'rgba(242, 132, 130, 0.2)',
  honeyDark: '#d48c00',
  honeyLight: 'rgba(246, 189, 96, 0.2)',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textInverse: '#FFFFFF',

  // Surfaces
  surface: '#FFFFFF',
  borderSubtle: 'rgba(249, 250, 251, 0.5)',

  // Utility
  white: '#ffffff',
  danger: '#ef4444',

  // Gradient stops (for LinearGradient)
  gradient: {
    statsCard: ['#F28482', '#F6BD60'] as const,
  },

  // Status / Maturity
  status: {
    peak: '#84A59D',
    peakBg: 'rgba(132, 165, 157, 0.15)',
    approaching: '#F6BD60',
    approachingBg: 'rgba(246, 189, 96, 0.15)',
    young: '#5B8DBE',
    youngBg: 'rgba(91, 141, 190, 0.15)',
    pastPrime: '#F28482',
    pastPrimeBg: 'rgba(242, 132, 130, 0.15)',
  },

  // Wine type colors
  wine: {
    red: '#F28482',
    white: '#F6BD60',
    rose: '#F5CAC3',
    sparkling: '#F6BD60',
    dessert: '#d48c00',
    fortified: '#84A59D',
  },

  // Gray scale (kept for muted text / borders)
  muted: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Chart colors (updated to palette)
  chart: {
    cellar: ['#F28482', '#84A59D', '#F6BD60', '#F5CAC3', '#5B8DBE'],
    region: ['#F28482', '#84A59D', '#F6BD60', '#F5CAC3', '#5B8DBE', '#e85d75', '#d48c00', '#6b7280'],
    vintage: ['#84A59D', '#F28482', '#F6BD60', '#F5CAC3', '#5B8DBE'],
    grape: ['#84A59D', '#F28482', '#F6BD60', '#F5CAC3', '#5B8DBE'],
  },
} as const

// Legacy aliases — use during migration, then remove
export const chartColors = colors.chart
