import { GetCurrentUserUseCase } from "../GetCurrentUserUseCase";
import { CheckUsernameUseCase } from "../CheckUsernameUseCase";
import { CompleteOnboardingUseCase } from "../CompleteOnboardingUseCase";
import type { IOnboardingPort } from "@/domain/onboarding/ports/IOnboardingPort";
import type {
  CompleteOnboardingResult,
  CurrentUser,
  OnboardingData,
  UsernameCheckResult,
} from "@/domain/onboarding/models/Onboarding";

const USER: CurrentUser = {
  id: "p1",
  authUserId: "u1",
  email: "a@b.com",
  name: "A",
  username: "alpha",
  hasAthleteProfile: false,
  language: null,
  currentHealthConsentVersion: "1.0",
};

function createMockPort(overrides: Partial<IOnboardingPort> = {}): IOnboardingPort {
  return {
    getCurrentUser: jest.fn().mockResolvedValue(USER),
    checkUsername: jest
      .fn()
      .mockResolvedValue({ isAvailable: true, isValid: true } satisfies UsernameCheckResult),
    completeOnboarding: jest
      .fn()
      .mockResolvedValue({ user: { ...USER, hasAthleteProfile: true }, isNewUser: true } satisfies CompleteOnboardingResult),
    ...overrides,
  };
}

describe("GetCurrentUserUseCase", () => {
  it("returns the current user from the port", async () => {
    const port = createMockPort();
    const result = await new GetCurrentUserUseCase(port).execute();
    expect(port.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.hasAthleteProfile).toBe(false);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({ getCurrentUser: jest.fn().mockRejectedValue(new Error("boom")) });
    await expect(new GetCurrentUserUseCase(port).execute()).rejects.toThrow("boom");
  });
});

describe("CheckUsernameUseCase", () => {
  it("passes the username through to the port", async () => {
    const port = createMockPort();
    const result = await new CheckUsernameUseCase(port).execute("alpha");
    expect(port.checkUsername).toHaveBeenCalledWith("alpha");
    expect(result.isAvailable).toBe(true);
  });
});

describe("CompleteOnboardingUseCase", () => {
  it("submits the payload and returns the result", async () => {
    const port = createMockPort();
    const data: OnboardingData = {
      username: "alpha",
      healthDataConsentGranted: true,
      measurementSystem: "metric",
      experienceLevel: "beginner",
    };
    const result = await new CompleteOnboardingUseCase(port).execute(data);
    expect(port.completeOnboarding).toHaveBeenCalledWith(data);
    expect(result.user.hasAthleteProfile).toBe(true);
    expect(result.isNewUser).toBe(true);
  });
});
