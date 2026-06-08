import { FixtureTrainingReadModelsRepository } from "../FixtureTrainingReadModelsRepository";
import { exerciseLibraryFixture } from "@/domain/training/__fixtures__/exerciseLibraryFixture";
import { routineLibraryFixture } from "@/domain/training/__fixtures__/routineLibraryFixture";
import { routineDetailFixtureFor } from "@/domain/training/__fixtures__/routineDetailFixture";
import { dayDetailFixtureFor } from "@/domain/training/__fixtures__/dayDetailFixture";

describe("FixtureTrainingReadModelsRepository", () => {
  const repo = new FixtureTrainingReadModelsRepository();

  it("serves the temporary exercise library read-model fixture", async () => {
    await expect(repo.getExerciseLibrary()).resolves.toBe(exerciseLibraryFixture);
  });

  it("serves the temporary routine library read-model fixture", async () => {
    await expect(repo.getRoutineLibrary()).resolves.toBe(routineLibraryFixture);
  });

  it("serves temporary routine and day detail read-model fixtures by id", async () => {
    await expect(repo.getRoutineDetailView("ppl-hipertrofia")).resolves.toBe(
      routineDetailFixtureFor("ppl-hipertrofia")
    );
    await expect(repo.getDayDetailView("legs-a")).resolves.toBe(
      dayDetailFixtureFor("legs-a")
    );
  });
});
