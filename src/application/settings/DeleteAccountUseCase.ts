import type { ISettingsPort } from "@/domain/settings";

export class DeleteAccountUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<void> {
    return this.port.deleteAccount();
  }
}
