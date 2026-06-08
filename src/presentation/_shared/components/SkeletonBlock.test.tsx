import { render } from "@testing-library/react-native";
import * as Reanimated from "react-native-reanimated";
import { SkeletonBlock } from "./SkeletonBlock";

describe("SkeletonBlock", () => {
  afterEach(() => jest.restoreAllMocks());

  it("renders a block without crashing", () => {
    const { toJSON } = render(<SkeletonBlock height={56} />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders statically when reduced motion is on (no pulse loop)", () => {
    const spy = jest.spyOn(Reanimated, "useReducedMotion").mockReturnValue(true);
    const { toJSON } = render(<SkeletonBlock height={120} radius={24} width={100} />);
    expect(toJSON()).toBeTruthy();
    expect(spy).toHaveBeenCalled();
  });
});
