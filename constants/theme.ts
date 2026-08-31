/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#F2F2F7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    accent: '#517A57',
    accentLight: '#8DA891',
    accentDark: '#426447',
  },
  dark: {
    text: '#f5f5f5',
    // The dark ladder needs a real gap between the page and the cards on it: the previous
    // #161616/#1c1c1c pair sat 6/255 apart (1.06:1), so a card read as "the background, but
    // black" rather than as an elevated surface. These land near iOS's own dark grouped-list
    // step (#000000/#1C1C1E, 1.23:1), with the page kept off pure black.
    background: '#0d0d0d',
    backgroundElement: '#242424',
    // Lifted alongside the element so the card -> selected step keeps its old size (1.22:1).
    backgroundSelected: '#333333',
    textSecondary: '#B0B4BA',
    accent: '#517A57',
    accentLight: '#8DA891',
    accentDark: '#426447',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
