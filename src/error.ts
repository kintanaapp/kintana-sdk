export class KintanaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Raw response body (truncated when thrown from the client). */
    readonly body: string
  ) {
    super(message);
    this.name = "KintanaApiError";
  }
}
