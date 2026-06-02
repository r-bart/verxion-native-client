import * as React from "react";
import { View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";
import { cn } from "@/presentation/_shared/lib/utils";

interface ProgressProps extends ViewProps {
  value?: number | null;
  indicatorClassName?: string;
}

function Progress({ value, className, indicatorClassName, ...props }: ProgressProps) {
  // Scale (0..1) instead of width(%) so the animation runs on the GPU/UI thread
  // rather than the JS thread (which stutters when animating layout props).
  const progress = useDerivedValue(() => Math.min(Math.max(value ?? 0, 0), 100) / 100);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: withSpring(progress.value, { overshootClamping: true }) }],
  }));

  return (
    <View
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <Animated.View
        style={[indicatorStyle, { height: "100%", width: "100%", transformOrigin: "left" }]}
        className={cn("rounded-full bg-primary", indicatorClassName)}
      />
    </View>
  );
}

export { Progress };
