import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { COLORS } from "@/lib/constants";

export const Input = forwardRef<TextInput, TextInputProps & { className?: string }>(
  ({ className, placeholderTextColor, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor ?? COLORS.mutedForeground}
        className={cn(
          "h-12 rounded-xl border border-border bg-card px-4 text-base text-white",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
