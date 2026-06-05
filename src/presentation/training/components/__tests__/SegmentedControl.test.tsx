import { fireEvent, render } from "@testing-library/react-native";
import { SegmentedControl, type SegmentOption } from "../SegmentedControl";

type K = "a" | "b" | "c";
const OPTIONS: SegmentOption<K>[] = [
  { key: "a", label: "Alpha" },
  { key: "b", label: "Beta" },
  { key: "c", label: "Gamma" },
];

describe("SegmentedControl", () => {
  it("renders one tappable label per option", () => {
    const { getByText } = render(
      <SegmentedControl options={OPTIONS} value="a" onChange={jest.fn()} />,
    );
    OPTIONS.forEach((o) => expect(getByText(o.label)).toBeTruthy());
  });

  it("emits the option key on press", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <SegmentedControl options={OPTIONS} value="a" onChange={onChange} />,
    );

    fireEvent.press(getByText("Beta"));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("marks only the active option as selected for assistive tech", () => {
    const { getAllByRole } = render(
      <SegmentedControl options={OPTIONS} value="c" onChange={jest.fn()} />,
    );

    const tabs = getAllByRole("tab");
    const selected = tabs.filter((t) => t.props.accessibilityState?.selected);
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent("Gamma");
  });
});
