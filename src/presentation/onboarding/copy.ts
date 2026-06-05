/**
 * Onboarding copy (English). Mirrors the semantics of the platform's
 * `onboarding` i18n namespace (apps/web-app/src/locales). The native app
 * is English-first and hardcodes strings (same pattern as LoginScreen); this
 * file is the single source for onboarding wording so steps stay terse.
 */
export const copy = {
  submitError: "Something went wrong. Please try again.",
  stepper: { stepOf: (current: number, total: number) => `Step ${current} of ${total}` },

  welcome: {
    tagline: "Log. Improve. Repeat.",
    title: "Welcome aboard",
    subtitle: "Let's tailor your experience with a few quick questions.",
    getStarted: "Get started",
    signOut: "Sign out",
  },

  resume: {
    title: "Let's pick up where you left off",
    heroSubtitle: (completed: number, total: number) =>
      `You're ${completed} of ${total} steps in. We saved your progress — continue right where you stopped.`,
    nextStepLabel: (label: string) => `Next · ${label}`,
    continue: "Continue setup",
    restart: "Start over",
  },

  username: {
    title: "Choose a username",
    subtitle: "This is how other athletes will find you.",
    label: "Username",
    placeholder: "your_username",
    available: "Available",
    checking: "Checking…",
    invalid: "1–15 characters: lowercase letters, numbers, underscores.",
    taken: "That username is already taken",
    checkError: "Couldn't check availability. Please try again.",
    next: "Next",
  },

  healthConsent: {
    title: "Health data consent",
    subtitle:
      "We need your explicit consent before collecting or processing health-related data across your profile, workouts, nutrition logs, measurements, and related coaching context.",
    checkbox:
      "I give my explicit consent for Verxion to process my health-related data, including fitness and nutrition data, as described in the Privacy Policy.",
    detailsPrefix: "Read the",
    detailsLink: "Privacy Policy",
    detailsSuffix: "for more details.",
    next: "Continue",
    back: "Back",
  },

  measurementSystem: {
    title: "Measurement system",
    subtitle: "Choose how weights and distances are shown.",
    metric: "Metric",
    metricHint: "kg, cm, km",
    imperial: "Imperial",
    imperialHint: "lbs, ft/in, mi",
    next: "Next",
    back: "Back",
  },

  experienceLevel: {
    title: "Your experience level",
    subtitle: "This helps us set sensible defaults.",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    submitIdle: "Continue",
    submitPending: "Setting up…",
    back: "Back",
  },

  personalDetails: {
    title: "A few personal details",
    subtitle:
      "GDPR-encrypted and never required. Sharing these gives coaching MUCH more context — training, nutrition, and recovery adapt better when we know your age, height, and sex.",
    genderLabel: "Sex",
    dateOfBirthLabel: "Date of birth",
    dateOfBirthPlaceholder: "Select your date of birth",
    heightLabelCm: "Height (cm)",
    heightLabelFeet: "Feet",
    heightLabelInches: "Inches",
    ageError: "You must be between 14 and 120 years old.",
    continue: "Continue",
    back: "Back",
  },

  gender: {
    male: "Male",
    female: "Female",
    not_specified: "Prefer not to say",
  },

  fitnessGoal: {
    title: "What's your primary goal?",
    subtitle: "We'll tailor your experience accordingly.",
    label: "Fitness goal",
    optional: "Optional",
    muscle_gain: "Build muscle",
    fat_loss: "Lose fat",
    strength: "Strength",
    endurance: "Endurance",
    flexibility: "Flexibility",
    general_fitness: "General fitness",
    athletic_performance: "Athletic performance",
    rehabilitation: "Rehabilitation",
    recomposition: "Recomposition",
    submitIdle: "Start using Verxion",
    submitPending: "Setting up…",
    back: "Back",
    skipAndFinish: "Skip and start using Verxion",
  },

  summaryFields: {
    healthConsent: "Health consent",
    username: "Username",
    measurementSystem: "Units",
    experienceLevel: "Experience",
    personalDetails: "Personal details",
    fitnessGoal: "Goal",
  } as Record<string, string>,
} as const;
