import { Pressable, View } from '@/tw';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

/** Curated palette; the first entry (`null`) resets to the theme's default accent. */
const PRESETS: (string | null)[] = [
  null,
  '#A195F5',
  '#6C5CE7',
  '#E74C3C',
  '#E67E22',
  '#F1C40F',
  '#2ECC71',
  '#1ABC9C',
  '#3498DB',
  '#E84393',
];

/** Picks the accent from Android's Material You palette rather than from a fixed color. */
export const DYNAMIC_ACCENT = 'dynamic';

export type AccentChoice = string | typeof DYNAMIC_ACCENT | null;

interface AccentColorSwatchesProps {
  value: AccentChoice;
  onChange: (color: AccentChoice) => void;
  defaultColor: string;
  /** The system's current accent, or null where Material You isn't available. */
  dynamicColor?: string | null;
  dynamicLabel?: string;
}

export function AccentColorSwatches({
  value,
  onChange,
  defaultColor,
  dynamicColor,
  dynamicLabel,
}: AccentColorSwatchesProps) {
  return (
    <View className="flex-row flex-wrap gap-3 bg-background-element">
      {PRESETS.map((color) => (
        <Swatch
          key={color ?? 'default'}
          color={color ?? defaultColor}
          selected={color === value}
          onPress={() => onChange(color)}
        />
      ))}
      {/* Last so the fixed palette keeps its order on devices without dynamic color. */}
      {dynamicColor && (
        <Swatch
          color={dynamicColor}
          selected={value === DYNAMIC_ACCENT}
          onPress={() => onChange(DYNAMIC_ACCENT)}
          accessibilityLabel={dynamicLabel}
          // Filled with the live system color, so it needs a mark of its own to read as
          // "follow the wallpaper" rather than as one more fixed swatch that happens to match.
          icon={{ ios: 'wand.and.stars', android: 'palette' }}
        />
      )}
    </View>
  );
}

interface SwatchProps {
  color: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  icon?: SymbolViewProps['name'];
}

function Swatch({ color, selected, onPress, accessibilityLabel, icon }: SwatchProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      <View
        className="w-9 h-9 rounded-full items-center justify-center border border-slate-950/20 dark:border-white/10"
        style={{ backgroundColor: color }}
      >
        {(selected || icon) && (
          <SymbolView
            name={selected ? { ios: 'checkmark', android: 'check' } : icon!}
            size={16}
            tintColor="white"
          />
        )}
      </View>
    </Pressable>
  );
}
