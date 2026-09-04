import { useResolvedThemeMode, useTheme } from '@/hooks/use-theme';
import { Pressable, Text, View } from '@/tw';
import { SymbolView } from 'expo-symbols';
import React, { Children, isValidElement } from 'react';
import { Platform, StyleSheet, type ViewStyle } from 'react-native';

interface SegmentedListProps {
  children: React.ReactNode;
  className?: string;
}

/** Material's grouped list: separate cards, large radius on the group's outer corners
 *  and a small one on the interior ones, with a hairline of space between rows. */
const ANDROID_OUTER_RADIUS = 20;
const ANDROID_INNER_RADIUS = 8;
const ANDROID_ROW_GAP = 3;

const GROUP_RADIUS = 20;

/**
 * Corners and spacing for one row of a grouped list, given where it sits in its group.
 * Android rounds and gaps every row into its own card; iOS rounds only the group's ends
 * so the rows read as a single block with dividers between them.
 *
 * Rows are laid out one at a time — inside a list's `renderItem`, or by `SegmentedList` —
 * so the shape has to be derivable from position alone.
 */
export function groupedRowStyle(isFirst: boolean, isLast: boolean): ViewStyle {
  if (Platform.OS === 'android') {
    return {
      overflow: 'hidden',
      marginTop: isFirst ? 0 : ANDROID_ROW_GAP,
      borderTopLeftRadius: isFirst ? ANDROID_OUTER_RADIUS : ANDROID_INNER_RADIUS,
      borderTopRightRadius: isFirst ? ANDROID_OUTER_RADIUS : ANDROID_INNER_RADIUS,
      borderBottomLeftRadius: isLast ? ANDROID_OUTER_RADIUS : ANDROID_INNER_RADIUS,
      borderBottomRightRadius: isLast ? ANDROID_OUTER_RADIUS : ANDROID_INNER_RADIUS,
    };
  }
  return {
    overflow: 'hidden',
    borderCurve: 'continuous',
    borderTopLeftRadius: isFirst ? GROUP_RADIUS : 0,
    borderTopRightRadius: isFirst ? GROUP_RADIUS : 0,
    borderBottomLeftRadius: isLast ? GROUP_RADIUS : 0,
    borderBottomRightRadius: isLast ? GROUP_RADIUS : 0,
  };
}

/** Whether a divider belongs above a row — Android's gap already separates its cards. */
export const showsRowDivider = Platform.OS !== 'android';

/**
 * Collects a group's rows, descending into fragments.
 *
 * `Children.toArray` flattens arrays but treats a `<>…</>` as a single child, so rows grouped
 * under one condition — `{isSignup && <><SegmentedRow/><SegmentedRow/></>}` — would count as one
 * item: no divider between them on iOS, and a single clipped card holding both on Android.
 */
function flattenRows(children: React.ReactNode): React.ReactElement[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === React.Fragment) {
      return flattenRows((child.props as { children?: React.ReactNode }).children);
    }
    return [child];
  });
}

export function SegmentedList({ children, className }: SegmentedListProps) {
  const items = flattenRows(children);
  // Taken from the resolved theme rather than a `dark:` class: the hairline has to lighten
  // on a dark card, and a black one over #242424 is the black bar this used to draw.
  const separatorColor =
    useResolvedThemeMode() === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';

  // Android groups its rows as gapped cards, so there is nothing to clip at the group
  // level and no divider to bridge — each row rounds and clips itself.
  if (Platform.OS === 'android') {
    return (
      <View className={className}>
        {items.map((child, i) => (
          <View key={i} style={groupedRowStyle(i === 0, i === items.length - 1)}>
            {child}
          </View>
        ))}
      </View>
    );
  }

  return (
    // The group paints the card color itself, not just the rows: row heights land on
    // fractional pixels, so two opaque rows can leave a hairline of the container showing
    // between them, and an unpainted container is the page behind the list — a black seam
    // that comes and goes with the rows' measured heights.
    <View
      className={`rounded-[20px] overflow-hidden bg-background-element ${className ?? ''}`}
      style={{ borderCurve: 'continuous' }}
    >
      {items.map((child, i) => {
        const prev = items[i - 1];
        // Between two rows where either is selected, the divider takes that row's
        // highlight color so the selection reads as one unbroken block. It stays
        // mounted and only changes color — unmounting it would collapse its 1px of
        // height and shift every row below on selection.
        type RowProps = { selected?: boolean; selectedColor?: string };
        const selectedNeighbor = [prev, child].find(
          (n) => isValidElement(n) && (n.props as RowProps).selected,
        );
        const bridgeColor =
          i > 0 && isValidElement(selectedNeighbor)
            ? (selectedNeighbor.props as RowProps).selectedColor
            : undefined;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              // The divider sits on a strip of the card background, inset by the row's own
              // horizontal padding so it lines up with the row's content the way UIKit's
              // grouped separators do. A bridge spans the full width instead — an inset one
              // would cut the selected block with two notches of unselected background.
              <View className={bridgeColor ? undefined : 'bg-background-element'}>
                <View
                  className={bridgeColor ? undefined : 'mx-4'}
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: bridgeColor ?? separatorColor,
                  }}
                />
              </View>
            )}
            {child}
          </React.Fragment>
        );
      })}
    </View>
  );
}

interface SegmentedRowProps {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  centerContent?: boolean;
  selected?: boolean;
  selectedColor?: string;
}

export function SegmentedRow({
  leading,
  trailing,
  children,
  onPress,
  onLongPress,
  disabled,
  destructive,
  centerContent,
  selected,
  selectedColor,
}: SegmentedRowProps) {
  const theme = useTheme();

  // A row holding a native Switch is 32dp of switch plus the padding; every other Android
  // row matches that so the list keeps one rhythm.
  const metrics = Platform.OS === 'android' ? 'px-4 py-3 min-h-[56px]' : 'px-4 py-3 min-h-[44px]';

  // HIG: a tapped row highlights by swapping its fill and keeping its content at full
  // strength, rather than fading the row out. The fade also stopped reading at all once
  // the group began painting the card color behind the rows — the row dissolved into an
  // identical background. Only rows that respond to a tap take the highlight.
  const inner = (pressed = false) => {
    const fill = selected ? selectedColor : pressed ? theme.backgroundSelected : undefined;
    return (
      <View
        className={`flex-row items-center ${metrics} ${fill ? '' : 'bg-background-element'
          } ${disabled ? 'opacity-40' : ''} justify-between grow`}
        style={fill ? { backgroundColor: fill } : undefined}
      >
        {leading && (
          <View className="flex-col justify-center w-fit me-3">
            {typeof leading === 'string' ? (
              <Text
                className={`${destructive ? 'text-red-500 dark:text-red-400' : 'text-foreground'
                  }`}
              >
                {leading}
              </Text>
            ) : (
              leading
            )}
          </View>
        )}
        {/* No alignment class in the default branch on purpose: content stretches to the
            row's width, which is what fields overlaid with an icon rely on. */}
        {children && (
          <View className={`flex-1 ${centerContent ? 'items-center' : ''}`}>
            {children}
          </View>
        )}
        {trailing && <View className="ml-2 items-end">{trailing}</View>}
      </View>
    );
  };

  if ((onPress || onLongPress) && !disabled) {
    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        // The ripple has to be drawn in the foreground: the row's own opaque background
        // sits above the Pressable's, which is where a background ripple would land. Its
        // color follows the text so it stays visible on a dark surface.
        android_ripple={{ color: `${theme.text}1f`, foreground: true }}
      >
        {({ pressed }) => inner(Platform.OS === 'ios' && pressed)}
      </Pressable>
    );
  }
  return inner();
}

export function Chevron({ color, rotation }: { color?: string, rotation?: number }) {
  return (
    <SymbolView
      name={{ ios: "chevron.right", android: "chevron_forward" }}
      size={Platform.select({ ios: 14, android: 18 })}
      tintColor={color ?? '#999'}
      style={{ opacity: 0.5, transform: [{ rotate: `${rotation ?? 0}deg` }] }}
    />
  );
}

export function SectionTitle({ children, first }: { children: string; first?: boolean }) {
  return (
    <Text
      className={`text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${first ? 'mb-3' : 'mt-5 mb-3'
        } px-1`}
    >
      {children}
    </Text>
  );
}
