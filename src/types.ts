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

export type KintanaFormField = {
  id: string;
  type: "text" | "email" | "textarea";
  label: string;
  required?: boolean;
};

export type KintanaPublicFormSchema = {
  id: string;
  title: string;
  kind: string;
  fields: KintanaFormField[];
  successMessage: string | null;
  redirectUrl: string | null;
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
