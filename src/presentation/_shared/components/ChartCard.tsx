import React from "react";
import { View, Text, Pressable, type ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import {
  PROGRESS_COLORS,
  METRIC_TYPOGRAPHY,
  CARD_SPACING,
  type ProgressColorType,
} from "../constants/progress-colors";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  color?: ProgressColorType;
  chart: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ChartCard({
  title,
  subtitle,
  color: _color = "neutral",
  chart,
  onPress,
  style,
}: ChartCardProps) {
  const isInteractive = !!onPress;

  const content = (
    <View
      className="rounded-2xl border border-border"
      style={[
        {
          backgroundColor: PROGRESS_COLORS.cardBackground,
          padding: CARD_SPACING.padding,
        },
        style,
      ]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardTitle,
              color: PROGRESS_COLORS.primaryText,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardSubtitle,
                color: PROGRESS_COLORS.secondaryText,
                marginTop: 4,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {isInteractive && (
          <ChevronRight
            size={CARD_SPACING.chevronSize}
            color={PROGRESS_COLORS.secondaryText}
          />
        )}
      </View>

      {/* Chart Content */}
      <View
        className="rounded-xl overflow-hidden"
        style={{
          height: 200,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      >
        {chart}
      </View>
    </View>
  );

  if (isInteractive) {
    return (
      <Pressable
        onPress={onPress}
        className="active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel={`${title} ${subtitle || ""}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
