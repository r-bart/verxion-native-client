import { render } from "@testing-library/react-native";
import { dietLibraryFixture } from "@/presentation/nutrition/lib/dietLibraryFixture";
import { DietLibraryCard } from "../DietLibraryCard";

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

describe("DietLibraryCard", () => {
  it("renders the active diet's name and goal chip", () => {
    const active = dietLibraryFixture.diets[0];
    const { getByText } = render(<DietLibraryCard item={active} />);

    // Diet name proves the card painted.
    expect(getByText("Definición · 2.250 kcal")).toBeTruthy();
    // Goal label routes through i18n (mock returns the key).
    expect(getByText("nutrition.goal.fat_loss")).toBeTruthy();
  });
});
