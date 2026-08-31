import React, { forwardRef, useMemo } from 'react';
import {
  PixelRatio,
  Platform,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { useCssElement } from 'react-native-css';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ViewProps = React.ComponentProps<typeof RNView> & { className?: string };

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: 'style' });
};
View.displayName = 'CSS(View)';

// Matches any `font-*` className token that sets a font *family* (e.g. `font-basteleur-bold`,
// `font-serif`), as opposed to a font *weight/style* utility (`font-bold`, `font-italic`, etc).
const FONT_FAMILY_CLASS_RE =
  /\bfont-(?!thin\b|extralight\b|light\b|normal\b|medium\b|semibold\b|bold\b|extrabold\b|black\b|italic\b|not-italic\b)\S+/;

// Defaults text-bearing elements to the app face (`--font-app`: the system font on iOS,
// Google Sans Flex on Android) unless the caller already picked a font family.
const withDefaultFontFamily = (className?: string) => {
  const hasFontFamilyClass = className ? FONT_FAMILY_CLASS_RE.test(className) : false;
  return hasFontFamilyClass ? className : ['font-app', className].filter(Boolean).join(' ');
};

export type TextType =
  | 'default'
  | 'title'
  | 'small'
  | 'smallBold'
  | 'subtitle'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type TextProps = React.ComponentProps<typeof RNText> & {
  className?: string;
  type?: TextType;
  themeColor?: ThemeColor;
  minimumFontSize?: number;
};

export const Text = (props: TextProps) => {
  const {
    className,
    type,
    themeColor,
    style,
    // iOS's "smaller text" accessibility setting shrinks text below the sizes we design for.
    // `minimumFontScale` can't prevent this (it only applies with `adjustsFontSizeToFit`), so
    // instead we only allow the OS to scale text *up* (larger accessibility sizes), never down.
    allowFontScaling = PixelRatio.getFontScale() >= 1,
    minimumFontSize,
    ...rest
  } = props;
  const theme = useTheme();
  const mergedClassName = withDefaultFontFamily(className);

  // react-native-css treats a changing `style` reference as new input on every render — the
  // original infinite-render-loop bug here was building a new style array with no memoization at
  // all, not the mere presence of an override. Wrapping in useMemo (keyed on the same props React
  // already re-renders on) keeps the reference stable, so it's safe to always fold the
  // minimumFontSize floor in here rather than only when an explicit style.fontSize undercuts it —
  // with no explicit size the underlying (native default / className-resolved) size is invisible
  // to us here anyway, so minimumFontSize wins.
  const mergedStyle = useMemo(() => {
    const base = [
      textBase,
      themeColor && { color: theme[themeColor] },
      type && textTypeStyles[type],
      style,
    ];
    if (minimumFontSize == null) return base;
    const flatFontSize = (StyleSheet.flatten(base) as TextStyle | undefined)?.fontSize;
    const floored = typeof flatFontSize === 'number' ? Math.max(flatFontSize, minimumFontSize) : minimumFontSize;
    return [base, { color: theme.text, fontSize: floored, fontWeight: 700 }];
  }, [themeColor, type, style, theme, minimumFontSize]);

  return useCssElement(
    RNText,
    {
      ...rest,
      allowFontScaling,
      className: mergedClassName,
      style: mergedStyle,
    },
    { className: 'style' }
  );
};
Text.displayName = 'CSS(Text)';

// Carried over from the Figtree era: every text type gets a little tracking. Both faces we ship
// now (the iOS system font, Google Sans Flex on Android) are optically spaced already, so this is
// a deliberate look rather than a correction.
const LETTER_SPACING = Platform.select({ ios: 0.0, android: 0.5 });

type FontWeight = 400 | 500 | 600 | 700 | 800 | 900;

/** Baseline tracking, applied under every Text and TextInput so untyped callers get it too. */
const textBase = { letterSpacing: LETTER_SPACING };

const textType = ({
  fontSize,
  lineHeight,
  fontWeight = 400,
}: {
  fontSize: number;
  lineHeight: number;
  fontWeight?: FontWeight;
}): TextStyle => ({
  fontSize,
  lineHeight,
  fontWeight,
});

const textTypeStyles = StyleSheet.create({
  small: textType({ fontSize: 14, lineHeight: 20, fontWeight: 500 }),
  smallBold: textType({ fontSize: 14, lineHeight: 20, fontWeight: 700 }),
  default: textType({ fontSize: 16, lineHeight: 24, fontWeight: 500 }),
  title: textType({ fontSize: 48, lineHeight: 52, fontWeight: 600 }),
  subtitle: textType({ fontSize: 32, lineHeight: 44, fontWeight: 600 }),
  link: textType({ fontSize: 14, lineHeight: 30 }),
  linkPrimary: { ...textType({ fontSize: 14, lineHeight: 30 }), color: '#3c87f7' },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
    // Opts out of textBase: the mono face is already evenly spaced by design.
    letterSpacing: 0,
  },
});

export const ScrollView = forwardRef<
  RNScrollView,
  React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
>((props, ref) => {
  return (useCssElement as (...args: unknown[]) => React.ReactElement)(
    RNScrollView,
    { ...props, ref },
    {
      className: 'style',
      contentContainerClassName: 'contentContainerStyle',
    }
  );
});
ScrollView.displayName = 'CSS(ScrollView)';

export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
) => {
  return (useCssElement as (...args: unknown[]) => React.ReactElement)(RNPressable, props, {
    className: 'style',
  });
};
Pressable.displayName = 'CSS(Pressable)';

export const TextInput = forwardRef<
  RNTextInput,
  React.ComponentProps<typeof RNTextInput> & { className?: string; minimumFontSize?: number }
>((props, ref) => {
  const { className, minimumFontSize = 19, style, cursorColor, selectionColor, ...rest } = props;
  const theme = useTheme();
  // Same fix as Text's mergedStyle above: the useMemo (not the presence or
  // absence of an override) is what keeps the style reference stable across
  // renders, so it's safe to always fold minimumFontSize in as a floor. With
  // no explicit style.fontSize, the underlying size is invisible to us here,
  // so minimumFontSize wins rather than being treated as a no-op.
  const mergedStyle = useMemo(() => {
    if (minimumFontSize == null || Platform.OS === "android") return [textBase, style];
    const flatFontSize = (StyleSheet.flatten(style) as TextStyle | undefined)?.fontSize;
    const floored = typeof flatFontSize === 'number' ? Math.max(flatFontSize, minimumFontSize) : minimumFontSize;
    return [textBase, style, { fontSize: floored }];
  }, [style, minimumFontSize]);
  return (useCssElement as (...args: unknown[]) => React.ReactElement)(
    RNTextInput,
    {
      ...rest, ref,
      className: withDefaultFontFamily(className),
      minimumFontSize,
      cursorColor: cursorColor ?? theme.accent,
      selectionColor: selectionColor ?? theme.accent,
      style: mergedStyle,
    },
    { className: 'style' }
  );
});
TextInput.displayName = 'CSS(TextInput)';

export const KeyboardAvoidingView = (
  props: React.ComponentProps<typeof RNKeyboardAvoidingView> & { className?: string }
) => {
  return useCssElement(RNKeyboardAvoidingView, props, { className: 'style' });
};
KeyboardAvoidingView.displayName = 'CSS(KeyboardAvoidingView)';
