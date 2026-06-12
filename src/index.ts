import { KintanaApiError } from "./error";
import { pickFormFromList, type FindFormOpts } from "./find-form";
import type {
  KintanaCreateEmbedFormInput,
  KintanaFormField,
  KintanaManagedEmbedFormRecord,
  KintanaManagedEmbedFormSummary,
  KintanaPublicArtistDetail,
  KintanaPublicArtistEmbed,
  KintanaPublicEvent,
  KintanaPublicEventListingStatus,
  KintanaPublicFile,
  KintanaPublicFormSchema,
  KintanaPublicFormSummary,
  KintanaGalleryItem,
  KintanaSiteAssetSlot,
  KintanaSiteAssets,
  KintanaSiteInfo,
  KintanaSiteManifest,
  KintanaPublicStoreCollection,
  KintanaPublicStoreCollectionDetail,
  KintanaPublicStoreProduct,
  KintanaPublicStoreProductDetail,
  KintanaPublicVenueDetail,
  KintanaPublicVenueListed,
  KintanaUpdateEmbedFormInput,
  KintanaWorkspaceContactCustomField,
} from "./types";
import type { KintanaGroupedCity } from "./locations";
import { groupVenuesByCity as groupVenuesByCityImpl } from "./locations";

export type {
  KintanaCreateEmbedFormInput,
  KintanaEmbedFieldType,
  KintanaFormField,
  KintanaFormFieldOptions,
  KintanaManagedEmbedFormRecord,
  KintanaManagedEmbedFormSummary,
  KintanaPublicEvent,
  KintanaPublicEventListingStatus,
  KintanaPublicFile,
  KintanaPublicFormSchema,
  KintanaPublicFormSummary,
  KintanaGalleryItem,
  KintanaSiteAssetSlot,
  KintanaSiteAssets,
  KintanaSiteInfo,
  KintanaSiteManifest,
  KintanaPublicStoreCollection,
  KintanaPublicStoreCollectionDetail,
  KintanaPublicStoreProduct,
  KintanaPublicStoreProductDetail,
  KintanaPublicVenueListed,
  KintanaPublicVenueDetail,
  KintanaPublicArtistEmbed,
  KintanaPublicArtistDetail,
  KintanaUpdateEmbedFormInput,
  KintanaWorkspaceContactCustomField,
} from "./types";
export { groupVenuesByCityImpl as groupVenuesByCity };
export type { KintanaGroupedCity } from "./locations";
export { KintanaApiError };
export { pickFormFromList, type FindFormOpts } from "./find-form";

export type KintanaClientOptions = {
  /** Publishable credential (`kpa_live_…`) for listings, schemas, and visitor flows */
  apiKey: string;
  /**
   * Server-only credential (`kpa_secret_…`) with `workspace.forms` scope for embed-form writes and contact-field helpers.
   * Optional read fallback for workspace embed-form GET when set without relying on {@link apiKey}.
   */
  secretApiKey?: string;
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
  /** Resolve an active embed form by slug (preferred) or kind via {@link listForms}. */
  findForm(opts: FindFormOpts): Promise<KintanaPublicFormSummary | null>;
  getFormSchema(formId: string, opts?: { cache?: RequestCache }): Promise<KintanaPublicFormSchema>;
  submitForm(
    formId: string,
    values: Record<string, string>,
    opts?: { visitorKey?: string }
  ): Promise<SubmitFormResponse>;
  uploadEmbedFormFile(formId: string, fieldId: string, file: File): Promise<{ ok: boolean; url?: string; error?: string }>;
  /**
   * Lists every embed form in the workspace (including inactive). Uses the same `kpa_live` key — **never call from a browser bundle**.
   */
  listEmbedFormsWorkspace(): Promise<KintanaManagedEmbedFormSummary[]>;
  /**
   * Creates a form (`CUSTOM` by default). Send `fieldsJson` with {@link KintanaFormField} rows; optional `mapsToContactFieldId`
   * references ids from {@link KintanaClient.listWorkspaceContactCustomFields}.
   */
  createEmbedFormWorkspace(body?: KintanaCreateEmbedFormInput): Promise<KintanaManagedEmbedFormRecord>;
  getEmbedFormWorkspace(formId: string): Promise<KintanaManagedEmbedFormRecord>;
  updateEmbedFormWorkspace(
    formId: string,
    patch: KintanaUpdateEmbedFormInput
  ): Promise<KintanaManagedEmbedFormRecord>;
  /** Contact-scoped workspace custom fields for mapping answers onto CRM storage. */
  listWorkspaceContactCustomFields(): Promise<KintanaWorkspaceContactCustomField[]>;
  listStoreProducts(opts?: {
    limit?: number;
    collection?: string;
  }): Promise<KintanaPublicStoreProduct[]>;
  getStoreProduct(idOrSlug: string): Promise<KintanaPublicStoreProductDetail>;
  listStoreCollections(opts?: { limit?: number }): Promise<KintanaPublicStoreCollection[]>;
  getStoreCollection(idOrSlug: string): Promise<KintanaPublicStoreCollectionDetail>;
  listFiles(opts?: { limit?: number; folderId?: string | null }): Promise<KintanaPublicFile[]>;
  getFile(id: string): Promise<KintanaPublicFile>;
  /** Site metadata for the credential's bound custom site. */
  getSite(): Promise<KintanaSiteInfo>;
  /** Typed gallery items (alt, caption, order). Requires site-bound key. */
  getSiteGallery(): Promise<KintanaGalleryItem[]>;
  /** Named brand asset slots resolved to public URLs. */
  getSiteAssets(): Promise<KintanaSiteAssets>;
  getSiteAsset(slot: keyof KintanaSiteAssets): Promise<KintanaSiteAssetSlot>;
  /** Gallery, assets, and form refs in one call for static builds. */
  getSiteManifest(): Promise<KintanaSiteManifest>;
};

export function createKintanaClient(opts: KintanaClientOptions): KintanaClient {
  const base = opts.baseUrl.replace(/\/$/, "");
  const fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);

  function bearerEmbedFormsRead(): string {
    const sec = opts.secretApiKey?.trim();
    if (sec) return sec;
    return opts.apiKey.trim();
  }

  function requireSecretBearer(): string {
    const s = opts.secretApiKey?.trim();
    if (!s) {
      throw new KintanaApiError(
        "This operation requires secretApiKey (server credential starting with kpa_secret_) with workspace.forms scope.",
        400,
        ""
      );
    }
    return s;
  }

  async function requestJson<T>(
    pathWithQuery: string,
    init: RequestInit & { method?: string; cache?: RequestCache } = {},
    bearer: string = opts.apiKey.trim()
  ): Promise<T> {
    const method = init.method ?? "GET";
    const headers = new Headers(init.headers ?? {});
    headers.set("Authorization", `Bearer ${bearer}`);
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

    async findForm(opts: FindFormOpts): Promise<KintanaPublicFormSummary | null> {
      const forms = await requestJson<{ forms?: KintanaPublicFormSummary[] }>(`/api/public/v1/forms`);
      return pickFormFromList(forms.forms ?? [], opts);
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

    async uploadEmbedFormFile(formId: string, fieldId: string, file: File) {
      const id = encodeURIComponent(formId);
      const fd = new FormData();
      fd.append("token", opts.apiKey.trim());
      fd.append("fieldId", fieldId);
      fd.append("file", file);
      const res = await fetchImpl(`${base}/api/public/forms/${id}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${opts.apiKey.trim()}` },
        body: fd,
      });
      const text = await res.text();
      let j: { ok?: boolean; url?: string; error?: string } = {};
      try {
        j = JSON.parse(text) as typeof j;
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        return { ok: false as const, error: typeof j.error === "string" ? j.error : `Upload failed (${res.status})` };
      }
      if (!j.ok || typeof j.url !== "string") {
        return { ok: false as const, error: typeof j.error === "string" ? j.error : "Upload failed" };
      }
      return { ok: true as const, url: j.url };
    },

    async listEmbedFormsWorkspace(): Promise<KintanaManagedEmbedFormSummary[]> {
      const data = await requestJson<{ forms?: KintanaManagedEmbedFormSummary[] }>(
        `/api/public/v1/workspace/embed-forms`,
        {},
        bearerEmbedFormsRead()
      );
      return data.forms ?? [];
    },

    async createEmbedFormWorkspace(
      body?: KintanaCreateEmbedFormInput
    ): Promise<KintanaManagedEmbedFormRecord> {
      return requestJson<KintanaManagedEmbedFormRecord>(
        `/api/public/v1/workspace/embed-forms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body ?? {}),
        },
        requireSecretBearer()
      );
    },

    async getEmbedFormWorkspace(formId: string): Promise<KintanaManagedEmbedFormRecord> {
      const id = encodeURIComponent(formId);
      return requestJson<KintanaManagedEmbedFormRecord>(
        `/api/public/v1/workspace/embed-forms/${id}`,
        {},
        bearerEmbedFormsRead()
      );
    },

    async updateEmbedFormWorkspace(
      formId: string,
      patch: KintanaUpdateEmbedFormInput
    ): Promise<KintanaManagedEmbedFormRecord> {
      const id = encodeURIComponent(formId);
      return requestJson<KintanaManagedEmbedFormRecord>(
        `/api/public/v1/workspace/embed-forms/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch ?? {}),
        },
        requireSecretBearer()
      );
    },

    async listWorkspaceContactCustomFields(): Promise<KintanaWorkspaceContactCustomField[]> {
      const data = await requestJson<{ fields?: KintanaWorkspaceContactCustomField[] }>(
        `/api/public/v1/workspace/contact-custom-fields`,
        {},
        requireSecretBearer()
      );
      return data.fields ?? [];
    },

    async listStoreProducts(listOpts?: {
      limit?: number;
      collection?: string;
    }): Promise<KintanaPublicStoreProduct[]> {
      const q = new URLSearchParams();
      const limit = Math.min(100, Math.max(1, listOpts?.limit ?? 50));
      q.set("limit", String(limit));
      if (listOpts?.collection?.trim()) q.set("collection", listOpts.collection.trim());
      const data = await requestJson<{ products?: KintanaPublicStoreProduct[] }>(
        `/api/public/v1/store/products?${q}`
      );
      return data.products ?? [];
    },

    async getStoreProduct(idOrSlug: string): Promise<KintanaPublicStoreProductDetail> {
      const id = encodeURIComponent(idOrSlug);
      const data = await requestJson<{ product?: KintanaPublicStoreProductDetail }>(
        `/api/public/v1/store/products/${id}`
      );
      if (!data.product) {
        throw new KintanaApiError("Malformed response from Kintana API (missing product)", 500, "");
      }
      return data.product;
    },

    async listStoreCollections(listOpts?: {
      limit?: number;
    }): Promise<KintanaPublicStoreCollection[]> {
      const limit = Math.min(100, Math.max(1, listOpts?.limit ?? 50));
      const data = await requestJson<{ collections?: KintanaPublicStoreCollection[] }>(
        `/api/public/v1/store/collections?limit=${limit}`
      );
      return data.collections ?? [];
    },

    async getStoreCollection(idOrSlug: string): Promise<KintanaPublicStoreCollectionDetail> {
      const id = encodeURIComponent(idOrSlug);
      const data = await requestJson<{ collection?: KintanaPublicStoreCollectionDetail }>(
        `/api/public/v1/store/collections/${id}`
      );
      if (!data.collection) {
        throw new KintanaApiError(
          "Malformed response from Kintana API (missing collection)",
          500,
          ""
        );
      }
      return data.collection;
    },

    async listFiles(listOpts?: {
      limit?: number;
      folderId?: string | null;
    }): Promise<KintanaPublicFile[]> {
      const q = new URLSearchParams();
      const limit = Math.min(100, Math.max(1, listOpts?.limit ?? 50));
      q.set("limit", String(limit));
      if (listOpts?.folderId) q.set("folderId", listOpts.folderId);
      const data = await requestJson<{ files?: KintanaPublicFile[] }>(
        `/api/public/v1/files?${q}`
      );
      return data.files ?? [];
    },

    async getFile(id: string): Promise<KintanaPublicFile> {
      const fileId = encodeURIComponent(id);
      const data = await requestJson<{ file?: KintanaPublicFile }>(`/api/public/v1/files/${fileId}`);
      if (!data.file) {
        throw new KintanaApiError("Malformed response from Kintana API (missing file)", 500, "");
      }
      return data.file;
    },

    async getSite(): Promise<KintanaSiteInfo> {
      const data = await requestJson<{ site?: KintanaSiteInfo }>(`/api/public/v1/site`);
      if (!data.site) {
        throw new KintanaApiError("Malformed response from Kintana API (missing site)", 500, "");
      }
      return data.site;
    },

    async getSiteGallery(): Promise<KintanaGalleryItem[]> {
      const data = await requestJson<{ gallery?: KintanaGalleryItem[] }>(`/api/public/v1/site/gallery`);
      return data.gallery ?? [];
    },

    async getSiteAssets(): Promise<KintanaSiteAssets> {
      const data = await requestJson<{ assets?: KintanaSiteAssets }>(`/api/public/v1/site/assets`);
      return data.assets ?? {};
    },

    async getSiteAsset(slot: keyof KintanaSiteAssets): Promise<KintanaSiteAssetSlot> {
      const id = encodeURIComponent(String(slot));
      const data = await requestJson<{ asset?: KintanaSiteAssetSlot }>(
        `/api/public/v1/site/assets?slot=${id}`
      );
      if (!data.asset) {
        throw new KintanaApiError(`Asset slot "${String(slot)}" is not set`, 404, "");
      }
      return data.asset;
    },

    async getSiteManifest(): Promise<KintanaSiteManifest> {
      return requestJson<KintanaSiteManifest>(`/api/public/v1/site/manifest`);
    },
  };
}
