import type { ISettingsPort } from "@/domain/settings";
import type { UpdateConnectedAppScopesInput } from "@/domain/settings";

export class UpdateConnectedAppScopesUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(input: UpdateConnectedAppScopesInput): Promise<void> {
    return this.port.updateConnectedAppScopes(input);
  }
}
