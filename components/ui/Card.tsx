import { cn } from "@/lib/utils";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn("rounded-2xl bg-card p-4", className)}
      {...props}
    />
  );
}
