import * as React from "react";
import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/presentation/_shared/lib/utils";

interface BadgeProps extends ViewProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-primary",
  secondary: "bg-secondary",
  destructive: "bg-destructive",
  outline: "border border-border bg-transparent",
};

function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <View
      className={cn(
        "flex-row items-center rounded-full px-2.5 py-0.5",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(
            "text-xs font-semibold",
            variant === "default" && "text-primary-foreground",
            variant === "secondary" && "text-secondary-foreground",
            variant === "destructive" && "text-destructive-foreground",
            variant === "outline" && "text-foreground"
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Badge, type BadgeProps };
