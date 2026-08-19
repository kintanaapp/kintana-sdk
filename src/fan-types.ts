export type KintanaFanShowEvent = {
  id: string;
  name: string;
  slug: string;
  date: string;
  doorsOpen: string | null;
  showTime: string | null;
  venue: string;
  city: string;
  country: string;
  citySlug: string;
  countrySlug: string;
  status: string;
  ticketingType: "INTERNAL" | "EXTERNAL";
  url: string;
  imageUrl: string | null;
  venueAddress: string | null;
  venueTimeZone: string;
};

export type KintanaFanTicketType = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  memberAccess: string;
  memberPriceCents: number | null;
  yourPriceCents?: number | null;
  soldOut: boolean;
  remaining: number | null;
};

export type KintanaFanEventDetail = {
  id: string;
  slug: string;
  name: string;
  date: string;
  doorsOpen: string | null;
  showTime: string | null;
  endTime: string | null;
  description: string | null;
  longDescription: string | null;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  status: string;
  ticketingType: string;
  visibility: string;
  venue: string;
  venueAddress: string | null;
  city: string;
  country: string;
  venueTimeZone: string;
  currency: string;
  language: string | null;
  embedUrl: string;
  checkoutUrl: string;
  /** Present when `ticketingType` is `EXTERNAL` — open in system browser. */
  externalTicketUrl?: string;
  ticketTypes: KintanaFanTicketType[];
  isMember: boolean;
};

export type KintanaFanMembershipPlanBenefit = {
  label: string;
  sortOrder?: number;
};

export type KintanaFanMembershipPlanPrices = {
  monthly?: { amountCents: number };
  annual?: { amountCents: number };
  lifetime?: { amountCents: number };
  pass?: { amountCents: number; durationDays: number };
};

export type KintanaFanMembershipPlan = {
  id: string;
  name: string;
  description: string | null;
  benefits?: KintanaFanMembershipPlanBenefit[];
  currency: string;
  prices: KintanaFanMembershipPlanPrices;
  /** @deprecated Use `prices.monthly`, `prices.annual`, etc. */
  priceCents: number;
  /** @deprecated Use `prices` tiers instead. */
  billingInterval: string;
  /** @deprecated Use `prices.pass.durationDays` when applicable. */
  durationDays: number | null;
};

export type KintanaFanMembershipStatus = {
  signedIn: boolean;
  email: string;
  membershipsEnabled: boolean;
  memberPortalEnabled: boolean;
  memberships: Array<{
    id: string;
    status: string;
    startsAt: string;
    endsAt: string | null;
    plan: {
      id: string;
      name: string;
      billingInterval: string;
      priceCents: number;
      currency: string;
    };
    stripeSubscriptionId: string | null;
  }>;
  billing: {
    hasRecurringSubscription: boolean;
    manageInBrowser: boolean;
  };
};

export type KintanaFanConfig = {
  workspace: { slug: string; name: string };
  membershipsEnabled: boolean;
  memberPortalEnabled: boolean;
  wallets: { apple: boolean; google: boolean };
};

export type KintanaFanTicket = {
  id: string;
  totalAmount: number;
  currency: string;
  completedAt: string | null;
  event: {
    id: string;
    name: string;
    slug: string;
    date: string;
    doorsOpen: string | null;
    showTime: string | null;
    venue: string;
    venueAddress: string | null;
    venueTimeZone: string;
    currency: string;
  };
  orderItems: Array<{ name: string; quantity: number; unitPrice: number }>;
  tickets: Array<{
    id: string;
    ticketTypeName: string;
    checkinUrl: string;
    checkedInAt: string | null;
  }>;
  ticketsPageUrl: string | null;
  publicViewToken: string | null;
  wallets: { google: boolean; apple: boolean };
};

export type KintanaCustomerAuthResult = {
  success: boolean;
  accessToken: string;
  expiresAt: string;
  email?: string;
};

export type KintanaFanAccountProfile = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

export type KintanaFanBillingPortalResult = {
  url: string;
};

export type KintanaFanMembershipSubscribeResult = {
  url: string;
};

export type KintanaFanOneoffMembershipPayment = {
  clientSecret: string;
  stripeConnectAccountId: string | null;
  stripePublishableKey: string | null;
};
