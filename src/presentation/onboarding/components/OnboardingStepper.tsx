import { useEffect, useReducer, useRef } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ONBOARDING_STEPS,
  type ExperienceLevelType,
  type FitnessGoalType,
  type GenderType,
  type MeasurementSystemType,
  type OnboardingData,
  type OnboardingStepKey,
} from "@/domain/onboarding/models/Onboarding";
import { tokens } from "@/presentation/_shared/design/tokens";
import { mono } from "@/presentation/_shared/design/fonts";
import { useDI } from "@/infrastructure/di/DIContext";
import { useCurrentUser } from "@/presentation/_shared/hooks/useCurrentUser";
import { useUsernameAvailability } from "@/presentation/_shared/hooks/useUsernameAvailability";
import { useCompleteOnboarding } from "../hooks/useCompleteOnboarding";
import { useOnboardingDraft } from "../hooks/useOnboardingDraft";
import { useSignOut } from "@/presentation/auth/hooks/useSignOut";
import { copy } from "../copy";
import { ProgressHeader } from "./ProgressHeader";
import { StepTransition } from "./StepTransition";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ResumeStep } from "./steps/ResumeStep";
import { HealthConsentStep } from "./steps/HealthConsentStep";
import { UsernameStep } from "./steps/UsernameStep";
import { MeasurementSystemStep } from "./steps/MeasurementSystemStep";
import { ExperienceLevelStep } from "./steps/ExperienceLevelStep";
import { PersonalDetailsStep } from "./steps/PersonalDetailsStep";
import { FitnessGoalStep } from "./steps/FitnessGoalStep";

interface FormState {
  username: string;
  healthDataConsentGranted: boolean;
  gender?: GenderType;
  dateOfBirth?: string;
  measurementSystem?: MeasurementSystemType;
  heightCm?: number;
  heightCmInput: string;
  heightFeetInput: string;
  heightInchesInput: string;
  primaryGoal?: FitnessGoalType;
  experienceLevel?: ExperienceLevelType;
}

interface OnboardingState {
  stepIndex: number;
  direction: 1 | -1;
  submitError: string | null;
  form: FormState;
  showResumeBanner: boolean;
}

type OnboardingAction =
  | { type: "SET_STEP"; payload: { index: number; direction: 1 | -1 } }
  | { type: "SET_SUBMIT_ERROR"; payload: string | null }
  | { type: "SET_FORM"; payload: Partial<FormState> }
  | { type: "REPLACE_FORM"; payload: FormState }
  | { type: "SET_SHOW_RESUME_BANNER"; payload: boolean }
  | { type: "CLEAR_SUBMIT_ERROR_IF_SET" };

const WELCOME_INDEX = -1;

const EMPTY_FORM: FormState = {
  username: "",
  healthDataConsentGranted: false,
  heightCmInput: "",
  heightFeetInput: "",
  heightInchesInput: "",
};

const INITIAL_STATE: OnboardingState = {
  stepIndex: WELCOME_INDEX,
  direction: 1,
  submitError: null,
  form: EMPTY_FORM,
  showResumeBanner: false,
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        stepIndex: action.payload.index,
        direction: action.payload.direction,
      };
    case "SET_SUBMIT_ERROR":
      return {
        ...state,
        submitError: action.payload,
      };
    case "SET_FORM":
      return {
        ...state,
        form: { ...state.form, ...action.payload },
      };
    case "REPLACE_FORM":
      return {
        ...state,
        form: action.payload,
      };
    case "SET_SHOW_RESUME_BANNER":
      return {
        ...state,
        showResumeBanner: action.payload,
      };
    case "CLEAR_SUBMIT_ERROR_IF_SET":
      return {
        ...state,
        submitError: state.submitError === null ? state.submitError : null,
      };
    default:
      return state;
  }
}

function isDraftNonEmpty(d: Partial<FormState>): boolean {
  return Boolean(
    (d.username && d.username.trim().length > 0) ||
      d.healthDataConsentGranted ||
      d.gender ||
      d.dateOfBirth ||
      d.measurementSystem ||
      typeof d.heightCm === "number" ||
      d.primaryGoal ||
      d.experienceLevel,
  );
}

function valueForStepKey(s: FormState, key: OnboardingStepKey): unknown {
  switch (key) {
    case "username":
      return s.username && s.username.trim().length > 0 ? s.username : undefined;
    case "healthConsent":
      return s.healthDataConsentGranted ? true : undefined;
    case "measurementSystem":
      return s.measurementSystem;
    case "experienceLevel":
      return s.experienceLevel;
    case "fitnessGoal":
      return s.primaryGoal;
    case "personalDetails":
      return s.gender || s.dateOfBirth || s.heightCm ? true : undefined;
  }
}

function firstIncompleteStepIndex(s: FormState): number {
  let firstOptional = -1;
  for (let i = 0; i < ONBOARDING_STEPS.length; i += 1) {
    const step = ONBOARDING_STEPS[i]!;
    const missing = valueForStepKey(s, step.key) == null;
    if (!missing) continue;
    if (step.optional) {
      if (firstOptional === -1) firstOptional = i;
    } else {
      return i;
    }
  }
  if (firstOptional >= 0) return firstOptional;
  return ONBOARDING_STEPS.length - 1;
}

function countCompletedSteps(s: FormState): number {
  return ONBOARDING_STEPS.reduce(
    (n, step) => (valueForStepKey(s, step.key) != null ? n + 1 : n),
    0,
  );
}

export function OnboardingStepper() {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.authUserId ?? null;
  const consentVersion = currentUser?.currentHealthConsentVersion ?? null;

  const steps = ONBOARDING_STEPS;
  const totalCountableSteps = steps.length;

  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_STATE);
  const { stepIndex, direction, submitError, form, showResumeBanner } = state;

  const userTouchedRef = useRef(false);
  const draftHydratedRef = useRef(false);

  const { mutate, isPending, error } = useCompleteOnboarding();
  const { mutate: signOut } = useSignOut();
  const usernameAvailability = useUsernameAvailability(form.username, currentUser?.username ?? undefined);
  const draft = useOnboardingDraft(userId, consentVersion);
  const { track } = useDI((c) => c.telemetry);

  // Draft hydration once userId + consentVersion known. Also seeds the
  // username from the profile when the draft doesn't carry one — both writes
  // happen in the async callback (not the effect body), the sanctioned place
  // for setState driven by an external system. Runs once.
  const seedUsername = currentUser?.username ?? null;
  useEffect(() => {
    if (!draft.ready || draftHydratedRef.current) return;
    draftHydratedRef.current = true;
    let cancelled = false;
    void draft.load<Partial<FormState>>().then((loaded) => {
      if (cancelled) return;
      const hasDraft = !!loaded && isDraftNonEmpty(loaded);
      const next = { ...EMPTY_FORM, ...(loaded ?? {}) };
      if (!next.username && seedUsername) next.username = seedUsername;
      dispatch({ type: "REPLACE_FORM", payload: next });
      if (hasDraft) dispatch({ type: "SET_SHOW_RESUME_BANNER", payload: true });
    });
    return () => {
      cancelled = true;
    };
  }, [draft, seedUsername]);

  // Persist draft on change — only after genuine user input.
  useEffect(() => {
    if (!draft.ready || !userTouchedRef.current) return;
    void draft.save(form);
  }, [form, draft]);

  // step_viewed analytics.
  useEffect(() => {
    if (stepIndex < 0) return;
    const step = steps[stepIndex];
    if (!step) return;
    track("onboarding_step_viewed", { step_key: step.key, step_index: stepIndex, is_optional: step.optional });
  }, [stepIndex, steps, track]);

  const goNext = () => {
    dispatch({ type: "SET_STEP", payload: { index: Math.min(stepIndex + 1, steps.length - 1), direction: 1 } });
  };

  const goBack = () => {
    dispatch({ type: "SET_STEP", payload: { index: Math.max(stepIndex - 1, WELCOME_INDEX), direction: -1 } });
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    userTouchedRef.current = true;
    dispatch({ type: "CLEAR_SUBMIT_ERROR_IF_SET" });
    dispatch({ type: "SET_FORM", payload: { [key]: value } });
  };

  const onHeightCm = (raw: string, cm: number | undefined) => {
    userTouchedRef.current = true;
    dispatch({ type: "SET_FORM", payload: { heightCmInput: raw, heightCm: cm } });
  };
  const onHeightFeet = (raw: string, cm: number | undefined) => {
    userTouchedRef.current = true;
    dispatch({ type: "SET_FORM", payload: { heightFeetInput: raw, heightCm: cm } });
  };
  const onHeightInches = (raw: string, cm: number | undefined) => {
    userTouchedRef.current = true;
    dispatch({ type: "SET_FORM", payload: { heightInchesInput: raw, heightCm: cm } });
  };

  const submitWithForm = (snapshot: FormState) => {
    const username = snapshot.username.trim();
    if (!username) {
      dispatch({ type: "SET_SUBMIT_ERROR", payload: copy.username.invalid });
      return;
    }
    // Required steps precede this one, so these should already be set — but
    // surface a message instead of failing silently if the flow ever lets a
    // submit through with them missing (e.g. a partial resumed draft).
    if (!snapshot.measurementSystem || !snapshot.experienceLevel || !snapshot.healthDataConsentGranted) {
      dispatch({ type: "SET_SUBMIT_ERROR", payload: copy.submitError });
      return;
    }
    dispatch({ type: "SET_SUBMIT_ERROR", payload: null });

    const data: OnboardingData = {
      username,
      healthDataConsentGranted: true,
      measurementSystem: snapshot.measurementSystem,
      experienceLevel: snapshot.experienceLevel,
      ...(snapshot.gender && { gender: snapshot.gender }),
      ...(snapshot.dateOfBirth && { dateOfBirth: snapshot.dateOfBirth }),
      ...(snapshot.heightCm && { heightCm: snapshot.heightCm }),
      ...(snapshot.primaryGoal && { primaryGoal: snapshot.primaryGoal }),
    };
    mutate(data);
  };

  const onWelcomeNext = () => {
    void draft.readStartedAt().then((startedAt) => {
      if (startedAt == null) {
        void draft.writeStartedAt(Date.now());
        track("onboarding_started", { resumed: false });
      }
    });
    dispatch({ type: "SET_STEP", payload: { index: 0, direction: 1 } });
  };

  const onSignOut = () => signOut();

  const resumeTargetIndex = firstIncompleteStepIndex(form);
  const completedCount = countCompletedSteps(form);

  const onResumeContinue = () => {
    track("onboarding_resumed", { completed_steps: completedCount, resume_step_index: resumeTargetIndex });
    dispatch({ type: "SET_STEP", payload: { index: resumeTargetIndex, direction: 1 } });
    dispatch({ type: "SET_SHOW_RESUME_BANNER", payload: false });
  };

  const onResumeRestart = () => {
    void draft.clear();
    userTouchedRef.current = false;
    dispatch({ type: "REPLACE_FORM", payload: EMPTY_FORM });
    dispatch({ type: "SET_STEP", payload: { index: WELCOME_INDEX, direction: 1 } });
    dispatch({ type: "SET_SHOW_RESUME_BANNER", payload: false });
  };

  const transitionKey = stepIndex === WELCOME_INDEX ? (showResumeBanner ? "resume" : "welcome") : stepIndex;

  const errorMessage = submitError ?? (error instanceof Error ? error.message : null);

  const currentStep = (() => {
    if (stepIndex === WELCOME_INDEX) {
      if (showResumeBanner) {
        const targetKey = steps[resumeTargetIndex]?.key;
        const nextStepLabel = targetKey ? copy.summaryFields[targetKey] ?? "" : "";
        return (
          <ResumeStep
            completedCount={completedCount}
            totalCount={totalCountableSteps}
            nextStepNumber={resumeTargetIndex + 1}
            nextStepLabel={nextStepLabel}
            onContinue={onResumeContinue}
            onRestart={onResumeRestart}
            onSignOut={onSignOut}
          />
        );
      }
      return <WelcomeStep onNext={onWelcomeNext} onSignOut={onSignOut} />;
    }

    const key = steps[stepIndex]!.key;
    switch (key) {
      case "healthConsent":
        return (
          <HealthConsentStep
            accepted={form.healthDataConsentGranted}
            onAcceptChange={(v) => updateField("healthDataConsentGranted", v)}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case "username":
        return (
          <UsernameStep
            value={form.username}
            onChange={(v) => updateField("username", v)}
            availability={usernameAvailability}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case "measurementSystem":
        return (
          <MeasurementSystemStep
            value={form.measurementSystem}
            onChange={(v) => updateField("measurementSystem", v)}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case "experienceLevel":
        return (
          <ExperienceLevelStep
            value={form.experienceLevel}
            onChange={(v) => updateField("experienceLevel", v)}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case "personalDetails":
        return (
          <PersonalDetailsStep
            gender={form.gender}
            onGenderChange={(v) => updateField("gender", v)}
            dateOfBirth={form.dateOfBirth}
            onDateOfBirthChange={(v) => updateField("dateOfBirth", v)}
            measurementSystem={form.measurementSystem ?? "metric"}
            heightCmInput={form.heightCmInput}
            heightFeetInput={form.heightFeetInput}
            heightInchesInput={form.heightInchesInput}
            onHeightCmInputChange={onHeightCm}
            onHeightFeetInputChange={onHeightFeet}
            onHeightInchesInputChange={onHeightInches}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case "fitnessGoal":
        return (
          <FitnessGoalStep
            value={form.primaryGoal}
            onChange={(v) => updateField("primaryGoal", v)}
            onSubmit={() => submitWithForm(form)}
            onSkip={() => {
              userTouchedRef.current = true;
              dispatch({ type: "SET_FORM", payload: { primaryGoal: undefined } });
              submitWithForm({ ...form, primaryGoal: undefined });
            }}
            onBack={goBack}
            isSubmitting={isPending}
          />
        );
    }
  })();

  const showProgress = stepIndex !== WELCOME_INDEX;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <LinearGradient
        colors={["rgba(255,98,98,0.08)", "rgba(255,98,98,0)"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%" }}
        pointerEvents="none"
      />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 }}>
        {showProgress ? <ProgressHeader currentStepIndex={stepIndex} totalSteps={totalCountableSteps} /> : null}
        <StepTransition transitionKey={transitionKey} direction={direction}>
          {currentStep}
        </StepTransition>
        {errorMessage ? (
          <Text
            testID="onboarding-error"
            style={{ fontFamily: mono(400), fontSize: 12, lineHeight: 16, color: tokens.color.destructive, textAlign: "center", marginTop: 12 }}
          >
            {errorMessage}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
