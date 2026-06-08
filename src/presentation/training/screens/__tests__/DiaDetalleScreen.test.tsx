import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { dayDetailFixtureFor } from "@/domain/training/__fixtures__/dayDetailFixture";
import { DiaDetalleScreen } from "../DiaDetalleScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "legs-a" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("DiaDetalleScreen", () => {
  it("renders the day plan (hero + exercises) once data resolves", async () => {
    const execute = jest.fn((id: string) =>
      Promise.resolve(dayDetailFixtureFor(id))
    );
    const container = createMockContainer({ getDayDetailView: { execute } });

    const { getAllByText, getByText } = renderWithProviders(
      <DiaDetalleScreen />,
      { container }
    );

    // The day name (also the header title) + the key lift prove we painted the plan.
    await waitFor(() =>
      expect(getAllByText("Legs A").length).toBeGreaterThan(0)
    );
    expect(getByText("Sentadilla")).toBeTruthy();
  });

  it("shows the error state with a retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getDayDetailView: { execute } });

    const { getByText } = renderWithProviders(<DiaDetalleScreen />, {
      container,
    });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });

  it("shows an empty notice when a training day has no exercises", async () => {
    const execute = jest.fn((id: string) =>
      Promise.resolve({
        ...dayDetailFixtureFor(id),
        isRest: false,
        exercises: [],
      })
    );
    const container = createMockContainer({ getDayDetailView: { execute } });

    const { findByText } = renderWithProviders(<DiaDetalleScreen />, {
      container,
    });

    expect(await findByText("training.dayDetail.noExercises")).toBeTruthy();
  });
});
