import { SectionTitle, SegmentedList, SegmentedRow } from "@/components/ui/SegmentedList";
import { useTheme } from "@/hooks/use-theme";
import { spacing } from "@/lib/utils";
import { ScrollView, Text } from "@/tw";
import { Stack, useRouter } from "expo-router";

export default function Index() {
  const theme = useTheme();
  const router = useRouter();

  return <ScrollView
    style={{ flex: 1, backgroundColor: theme.background }}
    contentInsetAdjustmentBehavior="automatic"
    contentContainerStyle={{ paddingBottom: spacing(4), paddingHorizontal: spacing(4) }}
  >
    <Stack.Screen options={{ title: 'HA Widgets' }} />
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button icon={"gear"} onPress={() => {
        router.navigate("/settings");
      }} />
    </Stack.Toolbar>

    <SectionTitle first>Widgets</SectionTitle>
    <SegmentedList>
      <SegmentedRow leading="First">
        <Text className="text-foreground-secondary text-right">Hi!</Text>
      </SegmentedRow>
    </SegmentedList>
  </ScrollView>;
}