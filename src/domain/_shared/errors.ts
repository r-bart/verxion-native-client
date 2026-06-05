/**
 * Transport-agnostic operation error carrying a numeric `status` and optional
 * `code`. Lives in the shared kernel (no imports) so any layer — including
 * presentation — can branch on it without reaching into infrastructure. The
 * HTTP client throws it; repositories and screens may inspect it.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
