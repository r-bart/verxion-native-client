import type { ISettingsPort } from "@/domain/settings";

export class UpdateFollowApprovalUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(requireApproval: boolean): Promise<void> {
    return this.port.updateFollowApproval(requireApproval);
  }
}
