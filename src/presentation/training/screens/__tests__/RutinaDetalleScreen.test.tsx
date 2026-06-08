import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { routineDetailFixtureFor } from "@/domain/training/__fixtures__/routineDetailFixture";
import { RutinaDetalleScreen } from "../RutinaDetalleScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "ppl-hipertrofia" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("RutinaDetalleScreen", () => {
  it("renders the routine detail (hero + rotation) once data resolves", async () => {
    const execute = jest.fn((id: string) =>
      Promise.resolve(routineDetailFixtureFor(id))
    );
    const container = createMockContainer({
      getRoutineDetailView: { execute },
    });

    const { getAllByText } = renderWithProviders(<RutinaDetalleScreen />, {
      container,
    });

    // The hero name (also the header title) + a rotation day name prove we
    // painted the aggregate.
    await waitFor(() =>
      expect(getAllByText("PPL Hipertrofia").length).toBeGreaterThan(0)
    );
    expect(getAllByText("Legs A").length).toBeGreaterThan(0);
    // Periodized active routine → the block line paints the RAW block name.
    expect(getAllByText("Acumulación").length).toBeGreaterThan(0);
  });

  it("shows the error state with a retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({
      getRoutineDetailView: { execute },
    });

    const { getByText } = renderWithProviders(<RutinaDetalleScreen />, {
      container,
    });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });

  it("shows an empty notice when the routine has no days", async () => {
    const execute = jest.fn((id: string) =>
      Promise.resolve({ ...routineDetailFixtureFor(id), days: [] })
    );
    const container = createMockContainer({
      getRoutineDetailView: { execute },
    });

    const { findByText } = renderWithProviders(<RutinaDetalleScreen />, {
      container,
    });

    expect(await findByText("training.routineDetail.noDays")).toBeTruthy();
  });
});
