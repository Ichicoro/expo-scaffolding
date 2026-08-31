import '@/global.css';

import { ThemeVariablesProvider } from '@/components/theme-variables-provider';
import { useSettingsStore } from '@/store/settings';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { colorScheme } from 'react-native-css';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

export default function RootLayout() {
  const loadSettings = useSettingsStore((s) => s.load);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const systemScheme = useColorScheme();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const effectiveScheme =
    themeMode === 'system' ? systemScheme : themeMode === 'dark' ? 'dark' : 'light';

  // Two separate consumers of the same choice: `colorScheme` drives the `dark:` variants in
  // react-native-css, while `Appearance` drives native surfaces (keyboards, native controls).
  // 'unspecified' hands the latter back to the OS when the user is on "system".
  useEffect(() => {
    colorScheme.set(effectiveScheme ?? 'light');
    Appearance.setColorScheme(themeMode === 'system' ? 'unspecified' : effectiveScheme);
  }, [effectiveScheme, themeMode]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider value={effectiveScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ThemeVariablesProvider>
          <Stack screenOptions={{
            headerTransparent: true,
            headerBackButtonDisplayMode: "minimal",
            headerBackButtonMenuEnabled: true,
            headerShown: true,
            // scrollEdgeEffects: { top: "soft" }
          }} />
          <StatusBar style="auto" />
        </ThemeVariablesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
