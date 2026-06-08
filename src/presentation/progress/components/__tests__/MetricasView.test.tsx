import { render, fireEvent } from "@testing-library/react-native";
import { progressOverviewFixture } from "@/domain/progress/__fixtures__/progressFixtures";
import { MetricasView } from "../MetricasView";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("MetricasView", () => {
  it("groups the inventory by domain and drills down in place on tap", () => {
    const onOpenMeasure = jest.fn();
    const { getByText, getByTestId, queryByText } = render(
      <MetricasView overview={progressOverviewFixture} onOpenMeasure={onOpenMeasure} />,
    );

    // Group headers (rendered uppercased) + a metric label render (i18n keys under test).
    expect(getByText("PROGRESS.METRICAS.GROUPS.CUERPO")).toBeTruthy();
    expect(getByText("progress.metrics.peso")).toBeTruthy();
    // Nothing expanded yet → no "ver detalle" affordance.
    expect(queryByText("progress.metricas.viewDetail")).toBeNull();

    // Tap the weight tile → its in-place drill-down opens (peso is a measure metric).
    fireEvent.press(getByTestId("metric-card-peso"));
    expect(getByText("progress.metricas.viewDetail")).toBeTruthy();

    // The "ver detalle" jump routes to the full measure screen.
    fireEvent.press(getByText("progress.metricas.viewDetail"));
    expect(onOpenMeasure).toHaveBeenCalledWith("peso");
  });

  it("keeps only one tile open at a time", () => {
    const { getByTestId, getAllByText } = render(
      <MetricasView overview={progressOverviewFixture} />,
    );

    fireEvent.press(getByTestId("metric-card-peso"));
    fireEvent.press(getByTestId("metric-card-cintura"));
    // Only one MetricExpand mounted → its stats label (uppercased) appears once.
    expect(getAllByText("PROGRESS.MEASURE.MAX").length).toBe(1);
  });
});
