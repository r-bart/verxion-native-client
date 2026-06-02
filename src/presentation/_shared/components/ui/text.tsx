import * as React from "react";
import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/presentation/_shared/lib/utils";

function Text({ className, ...props }: TextProps) {
  return <RNText className={cn("text-base text-foreground", className)} {...props} />;
}

export { Text };
