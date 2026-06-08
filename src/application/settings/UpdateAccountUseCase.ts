import type { ISettingsPort , UpdateAccountInput, UserAccount } from "@/domain/settings";

export class UpdateAccountUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(input: UpdateAccountInput): Promise<UserAccount> {
    return this.port.updateAccount(input);
  }
}
