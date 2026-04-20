# @kintana/sdk

TypeScript client for Kintana’s **read-only public API**, plus optional React helpers. Use it from a site or app that should list upcoming events while keeping checkout and ticketing on your Kintana deployment.

## Install

```bash
npm install @kintana/sdk
```

React helpers (e.g. `ShowsList`) are exported from `@kintana/sdk/react`. Install `react` in your app (`>= 18`).

## API key

1. In Kintana, open **Business** → **My website** → **Custom site** → **Public API keys (SDK)** → **Create key**.
2. Copy the key **once** — it is not shown again.
3. Keys are **scoped to your workspace** (`kpa_…`). Treat them like passwords: use environment variables, never commit them to source control.

You need your Kintana app **base URL** (e.g. `https://app.example.com`), with no trailing slash.

## Usage (core)

```ts
import { createKintanaClient } from "@kintana/sdk";

const client = createKintanaClient({
  apiKey: process.env.KINTANA_API_KEY!,
  baseUrl: "https://app.example.com",
});

const events = await client.listEvents();
```

Errors use `KintanaApiError` (HTTP status and response body snippet). You may pass `fetch` to `createKintanaClient` for tests or custom runtimes.

## Usage (React)

`ShowsList` uses hooks. In the Next.js App Router, put it in a **Client Component** (your file must start with `"use client"`).

```tsx
"use client";

import { ShowsList } from "@kintana/sdk/react";

export function Shows() {
  return (
    <ShowsList
      apiKey={process.env.NEXT_PUBLIC_KINTANA_API_KEY!}
      baseUrl="https://app.example.com"
    />
  );
}
```

`ShowsList` is a minimal example; build your own UI using `createKintanaClient` and the typed `KintanaPublicEvent` shape.

## CORS

The public API (`/api/public/v1/…`) sends CORS headers so browser `fetch` from another origin works with `Authorization: Bearer …`. Same-origin usage (e.g. Next.js server components calling your own deployment) does not require CORS.

## Source

Development lives in the Kintana monorepo under `packages/kintana-sdk`. The public mirror is [kintanaapp/kintana-sdk](https://github.com/kintanaapp/kintana-sdk).

## License

MIT
