import { waitFor, fireEvent } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { progressHistoryFixture } from "@/domain/progress/__fixtures__/progressFixtures";
import { HistorialView } from "../HistorialView";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("HistorialView", () => {
  it("renders the Cinta with the phase context (band name + why)", async () => {
    const execute = jest.fn().mockResolvedValue(progressHistoryFixture);
    const container = createMockContainer({ getProgressHistory: { execute } });

    const { getByText, getAllByText } = renderWithProviders(<HistorialView />, { container });

    // The band at "today" shows in the readout chip + the phase summary.
    await waitFor(() => expect(getAllByText("Verano ligero y fuerte").length).toBeGreaterThan(0));
    // The phase narrative (why) is in the summary.
    expect(getByText("Bajar grasa sin ceder la fuerza ganada.")).toBeTruthy();
  });

  it("expands a Cinta lane into focus mode and back (client-side, no extra fetch)", async () => {
    const execute = jest.fn().mockResolvedValue(progressHistoryFixture);
    const container = createMockContainer({ getProgressHistory: { execute } });

    const { getByText, getAllByLabelText } = renderWithProviders(<HistorialView />, {
      container,
    });

    // One focus (⤢) affordance per lane in the overview.
    await waitFor(() => expect(getAllByLabelText("progress.historial.focus").length).toBe(3));
    fireEvent.press(getAllByLabelText("progress.historial.focus")[0]);

    // Focus mode shows the "back to all domains" control + the week axis "now" tick.
    await waitFor(() => expect(getByText("progress.historial.allDomains")).toBeTruthy());
    expect(getByText("progress.historial.axisNow")).toBeTruthy();
    // No second fetch — focus reuses the loaded history.
    expect(execute).toHaveBeenCalledTimes(1);

    // Back to the multi-lane overview.
    fireEvent.press(getByText("progress.historial.allDomains"));
    await waitFor(() => expect(getAllByLabelText("progress.historial.focus").length).toBe(3));
  });

  it("shows the error state with retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getProgressHistory: { execute } });

    const { getByText } = renderWithProviders(<HistorialView />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
