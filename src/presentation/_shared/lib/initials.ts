/**
 * Avatar initials — up to two letters from the user's name (first + last),
 * falling back to username, then the email local-part. A single-word source
 * yields one letter. Always uppercase; "·" when there is nothing to show.
 */
export function initials(name?: string | null, username?: string | null, email?: string | null): string {
  const source = (name ?? username ?? email?.split("@")[0] ?? "").trim();
  if (!source) return "·";
  const parts = source.split(/\s+/).filter(Boolean);
  const chars = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
  return chars.toUpperCase();
}
