import { waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { sessionsSummaryFixture } from "@/domain/training/__fixtures__/sessionsSummaryFixture";
import { SesionesSegment } from "../SesionesSegment";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("SesionesSegment", () => {
  it("renders the recent sessions (not the skeleton) once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(sessionsSummaryFixture);
    const container = createMockContainer({ getSessionsSummary: { execute } });

    const { getByText } = renderWithProviders(<SesionesSegment />, { container });

    await waitFor(() => expect(getByText("Legs B")).toBeTruthy());
    expect(getByText("Push A")).toBeTruthy();
  });

  it("shows the error state with a retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getSessionsSummary: { execute } });

    const { getByText } = renderWithProviders(<SesionesSegment />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
