import { useMemo, type PropsWithChildren } from 'react';
import { VariableContextProvider } from 'react-native-css';

import { useTheme } from '@/hooks/use-theme';

/**
 * Bridges the runtime theme (which knows the user's accent color) into the CSS variables that
 * `global.css` declares statically. Variables from this context take precedence over the `:root`
 * ones, so every `bg-background` / `bg-background-element` / `bg-background-selected` class in the
 * app picks up the accent tint without each screen having to reach for `useTheme()`.
 */
export function ThemeVariablesProvider({ children }: PropsWithChildren) {
  const theme = useTheme();

  const value = useMemo(
    () => ({
      '--color-background': theme.background,
      '--color-background-element': theme.backgroundElement,
      '--color-background-selected': theme.backgroundSelected,
    }),
    [theme]
  );

  return <VariableContextProvider value={value}>{children}</VariableContextProvider>;
}
