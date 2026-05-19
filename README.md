## @kintana/sdk · v0.5.0

TypeScript helpers for embedding Kintana’s read-only endpoints from your own storefront (Next.js, Astro, Remix, etc.). Checkout still happens inside your Kintana deployment.

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

Loads website-visible shows. Options:

| Field | Meaning |
| --- | --- |
| `limit` | Max 100, default `24` |
| `tourId` | Filter by tour id attached to shows |
| `artistSlug` | Filter to lineup containing that comedian/party slug |
| `from` | Inclusive UTC date (`YYYY-MM-DD`) |
| `to` | Inclusive UTC date (`YYYY-MM-DD`) |
| `status` | `on-sale`, `sold-out`, `past`, `cancelled`, `postponed`, etc. |

```ts
await client.listEvents({ limit: 12, artistSlug: "taylor-swift-cover-band" });
await client.listEvents({ status: "past", limit: 20 });
```

#### `await client.getEvent(idOrSlug)`

Hydrate a dedicated page route with either internal id or public slug:

```ts
const show = await client.getEvent(params.slugFromUrl);
console.log(show.ticketUrl); // Links into Kintana checkout
console.log(show.embedUrl); // Marketing embed route
console.log(show.venue?.slug ?? show.venue?.id); // Stable venue deeplink for `/locations`
```

Responses now include richer fields (`doorsOpen`, `showTime`, `lineup`, `headliner`, nested `venue`, resolved `language`, ticketing context, markdown-friendly copy, pricing hints).

#### `await client.listForms()`

Returns `{ id, slug, title, kind }[]` helpers for dashboards.

```ts
const forms = await client.listForms();
const requestForm = forms.find((f) => f.kind === "SHOW_REQUEST");
```

#### `await client.getFormSchema(formId)`

Produces fully typed `{ fields, title, redirectUrl }` payloads for crafting custom forms.

```ts
const schema = await client.getFormSchema(formIdFromEnv);
schema.fields.forEach((field) => {
  console.log(field.id, field.type, field.required ?? false);
});
```

#### `await client.submitForm(formId, values, { visitorKey? })`

`values` mirrors `schema.fields[].id`:

```ts
await client.submitForm(formIdFromEnv, {
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

### Tracker & custom DOM events

**Do you need `_t/k.js`?**

| Setup | Tracker needed? |
| --- | --- |
| Only `createKintanaClient` on the server (lists, detail pages, API-backed forms you render yourself) | **No** — unless you want visit analytics / attribution below |
| Plain HTML markers `[data-kintana-form]` or `[data-kintana-widget="event:…"]`, ticket-click helpers, or the CustomEvents in this section | **Yes** — load the script once per layout (typically `<head>`). Copy it from **Business → Websites → Custom site** (“Tracking & embedded widgets”). If the snippet shows `YOUR_SITE_CREDENTIAL`, replace it with the secret shown once when you created that credential (same idea as `kpa_live_…` for API calls). |
| React `KintanaProvider` | Set **`enableTracker`** or render **`KintanaTracker`** — they inject `_t/k.js` using your publish credential |

The async loader at `{baseUrl}/_t/k.js` records first-party hits and dispatches browser events you can bridge into GA4:

| Event | When |
| --- | --- |
| `kintana:pageview` | After every automatic pageview payload |
| `kintana:event_view` | When a `[data-kintana-widget]` iframe boots |
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

Hydrates headings, geography, ticketing links, renders `<div data-kintana-widget="event:EVENT_ID"/>`, and eagerly loads `_t/k.js`.

#### `EmbedForm`

Fetches schema automatically, submits through `submitForm`.

Props:

| Prop | Notes |
| --- | --- |
| `id` | EmbedForm id copied from dashboard |
| `className` | Wrapper |
| `onSuccess` | Fires when POST succeeds **and** there's no configured redirect |

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
