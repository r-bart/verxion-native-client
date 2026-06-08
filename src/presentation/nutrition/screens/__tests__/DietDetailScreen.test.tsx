import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { dietDetailFixture } from "@/presentation/nutrition/lib/dietDetailFixture";
import { DietDetailScreen } from "../DietDetailScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "definicion-2250" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("DietDetailScreen", () => {
  it("renders the diet header + meal spine once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(dietDetailFixture);
    const container = createMockContainer({ getDietDetail: { execute } });

    const { getAllByText, getByText } = renderWithProviders(
      <DietDetailScreen />,
      { container }
    );

    // Header title (name's first segment) proves the hero painted; a meal name
    // proves the spine did.
    await waitFor(() =>
      expect(getAllByText("Definición").length).toBeGreaterThan(0)
    );
    expect(getByText("Comida")).toBeTruthy();
    expect(execute).toHaveBeenCalledWith("definicion-2250");
  });

  it("shows the error state when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getDietDetail: { execute } });

    const { getByText } = renderWithProviders(<DietDetailScreen />, {
      container,
    });

    await waitFor(() =>
      expect(getByText("nutrition.error.title")).toBeTruthy()
    );
  });

  it("shows an empty notice when the diet has no meals", async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ ...dietDetailFixture, meals: [] });
    const container = createMockContainer({ getDietDetail: { execute } });

    const { findByText } = renderWithProviders(<DietDetailScreen />, {
      container,
    });

    expect(await findByText("nutrition.dietDetail.noMeals")).toBeTruthy();
  });
});
