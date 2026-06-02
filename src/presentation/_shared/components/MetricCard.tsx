import React from "react";
import { View, Text, Pressable, type ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import {
  PROGRESS_COLORS,
  METRIC_TYPOGRAPHY,
  CARD_SPACING,
  type ProgressColorType,
} from "../constants/progress-colors";

export interface MetricCardProps {
  value: string | number;
  label: string;
  color?: ProgressColorType;
  subtitle?: string;
  footer?: string;
  icon?: React.ReactNode;
  badge?: string;
  onPress?: () => void;
  chevron?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
}

export function MetricCard({
  value,
  label,
  color = "neutral",
  subtitle,
  footer,
  icon,
  badge,
  onPress,
  chevron = false,
  style,
}: MetricCardProps) {
  const colorTheme =
    color === "gray" ? PROGRESS_COLORS.completed : PROGRESS_COLORS[color];
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
      {/* Header: Subtitle + Icon + Badge */}
      {(subtitle || icon || badge) && (
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            {icon}
            {subtitle && (
              <Text
                style={{
                  ...METRIC_TYPOGRAPHY.cardSubtitle,
                  color: PROGRESS_COLORS.secondaryText,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {badge && (
            <View
              className="px-2 py-1 rounded-md"
              style={{
                backgroundColor:
                  typeof colorTheme === "string"
                    ? colorTheme
                    : colorTheme.background,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color:
                    typeof colorTheme === "string"
                      ? PROGRESS_COLORS.primaryText
                      : colorTheme.text,
                }}
              >
                {badge}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Main Content: Value + Label */}
      <View className="flex-row items-baseline justify-between">
        <View className="flex-1">
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.metric,
              color:
                typeof colorTheme === "string"
                  ? colorTheme
                  : colorTheme.primary,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {value}
          </Text>
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.metricLabel,
              color: PROGRESS_COLORS.primaryText,
              marginTop: 4,
            }}
          >
            {label}
          </Text>
        </View>
        {isInteractive && chevron && (
          <ChevronRight
            size={CARD_SPACING.chevronSize}
            color={PROGRESS_COLORS.secondaryText}
          />
        )}
      </View>

      {/* Footer */}
      {footer && (
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.context,
            color: PROGRESS_COLORS.tertiaryText,
            marginTop: 8,
          }}
        >
          {footer}
        </Text>
      )}
    </View>
  );

  if (isInteractive) {
    return (
      <Pressable
        onPress={onPress}
        className="active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
