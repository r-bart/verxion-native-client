import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { tokens } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { FieldLabel } from "./Field";
import { OnboardingButton } from "./OnboardingButton";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date → "YYYY-MM-DD" (local parts, no timezone shift). */
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** "YYYY-MM-DD" → Date (local midnight). */
function fromISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface Props {
  /** "YYYY-MM-DD" or undefined. */
  value: string | undefined;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

/**
 * Native date-of-birth picker (`UIDatePicker` via @react-native-community/
 * datetimepicker). The native control handles days-per-month, leap years,
 * locale, accessibility and momentum for free. Age bounds (14–120) are enforced
 * with min/maximumDate. iOS spins in a themed bottom sheet committed on Done;
 * Android shows the platform dialog directly.
 */
export function DateOfBirthField({ value, onChange, label, placeholder }: Props) {
  const now = new Date();
  const maximumDate = new Date(now.getFullYear() - 14, now.getMonth(), now.getDate()); // youngest
  const minimumDate = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate()); // oldest
  const defaultDate = new Date(now.getFullYear() - 25, 0, 1);

  const [open, setOpen] = useState(false);
  // Working value while the iOS spinner is open (committed on Done).
  const [draftDate, setDraftDate] = useState<Date>(value ? fromISODate(value) : defaultDate);

  const display = value
    ? (() => {
        const d = fromISODate(value);
        return `${MONTHS[d.getMonth()]} ${pad2(d.getDate())}, ${d.getFullYear()}`;
      })()
    : placeholder;

  const onAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    if (event.type === "set" && date) onChange(toISODate(date));
  };

  const openPicker = () => {
    setDraftDate(value ? fromISODate(value) : defaultDate);
    setOpen(true);
  };

  return (
    <View>
      <FieldLabel optional>{label}</FieldLabel>
      <Pressable
        testID="dob-field"
        onPress={openPicker}
        style={styles.input}
        className="active:opacity-80"
      >
        <Text style={[styles.inputText, { color: value ? tokens.text.primary : tokens.text.tertiary }]}>
          {display}
        </Text>
      </Pressable>

      {/* Android: the platform dialog renders inline when mounted. */}
      {open && Platform.OS === "android" && (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={onAndroidChange}
        />
      )}

      {/* iOS: themed bottom sheet with the native spinner + Done. */}
      {Platform.OS === "ios" && (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {label}
            </Text>
            <DateTimePicker
              value={draftDate}
              mode="date"
              display="spinner"
              themeVariant="dark"
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              onChange={(_e, date) => date && setDraftDate(date)}
              style={{ alignSelf: "stretch" }}
            />
            <View style={{ marginTop: 8 }}>
              <OnboardingButton
                label="Done"
                testID="dob-done"
                onPress={() => {
                  onChange(toISODate(draftDate));
                  setOpen(false);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.color.border,
    backgroundColor: tokens.color.input,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  inputText: {
    fontFamily: mono(400),
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: tokens.surface.popover,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    borderTopWidth: 1,
    borderColor: tokens.color.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalTitle: {
    fontFamily: sans(700),
    fontSize: 16,
    color: tokens.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
});
