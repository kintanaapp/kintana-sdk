import { KintanaApiError } from "./error";
import type {
  KintanaFormField,
  KintanaPublicArtistDetail,
  KintanaPublicArtistEmbed,
  KintanaPublicEvent,
  KintanaPublicEventListingStatus,
  KintanaPublicFormSchema,
  KintanaPublicFormSummary,
  KintanaPublicVenueDetail,
  KintanaPublicVenueListed,
} from "./types";
import type { KintanaGroupedCity } from "./locations";
import { groupVenuesByCity as groupVenuesByCityImpl } from "./locations";

export type {
  KintanaFormField,
  KintanaPublicEvent,
  KintanaPublicEventListingStatus,
  KintanaPublicFormSchema,
  KintanaPublicFormSummary,
  KintanaPublicVenueListed,
  KintanaPublicVenueDetail,
  KintanaPublicArtistEmbed,
  KintanaPublicArtistDetail,
} from "./types";
export { groupVenuesByCityImpl as groupVenuesByCity };
export type { KintanaGroupedCity } from "./locations";
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

export type ListPublicEventsOpts = {
  limit?: number;
  tourId?: string;
  artistSlug?: string;
  from?: string;
  to?: string;
  status?: KintanaPublicEventListingStatus;
};

export type KintanaClient = {
  listEvents(opts?: ListPublicEventsOpts): Promise<KintanaPublicEvent[]>;
  getEvent(idOrSlug: string): Promise<KintanaPublicEvent>;
  listArtists(opts?: { limit?: number }): Promise<KintanaPublicArtistEmbed[]>;
  getArtist(idOrSlug: string): Promise<KintanaPublicArtistDetail>;
  listVenues(): Promise<KintanaPublicVenueListed[]>;
  getVenue(idOrSlug: string): Promise<KintanaPublicVenueDetail>;
  groupVenuesByCity(venues: readonly KintanaPublicVenueListed[]): KintanaGroupedCity[];
  listForms(): Promise<KintanaPublicFormSummary[]>;
  getFormSchema(formId: string, opts?: { cache?: RequestCache }): Promise<KintanaPublicFormSchema>;
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
    init: RequestInit & { method?: string; cache?: RequestCache } = {}
  ): Promise<T> {
    const method = init.method ?? "GET";
    const headers = new Headers(init.headers ?? {});
    headers.set("Authorization", `Bearer ${opts.apiKey.trim()}`);
    headers.set("Accept", "application/json");
    const { cache = "no-store", ...rest } = init;
    const res = await fetchImpl(`${base}${pathWithQuery}`, {
      ...rest,
      method,
      headers,
      cache,
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

  function buildEventsQuery(opts?: ListPublicEventsOpts): string {
    const q = new URLSearchParams();
    const limit = Math.min(100, Math.max(1, opts?.limit ?? 24));
    q.set("limit", String(limit));
    if (opts?.tourId?.trim()) q.set("tourId", opts.tourId.trim());
    if (opts?.artistSlug?.trim()) q.set("artistSlug", opts.artistSlug.trim());
    if (opts?.from?.trim()) q.set("from", opts.from.trim());
    if (opts?.to?.trim()) q.set("to", opts.to.trim());
    if (opts?.status?.trim()) q.set("status", opts.status.trim());
    return q.toString();
  }

  return {
    async listEvents(listOpts?: ListPublicEventsOpts): Promise<KintanaPublicEvent[]> {
      const qs = buildEventsQuery(listOpts);
      const data = await requestJson<{ events?: KintanaPublicEvent[] }>(
        `/api/public/v1/events?${qs}`
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

    async listArtists(listOpts?: { limit?: number }): Promise<KintanaPublicArtistEmbed[]> {
      const limit = Math.min(100, Math.max(1, listOpts?.limit ?? 50));
      const data = await requestJson<{ artists?: KintanaPublicArtistEmbed[] }>(
        `/api/public/v1/artists?limit=${limit}`
      );
      return data.artists ?? [];
    },

    async getArtist(idOrSlug: string): Promise<KintanaPublicArtistDetail> {
      const id = encodeURIComponent(idOrSlug);
      const data = await requestJson<{ artist?: KintanaPublicArtistDetail }>(
        `/api/public/v1/artists/${id}`
      );
      if (!data.artist) {
        throw new KintanaApiError("Malformed response from Kintana API (missing artist)", 500, "");
      }
      return data.artist;
    },

    async listVenues(): Promise<KintanaPublicVenueListed[]> {
      const data = await requestJson<{ venues?: KintanaPublicVenueListed[] }>(`/api/public/v1/venues`);
      return data.venues ?? [];
    },

    async getVenue(idOrSlug: string): Promise<KintanaPublicVenueDetail> {
      const id = encodeURIComponent(idOrSlug);
      const data = await requestJson<{ venue?: KintanaPublicVenueDetail }>(
        `/api/public/v1/venues/${id}`
      );
      if (!data.venue) {
        throw new KintanaApiError("Malformed response from Kintana API (missing venue)", 500, "");
      }
      return data.venue;
    },

    groupVenuesByCity(venues: readonly KintanaPublicVenueListed[]) {
      return groupVenuesByCityImpl(venues);
    },

    async listForms(): Promise<KintanaPublicFormSummary[]> {
      const data = await requestJson<{ forms?: KintanaPublicFormSummary[] }>(`/api/public/v1/forms`);
      return data.forms ?? [];
    },

    async getFormSchema(formId: string, schemaOpts?: { cache?: RequestCache }): Promise<KintanaPublicFormSchema> {
      const id = encodeURIComponent(formId);
      return requestJson<KintanaPublicFormSchema>(`/api/public/v1/forms/${id}/schema`, {
        cache: schemaOpts?.cache ?? "default",
      });
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
