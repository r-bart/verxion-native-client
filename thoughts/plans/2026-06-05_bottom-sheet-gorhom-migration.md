# Implementation Plan: Migrate BottomSheet to @gorhom/bottom-sheet

**Date**: 2026-06-05
**Status**: Draft

---

## Overview

Replace the custom `Modal`-based `BottomSheet` primitive with `@gorhom/bottom-sheet`
to get native detents, dynamic sizing, drag-to-dismiss and proper in-sheet scroll —
keeping the same `{ visible, onClose, title, children }` API so the two consumers
(`SesionesSegment`, `EjerciciosSegment`) don't change.

## Requirements

- [ ] `@gorhom/bottom-sheet` added; app wired with `GestureHandlerRootView` + `BottomSheetModalProvider`
- [ ] `BottomSheet` keeps its current props API (consumers untouched)
- [ ] Dynamic sizing: short sheets hug content, tall sheets cap + scroll internally
- [ ] Drag-to-dismiss + scrim-tap-to-close + safe-area bottom inset
- [ ] All existing tests pass (gorhom jest mock added); typecheck + lint green
- [ ] Verified on simulator: open/close, drag, scroll on the long "Filtrar" sheet

---

## Approach Analysis

### Option A: Stay custom, add max-height + ScrollView
**Description**: Keep the `Modal` sheet; cap content height (~80%) and wrap children in a `ScrollView`.
**Pros**: No dependency; matches the repo's `Modal` convention (ConfirmDialog); ~30 min.
**Cons**: No drag-to-dismiss/detents; the grab handle stays a "fake" affordance; manual height math; nested-scroll gesture handling is fiddly.
**Complexity**: Low

### Option B: Migrate to @gorhom/bottom-sheet  ← recommended
**Description**: Rewrite the shared `BottomSheet` over `BottomSheetModal` + `BottomSheetScrollView`, same API. Add the required root providers + jest mock.
**Pros**: Native feel (detents, drag, gesture scroll); `enableDynamicSizing` solves the short/tall height problem for free; backdrop + keyboard handling + a11y built in; the primitive is reused, so getting it right now pays off.
**Cons**: +1 dependency; introduces `GestureHandlerRootView` at the root (global touch surface — needs a sanity pass); reanimated 4 is recent.
**Complexity**: Medium

### Recommendation
**Option B.** Compatibility is confirmed (gorhom `5.2.14` peer-supports `reanimated >=4.0` and `gesture-handler >=2.16.1`; we run 4.3.1 / 2.31). The migration is contained to one shared component + provider wiring, and it resolves the height/scroll concern at the root instead of patching it.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add `@gorhom/bottom-sheet` |
| `app/_layout.tsx` | Modify | Wrap app in `GestureHandlerRootView` |
| `src/presentation/app/AppProvider.tsx` | Modify | Add `BottomSheetModalProvider` |
| `src/presentation/_shared/components/BottomSheet.tsx` | Rewrite | gorhom-backed, same API |
| `jest.setup.js` | Modify | Mock `@gorhom/bottom-sheet` |
| `src/__tests__/test-utils.tsx` | Modify (if needed) | Wrap render in `BottomSheetModalProvider` |

Consumers unchanged: `SesionesSegment.tsx`, `EjerciciosSegment.tsx`, `SheetOption.tsx`.

---

## Implementation Phases

### Phase 1: Dependency + root providers

#### Task 1.1: Install the library
```bash
npx expo install @gorhom/bottom-sheet
```
(`expo install` picks the SDK-56-compatible version; prereqs gesture-handler/reanimated/screens already present.)

#### Task 1.2: GestureHandlerRootView at the app root
**File**: `app/_layout.tsx`
```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
// ...
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <AppProvider>
      <AppShell />
    </AppProvider>
  </GestureHandlerRootView>
);
```

#### Task 1.3: BottomSheetModalProvider in the provider tree
**File**: `src/presentation/app/AppProvider.tsx`
```tsx
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
// ...
return (
  <QueryClientProvider client={queryClient}>
    <DIProvider>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </DIProvider>
  </QueryClientProvider>
);
```

#### Task 1.4: Jest mock
**File**: `jest.setup.js` (add near the other RN mocks)
```js
jest.mock("@gorhom/bottom-sheet", () => require("@gorhom/bottom-sheet/mock"));
```

### Phase 2: Rewrite the shared BottomSheet

#### Task 2.1: gorhom-backed BottomSheet (same API)
**File**: `src/presentation/_shared/components/BottomSheet.tsx`
```tsx
import { useEffect, useRef } from "react";
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

type Props = { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode };
const PANEL = "#131316";

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.62} pressBehavior="close" />;
}

export function BottomSheet({ visible, onClose, title, children }: Props) {
  const ref = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onClose}
      enableDynamicSizing
      backdropComponent={Backdrop}
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
```
Notes:
- `enableDynamicSizing` + `BottomSheetScrollView` → sheet sizes to content up to `maxDynamicContentSize` (≈ screen − top inset), then scrolls. Covers short "Ordenar" and tall "Filtrar".
- `onDismiss` (fires on drag-down, scrim tap, and `dismiss()`) bridges to `onClose`, keeping parent `visible` state in sync.
- Visuals preserved: panel `#131316`, 26px top radius, 38px grab, 0.62 scrim.

### Phase 3: Verify + (optional) test-utils provider

#### Task 3.1: Wrap test render in the provider if the mock needs it
**File**: `src/__tests__/test-utils.tsx` — only if a render test errors for a missing provider; wrap the tree in `<BottomSheetModalProvider>` (mocked, passthrough).

#### Task 3.2: Simulator sanity pass
Open Entreno → Sesiones and Ejercicios; open both sheets; confirm: dynamic height, internal scroll on "Filtrar", drag-to-dismiss, scrim tap, safe-area. Sanity-check that existing gestures/navigation still work after adding `GestureHandlerRootView`.

---

## Task Dependencies

```yaml
dependencies:
  1.1: []
  1.2: [1.1]
  1.3: [1.1]
  1.4: [1.1]
  2.1: [1.1, 1.3]
  3.1: [2.1, 1.4]
  3.2: [2.1, 1.2, 1.3]
```

---

## Risk Analysis

### Edge Cases
- [ ] Long "Filtrar" sheet on a small device → must cap + scroll (covered by dynamic sizing + `BottomSheetScrollView`).
- [ ] Rapid open/close toggling `visible` → `present()/dismiss()` idempotent; effect keyed on `visible`.
- [ ] Android hardware back closes the sheet (gorhom handles; verify).

### Technical Risks
- [ ] `GestureHandlerRootView` newly at root could alter global touch handling → sanity-pass existing screens (tabs, settings, onboarding swipes).
- [ ] reanimated 4 + gorhom 5 edge cases despite official support → verify on simulator early.
- [ ] Jest mock must cover `BottomSheetModal`, `BottomSheetModalProvider`, `BottomSheetScrollView`, `BottomSheetBackdrop` (official `/mock` does) → run full suite.

---

## Testing Strategy

- **Unit/render**: existing `SesionesSegment` / `EjerciciosSegment` render tests must still pass with the gorhom mock (sheets stay closed in those tests; assert no regression). No new unit tests (the primitive is presentational).
- **Manual**: Task 3.2 simulator pass.

---

## Done Criteria

### Phase 1
- [ ] `@gorhom/bottom-sheet` present: `node -e "require('@gorhom/bottom-sheet/package.json')"` resolves
- [ ] `GestureHandlerRootView` wraps the app in `app/_layout.tsx`; `BottomSheetModalProvider` in `AppProvider`

### Phase 2
- [ ] `BottomSheet` props unchanged (`grep -n "visible\|onClose\|title" src/presentation/_shared/components/BottomSheet.tsx`)
- [ ] No consumer edits: `git diff --stat` shows `SesionesSegment`/`EjerciciosSegment` untouched

### Phase 3
- [ ] Simulator: both sheets open/close, drag-to-dismiss, scrim tap, "Filtrar" scrolls, safe-area respected
- [ ] Existing gestures/navigation unaffected by `GestureHandlerRootView`

### Overall
- [ ] `npm run typecheck && npm run lint && npm test` all green (364 tests)
- [ ] No TODO/FIXME/HACK in new code
- [ ] Architecture: `BottomSheet` stays in `_shared/components`; no layer violation

---

## Verification

```bash
npm run typecheck && npm run lint && npm test
```
Then the simulator pass (Task 3.2), then `/post-review --strict`.

## Follow-ups (out of scope)
- "Limpiar filtros" action + "Ver N resultados" footer on the Ejercicios filter sheet (UX nicety).
- Migrate other overlays? No — `ConfirmDialog` (centered dialog) stays on `Modal`; only bottom sheets move to gorhom.
