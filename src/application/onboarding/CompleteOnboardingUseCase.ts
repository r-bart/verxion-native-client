import type {
  CompleteOnboardingResult,
  OnboardingData,
} from "@/domain/onboarding/models/Onboarding";
import type { IOnboardingPort } from "@/domain/onboarding/ports/IOnboardingPort";

export class CompleteOnboardingUseCase {
  constructor(private readonly port: IOnboardingPort) {}

  async execute(data: OnboardingData): Promise<CompleteOnboardingResult> {
    return this.port.completeOnboarding(data);
  }
}
