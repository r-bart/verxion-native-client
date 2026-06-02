import * as React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/presentation/_shared/lib/utils";

interface ButtonProps extends PressableProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-primary",
  destructive: "bg-destructive",
  outline: "border border-border bg-transparent",
  secondary: "bg-secondary",
  ghost: "bg-transparent",
};

const sizeStyles = {
  default: "h-12 px-4 py-3",
  sm: "h-9 px-3",
  lg: "h-14 px-8",
  icon: "h-10 w-10",
};

function Button({
  variant = "default",
  size = "default",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        "flex-row items-center justify-center rounded-xl",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(
            "text-base font-semibold",
            variant === "default" && "text-primary-foreground",
            variant === "destructive" && "text-destructive-foreground",
            variant === "outline" && "text-foreground",
            variant === "secondary" && "text-secondary-foreground",
            variant === "ghost" && "text-foreground"
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export { Button, type ButtonProps };
