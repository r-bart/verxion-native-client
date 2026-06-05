import type { UsernameCheckResult } from "@/domain/onboarding/models/Onboarding";
import type { IOnboardingPort } from "@/domain/onboarding/ports/IOnboardingPort";

export class CheckUsernameUseCase {
  constructor(private readonly port: IOnboardingPort) {}

  async execute(username: string): Promise<UsernameCheckResult> {
    return this.port.checkUsername(username);
  }
}
