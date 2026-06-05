/**
 * BottomSheet — the app's bottom sheet, backed by @gorhom/bottom-sheet for
 * native detents, drag-to-dismiss, gesture scroll and dynamic sizing. Keeps a
 * simple `{ visible, onClose, title }` API: the parent owns the open state and
 * this bridges it to the modal's imperative `present()/dismiss()`.
 *
 * Uses an explicit snap point (not dynamic sizing): `enableDynamicSizing` +
 * `BottomSheetScrollView` intermittently measures content height as 0 on the
 * first `present()`, so the sheet "opens" at zero height — a fixed detent always
 * opens reliably, and `BottomSheetScrollView` scrolls when content is taller.
 * Visuals match the handoff: panel #131316, 26px top radius, 38px grab, 0.62
 * scrim.
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
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
  const snapPoints = useMemo(() => ["50%"], []);

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
      snapPoints={snapPoints}
      enableDynamicSizing={false}
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
