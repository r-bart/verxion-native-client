import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "../constants/progress-colors";

export interface ScreenOption {
  label: string;
  route: string;
}

interface ScreenSelectorProps {
  options: ScreenOption[];
}

export function ScreenSelector({ options }: ScreenSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = options.findIndex((o) => pathname === o.route);
  const currentOption = currentIndex >= 0 ? options[currentIndex] : options[0];
  const currentLabel = currentOption?.label ?? "";

  const navigateTo = (targetIndex: number, route: string) => {
    if (targetIndex === currentIndex) return;
    router.replace(route as any);
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          color: PROGRESS_COLORS.primaryText,
          marginBottom: 12,
        }}
      >
        {currentLabel}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {options.map((option, index) => {
          const isSelected = pathname === option.route;
          return (
            <Pressable
              key={option.route}
              onPress={() => navigateTo(index, option.route)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isSelected
                  ? PROGRESS_COLORS.positive.primary
                  : PROGRESS_COLORS.cardBackground,
                borderWidth: isSelected ? 0 : 1,
                borderColor: PROGRESS_COLORS.tertiaryText,
              }}
            >
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.cardSubtitle,
                  fontWeight: "600",
                  color: isSelected ? "#FFFFFF" : PROGRESS_COLORS.secondaryText,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
