import type { ISettingsPort } from "@/domain/settings";
import type { UpdateAccountInput, UserAccount } from "@/domain/settings";

export class UpdateAccountUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(input: UpdateAccountInput): Promise<UserAccount> {
    return this.port.updateAccount(input);
  }
}
