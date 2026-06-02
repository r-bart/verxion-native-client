import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { PROGRESS_COLORS } from "../constants/progress-colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "Search..." }: SearchBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "40",
        paddingHorizontal: 14,
        height: 48,
        gap: 10,
      }}
    >
      <Search size={18} color={PROGRESS_COLORS.tertiaryText} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={PROGRESS_COLORS.tertiaryText}
        style={{
          flex: 1,
          fontSize: 15,
          color: PROGRESS_COLORS.primaryText,
        }}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
