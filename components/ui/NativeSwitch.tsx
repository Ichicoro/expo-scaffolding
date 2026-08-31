import { useResolvedThemeMode, useTheme } from '@/hooks/use-theme';
import { Host, Switch } from '@expo/ui';
import { Platform } from 'react-native';

interface NativeSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/**
 * The @expo/ui switch is a real UISwitch/Compose Switch, so it needs a Host to bridge
 * into SwiftUI/Compose. `seedColor` is what tints it on both platforms — there are no
 * track/thumb color props — and `colorScheme` keeps it on the app's theme rather than
 * the device's when the two disagree.
 */
export function NativeSwitch({ value, onValueChange }: NativeSwitchProps) {
  const theme = useTheme();
  const resolvedScheme = useResolvedThemeMode();
  return (
    <Host
      matchContents
      colorScheme={resolvedScheme}
      seedColor={theme.accent}
      // Compose pads the 32dp switch out to a 48dp minimum touch target. Pull that padding
      // back out of the layout — the touch target itself stays — so the row sits at the
      // same height as every other one.
      style={Platform.OS === 'android' ? { marginVertical: -8 } : undefined}
    >
      <Switch value={value} onValueChange={onValueChange} />
    </Host>
  );
}
