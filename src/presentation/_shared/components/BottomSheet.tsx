/**
 * BottomSheet — the app's bottom sheet: a dimmed scrim over a dark panel that
 * slides up from the bottom, with a grab handle and an optional title. Used for
 * filters / sort / select surfaces. Ported from the design handoff (scrim
 * rgba(8,8,10,0.62), panel #131316, 26px top radius, 38×4 grab).
 *
 * Uses the native Modal slide for a reliable, jank-free transition; tapping the
 * scrim or the hardware back closes it.
 */
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

const PANEL = "#131316";

export function BottomSheet({ visible, onClose, title, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="close"
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(8,8,10,0.62)" }]} />
        </Pressable>

        <View
          style={{
            backgroundColor: PANEL,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            borderWidth: 1,
            borderColor: glass.stroke,
            borderBottomWidth: 0,
          }}
        >
          <SafeAreaView edges={["bottom"]}>
            <View style={{ alignItems: "center", paddingTop: 10 }}>
              <View style={{ width: 38, height: 4, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.18)" }} />
            </View>

            {title && (
              <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, textAlign: "center", paddingTop: 14 }}>
                {title}
              </Text>
            )}

            <View style={{ padding: 16, paddingTop: 12 }}>{children}</View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
