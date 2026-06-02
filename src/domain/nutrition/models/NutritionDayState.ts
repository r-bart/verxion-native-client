export interface MacroProgress {
  target: number;
  actual: number;
  unit: string;
}

export interface NutritionDayState {
  state:
    | "NO_PLAN_ACTIVE"
    | "NO_RECENT_DATA"
    | "NO_LOGS_TODAY"
    | "PARTIAL_LOGS_TODAY"
    | "FULL_LOGS_TODAY";
  calories: MacroProgress;
  protein: MacroProgress;
  carbs: MacroProgress;
  fat: MacroProgress;
  compliance: number;
  mealsLogged: number;
}
