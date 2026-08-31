import { AccentColorSwatches, DYNAMIC_ACCENT } from '@/components/ui/AccentColorSwatches';
import { NativeSwitch } from '@/components/ui/NativeSwitch';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  Chevron,
  SectionTitle,
  SegmentedList,
  SegmentedRow,
} from '@/components/ui/SegmentedList';
import { Colors } from '@/constants/theme';
import { useResolvedThemeMode, useTheme } from '@/hooks/use-theme';
import { useSystemAccentPalette } from '@/hooks/use-system-accent';
import { ScrollView, Text, View } from '@/tw';
import { BACKGROUND_TINTS, BackgroundTint, useSettingsStore, type ThemeMode } from '@/store/settings';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, uppercaseFirstLetter } from '@/lib/utils';
import { Stack } from 'expo-router';
import { useHeaderHeight } from 'expo-router/build/react-navigation';
import { MenuView } from '@expo/ui/community/menu';

const THEME_MODES: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function Settings() {
  const theme = useTheme();
  const mode = useResolvedThemeMode();
  const systemAccent = useSystemAccentPalette();

  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const setAccentColor = useSettingsStore((s) => s.setAccentColor);
  const dynamicAccent = useSettingsStore((s) => s.dynamicAccent);
  const setDynamicAccent = useSettingsStore((s) => s.setDynamicAccent);
  const backgroundTint = useSettingsStore((s) => s.backgroundTint);
  const setBackgroundTint = useSettingsStore((s) => s.setBackgroundTint);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: spacing(4), paddingHorizontal: spacing(4) }}
    >
      <Stack.Screen options={{ title: 'Settings' }} />

      <SectionTitle first>Theme</SectionTitle>
      <SegmentedList>
        <SegmentedRow
          leading="Mode"
          trailing={
            <MenuView
              key={themeMode}
              actions={THEME_MODES.map((m) => ({
                title: m.label,
                id: m.value,
                state: themeMode === m.value ? 'on' : 'off',
              }))}
              onPressAction={(evt) => {
                setThemeMode(evt.nativeEvent.event as ThemeMode);
              }}
            >
              {/* The trigger sits inside a content-sized SwiftUI host, so it has to
                  size itself: `flex-1` there collapses it to zero width. */}
              <View className="flex-row items-center gap-1">
                <Text themeColor="textSecondary">
                  {THEME_MODES.find((m) => m.value === themeMode)?.label ?? 'System'}
                </Text>
                <Chevron rotation={90} color={theme.text} />
              </View>
            </MenuView>
          }
        />
        <SegmentedRow>
          <View className="flex-col gap-2">
            <Text type="small" themeColor="text">
              Accent
            </Text>
            <AccentColorSwatches
              value={dynamicAccent ? DYNAMIC_ACCENT : accentColor}
              onChange={(choice) => {
                setDynamicAccent(choice === DYNAMIC_ACCENT);
                if (choice !== DYNAMIC_ACCENT) setAccentColor(choice);
              }}
              defaultColor={Colors[mode].accent}
              dynamicColor={systemAccent?.[mode]}
              dynamicLabel="Follow wallpaper"
            />
          </View>
        </SegmentedRow>
        <SegmentedRow
          leading="Background tint"
          trailing={
            <MenuView
              key={backgroundTint}
              actions={BACKGROUND_TINTS.map((m) => ({
                title: uppercaseFirstLetter(m),
                id: m,
                state: backgroundTint === m ? 'on' : 'off',
              }))}
              onPressAction={(evt) => {
                setBackgroundTint(evt.nativeEvent.event as BackgroundTint);
              }}
            >
              {/* The trigger sits inside a content-sized SwiftUI host, so it has to
                  size itself: `flex-1` there collapses it to zero width. */}
              <View className="flex-row items-center gap-1">
                <Text themeColor="textSecondary">
                  {uppercaseFirstLetter(BACKGROUND_TINTS.find((m) => m === backgroundTint) ?? 'off')}
                </Text>
                <Chevron rotation={90} color={theme.text} />
              </View>
            </MenuView>
          }
        />
      </SegmentedList>

      <SectionTitle>Row variants</SectionTitle>
      <SegmentedList>
        <SegmentedRow leading="With a chevron" trailing={<Chevron color={theme.textSecondary} />} onPress={() => {}} />
        <SegmentedRow leading="With a switch" trailing={<NativeSwitch value onValueChange={() => {}} />} />
        <SegmentedRow leading="Disabled" trailing={<Chevron />} disabled />
        <SegmentedRow leading="Destructive" destructive onPress={() => {}} />
      </SegmentedList>

      <View className="mt-6 rounded-[20px] bg-background-element p-4">
        <Text type="small" themeColor="textSecondary">
          accent {theme.accent} · background {theme.background} · element {theme.backgroundElement}
        </Text>
      </View>
    </ScrollView>
  );
}
