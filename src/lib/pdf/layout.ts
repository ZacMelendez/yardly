/**
 * Shared layout constants for PDF generation.
 * Uses points (1/72 inch) as the unit.
 */

export const PAGE = {
    width: 612,
    height: 792,
    margin: 48,
} as const;

export const FONTS = {
    title: 24,
    subtitle: 14,
    body: 11,
    small: 9,
} as const;

export const COLORS = {
    primary: { r: 0.2, g: 0.5, b: 0.4 } as const, // Muted green - lawn care
    text: { r: 0.15, g: 0.15, b: 0.2 } as const,
    muted: { r: 0.45, g: 0.45, b: 0.5 } as const,
    border: { r: 0.85, g: 0.85, b: 0.88 } as const,
} as const;

export const LINE_HEIGHT = 1.35;
