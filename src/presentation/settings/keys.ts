/** Query-key factory for the settings feature. */
export const settingsKeys = {
  all: ["settings"] as const,
  account: () => ["settings", "account"] as const,
  profile: () => ["settings", "profile"] as const,
  sessions: () => ["settings", "sessions"] as const,
  connectedApps: () => ["settings", "connectedApps"] as const,
  feedSharing: () => ["settings", "feedSharing"] as const,
  export: () => ["settings", "export"] as const,
  exportJob: (id: string) => ["settings", "export", id] as const,
  health: () => ["settings", "health"] as const,
};
