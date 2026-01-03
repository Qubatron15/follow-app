/**
 * Color Palette for FollowApp
 *
 * A sophisticated color scheme combining deep navy, soft neutrals,
 * and warm accents for a modern, elegant interface.
 */

export const palette = {
  /**
   * Charcoal Blue #223843
   * Deep navy undertones blend with smoky steely hues for a sophisticated shade
   * evoking midnight skies and modern elegance.
   */
  charcoalBlue: "#223843",

  /**
   * Platinum #eff1f3
   * Softly muted silver-white shade, evoking sophistication, understated luxury,
   * and serene modern interiors.
   */
  platinum: "#eff1f3",

  /**
   * Dust Grey #dbd3d8
   * Subtle, soft tone mirroring dusted stone, ideal for inviting warmth
   * and understated sophistication.
   */
  dustGrey: "#dbd3d8",

  /**
   * Desert Sand #d8b4a0
   * Soft, sandy beige whispers earthy calm, inviting serenity and a sense
   * of gentle grounding, like warm dunes.
   */
  desertSand: "#d8b4a0",

  /**
   * Burnt Peach #d77a61
   * Fiery, robust shade bursts with energy, merging glowing embers and ripe fruit
   * for a bold, unforgettable impression.
   */
  burntPeach: "#d77a61",
} as const;

/**
 * Semantic color mappings for UI components
 */
export const semanticColors = {
  // Primary brand color - used for main actions and highlights
  primary: palette.burntPeach,
  primaryHover: "#c96b52",

  // Background colors
  background: palette.platinum,
  backgroundElevated: "#ffffff",
  backgroundSubtle: palette.dustGrey,

  // Text colors
  textPrimary: palette.charcoalBlue,
  textSecondary: "#556872",
  textMuted: "#8a9ba5",
  textOnPrimary: "#ffffff",

  // Border colors
  border: palette.dustGrey,
  borderSubtle: "#e8e4e6",

  // Accent colors
  accent: palette.desertSand,
  accentHover: "#cda68f",

  // Status colors
  success: "#4ade80",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
} as const;
