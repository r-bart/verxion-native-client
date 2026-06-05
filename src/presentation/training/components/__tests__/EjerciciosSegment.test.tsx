import { waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { exerciseLibraryFixture } from "@/domain/training/__fixtures__/exerciseLibraryFixture";
import { EjerciciosSegment } from "../EjerciciosSegment";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("EjerciciosSegment", () => {
  it("renders the exercise library once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(exerciseLibraryFixture);
    const container = createMockContainer({ getExerciseLibrary: { execute } });

    const { getByText } = renderWithProviders(<EjerciciosSegment />, { container });

    // Default sort is alphabetical; assert items inside the initial render window.
    await waitFor(() => expect(getByText("Aperturas en polea")).toBeTruthy());
    expect(getByText("Dominadas lastradas")).toBeTruthy();
  });

  it("shows the error state when the library read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getExerciseLibrary: { execute } });

    const { getByText } = renderWithProviders(<EjerciciosSegment />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
