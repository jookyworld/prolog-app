import { COLORS } from "@/lib/constants";
import { Stack } from "expo-router";

export default function RoutineLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" />
      <Stack.Screen name="select-exercises" />
    </Stack>
  );
}
