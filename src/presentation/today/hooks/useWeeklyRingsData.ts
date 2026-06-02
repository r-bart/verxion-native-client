import { useQueries } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export interface DayRing {
  date: string;
  dayLabel: string;
  isToday: boolean;
  training: number; // 0-1
  nutrition: number; // 0-1
  steps: number; // 0-1
}

const STEP_GOAL_DEFAULT = 10_000;
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().slice(0, 10);
}

function getSunday(monday: string): string {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

export function useWeeklyRingsData() {
  const monday = getMonday();
  const sunday = getSunday(monday);
  const today = new Date().toISOString().slice(0, 10);

  const trainingUc = useDI((c) => c.getWeeklyTrainingReview);
  const nutritionUc = useDI((c) => c.getNutritionWeeklySummary);
  const stepsUc = useDI((c) => c.listStepLogs);

  const results = useQueries({
    queries: [
      {
        queryKey: todayKeys.weeklyTrainingReview(),
        queryFn: () => trainingUc.execute(monday),
      },
      {
        queryKey: todayKeys.weeklyNutritionSummary(),
        queryFn: () => nutritionUc.execute(monday),
      },
      {
        queryKey: todayKeys.weeklySteps(monday, sunday),
        queryFn: () => stepsUc.execute(monday, sunday),
      },
    ],
  });

  const [trainingResult, nutritionResult, stepsResult] = results;
  const isLoading = trainingResult.isLoading || nutritionResult.isLoading || stepsResult.isLoading;

  const days: DayRing[] = [];

  if (!isLoading) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      // Training: completed/rest = 1 (plan followed), missed = 0, upcoming = 0
      let trainingPct = 0;
      if (trainingResult.data) {
        const day = trainingResult.data.days.find((td) => td.date === dateStr);
        if (day?.status === "completed" || day?.status === "rest") {
          trainingPct = 1;
        }
      }

      // Nutrition: average of calorie and protein adherence
      let nutritionPct = 0;
      if (nutritionResult.data) {
        const day = nutritionResult.data.dayByDay.find((nd) => nd.date === dateStr);
        if (day) {
          if (day.targetCalories && day.targetCalories > 0) {
            const calPct = Math.min(day.totalCalories / day.targetCalories, 1);
            const proPct =
              day.targetProtein && day.targetProtein > 0
                ? Math.min(day.totalProtein / day.targetProtein, 1)
                : calPct;
            nutritionPct = (calPct + proPct) / 2;
          } else if (day.mealCount > 0) {
            nutritionPct = 0.5;
          }
        }
      }

      // Steps: percentage of goal
      let stepsPct = 0;
      if (stepsResult.data) {
        const stepDay = stepsResult.data.find((s) => s.loggedDate === dateStr);
        if (stepDay) {
          const goal = stepDay.stepGoal ?? STEP_GOAL_DEFAULT;
          stepsPct = goal > 0 ? Math.min(stepDay.totalSteps / goal, 1) : 0;
        }
      }

      days.push({
        date: dateStr,
        dayLabel: DAY_LABELS[i],
        isToday: dateStr === today,
        training: trainingPct,
        nutrition: nutritionPct,
        steps: stepsPct,
      });
    }
  }

  return { days, isLoading };
}
