import "@/infrastructure/i18n/i18n";
import { initPostHog } from "../analytics/posthogClient";

let bootstrapped = false;

export function bootstrapInfrastructure(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  initPostHog();
}
