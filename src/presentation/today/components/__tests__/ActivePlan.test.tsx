import { render } from "@testing-library/react-native";
import { ActivePlan } from "../ActivePlan";
import type {
  RoutineProgress,
  DietProgress,
  ProgramProgress,
  TodaySetup,
} from "@/domain/today/models/TodayDashboard";

// t returns the key (with no interpolation) so we can assert on label keys.
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "es" } }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

const routine: RoutineProgress = {
  name: "5-Day Hypertrophy",
  week: 1,
  totalWeeks: 1,
  adherenceScore: 100,
  adherenceMax: 100,
};
const diet: DietProgress = {
  name: "Diet Phase 3",
  phase: "superávit",
  adherenceScore: 0,
  adherenceMax: 100,
};
const program: ProgramProgress = {
  name: "Peak Hypertrophy",
  week: 10,
  totalWeeks: 11,
  adherenceScore: 50,
  adherenceMax: 100,
};
const setup = (s: Partial<TodaySetup>): TodaySetup => ({
  routine: "none",
  dietPlan: "none",
  program: "none",
  ...s,
});

describe("ActivePlan", () => {
  it("collapses to a single program row when a program is active", () => {
    const { getByText, queryByText } = render(
      <ActivePlan
        setup={setup({ program: "active", routine: "active", dietPlan: "active" })}
        routine={routine}
        diet={diet}
        program={program}
      />,
    );
    // The program is the only row…
    expect(getByText("Peak Hypertrophy")).toBeTruthy();
    expect(getByText(/today\.plans\.programActive/)).toBeTruthy();
    // …with the routine + diet names folded into the subtitle.
    expect(getByText("5-Day Hypertrophy · Diet Phase 3")).toBeTruthy();
    // …and NO standalone routine/diet rows.
    expect(queryByText("today.plans.routine")).toBeNull();
  });

  it("shows two rows + a hint when routine and diet are unbundled (sueltas)", () => {
    const { getByText } = render(
      <ActivePlan
        setup={setup({ routine: "active", dietPlan: "active" })}
        routine={routine}
        diet={diet}
        program={null}
      />,
    );
    expect(getByText("5-Day Hypertrophy")).toBeTruthy();
    expect(getByText("Diet Phase 3")).toBeTruthy();
    expect(getByText("today.plans.looseHint")).toBeTruthy();
  });

  it("shows only the routine row when just a routine is active", () => {
    const { getByText, queryByText } = render(
      <ActivePlan
        setup={setup({ routine: "active" })}
        routine={routine}
        diet={null}
        program={null}
      />,
    );
    expect(getByText("5-Day Hypertrophy")).toBeTruthy();
    expect(queryByText("Diet Phase 3")).toBeNull();
    expect(queryByText("today.plans.looseHint")).toBeNull();
  });

  it("falls back to the empty hint when nothing is active", () => {
    const { getByText } = render(
      <ActivePlan setup={setup({})} routine={null} diet={null} program={null} />,
    );
    expect(getByText("today.plans.none")).toBeTruthy();
  });

  it("does not collapse to program when setup says program is inactive", () => {
    const { getByText, queryByText } = render(
      <ActivePlan
        setup={setup({ program: "inactive_only", routine: "active" })}
        routine={routine}
        diet={null}
        program={program}
      />,
    );
    expect(getByText("5-Day Hypertrophy")).toBeTruthy();
    expect(queryByText("Peak Hypertrophy")).toBeNull();
  });
});
