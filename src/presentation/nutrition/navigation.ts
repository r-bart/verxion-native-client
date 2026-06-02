interface ScreenOption {
  label: string;
  route: string;
}

export const nutritionScreens: ScreenOption[] = [
  { label: "Diet Plans", route: "/nutrition" },
  { label: "Meals", route: "/nutrition/meal-logs" },
  { label: "Foods", route: "/nutrition/foods" },
];
