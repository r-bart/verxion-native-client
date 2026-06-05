import { Switch } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";

/** Themed boolean switch used across the privacy controls. */
export function Toggle({
  value,
  onValueChange,
  disabled,
  testID,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      testID={testID}
      trackColor={{ false: glass.fill2, true: "rgba(95,227,154,0.55)" }}
      thumbColor={glass.white}
      ios_backgroundColor={glass.fill2}
    />
  );
}
