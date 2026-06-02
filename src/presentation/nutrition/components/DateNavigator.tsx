import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

interface DateNavigatorProps {
  date: string;
  onPrev: () => void;
  onNext: () => void;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function DateNavigator({ date, onPrev, onNext }: DateNavigatorProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        paddingVertical: 10,
        paddingHorizontal: 16,
      }}
    >
      <Pressable onPress={onPrev} hitSlop={8} className="active:opacity-70">
        <ChevronLeft size={22} color={PROGRESS_COLORS.primaryText} />
      </Pressable>
      <Text style={{ fontSize: 16, fontWeight: "600", color: PROGRESS_COLORS.primaryText }}>
        {formatDisplayDate(date)}
      </Text>
      <Pressable onPress={onNext} hitSlop={8} className="active:opacity-70">
        <ChevronRight size={22} color={PROGRESS_COLORS.primaryText} />
      </Pressable>
    </View>
  );
}
