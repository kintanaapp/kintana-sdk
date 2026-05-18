"use client";

import * as React from "react";
import type { KintanaClient } from "../index";
import { createKintanaClient } from "../index";
import type { KintanaPublicEvent, KintanaPublicFormSchema } from "../types";

type KintanaBridge = {
  client: KintanaClient;
  apiKey: string;
  baseUrl: string;
};

const KintanaContext = React.createContext<KintanaBridge | null>(null);

export function KintanaProvider({
  apiKey,
  baseUrl,
  enableTracker,
  children,
}: {
  apiKey: string;
  baseUrl: string;
  /** When true, injects the onsite visitor script (`/_t/k.js`) exactly once */
  enableTracker?: boolean;
  children: React.ReactNode;
}) {
  const trimmedKey = apiKey.trim();
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const value = React.useMemo(
    () => ({
      client: createKintanaClient({ apiKey: trimmedKey, baseUrl: normalizedBase }),
      apiKey: trimmedKey,
      baseUrl: normalizedBase,
    }),
    [trimmedKey, normalizedBase]
  );

  return (
    <KintanaContext.Provider value={value}>
      {enableTracker === true ? <KintanaTracker /> : null}
      {children}
    </KintanaContext.Provider>
  );
}

export function useKintana(): KintanaClient {
  const c = React.useContext(KintanaContext);
  if (!c) {
    throw new Error("Wrap your tree in <KintanaProvider /> from @kintana/sdk/react.");
  }
  return c.client;
}

export function ShowsList({
  limit = 24,
  className,
  itemClassName,
  renderItem,
}: {
  limit?: number;
  className?: string;
  itemClassName?: string;
  /** Return a `<tr>` (for the default layout) or any node */
  renderItem?: (event: KintanaPublicEvent) => React.ReactNode;
}) {
  const client = useKintana();
  const [events, setEvents] = React.useState<KintanaPublicEvent[] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    void client
      .listEvents({ limit })
      .then((rows) => {
        if (alive) setEvents(rows);
      })
      .catch((e: unknown) => {
        const msg =
          e instanceof Error ? e.message : typeof e === "string" ? e : "Could not load shows.";
        if (alive) setErr(msg);
      });
    return () => {
      alive = false;
    };
  }, [client, limit]);

  if (err) {
    return <p className={className}>{err}</p>;
  }
  if (!events) {
    return <p className={className}>Loading…</p>;
  }
  return (
    <section className={className}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th scope="col" style={{ textAlign: "left", padding: "8px 0" }}>
              Show
            </th>
            <th scope="col" style={{ textAlign: "left", padding: "8px 0" }}>
              When
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) =>
            renderItem ? (
              <React.Fragment key={e.id}>{renderItem(e)}</React.Fragment>
            ) : (
              <tr key={e.id} className={itemClassName}>
                <td style={{ padding: "10px 0", verticalAlign: "top" }}>
                  <strong>{e.name}</strong>
                  {[e.city, e.country].filter(Boolean).length ? (
                    <div style={{ fontSize: "0.875rem", color: "#666" }}>
                      {[e.city, e.country].filter(Boolean).join(", ")}
                    </div>
                  ) : null}
                </td>
                <td style={{ padding: "10px 0", verticalAlign: "top" }}>{e.date}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </section>
  );
}

export function EventDetail({
  idOrSlug,
  className,
}: {
  idOrSlug: string;
  className?: string;
}) {
  const client = useKintana();
  const [event, setEvent] = React.useState<KintanaPublicEvent | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    void client
      .getEvent(idOrSlug)
      .then((ev) => {
        if (alive) setEvent(ev);
      })
      .catch(() => {
        if (alive) setErr("Not found.");
      });
    return () => {
      alive = false;
    };
  }, [client, idOrSlug]);

  if (err) {
    return <article className={className}>{err}</article>;
  }
  if (!event) {
    return <article className={className}>Loading…</article>;
  }
  return (
    <article className={className}>
      <header>
        <h1 style={{ margin: "0 0 12px", fontSize: "1.75rem" }}>{event.name}</h1>
      </header>
      <dl style={{ display: "grid", gap: 8 }}>
        <div>
          <dt style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#666" }}>Date</dt>
          <dd style={{ margin: 0 }}>{event.date}</dd>
        </div>
        {[event.city, event.country].some(Boolean) ? (
          <div>
            <dt style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#666" }}>Where</dt>
            <dd style={{ margin: 0 }}>{[event.city, event.country].filter(Boolean).join(", ")}</dd>
          </div>
        ) : null}
      </dl>
      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <a
          href={event.ticketUrl}
          style={{
            display: "inline-block",
            padding: "10px 16px",
            background: "#e35336",
            color: "#fff",
            borderRadius: 8,
          }}
        >
          Tickets
        </a>
        <a
          href={event.embedUrl}
          style={{ display: "inline-block", padding: "10px 16px", borderRadius: 8, border: "1px solid #ccc" }}
        >
          Preview embed
        </a>
      </div>
      {event.imageUrl ? (
        <img
          alt=""
          src={event.imageUrl}
          width={640}
          height={360}
          style={{ marginTop: 16, width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 8 }}
        />
      ) : null}
      <div
        data-kintana-widget={`event:${event.id}`}
        style={{ marginTop: 24, minHeight: 320, borderRadius: 8 }}
      />
    </article>
  );
}

function fieldInputType(t: string): React.HTMLInputTypeAttribute {
  return t === "email" ? "email" : "text";
}

export function EmbedForm({
  id,
  className,
  onSuccess,
}: {
  id: string;
  className?: string;
  /** Called after a successful submit when there is no redirect URL. */
  onSuccess?: (schema: KintanaPublicFormSchema) => void;
}) {
  const client = useKintana();
  const [schema, setSchema] = React.useState<KintanaPublicFormSchema | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    void client
      .getFormSchema(id)
      .then((s) => {
        if (alive) setSchema(s);
      })
      .catch(() => {
        if (alive) setMessage("Could not load this form.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [client, id]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!schema) return;
    setSubmitting(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    for (const f of schema.fields) {
      const v = fd.get(f.id);
      values[f.id] = typeof v === "string" ? v : "";
    }
    try {
      const result = await client.submitForm(schema.id, values);
      if (result.ok !== true) {
        setMessage("Something went wrong.");
        return;
      }
      const successText = typeof result.successMessage === "string" ? result.successMessage : null;
      const redirectHint = typeof result.redirectUrl === "string" ? result.redirectUrl : null;

      setMessage(successText ?? "Submitted.");
      if (redirectHint) {
        window.location.assign(redirectHint);
        return;
      }

      const schemaSnapshot = schema;
      onSuccess?.(schemaSnapshot);
    } catch {
      setMessage("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className={className}>Loading…</div>;
  if (!schema) return <div className={className}>{message ?? "Unavailable."}</div>;

  return (
    <div className={className}>
      <h2 style={{ fontSize: "1.125rem", marginBottom: 12 }}>{schema.title}</h2>
      <form onSubmit={(e) => void submit(e)} style={{ display: "grid", gap: 14 }}>
        {schema.fields.map((f) => (
          <label key={f.id} style={{ display: "grid", gap: 6, fontWeight: 500 }}>
            <span>
              {f.label}
              {f.required ? " *" : ""}
            </span>
            {f.type === "textarea" ? (
              <textarea
                name={f.id}
                required={Boolean(f.required)}
                rows={4}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            ) : (
              <input
                type={fieldInputType(f.type)}
                name={f.id}
                required={Boolean(f.required)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            )}
          </label>
        ))}
        <button
          type="submit"
          disabled={submitting}
          style={{
            justifySelf: "start",
            padding: "12px 20px",
            borderRadius: 8,
            background: submitting ? "#888" : "#e35336",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            cursor: submitting ? "default" : "pointer",
          }}
        >
          {submitting ? "Sending…" : "Send"}
        </button>
      </form>
      {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
    </div>
  );
}

export function KintanaTracker(): null {
  const ctx = React.useContext(KintanaContext);
  const added = React.useRef(false);

  React.useEffect(() => {
    if (!ctx) {
      console.error("[@kintana/sdk/react] KintanaTracker requires a parent KintanaProvider.");
      return;
    }
    if (added.current) return () => {};
    added.current = true;
    const b = ctx.baseUrl.replace(/\/$/, "");
    const script = document.createElement("script");
    script.async = true;
    script.src = `${b}/_t/k.js`;
    script.dataset.token = ctx.apiKey;
    script.dataset.apiBase = b;
    document.body.appendChild(script);
    return () => {
      added.current = false;
      try {
        document.body.removeChild(script);
      } catch {
        /* ignore */
      }
    };
  }, [ctx?.apiKey, ctx?.baseUrl]);

  return null;
}
