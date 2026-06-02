/**
 * Raised when the user dismisses a sign-in flow (e.g. the native Apple sheet)
 * before completing it. Cancellation is not a failure — the presentation layer
 * checks `instanceof SignInCancelled` to stay silent instead of surfacing an
 * error. Lives in the domain so both infrastructure (which throws it) and
 * presentation (which catches it) can reference it without crossing layers.
 */
export class SignInCancelled extends Error {
  constructor(message = "Sign in cancelled") {
    super(message);
    this.name = "SignInCancelled";
  }
}
