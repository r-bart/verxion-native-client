import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { sessionDetailFixtureFor } from "@/domain/training/__fixtures__/sessionDetailFixture";
import { SesionDetalleScreen } from "../SesionDetalleScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "legs-b-31may" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "es" } }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("SesionDetalleScreen", () => {
  it("renders the session report (hero + per-set breakdown) once data resolves", async () => {
    const execute = jest.fn((id: string) =>
      Promise.resolve(sessionDetailFixtureFor(id))
    );
    const container = createMockContainer({
      getSessionDetailView: { execute },
    });

    const { getAllByText, getByText } = renderWithProviders(
      <SesionDetalleScreen />,
      { container }
    );

    // The session name (also the header title) + the key lift prove we painted it.
    await waitFor(() =>
      expect(getAllByText("Legs B").length).toBeGreaterThan(0)
    );
    expect(getByText("Peso muerto rumano")).toBeTruthy();
    // Frozen-block chip: the raw block name is painted verbatim (no i18n).
    expect(getByText(/Acumulación/)).toBeTruthy();
  });

  it("shows the error state with a retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({
      getSessionDetailView: { execute },
    });

    const { getByText } = renderWithProviders(<SesionDetalleScreen />, {
      container,
    });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
