import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/presentation/_shared/lib/utils";

interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical";
}

function Separator({ orientation = "horizontal", className, ...props }: SeparatorProps) {
  return (
    <View
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
