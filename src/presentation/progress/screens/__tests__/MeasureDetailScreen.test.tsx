import { waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { progressMeasureDetailFixture } from "@/domain/progress/__fixtures__/progressFixtures";
import { MeasureDetailScreen } from "../MeasureDetailScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ metric: "peso" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("MeasureDetailScreen", () => {
  it("renders the detail (period picker + read-only note) once the measure resolves", async () => {
    const execute = jest.fn().mockResolvedValue(progressMeasureDetailFixture);
    const container = createMockContainer({ getProgressMeasure: { execute } });

    const { getByText } = renderWithProviders(<MeasureDetailScreen />, { container });

    await waitFor(() => expect(getByText("progress.measure.readOnly")).toBeTruthy());
    // The period picker is present (labels are i18n keys under test).
    expect(getByText("progress.measure.period.mes")).toBeTruthy();
    // It requested the metric from the route param, defaulting to the month period.
    expect(execute).toHaveBeenCalledWith("peso", "mes");
  });

  it("shows the error state with retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getProgressMeasure: { execute } });

    const { getByText } = renderWithProviders(<MeasureDetailScreen />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });

  it("shows an empty notice when the period has no records", async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ ...progressMeasureDetailFixture, records: [] });
    const container = createMockContainer({ getProgressMeasure: { execute } });

    const { findByText } = renderWithProviders(<MeasureDetailScreen />, {
      container,
    });

    expect(await findByText("progress.measure.noRecords")).toBeTruthy();
  });
});
