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
  KintanaPublicEventInvolvement,
  KintanaPublicEventListingStatus,
  KintanaPublicEventsScope,
  KintanaPublicFile,
  KintanaPublicFormSchema,
  KintanaPublicFormSummary,
  KintanaEndpointSummary,
  KintanaEndpointIntent,
  KintanaSubmitPayload,
  KintanaSubmitResponse,
  KintanaManifestEndpointRef,
  KintanaGalleryItem,
  KintanaSiteAssetSlot,
  KintanaSiteAssets,
  KintanaSiteInfo,
  KintanaSiteManifest,
  KintanaPublicStoreCollection,
  KintanaPublicStoreCollectionDetail,
  KintanaPublicStoreProduct,
  KintanaPublicStoreProductDetail,
  KintanaPublicFoodMenu,
  KintanaPublicFoodMenuCategory,
  KintanaPublicFoodMenuItem,
  KintanaPublicVenueDetail,
  KintanaPublicVenueListed,
  KintanaUpdateEmbedFormInput,
  KintanaWorkspaceContactCustomField,
} from "./types";
import type { KintanaGroupedCity } from "./locations";
import { groupVenuesByCity as groupVenuesByCityImpl } from "./locations";
import type {
  KintanaCustomerAuthResult,
  KintanaFanConfig,
  KintanaFanEventDetail,
  KintanaFanMembershipPlan,
  KintanaFanMembershipStatus,
  KintanaFanShowEvent,
  KintanaFanTicket,
  KintanaFanAccountProfile,
  KintanaFanBillingPortalResult,
  KintanaFanMembershipSubscribeResult,
  KintanaFanOneoffMembershipPayment,
} from "./fan-types";

export type {
  KintanaCreateEmbedFormInput,
  KintanaEmbedFieldType,
  KintanaFormField,
  KintanaFormFieldOptions,
  KintanaManagedEmbedFormRecord,
  KintanaManagedEmbedFormSummary,
  KintanaPublicEvent,
  KintanaPublicEventInvolvement,
  KintanaPublicEventListingStatus,
  KintanaPublicEventsScope,
  KintanaPublicFile,
  KintanaPublicFormSchema,
  KintanaPublicFormSummary,
  KintanaEndpointSummary,
  KintanaEndpointIntent,
  KintanaSubmitPayload,
  KintanaSubmitResponse,
  KintanaManifestEndpointRef,
  KintanaGalleryItem,
  KintanaSiteAssetSlot,
  KintanaSiteAssets,
  KintanaSiteInfo,
  KintanaSiteManifest,
  KintanaPublicStoreCollection,
  KintanaPublicStoreCollectionDetail,
  KintanaPublicStoreProduct,
  KintanaPublicStoreProductDetail,
  KintanaPublicFoodMenu,
  KintanaPublicFoodMenuCategory,
  KintanaPublicFoodMenuItem,
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
export type {
  KintanaCustomerAuthResult,
  KintanaFanConfig,
  KintanaFanEventDetail,
  KintanaFanMembershipPlan,
  KintanaFanMembershipPlanBenefit,
  KintanaFanMembershipStatus,
  KintanaFanShowEvent,
  KintanaFanTicket,
  KintanaFanAccountProfile,
  KintanaFanBillingPortalResult,
  KintanaFanMembershipSubscribeResult,
  KintanaFanOneoffMembershipPayment,
} from "./fan-types";

export type KintanaClientOptions = {
  /** Publishable credential (`kpa_live_…`) for listings, schemas, and visitor flows */
  apiKey: string;
  /**
   * Server-only credential (`kpa_secret_…`) with `workspace.forms` / `workspace.files` scopes for writes.
   * Optional read fallback for workspace embed-form GET when set without relying on {@link apiKey}.
   */
  secretApiKey?: string;
  /** Absolute URL of your Kintana deployment (production: `https://kintana.app`) */
  baseUrl: string;
  /** Fan session JWT from magic link, Apple, or Google native sign-in */
  accessToken?: string;
  /** When true, sends `X-Kintana-Channel: app` on fan/order requests */
  fanAppChannel?: boolean;
  fetch?: typeof fetch;
};

export type SubmitFormResponse = {
  ok: boolean;
  successMessage?: string | null;
  redirectUrl?: string | null;
};

export type KintanaFilePresignResponse = {
  uploadUrl: string;
  pendingKey: string;
  headers: { "Content-Type": string };
};

export type KintanaFileUploadResponse = {
  file: KintanaPublicFile;
};

export type ListPublicEventsOpts = {
  limit?: number;
  tourId?: string;
  artistSlug?: string;
  venueSlug?: string;
  promoterSlug?: string;
  /** `all` (default) — owned + shared; `owned` — this workspace only; `shared` — collaboration only */
  scope?: KintanaPublicEventsScope;
  /** Narrow to how this workspace is involved: lineup, venue, promoter, collaborator, tour */
  involvement?: KintanaPublicEventInvolvement;
  /** Shorthand for `involvement: "lineup"` (shows where your linked performer is on the bill) */
  myLineup?: boolean;
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
  /** List active submission endpoints (slug + intent). */
  listEndpoints(): Promise<KintanaEndpointSummary[]>;
  /** Submit to a headless endpoint by slug. Email is required; other fields are developer-defined. */
  submitEndpoint(slug: string, payload: KintanaSubmitPayload): Promise<KintanaSubmitResponse>;
  /** @deprecated Use {@link submitEndpoint} with a show_request endpoint slug. */
  listForms(): Promise<KintanaPublicFormSummary[]>;
  /** @deprecated Use {@link listEndpoints} and submit by slug. */
  findForm(opts: FindFormOpts): Promise<KintanaPublicFormSummary | null>;
  /** @deprecated Build your own form UI and call {@link submitEndpoint}. */
  getFormSchema(formId: string, opts?: { cache?: RequestCache }): Promise<KintanaPublicFormSchema>;
  /** @deprecated Use {@link submitEndpoint}. */
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
  getFoodMenu(): Promise<KintanaPublicFoodMenu>;
  listFiles(opts?: { limit?: number; folderId?: string | null }): Promise<KintanaPublicFile[]>;
  getFile(id: string): Promise<KintanaPublicFile>;
  /** Multipart upload (≤4MB). Requires {@link KintanaClientOptions.secretApiKey} with `workspace.files`. */
  uploadFile(
    file: Blob | File,
    opts?: { folderId?: string | null; fileName?: string }
  ): Promise<KintanaPublicFile>;
  presignFileUpload(body: {
    fileName: string;
    contentType: string;
    size: number;
    folderId?: string | null;
  }): Promise<KintanaFilePresignResponse>;
  completeFileUpload(body: {
    pendingKey: string;
    fileName: string;
    contentType: string;
    size: number;
    folderId?: string | null;
  }): Promise<KintanaPublicFile>;
  /** Multipart for small files, presigned PUT for larger (up to 100MB). Server-only. */
  uploadFileAuto(
    file: Blob | File,
    opts?: { folderId?: string | null; fileName?: string }
  ): Promise<KintanaPublicFile>;
  /** Site metadata for the credential's bound custom site. */
  getSite(): Promise<KintanaSiteInfo>;
  /** Typed gallery items (alt, caption, order). Requires site-bound key. */
  getSiteGallery(): Promise<KintanaGalleryItem[]>;
  /** Named brand asset slots resolved to public URLs. */
  getSiteAssets(): Promise<KintanaSiteAssets>;
  getSiteAsset(slot: keyof KintanaSiteAssets): Promise<KintanaSiteAssetSlot>;
  /** Gallery, assets, and form refs in one call for static builds. */
  getSiteManifest(): Promise<KintanaSiteManifest>;
  /** Fan app: list shows visible in the mobile app (includes app-only; members-only when signed in). */
  listFanEvents(): Promise<KintanaFanShowEvent[]>;
  getFanEvent(slug: string): Promise<KintanaFanEventDetail>;
  getFanConfig(): Promise<KintanaFanConfig>;
  listFanMembershipPlans(): Promise<KintanaFanMembershipPlan[]>;
  getFanMembershipStatus(): Promise<KintanaFanMembershipStatus>;
  listFanTickets(): Promise<KintanaFanTicket[]>;
  getFanTicket(orderId: string): Promise<KintanaFanTicket>;
  /** Headless sign-in: send magic link + code email (requires redirectUrl to your verify page). */
  requestCustomerMagicLink(
    email: string,
    opts?: { redirectUrl?: string }
  ): Promise<{ success: boolean }>;
  /** Headless sign-in: exchange token or code for a session JWT. */
  verifyCustomerAuth(body: {
    token?: string;
    code?: string;
    email?: string;
  }): Promise<KintanaCustomerAuthResult>;
  getFanAccountProfile(): Promise<KintanaFanAccountProfile>;
  updateFanAccountProfile(patch: {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  }): Promise<KintanaFanAccountProfile>;
  openFanBillingPortal(opts: { returnUrl: string }): Promise<KintanaFanBillingPortalResult>;
  subscribeFanMembership(opts: {
    planId: string;
    interval: "month" | "year";
    successUrl: string;
    cancelUrl: string;
  }): Promise<KintanaFanMembershipSubscribeResult>;
  createFanOneoffMembershipPayment(opts: {
    planId: string;
    kind: "lifetime" | "pass";
  }): Promise<KintanaFanOneoffMembershipPayment>;
  signInWithAppleNative(body: {
    idToken: string;
    nonce?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<KintanaCustomerAuthResult>;
  signInWithGoogleNative(body: { idToken: string }): Promise<KintanaCustomerAuthResult>;
  /** Update the in-memory access token used for Bearer-authenticated fan calls. */
  setAccessToken(token: string | null): void;
};

export function createKintanaClient(opts: KintanaClientOptions): KintanaClient {
  const base = opts.baseUrl.replace(/\/$/, "");
  const fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);
  let accessToken = opts.accessToken?.trim() || null;

  function fanHeaders(extra?: HeadersInit): Headers {
    const headers = new Headers(extra ?? {});
    headers.set("Accept", "application/json");
    if (opts.fanAppChannel) {
      headers.set("X-Kintana-Channel", "app");
    }
    return headers;
  }

  function bearerEmbedFormsRead(): string {
    const sec = opts.secretApiKey?.trim();
    if (sec) return sec;
    return opts.apiKey.trim();
  }

  function requireSecretBearer(scopeHint: string): string {
    const s = opts.secretApiKey?.trim();
    if (!s) {
      throw new KintanaApiError(
        `This operation requires secretApiKey (server credential starting with kpa_secret_) with ${scopeHint} scope.`,
        400,
        ""
      );
    }
    return s;
  }

  function requireSecretFormsBearer(): string {
    return requireSecretBearer("workspace.forms");
  }

  function requireSecretFilesBearer(): string {
    return requireSecretBearer("workspace.files");
  }

  const MULTIPART_FILE_MAX_BYTES = 4 * 1024 * 1024;

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

  async function fanRequestJson<T>(
    pathWithQuery: string,
    init: RequestInit & { method?: string; requireAuth?: boolean } = {}
  ): Promise<T> {
    const headers = fanHeaders(init.headers);
    headers.set("Authorization", `Bearer ${opts.apiKey.trim()}`);
    if (accessToken) {
      headers.set("X-Customer-Authorization", `Bearer ${accessToken}`);
    } else if (init.requireAuth) {
      throw new KintanaApiError("Sign in required", 401, "");
    }
    const method = init.method ?? "GET";
    const { requireAuth: _ra, ...rest } = init;
    const res = await fetchImpl(`${base}${pathWithQuery}`, {
      ...rest,
      method,
      headers,
      cache: "no-store",
    });
    const text = await res.text();
    const snippet = text.slice(0, 400);
    if (!res.ok) {
      throw new KintanaApiError(`Kintana Fan API ${res.status}: ${snippet}`, res.status, snippet);
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new KintanaApiError("Invalid JSON from Kintana Fan API", res.status, snippet);
    }
  }

  async function customerRequestJson<T>(
    path: string,
    init: RequestInit & { method?: string } = {}
  ): Promise<T> {
    const headers = fanHeaders(init.headers);
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    const method = init.method ?? "GET";
    const res = await fetchImpl(`${base}${path}`, {
      ...init,
      method,
      headers,
      cache: "no-store",
    });
    const text = await res.text();
    const snippet = text.slice(0, 400);
    if (!res.ok) {
      throw new KintanaApiError(`Kintana customer API ${res.status}: ${snippet}`, res.status, snippet);
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new KintanaApiError("Invalid JSON from Kintana customer API", res.status, snippet);
    }
  }

  function buildEventsQuery(opts?: ListPublicEventsOpts): string {
    const q = new URLSearchParams();
    const limit = Math.min(100, Math.max(1, opts?.limit ?? 24));
    q.set("limit", String(limit));
    if (opts?.tourId?.trim()) q.set("tourId", opts.tourId.trim());
    if (opts?.artistSlug?.trim()) q.set("artistSlug", opts.artistSlug.trim());
    if (opts?.venueSlug?.trim()) q.set("venueSlug", opts.venueSlug.trim());
    if (opts?.promoterSlug?.trim()) q.set("promoterSlug", opts.promoterSlug.trim());
    if (opts?.scope && opts.scope !== "all") q.set("scope", opts.scope);
    if (opts?.involvement) q.set("involvement", opts.involvement);
    else if (opts?.myLineup) q.set("myLineup", "true");
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

    async listEndpoints(): Promise<KintanaEndpointSummary[]> {
      const data = await requestJson<{ endpoints?: KintanaEndpointSummary[] }>(
        `/api/public/v1/endpoints`
      );
      return data.endpoints ?? [];
    },

    async submitEndpoint(
      slug: string,
      payload: KintanaSubmitPayload
    ): Promise<KintanaSubmitResponse> {
      const encoded = encodeURIComponent(slug.trim());
      const body: Record<string, unknown> = {
        email: payload.email,
        ...(payload.phone ? { phone: payload.phone } : {}),
        ...(payload.fields ? { fields: payload.fields } : {}),
        ...(payload.context ? { context: payload.context } : {}),
        ...(payload.visitorKey ? { visitorKey: payload.visitorKey } : {}),
      };
      return requestJson<KintanaSubmitResponse>(`/api/public/v1/endpoints/${encoded}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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
        requireSecretFormsBearer()
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
        requireSecretFormsBearer()
      );
    },

    async listWorkspaceContactCustomFields(): Promise<KintanaWorkspaceContactCustomField[]> {
      const data = await requestJson<{ fields?: KintanaWorkspaceContactCustomField[] }>(
        `/api/public/v1/workspace/contact-custom-fields`,
        {},
        requireSecretFormsBearer()
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

    async getFoodMenu(): Promise<KintanaPublicFoodMenu> {
      const data = await requestJson<{ menu?: KintanaPublicFoodMenu }>(`/api/public/v1/food/menu`);
      if (!data.menu) {
        throw new KintanaApiError("Malformed response from Kintana API (missing menu)", 500, "");
      }
      return data.menu;
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

    async uploadFile(
      file: Blob | File,
      uploadOpts?: { folderId?: string | null; fileName?: string }
    ): Promise<KintanaPublicFile> {
      const bearer = requireSecretFilesBearer();
      const fd = new FormData();
      const name =
        uploadOpts?.fileName?.trim() ||
        (file instanceof File && file.name.trim() ? file.name.trim() : "upload.bin");
      fd.append("file", file, name);
      if (uploadOpts?.folderId) {
        fd.append("folderId", uploadOpts.folderId);
      }
      const res = await fetchImpl(`${base}/api/public/v1/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${bearer}` },
        body: fd,
      });
      const text = await res.text();
      const snippet = text.slice(0, 400);
      if (!res.ok) {
        throw new KintanaApiError(`Kintana API ${res.status}: ${snippet}`, res.status, snippet);
      }
      let data: KintanaFileUploadResponse;
      try {
        data = JSON.parse(text) as KintanaFileUploadResponse;
      } catch {
        throw new KintanaApiError("Invalid JSON from Kintana API", res.status, snippet);
      }
      if (!data.file) {
        throw new KintanaApiError("Malformed response from Kintana API (missing file)", 500, snippet);
      }
      return data.file;
    },

    async presignFileUpload(body: {
      fileName: string;
      contentType: string;
      size: number;
      folderId?: string | null;
    }): Promise<KintanaFilePresignResponse> {
      return requestJson<KintanaFilePresignResponse>(
        `/api/public/v1/files/upload/presign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        requireSecretFilesBearer()
      );
    },

    async completeFileUpload(body: {
      pendingKey: string;
      fileName: string;
      contentType: string;
      size: number;
      folderId?: string | null;
    }): Promise<KintanaPublicFile> {
      const data = await requestJson<KintanaFileUploadResponse>(
        `/api/public/v1/files/upload/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        requireSecretFilesBearer()
      );
      if (!data.file) {
        throw new KintanaApiError("Malformed response from Kintana API (missing file)", 500, "");
      }
      return data.file;
    },

    async uploadFileAuto(
      file: Blob | File,
      uploadOpts?: { folderId?: string | null; fileName?: string }
    ): Promise<KintanaPublicFile> {
      const fileName =
        uploadOpts?.fileName?.trim() ||
        (file instanceof File && file.name.trim() ? file.name.trim() : "upload.bin");
      const contentType = file.type || "application/octet-stream";
      const size = file.size;

      if (size <= MULTIPART_FILE_MAX_BYTES) {
        return this.uploadFile(file, { ...uploadOpts, fileName });
      }

      const presign = await this.presignFileUpload({
        fileName,
        contentType,
        size,
        folderId: uploadOpts?.folderId ?? null,
      });

      const putRes = await fetchImpl(presign.uploadUrl, {
        method: "PUT",
        headers: presign.headers,
        body: file,
      });
      if (!putRes.ok) {
        const snippet = (await putRes.text()).slice(0, 400);
        throw new KintanaApiError(`Direct upload failed (${putRes.status}): ${snippet}`, putRes.status, snippet);
      }

      return this.completeFileUpload({
        pendingKey: presign.pendingKey,
        fileName,
        contentType,
        size,
        folderId: uploadOpts?.folderId ?? null,
      });
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

    async listFanEvents(): Promise<KintanaFanShowEvent[]> {
      const data = await fanRequestJson<{ events?: KintanaFanShowEvent[] }>(`/api/fan/v1/events`, {
        requireAuth: Boolean(accessToken),
      });
      return data.events ?? [];
    },

    async getFanEvent(slug: string): Promise<KintanaFanEventDetail> {
      const id = encodeURIComponent(slug);
      const data = await fanRequestJson<{ event?: KintanaFanEventDetail }>(
        `/api/fan/v1/events/${id}`,
        { requireAuth: Boolean(accessToken) }
      );
      if (!data.event) {
        throw new KintanaApiError("Malformed response from Kintana Fan API (missing event)", 500, "");
      }
      return data.event;
    },

    async getFanConfig(): Promise<KintanaFanConfig> {
      return fanRequestJson<KintanaFanConfig>(`/api/fan/v1/config`);
    },

    async listFanMembershipPlans(): Promise<KintanaFanMembershipPlan[]> {
      const data = await fanRequestJson<{ plans?: KintanaFanMembershipPlan[] }>(
        `/api/fan/v1/membership/plans`
      );
      return data.plans ?? [];
    },

    async getFanMembershipStatus(): Promise<KintanaFanMembershipStatus> {
      return fanRequestJson<KintanaFanMembershipStatus>(`/api/fan/v1/membership/status`, {
        requireAuth: true,
      });
    },

    async listFanTickets(): Promise<KintanaFanTicket[]> {
      const data = await fanRequestJson<{ tickets?: KintanaFanTicket[] }>(`/api/fan/v1/tickets`, {
        requireAuth: true,
      });
      return data.tickets ?? [];
    },

    async getFanTicket(orderId: string): Promise<KintanaFanTicket> {
      const id = encodeURIComponent(orderId);
      const data = await fanRequestJson<{ ticket?: KintanaFanTicket }>(
        `/api/fan/v1/tickets/${id}`,
        { requireAuth: true }
      );
      if (!data.ticket) {
        throw new KintanaApiError("Malformed response from Kintana Fan API (missing ticket)", 500, "");
      }
      return data.ticket;
    },

    async requestCustomerMagicLink(
      email: string,
      opts?: { redirectUrl?: string }
    ): Promise<{ success: boolean }> {
      const redirectUrl = opts?.redirectUrl?.trim();
      if (!redirectUrl) {
        throw new KintanaApiError("redirectUrl is required for headless sign-in", 400, "");
      }
      return fanRequestJson<{ success: boolean }>(`/api/fan/v1/auth/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectUrl }),
      });
    },

    async verifyCustomerAuth(body: {
      token?: string;
      code?: string;
      email?: string;
    }): Promise<KintanaCustomerAuthResult> {
      const res = await fanRequestJson<KintanaCustomerAuthResult>(`/api/fan/v1/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.accessToken) accessToken = res.accessToken;
      return res;
    },

    async getFanAccountProfile(): Promise<KintanaFanAccountProfile> {
      const data = await fanRequestJson<{ profile?: KintanaFanAccountProfile }>(
        `/api/fan/v1/account/profile`,
        { requireAuth: true }
      );
      if (!data.profile) {
        throw new KintanaApiError("Malformed response from Kintana Fan API (missing profile)", 500, "");
      }
      return data.profile;
    },

    async updateFanAccountProfile(patch: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
    }): Promise<KintanaFanAccountProfile> {
      const data = await fanRequestJson<{ profile?: KintanaFanAccountProfile }>(
        `/api/fan/v1/account/profile`,
        {
          method: "PATCH",
          requireAuth: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }
      );
      if (!data.profile) {
        throw new KintanaApiError("Malformed response from Kintana Fan API (missing profile)", 500, "");
      }
      return data.profile;
    },

    async openFanBillingPortal(opts: {
      returnUrl: string;
    }): Promise<KintanaFanBillingPortalResult> {
      return fanRequestJson<KintanaFanBillingPortalResult>(`/api/fan/v1/membership/billing-portal`, {
        method: "POST",
        requireAuth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: opts.returnUrl }),
      });
    },

    async subscribeFanMembership(opts: {
      planId: string;
      interval: "month" | "year";
      successUrl: string;
      cancelUrl: string;
    }): Promise<KintanaFanMembershipSubscribeResult> {
      return fanRequestJson<KintanaFanMembershipSubscribeResult>(`/api/fan/v1/membership/subscribe`, {
        method: "POST",
        requireAuth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: opts.planId,
          interval: opts.interval,
          successUrl: opts.successUrl,
          cancelUrl: opts.cancelUrl,
        }),
      });
    },

    async createFanOneoffMembershipPayment(opts: {
      planId: string;
      kind: "lifetime" | "pass";
    }): Promise<KintanaFanOneoffMembershipPayment> {
      return fanRequestJson<KintanaFanOneoffMembershipPayment>(`/api/fan/v1/membership/oneoff`, {
        method: "POST",
        requireAuth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: opts.planId, kind: opts.kind }),
      });
    },

    async signInWithAppleNative(body: {
      idToken: string;
      nonce?: string;
      firstName?: string;
      lastName?: string;
    }): Promise<KintanaCustomerAuthResult> {
      const res = await customerRequestJson<KintanaCustomerAuthResult>(
        `/api/customer/auth/apple/native`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (res.accessToken) accessToken = res.accessToken;
      return res;
    },

    async signInWithGoogleNative(body: { idToken: string }): Promise<KintanaCustomerAuthResult> {
      const res = await customerRequestJson<KintanaCustomerAuthResult>(
        `/api/customer/auth/google/native`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (res.accessToken) accessToken = res.accessToken;
      return res;
    },

    setAccessToken(token: string | null) {
      accessToken = token?.trim() || null;
    },
  };
}
