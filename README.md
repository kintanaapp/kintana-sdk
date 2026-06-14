## @kintana/sdk · v0.9.1

TypeScript helpers for embedding Kintana’s read-only endpoints from your own storefront (Next.js, Astro, Remix, etc.). Ticket checkout can run on your domain via the `[data-kintana-widget]` embed (Stripe inside an iframe on Kintana); you can still link to `ticketUrl` for the full hosted event page when you prefer.

Install:

```bash
npm install @kintana/sdk
```

React bindings are optional peers:

```bash
npm install react
```

Everything below assumes `.env.local` (do not commit this file):

```bash
NEXT_PUBLIC_KINTANA_API_KEY=kpa_live_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_KINTANA_BASE_URL=https://kintana.app
```

Run the quickest happy path inside an App Router Client Component:

```tsx
"use client";

import { createKintanaClient } from "@kintana/sdk";
import { useEffect, useState } from "react";

const client = createKintanaClient({
  apiKey: process.env.NEXT_PUBLIC_KINTANA_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_KINTANA_BASE_URL!,
});

export function HelloShows() {
  const [shows, setShows] = useState<string>("");

  useEffect(() => {
    void client.listEvents({ limit: 5 }).then((rows) =>
      setShows(rows.map((e) => `${e.date} • ${e.name}`).join("\n"))
    );
  }, []);

  return <pre>{shows || "loading…"}</pre>;
}
```

### Core client

#### `createKintanaClient({ apiKey, secretApiKey?, baseUrl, fetch? })`

| Option | Meaning |
| --- | --- |
| `apiKey` | Publishable credential (`kpa_live_…`) created in Business → Websites → Custom site |
| `secretApiKey` | Optional server credential (`kpa_secret_…`) with `workspace.forms` scope for embed-form writes and CRM field helpers |
| `baseUrl` | Absolute URL of Kintana, no trailing slash |
| `fetch` | Optional override (`globalThis.fetch` by default); useful inside tests |

Returns a `KintanaClient`:

#### `await client.listEvents(opts?)`

Loads website-visible shows for the workspace tied to your API key — **owned shows and shared shows** (venue, promoter, lineup, or explicit collaborator on the bill). Default `scope` is `all`.

| Field | Meaning |
| --- | --- |
| `limit` | Max 100, default `24` |
| `scope` | `all` (default) — owned + shared; `owned` — only shows this workspace created; `shared` — collaboration only |
| `involvement` | Narrow by role: `lineup`, `venue`, `promoter`, `collaborator`, `tour` |
| `myLineup` | Shorthand for `involvement: "lineup"` (shows where your linked performer profile is on the bill) |
| `tourId` | Filter by tour id attached to shows |
| `artistSlug` | Filter to lineup containing that comedian/party slug |
| `venueSlug` | Filter by canonical venue slug |
| `promoterSlug` | Filter by promoter slug |
| `from` | Inclusive UTC date (`YYYY-MM-DD`) |
| `to` | Inclusive UTC date (`YYYY-MM-DD`) |
| `status` | `on-sale`, `sold-out`, `past`, `cancelled`, `postponed`, etc. |

Each event includes `isShared` (true when another workspace owns ticketing) and `hostWorkspace` (`slug`, `name`). `ticketUrl` always points at the host’s checkout page on Kintana.

```ts
// All upcoming shows you own or appear on
await client.listEvents({ limit: 12 });

// Gigs where you're on the lineup but don't own the show
await client.listEvents({ scope: "shared", myLineup: true });

await client.listEvents({ limit: 12, artistSlug: "taylor-swift-cover-band" });
await client.listEvents({ status: "past", limit: 20, involvement: "lineup" });
```

#### `await client.getEvent(idOrSlug)`

Hydrate a dedicated page route with either internal id or public slug:

```ts
const show = await client.getEvent(params.slugFromUrl);
console.log(show.ticketUrl); // Full hosted event page on Kintana (host workspace when isShared)
console.log(show.isShared, show.hostWorkspace); // Collaboration metadata
console.log(show.embedUrl); // iframe checkout route (also used by `[data-kintana-widget]`)
console.log(show.venue?.slug ?? show.venue?.id); // Stable venue deeplink for `/locations`
```

Responses now include richer fields (`doorsOpen`, `showTime`, `lineup`, `headliner`, nested `venue`, resolved `language`, ticketing context, markdown-friendly copy, pricing hints).

#### `await client.listForms()`

Returns `{ id, slug, title, kind }[]` for active embed forms in the workspace.

#### `await client.findForm({ kind?, slug? })`

Resolves a form without hard-coding ids. Slug wins when both are passed.

```ts
const requestForm = await client.findForm({ kind: "SHOW_REQUEST" });
// or when you have multiple request forms:
const partnerForm = await client.findForm({ slug: "partner-request" });
```

#### `await client.getFormSchema(formId)`

Produces fully typed `{ fields, title, redirectUrl }` payloads for crafting custom forms.

```ts
const form = await client.findForm({ kind: "SHOW_REQUEST" });
if (!form) throw new Error("Create a Request a show form in Kintana");
const schema = await client.getFormSchema(form.id);
schema.fields.forEach((field) => {
  console.log(field.id, field.type, field.required ?? false);
});
```

#### `await client.submitForm(formId, values, { visitorKey? })`

`values` mirrors `schema.fields[].id`:

```ts
const form = await client.findForm({ kind: "SHOW_REQUEST" });
if (!form) throw new Error("Missing form");

await client.submitForm(form.id, {
  firstName: "Taylor",
  lastName: "Fan",
  email: "hey@example.com",
  phone: "",
  country: "US",
  city: "Nashville",
});
```

Responses include `{ ok: true, successMessage, redirectUrl }`. When `redirectUrl` is populated the browser helper inside `@kintana/sdk/react` will navigate automatically after success.

### Workspace form management (**server-side writes**)

Listing and loading workspace embed forms accepts **`apiKey`** (`kpa_live_…`) or **`secretApiKey`**. Creating, updating forms and listing CRM contact-field definitions require **`secretApiKey`** with `workspace.forms` scope — **never ship that credential in browser bundles**.

| Client method | Credential | REST |
| --- | --- | --- |
| `listEmbedFormsWorkspace()` | Publishable or secret | `GET /api/public/v1/workspace/embed-forms` |
| `createEmbedFormWorkspace(body?)` | Secret only | `POST /api/public/v1/workspace/embed-forms` |
| `getEmbedFormWorkspace(id)` | Publishable or secret | `GET /api/public/v1/workspace/embed-forms/:id` |
| `updateEmbedFormWorkspace(id, patch)` | Secret only | `PATCH /api/public/v1/workspace/embed-forms/:id` |
| `listWorkspaceContactCustomFields()` | Secret only | `GET /api/public/v1/workspace/contact-custom-fields` |

- **`fieldsJson`** on create/update is an array of **`KintanaFormField`** objects (`id`, `type`, `label`, optional `options`, `mapsToContactFieldId`, …). Use **`listWorkspaceContactCustomFields()`** to resolve ids for `mapsToContactFieldId`; defining new CRM custom fields still happens in Business settings — the API maps submissions onto existing definitions only.
- **`createEmbedFormWorkspace`** defaults **`kind`** to `CUSTOM` when omitted (suited to developer-built flows). Other kinds behave like the dashboard wizard (`NEWSLETTER`, `SHOW_REQUEST`, …).
- Updates are audited when an owning workspace admin can be resolved (`details.via: "secret_public_api_v1"`).

```ts
// Example: Node / Edge handler — not for the browser
const client = createKintanaClient({
  apiKey: process.env.KINTANA_API_KEY!, // publishable
  secretApiKey: process.env.KINTANA_SECRET_API_KEY,
  baseUrl: process.env.KINTANA_BASE_URL!,
});

const defs = await client.listWorkspaceContactCustomFields();
const emailField = defs.find((f) => f.type === "EMAIL");

const form = await client.createEmbedFormWorkspace({
  title: "Partner referral",
  slug: "partner-referral",
  fieldsJson: [
    { id: "company", type: "text", label: "Company", required: true },
    { id: "email", type: "email", label: "Work email", required: true, mapsToContactFieldId: emailField?.id ?? undefined },
  ],
  active: true,
});

await client.updateEmbedFormWorkspace(form.id, {
  successMessage: "<p>Thanks — we will reply shortly.</p>",
});
```

Errors throw `KintanaApiError` with:

| Field | Meaning |
| --- | --- |
| `.status` | HTTP status |
| `.message` | Concatenates status plus body preview |
| `.bodySnippet` | First chunk of textual response |

Common causes:

| Status | Typical fix |
| --- | --- |
| `401` | Key rotated, pasted wrong credential, forgot `Bearer`, or mismatched `.env.local` |
| `404` | Event slug typo or unpublished show outside website visibility rules |
| `429` | Back off retries; exponential sleep helps automated jobs |

---

### Artists, venues, and coarse city grouping

#### `await client.listArtists({ limit })`

Returns comedians/parties tied to published shows in the workspace (`stageName`, `socials`, `reels`, `residency` labels are lowercase slugs).

#### `await client.getArtist(idOrSlug)`

Includes `{ upcomingEvents: KintanaPublicEvent[] }` hydrated with the richer event payload (`lineup`, `venue`, `status`, etc.).

#### `await client.listVenues()` / `await client.getVenue(idOrSlug)`

Every venue now ships a stable `slug` (plus `capacity`, coordinates, notes). `getVenue` mirrors `getArtist` by bundling `upcomingEvents`.

#### `client.groupVenuesByCity(venues)` (also `import { groupVenuesByCity } from "@kintana/sdk/locations"`)

Build `/locations` navigation without a bespoke API: group on `(city, country)` and sort venues alphabetically.

### Store (Pro workspaces with store enabled)

Headless merchandising: list products on your site, send shoppers to `productUrl` for checkout on Kintana.

#### `await client.listStoreProducts({ limit?, collection? })`

Active products with resolved image URLs, `priceFromCents`, `inStock`, and absolute `productUrl` / `storeUrl`.

#### `await client.getStoreProduct(idOrSlug)`

Adds `variants[]` with `priceCents`, `compareAtCents`, `availableQuantity` (`null` = unlimited), and `inStock`.

#### `await client.listStoreCollections({ limit? })` / `await client.getStoreCollection(idOrSlug)`

Collection summaries include `productCount` and `collectionUrl`. Detail responses embed the same product summaries as the list endpoint.

Returns `404` when the workspace is not on Pro, store is disabled, or the slug is unknown.

### Link-shareable files

#### `await client.listFiles({ limit?, folderId? })` / `await client.getFile(id)`

Only workspace files marked **Anyone with the link** in Business → Files are returned. Each row includes an absolute `url` suitable for `<img src>` on external sites.

Only workspace files marked **Anyone with the link** in Business → Files are returned. Each row includes an absolute `url` suitable for `<img src>` on external sites.

### Custom site gallery, assets, and manifest

Requires a **site-bound** publishable key (create under **Business → Websites → Custom site** after creating a site).

#### `await client.getSiteManifest()`

Primary entry point for static storefronts — gallery, brand assets, and form refs in one call:

```ts
const { gallery, assets, forms, updatedAt } = await client.getSiteManifest();
// assets.logo?.url, forms.showRequest?.id, gallery[0].caption, …
```

Also available individually:

| Method | Endpoint |
| --- | --- |
| `getSite()` | `GET /api/public/v1/site` |
| `getSiteGallery()` | `GET /api/public/v1/site/gallery` |
| `getSiteAssets()` / `getSiteAsset("logo")` | `GET /api/public/v1/site/assets` |

No folder ids or filename prefixes in env — upload in the dashboard, read via manifest.

### Tracker & custom DOM events

**Do you need `_t/k.js`?**

| Setup | Tracker needed? |
| --- | --- |
| Only `createKintanaClient` on the server (lists, detail pages, API-backed forms you render yourself) | **No** — unless you want visit analytics / attribution below |
| Plain HTML markers `[data-kintana-form]` or `[data-kintana-widget="event:…"]`, ticket-click helpers, or the CustomEvents in this section | **Yes** — load the script once per layout (typically `<head>`). Copy it from **Business → Websites → Custom site**. The tracker **`data-token` is your Public key** (`kpa_live_…`) — the same value as `NEXT_PUBLIC_KINTANA_API_KEY`. Never use the Secret key in the browser. |
| React `KintanaProvider` | Set **`enableTracker`** or render **`KintanaTracker`** — they inject `_t/k.js` using your Public key |

The async loader at `{baseUrl}/_t/k.js` records first-party hits and dispatches browser events you can bridge into GA4:

| Event | When |
| --- | --- |
| `kintana:pageview` | After every automatic pageview payload |
| `kintana:event_view` | When a `[data-kintana-widget]` checkout iframe boots |
| `kintana:ticket_click` | Outbound links with `data-kintana-event` **or** same-origin `/event/...` checkout URLs |
| `kintana:form_submit` | After embedded `[data-kintana-form]` POST succeeds |

`window.addEventListener("kintana:pageview", (ev) => { console.log(ev.detail); })`.

### Deferred product surface (tell clients explicitly)

Generic marketing CMS pages (`/pages/{slug}`), partner/press tables, aggregated investor KPIs (`/stats`), RRULE recurrence remain **outside** `@kintana/sdk` until separate releases document them—continue using Astro/Next MDX for long-form storytelling for now.

### Form schema caching

`GET /api/public/v1/forms/{id}/schema` ships `Cache-Control: public, max-age=300, stale-while-revalidate=600` plus SHA-256 etags keyed to the normalized field list—`client.getFormSchema` defaults to browser caching (`fetch` cache `default`) so SSR pipelines can hydrate forms without disabling HTTP caches entirely.

---


### React helpers (`@kintana/sdk/react`)

All components rely on `"use client"` boundaries (Next.js App Router needs that directive on the importing file unless re-exported from another client boundary).

```tsx
"use client";

import { KintanaProvider, ShowsList } from "@kintana/sdk/react";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_KINTANA_API_KEY!;
  const baseUrl = process.env.NEXT_PUBLIC_KINTANA_BASE_URL!;

  return (
    <KintanaProvider apiKey={apiKey} baseUrl={baseUrl} enableTracker>
      {children}
    </KintanaProvider>
  );
}
```

Components:

#### `KintanaProvider`

| Prop | Default | Purpose |
| --- | --- | --- |
| `apiKey` | — | Passed to REST client + onsite script tags |
| `baseUrl` | — | Passed to REST client |
| `enableTracker` | `false` | When `true`, injects `_t/k.js` automatically |
| `children` | — | Wrapped tree |

#### `useKintana()`

Returns the memoized SDK client scoped to Provider props.

```tsx
const client = useKintana();
void client.listForms().then(console.log);
```

When you manually need onsite analytics only, omit `enableTracker`, import `KintanaTracker`, and render it beside the provider.

#### `ShowsList`

Renders table rows with show name/date (override via `renderItem`).

Props:

- `limit` number (≤100)
- `className`
- `itemClassName`
- `renderItem` custom render for each row (return `<tr key={event.id}>…</tr>` when keeping the `<table>`)

#### `EventDetail`

Hydrates headings, geography, ticketing links, renders `<div data-kintana-widget="event:EVENT_ID"/>`, and eagerly loads `_t/k.js`. The widget iframe loads full ticket selection + Stripe checkout (not a link-out teaser).

#### `EmbedForm`

Fetches schema automatically, submits through `submitForm`. Pass **`id`**, or resolve by **`kind`** / **`slug`** (no env form id required).

Props:

| Prop | Notes |
| --- | --- |
| `id` | Explicit embed form id (optional if `kind` or `slug` set) |
| `kind` | e.g. `SHOW_REQUEST` — first active match in workspace |
| `slug` | Stable slug when multiple forms share a kind |
| `className` | Wrapper |
| `onSuccess` | Fires when POST succeeds **and** there's no configured redirect |

```tsx
<EmbedForm kind="SHOW_REQUEST" />
```

#### `KintanaTracker`

Standalone script injection requiring an ancestor `KintanaProvider`; skip when `enableTracker` already true unless you consciously need two loaders (normally don’t).

---

### Recipes

**Server-rendered Astro list**

```astro
---
import { createKintanaClient } from "@kintana/sdk";

const client = createKintanaClient({
  apiKey: import.meta.env.KINTANA_API_KEY,
  baseUrl: import.meta.env.KINTANA_BASE_URL,
});

const upcoming = await client.listEvents({ limit: 20 });
---

<ul>
  {upcoming.map((show) => (
    <li>
      <a href={`/shows/${show.slug}/`}>{show.name}</a> — {show.date}
    </li>
  ))}
</ul>
```

**Next.js server component fetching a single slug**

```tsx
import { createKintanaClient } from "@kintana/sdk";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const show = await createKintanaClient({
    apiKey: process.env.KINTANA_SERVER_KEY!,
    baseUrl: process.env.KINTANA_BASE_URL!,
  }).getEvent(slug);

  return <h1>{show.name}</h1>;
}
```

> Tip: Prefer server-only secrets for SSR when possible (`KINTANA_SERVER_KEY`). Browser widgets still require `NEXT_PUBLIC_*` equivalents.

---

### Development & publishing workflow

Development happens inside `packages/kintana-sdk` alongside the primary Kintana monorepo. To mirror artifacts into the OSS repo before tagging `v0.x.x`:

```bash
pnpm install
pnpm --filter @kintana/sdk build
node scripts/sync-kintana-sdk.mjs ~/src/kintana-sdk
```

The mirror repo publishes `v0.2.0+` artifacts to npm whenever you push a semver tag (`git tag sdk-v0.2.1 && git push origin sdk-v0.2.1` matches the bundled GitHub Workflow template).

Older `0.1.0` documentation referenced endpoints that shipped without matching server primitives — migrate to **`/api/public/v1/*`** and credentials beginning with **`kpa_live_`** only.
