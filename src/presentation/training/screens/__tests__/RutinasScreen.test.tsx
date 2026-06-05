import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { routineLibraryFixture } from "@/domain/training/__fixtures__/routineLibraryFixture";
import { RutinasScreen } from "../RutinasScreen";

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
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("RutinasScreen", () => {
  it("renders the library content (not the skeleton) once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(routineLibraryFixture);
    const container = createMockContainer({ getRoutineLibrary: { execute } });

    const { getByText } = renderWithProviders(<RutinasScreen />, { container });

    // The active card name + an archive row prove we painted the aggregate.
    await waitFor(() => expect(getByText("PPL Hipertrofia")).toBeTruthy());
    expect(getByText("PPL base")).toBeTruthy();
  });

  it("shows the error state with a retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getRoutineLibrary: { execute } });

    const { getByText } = renderWithProviders(<RutinasScreen />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
