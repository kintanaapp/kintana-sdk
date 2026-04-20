"use client";

import { useEffect, useState } from "react";
import { createKintanaClient, type KintanaClientOptions, type KintanaPublicEvent } from "./index";

export function ShowsList(props: KintanaClientOptions & { emptyMessage?: string }) {
  const [events, setEvents] = useState<KintanaPublicEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = createKintanaClient({
      apiKey: props.apiKey,
      baseUrl: props.baseUrl,
      fetch: props.fetch,
    });
    c.listEvents()
      .then(setEvents)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [props.apiKey, props.baseUrl, props.fetch]);

  if (error) return <p role="alert">{error}</p>;
  if (!events) return <p>Loading…</p>;
  if (events.length === 0) return <p>{props.emptyMessage ?? "No upcoming events."}</p>;

  return (
    <ul className="kintana-shows-list">
      {events.map((ev) => {
        const id = typeof ev.id === "string" ? ev.id : String(ev.id ?? "");
        const name = typeof ev.name === "string" ? ev.name : "Event";
        return (
          <li key={id || name}>
            {name}
          </li>
        );
      })}
    </ul>
  );
}

/** Placeholder — wire to your checkout flow */
export function TicketWidget(_props: { eventId: string; apiKey: string; baseUrl: string }) {
  return null;
}

export function PurchaseCard(_props: { eventId: string; apiKey: string; baseUrl: string }) {
  return null;
}

export function BioHeader(_props: { apiKey: string; baseUrl: string }) {
  return null;
}
