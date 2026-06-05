/**
 * App-shared query keys — for state that belongs to no single feature. The
 * authenticated user (`GET /users/me`) is read by the auth gate, the header
 * avatar, onboarding and settings, so its key lives here rather than in any one
 * feature's key factory.
 */
export const userKeys = {
  currentUser: () => ["user", "currentUser"] as const,
};
