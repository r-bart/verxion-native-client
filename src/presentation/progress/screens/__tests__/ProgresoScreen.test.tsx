import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import {
  progressOverviewFixture,
  progressHistoryFixture,
} from "@/domain/progress/__fixtures__/progressFixtures";
import { ProgresoScreen } from "../ProgresoScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("ProgresoScreen", () => {
  it("renders the Resumen lens (strength PR + a metric) once the overview resolves", async () => {
    const container = createMockContainer({
      getProgressOverview: { execute: jest.fn().mockResolvedValue(progressOverviewFixture) },
      getProgressHistory: { execute: jest.fn().mockResolvedValue(progressHistoryFixture) },
    });

    const { getByText, queryByText } = renderWithProviders(<ProgresoScreen />, { container });

    // StrengthCard paints the latest PR exercise name verbatim.
    await waitFor(() => expect(getByText("Press banca")).toBeTruthy());
    // The 3-lens segmented is present (labels are i18n keys under test).
    expect(getByText("progress.segments.resumen")).toBeTruthy();
    expect(getByText("progress.segments.historial")).toBeTruthy();
    // Not the empty state.
    expect(queryByText("progress.states.emptyTitle")).toBeNull();
  });

  it("shows the blank-slate invite (no segmented) when dataState is empty", async () => {
    const empty = { ...progressOverviewFixture, dataState: "empty" as const, strengthPr: null };
    const container = createMockContainer({
      getProgressOverview: { execute: jest.fn().mockResolvedValue(empty) },
    });

    const { getByText, queryByText } = renderWithProviders(<ProgresoScreen />, { container });

    await waitFor(() => expect(getByText("progress.states.emptyTitle")).toBeTruthy());
    expect(queryByText("progress.segments.resumen")).toBeNull();
  });

  it("shows the error state with a retry (not the empty invite) when the read fails", async () => {
    const container = createMockContainer({
      getProgressOverview: { execute: jest.fn().mockRejectedValue(new Error("boom")) },
    });

    const { getByText, queryByText } = renderWithProviders(<ProgresoScreen />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
    expect(getByText("common.somethingWentWrong")).toBeTruthy();
    // A failed read must NOT masquerade as "no data yet".
    expect(queryByText("progress.states.emptyTitle")).toBeNull();
  });
});
