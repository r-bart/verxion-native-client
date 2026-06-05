/**
 * BottomSheet — the app's bottom sheet, backed by @gorhom/bottom-sheet for
 * native detents, drag-to-dismiss, gesture scroll and dynamic sizing. Keeps a
 * simple `{ visible, onClose, title }` API: the parent owns the open state and
 * this bridges it to the modal's imperative `present()/dismiss()`.
 *
 * `enableDynamicSizing` sizes the sheet to its content (short menus hug, long
 * ones cap near full height and scroll inside via `BottomSheetScrollView`).
 * Visuals match the handoff: panel #131316, 26px top radius, 38px grab, 0.62
 * scrim.
 */
import { useCallback, useEffect, useRef } from "react";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

const PANEL = "#131316";

function renderBackdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.62} pressBehavior="close" />;
}

export function BottomSheet({ visible, onClose, title, children }: Props) {
  const ref = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  // Fires on drag-down, scrim tap, and programmatic dismiss — keep parent state in sync.
  const handleDismiss = useCallback(() => onClose(), [onClose]);

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={handleDismiss}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "rgba(255,255,255,0.18)", width: 38 }}
      backgroundStyle={{ backgroundColor: PANEL, borderTopLeftRadius: 26, borderTopRightRadius: 26 }}
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 16 }}>
        {title && (
          <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, textAlign: "center", paddingBottom: 8 }}>
            {title}
          </Text>
        )}
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
