interface ScreenOption {
  label: string;
  route: string;
}

export const progressScreens: ScreenOption[] = [
  { label: "Overview", route: "/progress" },
  { label: "Body Comp", route: "/progress/body-composition" },
  { label: "Exercises", route: "/progress/exercises" },
  { label: "Trends", route: "/progress/trends" },
  { label: "Records", route: "/progress/records" },
];

export const historyScreens: ScreenOption[] = [
  { label: "Timeline", route: "/progress/timeline" },
  { label: "Weeks", route: "/progress/weeks" },
  { label: "Months", route: "/progress/months" },
];
