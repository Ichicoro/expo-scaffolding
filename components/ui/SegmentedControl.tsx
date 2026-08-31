import { Pressable, Text, View } from '@/tw';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View
      className="flex-row rounded-lg p-0.5 bg-zinc-200 dark:bg-zinc-700"
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`flex-1 py-1.5 rounded-md items-center justify-center ${
              selected
                ? 'bg-white dark:bg-zinc-500 shadow-sm'
                : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selected
                  ? 'text-foreground'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
