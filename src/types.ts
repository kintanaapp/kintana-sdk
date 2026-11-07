export type KintanaPublicEventListingStatus =
  | "on-sale"
  | "sold-out"
  | "postponed"
  | "cancelled"
  | "past";

export type KintanaPublicEventsScope = "all" | "owned" | "shared";

export type KintanaPublicEventInvolvement =
  | "lineup"
  | "venue"
  | "promoter"
  | "collaborator"
  | "tour";

export type KintanaPublicVenue = {
  id: string | null;
  slug: string | null;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  description?: string | null;
  lat: number | null;
  lng: number | null;
  timeZone: string | null;
  /** Step-free / wheelchair access when set on the venue in Kintana. */
  wheelchairAccessible?: boolean | null;
};

/** A room or space inside a venue. `capacity` is null when it isn't set. */
export type KintanaPublicVenueRoom = {
  id: string;
  name: string;
  capacity: number | null;
};

export type KintanaPublicVenueListed = KintanaPublicVenue & {
  capacity: number;
  imageUrl: string | null;
  /** Rooms inside the venue, main room first. Empty when the venue is one room. */
  rooms?: KintanaPublicVenueRoom[];
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
  imageUrl?: string | null;
};

export type KintanaPublicPromoter = {
  slug: string;
  name: string;
};

export type KintanaPublicGoldMembership = {
  status: "eligible" | "exempt";
  planName: string;
  /** Free tickets per order when eligible, when configured on the plan. */
  freeTickets?: number;
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
  /**
   * Meta pixel ids that should fire on this show's pages: the organiser's, plus collaborators' and lineup
   * acts' (minus any the organiser switched off). Load them only after the visitor allows ad cookies.
   */
  metaPixelIds?: string[];
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
  /** True when this show is owned by another workspace and visible via collaboration. */
  isShared?: boolean;
  /** Workspace that owns ticketing for this show. */
  hostWorkspace?: { slug: string; name: string };
  /** Linked promoter when set on the event in Kintana. */
  promoter?: KintanaPublicPromoter | null;
  /** Gold membership eligibility when memberships are enabled for the host workspace. */
  goldMembership?: KintanaPublicGoldMembership;
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

export type KintanaEndpointIntent =
  | "show_request"
  | "contact"
  | "newsletter"
  | "external_lead"
  | "group_booking"
  | "custom";

export type KintanaEndpointSummary = {
  slug: string;
  intent: KintanaEndpointIntent;
  title: string | null;
};

export type KintanaSubmitPayload = {
  email: string;
  phone?: string;
  fields?: Record<string, string>;
  context?: Record<string, string>;
  visitorKey?: string;
};

export type KintanaSubmitResponse = {
  ok: boolean;
  successMessage?: string | null;
  redirectUrl?: string | null;
  bookingRequestId?: string;
};

export type KintanaBookingRequestStatus = "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED";

export type KintanaBookingRequest = {
  id: string;
  status: KintanaBookingRequestStatus;
  outcomeType: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  companyName: string | null;
  headcount: number | null;
  preferredShowLabel: string | null;
  preferredDates: string | null;
  notes: string | null;
  preferredEventId: string | null;
  preferredEvent: { id: string; name: string; slug: string; date: string } | null;
  declineReason: string | null;
  alternateDates: string | null;
  internalNotes: string | null;
  invoiceId: string | null;
  orderId: string | null;
  paymentUrl: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fieldsJson: Record<string, unknown> | null;
};

export type KintanaUpdateBookingRequestInput = {
  status?: KintanaBookingRequestStatus;
  declineReason?: string | null;
  alternateDates?: string | null;
  internalNotes?: string | null;
  sendEmail?: boolean;
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

export type KintanaPublicFoodMenuItem = {
  id: string;
  name: string;
  description: string | null;
  allergenNote: string | null;
  priceCents: number;
  imageUrl: string | null;
  available: boolean;
};

export type KintanaPublicFoodMenuCategory = {
  id: string;
  name: string;
  sortOrder: number;
  items: KintanaPublicFoodMenuItem[];
};

/** Active venue menu for custom sites. Checkout stays on Kintana QR / show-order URLs. */
export type KintanaPublicFoodMenu = {
  id: string;
  name: string;
  currency: string;
  categories: KintanaPublicFoodMenuCategory[];
};

export type KintanaPublicFile = {
  id: string;
  name: string;
  /** Web-optimized URL (WebP when derivative is ready). */
  url: string;
  contentType: string;
  size: number;
  createdAt: string;
  /** Original uploaded file URL when a WebP derivative is served from `url`. */
  originalUrl?: string;
  originalContentType?: string;
  originalSize?: number;
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

export type KintanaManifestEndpointRef = {
  slug: string;
  intent: string;
};

export type KintanaSiteManifest = {
  site: { id: string; name: string; slug: string };
  updatedAt: string;
  gallery: KintanaGalleryItem[];
  assets: KintanaSiteAssets;
  /** @deprecated Use `endpoints`. */
  forms: Record<string, KintanaManifestFormRef | null>;
  endpoints: Record<string, KintanaManifestEndpointRef | null>;
};

/** A gift card or voucher on sale (`listGiftCardProducts`). Amounts are minor units. */
export type KintanaPublicGiftCardProduct = {
  id: string;
  /** GIFT_CARD holds money for tickets; VOUCHER is a set number of tickets or one item at the door. */
  kind: "GIFT_CARD" | "VOUCHER";
  name: string;
  description: string | null;
  imageUrl: string | null;
  currency: string;
  /** Gift card: amounts to pick from. */
  amountOptionsCents: number[];
  /** Gift card: buyer may enter their own amount between min and max. */
  allowCustomAmount: boolean;
  minCustomCents: number | null;
  maxCustomCents: number | null;
  /** Voucher: what it costs. */
  priceCents: number | null;
  /** Voucher: TICKETS (spent at checkout) or ITEM (scanned at the door). */
  redeemType: "TICKETS" | "ITEM" | null;
  /** Ticket voucher: tickets it covers. */
  ticketCount: number | null;
  /** Door voucher: what staff hand over, e.g. "Two drinks". */
  itemLabel: string | null;
  /** Months from purchase until it expires; null = never. */
  validMonths: number | null;
};

export type KintanaGiftCardShop = {
  products: KintanaPublicGiftCardProduct[];
  /** Kintana's hosted gift card shop for this workspace. */
  shopUrl: string;
};

export type KintanaGiftCardPurchaseInput = {
  productId: string;
  /** Gift card amount in minor units: one of `amountOptionsCents`, or a custom amount when allowed. Ignored for vouchers. */
  amountCents?: number | null;
  purchaserName: string;
  purchaserEmail: string;
  /** Leave out to buy it for yourself (it's emailed to the purchaser). */
  recipientName?: string | null;
  recipientEmail?: string | null;
  message?: string | null;
  /** ISO date or date-time to email the gift on; omitted = straight after payment. */
  deliverAt?: string | null;
};

/** Confirm `clientSecret` with Stripe.js (`stripeAccount: stripeConnectAccountId` when set). */
export type KintanaGiftCardPurchase = {
  /** Token for `getGiftCard`; also the end of `giftPageUrl`. */
  giftCardToken: string;
  /** Hosted gift page: code, balance, door QR. A good Stripe `return_url`. */
  giftPageUrl: string;
  amountCents: number;
  currency: string;
  clientSecret: string | null;
  stripeConnectAccountId: string | null;
  stripePublishableKey: string | null;
};

export type KintanaGiftCard = {
  token: string;
  kind: "GIFT_CARD" | "VOUCHER";
  redeemType: "TICKETS" | "ITEM" | null;
  name: string;
  itemLabel: string | null;
  /** PENDING until paid, then ACTIVE; USED when spent; VOID when cancelled. */
  status: "PENDING" | "ACTIVE" | "USED" | "VOID";
  expired: boolean;
  /** Can be spent right now. */
  usable: boolean;
  currency: string;
  initialValueCents: number;
  balanceCents: number;
  initialTickets: number;
  remainingTickets: number;
  expiresAt: string | null;
  recipientName: string | null;
  message: string | null;
  /** XXXX-XXXX-XXXX, entered at checkout. Null until paid, and never returned by `checkGiftCardBalance`. */
  code: string | null;
  giftPageUrl: string;
};

/** `checkGiftCardBalance` result: amounts net of unpaid checkouts currently holding value. */
export type KintanaGiftCardBalance = KintanaGiftCard & {
  availableCents: number;
  availableTickets: number;
};
