import type { ISettingsPort , UserAccount } from "@/domain/settings";

export class GetAccountUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<UserAccount> {
    return this.port.getAccount();
  }
}
