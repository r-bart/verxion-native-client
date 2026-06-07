import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import {
  foodLibraryFixture,
  foodLibraryEmptyFixture,
} from "@/presentation/nutrition/lib/foodLibraryFixture";
import { AlimentosSegment } from "../AlimentosSegment";

jest.mock("react-native-safe-area-context", () => ({
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

describe("AlimentosSegment", () => {
  it("renders the food rows once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(foodLibraryFixture);
    const container = createMockContainer({ getFoodLibrary: { execute } });

    const { getByText } = renderWithProviders(<AlimentosSegment />, { container });

    await waitFor(() => expect(getByText("Pechuga de pollo")).toBeTruthy());
    expect(getByText("Pollo con arroz")).toBeTruthy();
  });

  it("shows the no-results state when the library is empty", async () => {
    const execute = jest.fn().mockResolvedValue(foodLibraryEmptyFixture);
    const container = createMockContainer({ getFoodLibrary: { execute } });

    const { getByText } = renderWithProviders(<AlimentosSegment />, { container });

    await waitFor(() =>
      expect(getByText("nutrition.foods.noResults")).toBeTruthy()
    );
  });
});
