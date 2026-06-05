import { waitFor } from "@testing-library/react-native";
import { renderWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { routineDashboardFixture } from "@/domain/training/__fixtures__/routineDashboardFixture";
import { RutinaSegment } from "../RutinaSegment";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("RutinaSegment", () => {
  it("renders the routine content (not the skeleton) once data resolves", async () => {
    const execute = jest.fn().mockResolvedValue(routineDashboardFixture);
    const container = createMockContainer({ getRoutineDashboard: { execute } });

    const { getByText } = renderWithProviders(<RutinaSegment />, { container });

    // The hero name proves we left the skeleton and painted the aggregate —
    // the exact regression the placeholderData/isLoading guard hid.
    await waitFor(() => expect(getByText("PPL Hipertrofia")).toBeTruthy());
    expect(getByText(routineDashboardFixture.agentNote!)).toBeTruthy();
  });

  it("shows the error state with a retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getRoutineDashboard: { execute } });

    const { getByText } = renderWithProviders(<RutinaSegment />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
