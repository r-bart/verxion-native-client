import type { CurrentUser } from "@/domain/onboarding/models/Onboarding";
import type { IOnboardingPort } from "@/domain/onboarding/ports/IOnboardingPort";

export class GetCurrentUserUseCase {
  constructor(private readonly port: IOnboardingPort) {}

  async execute(): Promise<CurrentUser> {
    return this.port.getCurrentUser();
  }
}
