/**
 * Query-key factory for the Programas feature. One namespace, keyed by the read
 * it backs (library list, active program, single program, adherence).
 */
export const programKeys = {
  all: ["program"] as const,
  list: () => ["program", "list"] as const,
  active: () => ["program", "active"] as const,
  detail: (id: string) => ["program", "detail", id] as const,
  adherence: (id: string) => ["program", "adherence", id] as const,
};
