import React from "react";
import { View, Text, Pressable, type ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import {
  PROGRESS_COLORS,
  METRIC_TYPOGRAPHY,
  type ProgressColorType,
} from "../constants/progress-colors";

export interface ListCardItem {
  label: string;
  value: string | number;
  subtitle?: string;
  onPress?: () => void;
}

export interface ListCardProps {
  title?: string;
  items: ListCardItem[];
  color?: ProgressColorType;
  maxItems?: number;
  onPressAll?: () => void;
  style?: ViewStyle;
}

export function ListCard({
  title,
  items,
  color = "neutral",
  maxItems,
  onPressAll,
  style,
}: ListCardProps) {
  const colorTheme =
    color === "gray" ? PROGRESS_COLORS.completed : PROGRESS_COLORS[color];

  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const hasMore = maxItems && items.length > maxItems;

  return (
    <View
      className="rounded-2xl border border-border"
      style={[
        {
          backgroundColor: PROGRESS_COLORS.cardBackground,
          padding: 24,
        },
        style,
      ]}
    >
      {title && (
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardTitle,
            color: PROGRESS_COLORS.primaryText,
            marginBottom: 16,
          }}
        >
          {title}
        </Text>
      )}

      <View style={{ gap: 12 }}>
        {displayItems.map((item, index) => {
          const isInteractive = !!item.onPress;

          const itemContent = (
            <View
              className="flex-row items-center justify-between py-2"
              style={{
                borderBottomWidth: index < displayItems.length - 1 ? 1 : 0,
                borderBottomColor: PROGRESS_COLORS.secondaryText + "20",
              }}
            >
              <View className="flex-1">
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.cardSubtitle,
                    color: PROGRESS_COLORS.primaryText,
                    fontWeight: "500",
                  }}
                >
                  {item.label}
                </Text>
                {item.subtitle && (
                  <Text
                    style={{
                      ...METRIC_TYPOGRAPHY.context,
                      color: PROGRESS_COLORS.tertiaryText,
                      marginTop: 4,
                    }}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center gap-2">
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.cardSubtitle,
                    color:
                      typeof colorTheme === "string"
                        ? colorTheme
                        : colorTheme.primary,
                    fontWeight: "600",
                  }}
                >
                  {item.value}
                </Text>
                {isInteractive && (
                  <ChevronRight
                    size={16}
                    color={PROGRESS_COLORS.secondaryText}
                  />
                )}
              </View>
            </View>
          );

          if (isInteractive) {
            return (
              <Pressable
                key={index}
                onPress={item.onPress}
                className="active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: ${item.value}`}
              >
                {itemContent}
              </Pressable>
            );
          }

          return <View key={index}>{itemContent}</View>;
        })}
      </View>

      {hasMore && onPressAll && (
        <Pressable
          onPress={onPressAll}
          className="flex-row items-center justify-center py-2"
          style={{ marginTop: 16 }}
          accessibilityRole="button"
          accessibilityLabel="Ver todo"
        >
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardSubtitle,
              color:
                typeof colorTheme === "string"
                  ? colorTheme
                  : colorTheme.primary,
              fontWeight: "600",
            }}
          >
            Ver todo ({items.length})
          </Text>
          <ChevronRight
            size={16}
            color={
              typeof colorTheme === "string" ? colorTheme : colorTheme.primary
            }
          />
        </Pressable>
      )}
    </View>
  );
}
