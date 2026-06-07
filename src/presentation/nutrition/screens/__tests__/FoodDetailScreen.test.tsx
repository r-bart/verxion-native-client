import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import {
  foodDetailFixture,
  recipeDetailFixture,
} from "@/presentation/nutrition/lib/foodDetailFixture";
import { FoodDetailScreen } from "../FoodDetailScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ kind: "recipe", id: "pollo-arroz" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("FoodDetailScreen", () => {
  it("renders a recipe with its ingredient list once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(recipeDetailFixture);
    const container = createMockContainer({ getFoodDetail: { execute } });

    const { getByText, getAllByText } = renderWithProviders(<FoodDetailScreen />, {
      container,
    });

    await waitFor(() =>
      expect(getAllByText("Pollo con arroz y verduras").length).toBeGreaterThan(0)
    );
    // Ingredient rows prove the recipe block painted.
    expect(getByText("Arroz basmati")).toBeTruthy();
    expect(execute).toHaveBeenCalledWith("recipe", "pollo-arroz");
  });

  it("renders a plain food's macros (no ingredient block)", async () => {
    const execute = jest.fn().mockResolvedValue(foodDetailFixture);
    const container = createMockContainer({ getFoodDetail: { execute } });

    const { getAllByText, queryByText } = renderWithProviders(<FoodDetailScreen />, {
      container,
    });

    await waitFor(() =>
      expect(getAllByText("Pechuga de pollo").length).toBeGreaterThan(0)
    );
    // A plain food has no ingredients section header.
    expect(queryByText("nutrition.foodDetail.ingredients")).toBeNull();
  });
});
