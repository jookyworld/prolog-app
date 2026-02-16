import "../global.css";
import { AuthProvider } from "@/contexts/auth-context";
import { WorkoutProvider } from "@/contexts/workout-context";
import { AuthGuard } from "@/components/AuthGuard";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <StatusBar style="light" />
        <AuthGuard>
          <Slot />
        </AuthGuard>
      </WorkoutProvider>
    </AuthProvider>
  );
}
