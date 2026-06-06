/**
 * SelectSheet — a single-select bottom sheet: a list of options as SheetOption
 * rows with the active one checked. Picking fires `onSelect` and closes the
 * sheet. Backs the Sesiones/Ejercicios routine + sort pickers.
 *
 * Generic over the option key so callers stay type-safe; model an "all" row as
 * a regular option (an empty-string key reads cleanly as "no filter").
 */
import { BottomSheet } from "@/presentation/_shared/components/BottomSheet";
import { SheetOption } from "./SheetOption";

export type SelectOption<K extends string> = { key: K; label: string };

type Props<K extends string> = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption<K>[];
  selectedKey: K;
  onSelect: (key: K) => void;
};

export function SelectSheet<K extends string>({
  visible,
  onClose,
  title,
  options,
  selectedKey,
  onSelect,
}: Props<K>) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {options.map((opt) => (
        <SheetOption
          key={opt.key}
          label={opt.label}
          selected={selectedKey === opt.key}
          onPress={() => {
            onSelect(opt.key);
            onClose();
          }}
        />
      ))}
    </BottomSheet>
  );
}
