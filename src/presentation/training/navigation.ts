interface ScreenOption {
  label: string;
  route: string;
}

export const trainingScreens: ScreenOption[] = [
  { label: "Routines", route: "/training" },
  { label: "Sessions", route: "/training/sessions" },
  { label: "Exercises", route: "/training/exercises" },
];
