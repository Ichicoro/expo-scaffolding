/** Relative luminance per WCAG, used to pick text/background pairings that stay readable. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [rl, gl, bl] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hexA: string, hexB: string): number {
  const [la, lb] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
  return (la + 0.05) / (lb + 0.05);
}

/**
 * Darkens a hex color (in HSL lightness) until it has enough contrast against white text.
 * Some theme colors (e.g. pastel accents) look fine with dark text but aren't dark enough
 * for white text to stay legible on platforms that render it that way.
 */
export function darkenForWhiteText(hex: string, minContrast = 4.5): string {
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(normalized.slice(i, i + 2), 16));

  for (let step = 0; step < 20 && contrastRatio(rgbToHex(r, g, b), '#ffffff') < minContrast; step++) {
    r = Math.round(r * 0.92);
    g = Math.round(g * 0.92);
    b = Math.round(b * 0.92);
  }

  return rgbToHex(r, g, b);
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  return [1, 3, 5].map((i) => parseInt(normalized.slice(i, i + 2), 16)) as [number, number, number];
}

/** Blends a hex color toward white by `amount` (0-1). */
export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return rgbToHex(mix(r), mix(g), mix(b));
}

/** Restates a hex color with an alpha channel (0-1), as the `#rrggbbaa` form RN accepts. */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return `${rgbToHex(r, g, b)}${a.toString(16).padStart(2, '0')}`;
}

/** Blends a hex color toward black by `amount` (0-1). */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => Math.round(c * (1 - amount));
  return rgbToHex(mix(r), mix(g), mix(b));
}

type Hsl = { h: number; s: number; l: number };

function hexToHsl(hex: string): Hsl {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { h: 0, s: 0, l };

  const s = delta / (1 - Math.abs(2 * l - 1));
  const h =
    max === r
      ? ((g - b) / delta) % 6
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;

  return { h: (h * 60 + 360) % 360, s, l };
}

function hslToHex({ h, s, l }: Hsl): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return rgbToHex(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
}

/**
 * Lightness floor for the mix target. Every dark surface sits below it, so they all aim at this
 * same lightness — which makes it the ceiling on how light a tinted dark card can get, whatever
 * the tint level asks for. At 0.14 that ceiling was low enough to keep dark cards flat against
 * the page no matter how far the tint was turned up.
 */
const MIN_TINT_LIGHTNESS = 0.2;

/**
 * Pulls a neutral surface toward the accent's hue — the Material You trick, dialled way down.
 *
 * The surface is mixed by `strength` (0-1) with a color that carries the accent's hue at the
 * surface's own lightness, so the result barely shifts in lightness: dark mode stays dark and
 * the background/element/selected hierarchy survives. Lightness is clamped away from the ends
 * of the range first, because pure white and near-black can't hold any chroma in HSL — without
 * that, `#ffffff` cards would come back exactly white. Grey accents leave the surface untouched.
 */
export function tintSurface(surface: string, accent: string, strength: number): string {
  const { h, s } = hexToHsl(accent);
  if (s === 0 || strength <= 0) return surface;

  const { l } = hexToHsl(surface);
  // The tint color's own saturation is floored as well as capped: a muted accent like a sage
  // green would otherwise wash out to plain grey at every mix strength, while a neon one would
  // blow past "slightly tinted" — the level, not the accent, should decide how loud this reads.
  const tintSaturation = Math.min(Math.max(s, 0.3), 0.7);
  const tint = hexToRgb(
    hslToHex({ h, s: tintSaturation, l: Math.min(Math.max(l, MIN_TINT_LIGHTNESS), 0.92) })
  );
  const [r, g, b] = hexToRgb(surface);

  const mix = (c: number, t: number) => Math.round(c + (t - c) * strength);
  return rgbToHex(mix(r, tint[0]), mix(g, tint[1]), mix(b, tint[2]));
}
