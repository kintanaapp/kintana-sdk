import { KintanaApiError } from "./error";
import type {
  KintanaFormField,
  KintanaPublicEvent,
  KintanaPublicFormSchema,
  KintanaPublicFormSummary,
} from "./types";

export type {
  KintanaFormField,
  KintanaPublicEvent,
  KintanaPublicFormSchema,
  KintanaPublicFormSummary,
} from "./types";
export { KintanaApiError };

export type KintanaClientOptions = {
  /** Workspace credential starting with `kpa_live_…` */
  apiKey: string;
  /** Absolute URL of your Kintana deployment (production: `https://kintana.app`) */
  baseUrl: string;
  fetch?: typeof fetch;
};

export type SubmitFormResponse = {
  ok: boolean;
  successMessage?: string | null;
  redirectUrl?: string | null;
};

export type KintanaClient = {
  listEvents(opts?: { limit?: number }): Promise<KintanaPublicEvent[]>;
  getEvent(idOrSlug: string): Promise<KintanaPublicEvent>;
  listForms(): Promise<KintanaPublicFormSummary[]>;
  getFormSchema(formId: string): Promise<KintanaPublicFormSchema>;
  submitForm(
    formId: string,
    values: Record<string, string>,
    opts?: { visitorKey?: string }
  ): Promise<SubmitFormResponse>;
};

export function createKintanaClient(opts: KintanaClientOptions): KintanaClient {
  const base = opts.baseUrl.replace(/\/$/, "");
  const fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);

  async function requestJson<T>(
    pathWithQuery: string,
    init: RequestInit & { method?: string } = {}
  ): Promise<T> {
    const method = init.method ?? "GET";
    const headers = new Headers(init.headers ?? {});
    headers.set("Authorization", `Bearer ${opts.apiKey.trim()}`);
    headers.set("Accept", "application/json");
    const res = await fetchImpl(`${base}${pathWithQuery}`, {
      ...init,
      method,
      headers,
      cache: "no-store",
    });
    const text = await res.text();
    const snippet = text.slice(0, 400);
    if (!res.ok) {
      throw new KintanaApiError(`Kintana API ${res.status}: ${snippet}`, res.status, snippet);
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new KintanaApiError("Invalid JSON from Kintana API", res.status, snippet);
    }
  }

  return {
    async listEvents(listOpts?: { limit?: number }): Promise<KintanaPublicEvent[]> {
      const limit = Math.min(100, Math.max(1, listOpts?.limit ?? 24));
      const qs = new URLSearchParams({ limit: String(limit) });
      const data = await requestJson<{ events?: KintanaPublicEvent[] }>(
        `/api/public/v1/events?${qs.toString()}`
      );
      return data.events ?? [];
    },

    async getEvent(idOrSlug: string): Promise<KintanaPublicEvent> {
      const slug = encodeURIComponent(idOrSlug);
      const data = await requestJson<{ event?: KintanaPublicEvent }>(
        `/api/public/v1/events/${slug}`
      );
      if (!data.event) {
        throw new KintanaApiError("Malformed response from Kintana API (missing event)", 500, "");
      }
      return data.event;
    },

    async listForms(): Promise<KintanaPublicFormSummary[]> {
      const data = await requestJson<{ forms?: KintanaPublicFormSummary[] }>(
        `/api/public/v1/forms`
      );
      return data.forms ?? [];
    },

    async getFormSchema(formId: string): Promise<KintanaPublicFormSchema> {
      const id = encodeURIComponent(formId);
      return requestJson<KintanaPublicFormSchema>(`/api/public/v1/forms/${id}/schema`);
    },

    async submitForm(
      formId: string,
      values: Record<string, string>,
      submitOpts?: { visitorKey?: string }
    ): Promise<SubmitFormResponse> {
      const id = encodeURIComponent(formId);
      const body: Record<string, unknown> = { ...values };
      if (submitOpts?.visitorKey) body.visitorKey = submitOpts.visitorKey;

      return requestJson<SubmitFormResponse>(`/api/public/v1/forms/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
  };
}
