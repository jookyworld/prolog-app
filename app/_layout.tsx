import "../global.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/AuthGuard";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthGuard>
        <Slot />
      </AuthGuard>
    </AuthProvider>
  );
}
