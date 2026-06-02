export interface Food {
  id: string;
  name: string;
  brand: string | null;
  caloriesPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  servingUnit: string | null;
  servingSize: number | null;
  isCustom: boolean;
}

export interface FoodSearchParams {
  q?: string;
  limit?: number;
  offset?: number;
}
