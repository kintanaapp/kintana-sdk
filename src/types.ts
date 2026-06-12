export type KintanaPublicEventListingStatus =
  | "on-sale"
  | "sold-out"
  | "postponed"
  | "cancelled"
  | "past";

export type KintanaPublicVenue = {
  id: string | null;
  slug: string | null;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  timeZone: string | null;
  /** Step-free / wheelchair access when set on the venue in Kintana. */
  wheelchairAccessible?: boolean | null;
};

export type KintanaPublicVenueListed = KintanaPublicVenue & {
  capacity: number;
  imageUrl: string | null;
};

export type KintanaPublicVenueDetail = KintanaPublicVenueListed & {
  upcomingEvents: KintanaPublicEvent[];
};

export type KintanaPublicLineupEntry = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  sortOrder: number;
  imageUrl: string | null;
};

export type KintanaPublicEventReview = {
  quote: string | null;
  stars: number;
  source: string;
};

export type KintanaPublicTour = {
  id: string;
  slug: string;
  name: string;
};

export type KintanaPublicEvent = {
  id: string;
  slug: string;
  name: string;
  date: string;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
  ticketUrl: string;
  embedUrl: string;
  doorsOpen: string | null;
  showTime: string | null;
  description: string | null;
  status: KintanaPublicEventListingStatus;
  language: string;
  venue: KintanaPublicVenue | null;
  tour: KintanaPublicTour | null;
  lineup: KintanaPublicLineupEntry[];
  headliner: KintanaPublicLineupEntry | null;
  ticketingType: "INTERNAL" | "EXTERNAL";
  imageUrlMobile: string | null;
  longDescription?: string | null;
  endTime?: string | null;
  ageRestriction?: string | null;
  /** Minor units when present (typically cents). */
  priceFrom?: number | null;
  priceCurrency?: string | null;
  tags?: string[];
  /** Press quotes when configured on the event in Kintana. */
  reviews?: KintanaPublicEventReview[];
};

export type KintanaArtistResidency = "resident" | "regular" | "visiting" | "headline-guest";

export type KintanaPublicArtistEmbed = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  website: string | null;
  stageName: string | null;
  homeCity: string | null;
  residency: string | null;
  socials: Record<string, string>;
  reels: Array<{ title: string; url: string; posterUrl: string | null }>;
};

export type KintanaPublicArtistDetail = KintanaPublicArtistEmbed & {
  upcomingEvents: KintanaPublicEvent[];
};

export type KintanaPublicFormSummary = {
  id: string;
  slug: string;
  kind: string;
  title: string;
};

export type KintanaEmbedFieldType =
  | "text"
  | "email"
  | "textarea"
  | "number"
  | "date"
  | "boolean"
  | "url"
  | "phone"
  | "select"
  | "multiselect"
  | "file";

export type KintanaFormFieldOptions = {
  choices?: string[];
  acceptMimeTypes?: string[];
  maxBytes?: number;
};

export type KintanaFormField = {
  id: string;
  type: KintanaEmbedFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: KintanaFormFieldOptions;
  mapsToContactFieldId?: string | null;
};

export type KintanaPublicFormSchema = {
  id: string;
  title: string;
  kind: string;
  fields: KintanaFormField[];
  successMessage: string | null;
  redirectUrl: string | null;
};

/** Workspace management row (`GET /api/public/v1/workspace/embed-forms`). Includes inactive forms. */
export type KintanaManagedEmbedFormSummary = {
  id: string;
  slug: string;
  kind: string;
  title: string | null;
  active: boolean;
  linkedEventId: string | null;
  createdAt: string;
};

/** Full embed form definition returned by workspace management endpoints (matches persisted shape). */
export type KintanaManagedEmbedFormRecord = KintanaManagedEmbedFormSummary & {
  workspaceId: string;
  fieldsJson: unknown;
  successMessage: string | null;
  redirectUrl: string | null;
  doubleOptIn: boolean;
  updatedAt: string;
};

/** Create body for `POST /api/public/v1/workspace/embed-forms`. */
export type KintanaCreateEmbedFormInput = {
  /** Defaults to `CUSTOM` when omitted (suited for programmatic builders). */
  kind?: string;
  title?: string | null;
  slug?: string;
  linkedEventId?: string | null;
  /** When set, replaces kind defaults; must contain at least one valid field. */
  fieldsJson?: KintanaFormField[];
  successMessage?: string | null;
  redirectUrl?: string | null;
  active?: boolean;
};

/** Patch body for `PATCH /api/public/v1/workspace/embed-forms/:id` (same keys as dashboard API). */
export type KintanaUpdateEmbedFormInput = {
  title?: string | null;
  /** Alias accepted by the API for legacy/dashboard payloads */
  name?: string | null;
  fieldsJson?: KintanaFormField[];
  successMessage?: string | null;
  redirectUrl?: string | null;
  active?: boolean;
  slug?: string;
};

/** Contact custom field defs for wiring `mapsToContactFieldId` on embed fields. */
export type KintanaWorkspaceContactCustomField = {
  id: string;
  name: string;
  type: string;
  entity: string;
  options: unknown;
};

export type KintanaPublicStoreVariant = {
  id: string;
  name: string;
  sku: string | null;
  priceCents: number;
  compareAtCents: number | null;
  /** `null` = unlimited inventory */
  availableQuantity: number | null;
  inStock: boolean;
};

export type KintanaPublicStoreProductImage = {
  url: string;
  alt: string | null;
};

export type KintanaPublicStoreProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  currency: string;
  priceFromCents: number | null;
  compareAtCents: number | null;
  inStock: boolean;
  images: KintanaPublicStoreProductImage[];
  productUrl: string;
  storeUrl: string;
};

export type KintanaPublicStoreProductDetail = KintanaPublicStoreProduct & {
  variants: KintanaPublicStoreVariant[];
};

export type KintanaPublicStoreCollection = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  collectionUrl: string;
  storeUrl: string;
};

export type KintanaPublicStoreCollectionDetail = KintanaPublicStoreCollection & {
  products: KintanaPublicStoreProduct[];
};

export type KintanaPublicFile = {
  id: string;
  name: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: string;
};

export type KintanaSiteInfo = {
  id: string;
  name: string;
  slug: string;
  galleryFolderId: string | null;
  brandAssetsFolderId: string | null;
};

export type KintanaGalleryItem = {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  sortOrder: number;
};

export type KintanaSiteAssetSlot = {
  url: string;
  alt?: string;
};

export type KintanaSiteAssets = Partial<
  Record<"logo" | "founderHeadshot" | "heroFallback", KintanaSiteAssetSlot>
>;

export type KintanaManifestFormRef = {
  id: string;
  slug: string;
  kind: string;
};

export type KintanaSiteManifest = {
  site: { id: string; name: string; slug: string };
  updatedAt: string;
  gallery: KintanaGalleryItem[];
  assets: KintanaSiteAssets;
  forms: Record<string, KintanaManifestFormRef | null>;
};
