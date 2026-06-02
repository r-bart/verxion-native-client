import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandLogo } from "@/presentation/_shared/components/BrandLogo";

/**
 * Temporary authenticated landing while the app is rebuilt in public,
 * tab by tab, against the new design. Replaced by the real Today screen
 * once that tab lands.
 */
export function PlaceholderScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#171717" }}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          paddingHorizontal: 32,
        }}
      >
        <BrandLogo width={96} height={58} />
        <Text
          style={{
            color: "#a3a3a3",
            fontSize: 15,
            lineHeight: 22,
            textAlign: "center",
          }}
        >
          Building in public — screens are landing tab by tab.
        </Text>
      </View>
    </SafeAreaView>
  );
}
