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
  /** Credits held for this email awaiting membership activation in this workspace. */
  pendingReceivedCents?: number;
  /** Comedy credits from the hidden wallet (no paid membership required). */
  walletCreditBalanceCents?: number;
  memberships: Array<{
    id: string;
    status: string;
    startsAt: string;
    endsAt: string | null;
    /** False when cancel-at-period-end is set (still ACTIVE until endsAt). */
    autoRenew?: boolean;
    creditBalanceCents?: number;
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
    /** True when the recurring sub will end at currentPeriodEnd. */
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: string | null;
  };
};

export type KintanaFanCreditTransferResult = {
  id: string;
  status: "PENDING" | "COMPLETED";
  amountCents: number;
  currency: string;
  toEmail: string;
};

export type KintanaFanMembershipRedeemResult =
  | {
      kind: "membership";
      extended: boolean;
      membership: {
        id: string;
        planId: string;
        planName: string;
        endsAt: string | null;
      };
    }
  | {
      kind: "credits";
      amountCents: number;
      newBalanceCents: number;
      currency: string;
    };

export type KintanaFanCreditTransfer = {
  id: string;
  direction: "sent" | "received";
  amountCents: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  counterpartyEmail: string;
  counterpartyName: string | null;
  createdAt: string;
  claimedAt: string | null;
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

export type KintanaFanMembershipCancelResult = {
  ok: true;
  membershipId: string;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  currentPeriodEnd: string | null;
  status: string;
};

export type KintanaFanPaymentMethodSession = {
  clientSecret: string;
  stripePublishableKey: string | null;
  stripeConnectAccountId: string | null;
};

export type KintanaFanMembershipSubscribeResult = {
  mode: "elements";
  clientSecret: string;
  stripeConnectAccountId: string | null;
  stripePublishableKey: string | null;
};

export type KintanaFanOneoffMembershipPayment = {
  clientSecret: string;
  stripeConnectAccountId: string | null;
  stripePublishableKey: string | null;
};
