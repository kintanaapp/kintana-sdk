export class KintanaApiError extends Error {
  readonly status: number;
  readonly bodySnippet: string;

  constructor(message: string, status: number, bodySnippet: string) {
    super(message);
    this.name = "KintanaApiError";
    this.status = status;
    this.bodySnippet = bodySnippet;
  }
}
