import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockContainer,
} from "@/__tests__/test-utils";
import { progressExerciseDetailFixture } from "@/domain/progress/__fixtures__/progressFixtures";
import { ExerciseDetailScreen } from "../ExerciseDetailScreen";

// expo-image is a native module — render its accessibilityLabel as plain text so
// the gif surface is queryable in jest.
jest.mock("expo-image", () => ({
  Image: (props: any) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, null, props.accessibilityLabel);
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ slug: "press-banca" }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));

describe("ExerciseDetailScreen", () => {
  it("paints the hero + Progreso tab (name, tabs) once the detail resolves", async () => {
    const execute = jest.fn().mockResolvedValue(progressExerciseDetailFixture);
    const container = createMockContainer({ getProgressExerciseDetail: { execute } });

    const { getAllByText, getByText } = renderWithProviders(<ExerciseDetailScreen />, { container });

    // Name appears (header + hero) once data resolves.
    await waitFor(() => expect(getAllByText("Press banca").length).toBeGreaterThan(0));
    // The two tabs render (labels are i18n keys under test).
    expect(getByText("progress.exercise.tabs.progress")).toBeTruthy();
    expect(getByText("progress.exercise.tabs.guide")).toBeTruthy();
    // It fetched by the route slug, defaulting to the e1rm metric.
    expect(execute).toHaveBeenCalledWith("press-banca", "e1rm");
  });

  it("renders the exercise gif in the guide tab when the catalog returns gifUrl", async () => {
    const execute = jest.fn().mockResolvedValue(progressExerciseDetailFixture);
    const guideExecute = jest.fn().mockResolvedValue({
      id: "ex_press_banca",
      name: "Press banca",
      bodyPart: "chest",
      equipment: "barbell",
      target: "pectorals",
      secondaryMuscles: [],
      instructions: ["Baja la barra al pecho.", "Empuja hasta extender."],
      gifUrl: "https://cdn.verxion.test/press-banca.gif",
      isCustom: false,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });
    const container = createMockContainer({
      getProgressExerciseDetail: { execute },
      getExerciseCatalogDetail: { execute: guideExecute },
    });

    const { getByText } = renderWithProviders(<ExerciseDetailScreen />, { container });

    await waitFor(() => expect(getByText("progress.exercise.tabs.guide")).toBeTruthy());
    fireEvent.press(getByText("progress.exercise.tabs.guide"));

    // The guide fetches by the read-model's library id, and the gif surface renders.
    await waitFor(() => expect(guideExecute).toHaveBeenCalledWith("ex_press_banca"));
    await waitFor(() => expect(getByText("progress.exercise.guideMediaAlt")).toBeTruthy());
  });

  it("shows the error state with retry when the read fails", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getProgressExerciseDetail: { execute } });

    const { getByText } = renderWithProviders(<ExerciseDetailScreen />, { container });

    await waitFor(() => expect(getByText("common.retry")).toBeTruthy());
  });
});
