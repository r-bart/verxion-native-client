import { render } from "@testing-library/react-native";
import { BlockLine } from "../BlockLine";
import type { MesocycleIdentity } from "@/domain/training/models/RoutineDashboard";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, o?: Record<string, unknown>) =>
      o ? `${k}:${JSON.stringify(o)}` : k,
  }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

const block = (over: Partial<MesocycleIdentity> = {}): MesocycleIdentity => ({
  id: "m1",
  name: "Acumulación",
  goal: "Volumen",
  orderIndex: 0,
  totalBlocks: 3,
  ...over,
});

describe("BlockLine", () => {
  it("renders nothing for a flat/finished/paused routine (null)", () => {
    const { toJSON } = render(<BlockLine mesocycle={null} />);
    expect(toJSON()).toBeNull();
  });

  it("paints the RAW block name + localized 'Bloque {i+1}/{total}' + dots", () => {
    const { getByText, getByTestId } = render(
      <BlockLine mesocycle={block({ orderIndex: 1, totalBlocks: 3 })} />,
    );
    expect(getByText("Acumulación")).toBeTruthy(); // verbatim, no i18n
    // index is orderIndex + 1 (1-based for display), total is totalBlocks
    expect(getByText('training.routine.block:{"index":2,"total":3}')).toBeTruthy();
    expect(getByTestId("block-dots")).toBeTruthy();
  });

  it("drops the dot indicator past MAX_DOTS so a long block list can't overflow", () => {
    const { queryByTestId } = render(
      <BlockLine mesocycle={block({ totalBlocks: 12 })} />,
    );
    expect(queryByTestId("block-dots")).toBeNull();
  });
});
