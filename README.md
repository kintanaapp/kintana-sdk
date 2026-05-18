## @kintana/sdk · v0.2.0

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

#### `createKintanaClient({ apiKey, baseUrl, fetch? })`

| Option | Meaning |
| --- | --- |
| `apiKey` | Workspace credential that starts with `kpa_live_…` created in Business → Websites → Custom site |
| `baseUrl` | Absolute URL of Kintana, no trailing slash |
| `fetch` | Optional override (`globalThis.fetch` by default); useful inside tests |

Returns a `KintanaClient`:

#### `await client.listEvents({ limit })`

Loads upcoming website-visible shows (max 100, default 24).

```ts
await client.listEvents({ limit: 12 });
```

#### `await client.getEvent(idOrSlug)`

Hydrate a dedicated page route with either internal id or public slug:

```ts
const show = await client.getEvent(params.slugFromUrl);
console.log(show.ticketUrl); // Links into Kintana checkout
console.log(show.embedUrl); // Marketing embed route
```

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

Hydrates headings, geography, ticketing links, renders `<div data-kintana-widget data-event-id="…"/>`, and eagerly loads `_t/k.js`.

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
