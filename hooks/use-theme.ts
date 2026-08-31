/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSystemAccentPalette } from '@/hooks/use-system-accent';
import { darken, lighten, tintSurface } from '@/lib/color';
import { useSettingsStore, type BackgroundTint } from '@/store/settings';
import { useMemo } from 'react';
import { Platform } from 'react-native';

export function useResolvedThemeMode(): 'light' | 'dark' {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);

  return themeMode === 'system'
    ? systemScheme === 'unspecified' || !systemScheme
      ? 'light'
      : systemScheme
    : themeMode;
}

type SurfaceTint = Record<'background' | 'backgroundElement' | 'backgroundSelected', number>;

/**
 * How much of the accent's hue each surface absorbs, per tint level, in light mode. Cards stay
 * the least tinted so they keep separating from the background, and the "selected" state leans
 * on the tint hardest.
 */
const SURFACE_TINT: Record<Exclude<BackgroundTint, 'off'>, SurfaceTint> = {
  subtle: { background: 0.14, backgroundElement: 0.1, backgroundSelected: 0.18 },
  medium: { background: 0.28, backgroundElement: 0.2, backgroundSelected: 0.34 },
  strong: { background: 0.45, backgroundElement: 0.34, backgroundSelected: 0.52 },
};

/**
 * Dark mode runs its own ladder, ordered the *opposite* way: the page stays close to neutral
 * black and each surface picks up more of the accent as it elevates, the way Material's tonal
 * surfaces do. Reusing the light ordering here put the most hue on the darkest surface, where
 * there isn't enough lightness left to show it — a mix that measures as tinted but reads as
 * plain grey — while the cards above it, which have the lightness to carry a hue, got the least.
 *
 * The numbers aren't a scaled copy of the light ones either: a given mix is roughly twice as
 * chromatic against near-black as against near-white, so the levels are set from the resulting
 * saturation instead (amber at `medium` lands cards around S=0.15, which reads as brown rather
 * than grey), and only the top of the ladder needs to run near the light values.
 */
const DARK_SURFACE_TINT: Record<Exclude<BackgroundTint, 'off'>, SurfaceTint> = {
  subtle: { background: 0.06, backgroundElement: 0.12, backgroundSelected: 0.16 },
  medium: { background: 0.12, backgroundElement: 0.24, backgroundSelected: 0.3 },
  strong: { background: 0.2, backgroundElement: 0.4, backgroundSelected: 0.48 },
};

/**
 * Android runs the ladder harder. The levels above are set for iOS, where a tinted surface is a
 * deviation from the system's neutral greys; on Android the same surface sits next to Material
 * You's own tonal surfaces, which carry far more of the seed color, so a tint that reads as
 * deliberate on iOS reads as an almost-grey mistake there. At 1.5, `medium` lands dark cards
 * around S=0.21 — in the range M3 generates for a surface container.
 *
 * The boost tapers off at the top rather than applying evenly: past roughly S=0.3 a near-black
 * surface stops reading as "tinted" and starts reading as muddy brown, and `strong` is already
 * close to that line before any platform scaling. So `strong` gets only a token lift — the
 * headroom the level ladder has left at that point is what limits it, not the platform.
 */
const ANDROID_TINT_SCALE: Record<Exclude<BackgroundTint, 'off'>, number> = {
  subtle: 1.5,
  medium: 1.5,
  strong: 1.1,
};

function scaleTint(level: SurfaceTint, name: Exclude<BackgroundTint, 'off'>): SurfaceTint {
  if (Platform.OS !== 'android') return level;
  // Clamped because a scaled level asking for more than a full mix is read by `tintSurface` as
  // "replace the surface with the tint color".
  const scale = (value: number) => Math.min(1, value * ANDROID_TINT_SCALE[name]);
  return {
    background: scale(level.background),
    backgroundElement: scale(level.backgroundElement),
    backgroundSelected: scale(level.backgroundSelected),
  };
}

export function useTheme() {
  const mode = useResolvedThemeMode();
  const base = Colors[mode];
  const accentColor = useSettingsStore((s) => s.accentColor);
  const dynamicAccent = useSettingsStore((s) => s.dynamicAccent);
  const backgroundTint = useSettingsStore((s) => s.backgroundTint);
  const systemAccent = useSystemAccentPalette();

  // Memoized because consumers (see `Text` in `@/tw`) fold this into style arrays whose
  // reference has to stay stable across renders.
  return useMemo(() => {
    // Material You wins over the swatch when it's both switched on and actually available, so a
    // build or device without dynamic color falls back to whatever the user picked by hand.
    const override = (dynamicAccent ? systemAccent?.[mode] : null) ?? accentColor;
    const accent = override ?? base.accent;
    const ladder = mode === 'dark' ? DARK_SURFACE_TINT : SURFACE_TINT;
    const level =
      backgroundTint === 'off' ? null : scaleTint(ladder[backgroundTint], backgroundTint);

    return {
      ...base,
      ...(override && {
        accent: override,
        accentLight: lighten(override, 0.35),
        accentDark: darken(override, 0.18),
      }),
      ...(level && {
        background: tintSurface(base.background, accent, level.background),
        backgroundElement: tintSurface(base.backgroundElement, accent, level.backgroundElement),
        backgroundSelected: tintSurface(base.backgroundSelected, accent, level.backgroundSelected),
      }),
    };
  }, [base, mode, accentColor, dynamicAccent, systemAccent, backgroundTint]);
}
