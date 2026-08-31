import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ThemeMode = 'system' | 'light' | 'dark';

/** How strongly the accent color bleeds into the app's surfaces. */
export type BackgroundTint = 'off' | 'subtle' | 'medium' | 'strong';

export const BACKGROUND_TINTS: BackgroundTint[] = ['off', 'subtle', 'medium', 'strong'];

function isBackgroundTint(value: unknown): value is BackgroundTint {
  return BACKGROUND_TINTS.includes(value as BackgroundTint);
}

interface SettingsState {
  themeMode: ThemeMode;
  /** User-picked accent color (hex), or null to use the theme's default accent. */
  accentColor: string | null;
  /** Android only: derive the accent from the system's Material You palette instead. */
  dynamicAccent: boolean;
  /** Tints the app's surfaces toward the accent hue (Material You, dialled down). */
  backgroundTint: BackgroundTint;
  loaded: boolean;
}

interface SettingsActions {
  load: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setAccentColor: (color: string | null) => Promise<void>;
  setDynamicAccent: (enabled: boolean) => Promise<void>;
  setBackgroundTint: (tint: BackgroundTint) => Promise<void>;
}

const THEME_KEY = 'settings_theme_mode';
const ACCENT_COLOR_KEY = 'settings_accent_color';
const DYNAMIC_ACCENT_KEY = 'settings_dynamic_accent';
const BACKGROUND_TINT_KEY = 'settings_background_tint';

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  immer((set) => ({
    themeMode: 'system',
    accentColor: null,
    dynamicAccent: false,
    backgroundTint: 'medium',
    loaded: false,

    load: async () => {
      const [theme, accentColor, dynamicAccent, backgroundTint] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(ACCENT_COLOR_KEY),
        AsyncStorage.getItem(DYNAMIC_ACCENT_KEY),
        AsyncStorage.getItem(BACKGROUND_TINT_KEY),
      ]);

      set((s) => {
        s.themeMode = (theme as ThemeMode | null) ?? 'system';
        s.accentColor = accentColor ?? null;
        s.dynamicAccent = dynamicAccent === 'true';
        s.backgroundTint = isBackgroundTint(backgroundTint) ? backgroundTint : 'medium';
        s.loaded = true;
      });
    },

    setThemeMode: async (mode) => {
      set((s) => { s.themeMode = mode; });
      await AsyncStorage.setItem(THEME_KEY, mode);
    },

    setAccentColor: async (color) => {
      set((s) => { s.accentColor = color; });
      if (color) {
        await AsyncStorage.setItem(ACCENT_COLOR_KEY, color);
      } else {
        await AsyncStorage.removeItem(ACCENT_COLOR_KEY);
      }
    },

    setDynamicAccent: async (enabled) => {
      set((s) => { s.dynamicAccent = enabled; });
      await AsyncStorage.setItem(DYNAMIC_ACCENT_KEY, String(enabled));
    },

    setBackgroundTint: async (tint) => {
      set((s) => { s.backgroundTint = tint; });
      await AsyncStorage.setItem(BACKGROUND_TINT_KEY, tint);
    },
  })),
);
