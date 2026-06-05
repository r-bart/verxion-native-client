/** Query-key factory for the "Hoy" feature. */
export const todayKeys = {
  all: ["today"] as const,
  dashboard: (date?: string) => ["today", "dashboard", date ?? "today"] as const,
  itemDetail: (kind: string, id: string) => ["today", "item", kind, id] as const,
};
