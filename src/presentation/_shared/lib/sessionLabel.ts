/**
 * Friendly session label from the API's `display` field.
 *
 * Today the platform sends the raw User-Agent as `display` (e.g.
 * "Mozilla/5.0 (iPhone; …) Safari/604.1"). This is a presentation-only
 * prettifier that distils it to "Browser · Device" (e.g. "Safari · iPhone").
 * It is cosmetic and intentionally lossy; if/when the server formats `display`
 * into a clean label, this can be deleted and the field painted verbatim again.
 *
 * Falls back to the original string when it isn't a recognizable User-Agent
 * (e.g. an OAuth token whose `display` is already an app name).
 */
const BROWSERS: [RegExp, string][] = [
  [/edg(e|a|ios)?\//i, "Edge"],
  [/firefox\/|fxios\//i, "Firefox"],
  [/crios\/|chrome\//i, "Chrome"], // CriOS = Chrome on iOS
  [/version\/[\d.]+ .*safari|safari\//i, "Safari"],
];

const DEVICES: [RegExp, string][] = [
  [/iphone/i, "iPhone"],
  [/ipad/i, "iPad"],
  [/android/i, "Android"],
  [/macintosh|mac os x/i, "Mac"],
  [/windows/i, "Windows"],
  [/linux/i, "Linux"],
];

function match(pairs: [RegExp, string][], ua: string): string | null {
  for (const [re, name] of pairs) if (re.test(ua)) return name;
  return null;
}

export function formatSessionLabel(display: string | null | undefined): string {
  const ua = display?.trim();
  if (!ua) return "";

  // Not a browser User-Agent (e.g. an OAuth app name) → leave it untouched.
  if (!/mozilla\/|applewebkit|gecko|chrome|safari|firefox/i.test(ua)) return ua;

  const browser = match(BROWSERS, ua);
  const device = match(DEVICES, ua);

  if (browser && device) return `${browser} · ${device}`;
  return device ?? browser ?? ua;
}
