import { useEffect } from "react";
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

interface Props {
  /** Changing this key replays the entrance animation. */
  transitionKey: string | number;
  /** 1 = forward (slide in from right), -1 = back (slide in from left). */
  direction: 1 | -1;
  children: React.ReactNode;
}

/**
 * Cross-fade + subtle horizontal slide between steps, using react-native-reanimated
 * for smooth UI-thread animations. Replays whenever `transitionKey` changes.
 */
export function StepTransition({ transitionKey, direction, children }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [transitionKey, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      opacity: progress.value,
      transform: [{ translateX: (1 - progress.value) * direction * 22 }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
