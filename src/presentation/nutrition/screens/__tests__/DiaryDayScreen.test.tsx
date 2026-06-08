import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { diaryDayFixture } from "@/presentation/nutrition/lib/diaryDayFixture";
import { DiaryDayScreen } from "../DiaryDayScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ date: "2026-06-07" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock(
  "lucide-react-native",
  () => new Proxy({}, { get: () => () => null })
);

describe("DiaryDayScreen", () => {
  it("renders the consumed total + logged meals once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(diaryDayFixture);
    const container = createMockContainer({ getDiaryDay: { execute } });

    const { getByText } = renderWithProviders(<DiaryDayScreen />, { container });

    await waitFor(() => expect(getByText("Definición · 2.250 kcal")).toBeTruthy());
    expect(getByText("Comida")).toBeTruthy();
    expect(execute).toHaveBeenCalledWith("2026-06-07", expect.any(Number));
  });

  it("shows the error state when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getDiaryDay: { execute } });

    const { getByText } = renderWithProviders(<DiaryDayScreen />, { container });

    await waitFor(() => expect(getByText("nutrition.error.title")).toBeTruthy());
  });

  it("shows an empty notice when no meals were logged that day", async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ ...diaryDayFixture, meals: [], mealsLogged: 0 });
    const container = createMockContainer({ getDiaryDay: { execute } });

    const { findByText } = renderWithProviders(<DiaryDayScreen />, { container });

    expect(await findByText("nutrition.diaryDay.noMeals")).toBeTruthy();
  });
});
