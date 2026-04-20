/** Ticket line as returned by `GET /api/public/v1/events` (availability fields included). */
export type KintanaPublicTicketType = {
  id: string;
  eventId: string;
  name: string;
  /** Price in minor units (cents). */
  price: number;
  currency: string;
  totalQuantity: number;
  sortOrder: number;
  archived: boolean;
  publicCheckout: boolean;
  category: string;
  alternatePrices: unknown;
  sold: number;
  remaining: number;
  percentRemaining: number;
};

/**
 * Event as returned by `GET /api/public/v1/events` (JSON wire format).
 * Date/time fields are ISO strings.
 */
export type KintanaPublicEvent = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  date: string;
  doorsOpen: string | null;
  showTime: string | null;
  venueId: string | null;
  venue: string;
  venueAddress: string | null;
  description: string | null;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  tourId: string | null;
  ticketingType: string;
  externalTicketingUrl: string | null;
  promoterId: string | null;
  blocks: unknown;
  workspaceId: string;
  primaryPayoutWorkspaceId: string | null;
  upmicShowId: string | null;
  eventPotStatus: string;
  eventPotStatusAt: string | null;
  ticketTypes: KintanaPublicTicketType[];
  _count?: { orders: number };
};
