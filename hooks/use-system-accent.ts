import { getSystemAccentPalette, type SystemAccentPalette } from 'expo-system-accent';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Android's Material You palette, re-read whenever the app comes back to the foreground —
 * changing the wallpaper (and with it the seed color) happens outside the app, and the system
 * doesn't always recreate us for it. Null on every platform without dynamic color.
 *
 * The state only changes identity when the colors actually change, so it's safe to use as a
 * dependency of the memoized theme.
 */
export function useSystemAccentPalette(): SystemAccentPalette | null {
  const [palette, setPalette] = useState(getSystemAccentPalette);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const next = getSystemAccentPalette();
      setPalette((current) =>
        current?.light === next?.light && current?.dark === next?.dark ? current : next
      );
    });
    return () => subscription.remove();
  }, []);

  return palette;
}
