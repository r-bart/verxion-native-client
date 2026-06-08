import { render } from "@testing-library/react-native";
import { SectionEmptyNotice } from "../SectionEmptyNotice";

describe("SectionEmptyNotice", () => {
  it("renders its text", () => {
    const { getByText } = render(<SectionEmptyNotice text="Nothing here yet" />);
    expect(getByText("Nothing here yet")).toBeTruthy();
  });

  it("renders without crashing when given no icon", () => {
    const { toJSON } = render(<SectionEmptyNotice text="Empty" />);
    expect(toJSON()).toBeTruthy();
  });
});
