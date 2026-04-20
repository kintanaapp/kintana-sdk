import { KintanaApiError } from "./error";
import type { KintanaPublicEvent } from "./types";

export type { KintanaPublicEvent, KintanaPublicTicketType } from "./types";
export { KintanaApiError };

export type KintanaClientOptions = {
  /** Workspace API key (`kpa_…`). */
  apiKey: string;
  /** Absolute base URL of the Kintana deployment (e.g. `https://app.example.com`). */
  baseUrl: string;
  /** Override `fetch` (e.g. tests or SSR adapters). Defaults to global `fetch`. */
  fetch?: typeof fetch;
};

export function createKintanaClient(opts: KintanaClientOptions) {
  const base = opts.baseUrl.replace(/\/$/, "");
  const fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);

  async function requestJson<T>(path: string): Promise<T> {
    const res = await fetchImpl(`${base}${path}`, {
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      const snippet = text.slice(0, 200);
      throw new KintanaApiError(`Kintana API ${res.status}: ${snippet}`, res.status, snippet);
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new KintanaApiError("Invalid JSON from Kintana API", res.status, text.slice(0, 200));
    }
  }

  return {
    async listEvents(): Promise<KintanaPublicEvent[]> {
      const data = await requestJson<{ events: KintanaPublicEvent[] }>("/api/public/v1/events");
      return data.events ?? [];
    },
  };
}

export type KintanaClient = ReturnType<typeof createKintanaClient>;
