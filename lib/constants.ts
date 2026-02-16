export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";


export const COLORS = {
  background: "#101012",
  card: "#17171C",
  primary: "#3182F6",
  primaryHover: "#2272EB",
  border: "rgba(255,255,255,0.1)",
  mutedForeground: "rgba(255,255,255,0.6)",
  tabInactive: "rgba(255,255,255,0.35)",
  iconMuted: "rgba(255,255,255,0.3)",
  placeholder: "rgba(255,255,255,0.2)",
  destructive: "#EF4444",
  white: "#FFFFFF",
} as const;
