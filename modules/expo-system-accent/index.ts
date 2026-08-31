import { requireOptionalNativeModule } from 'expo';

/** The system's primary tone for each color scheme, as `#rrggbb`. */
export interface SystemAccentPalette {
  light: string;
  dark: string;
}

interface ExpoSystemAccentModule {
  getPalette(): SystemAccentPalette | null;
}

// Optional so the JS bundle still runs against a dev build that predates this module, and on
// iOS/web where there's no native side at all, instead of throwing at import time.
const native = requireOptionalNativeModule<ExpoSystemAccentModule>('ExpoSystemAccent');

/**
 * Android's Material You palette, derived by the system from the wallpaper seed color. Null
 * wherever dynamic color doesn't exist: iOS, web, Android below 12, and dev builds without
 * this module compiled in. Cheap enough to call on every foreground — it's a resource lookup.
 */
export function getSystemAccentPalette(): SystemAccentPalette | null {
  return native?.getPalette() ?? null;
}

/**
 * Whether the running build can report a Material You palette at all. A function rather than a
 * constant: at import time the native module may not have an Android context yet, and caching a
 * false from that window would hide the setting for the rest of the session.
 */
export function isSystemAccentAvailable(): boolean {
  return getSystemAccentPalette() != null;
}
