"use client";

import * as React from "react";
import type { KintanaCustomerAuthResult } from "../fan-types";
import type { KintanaClient } from "../index";
import { createKintanaClient } from "../index";
import type { KintanaPublicEvent, KintanaPublicFormSchema, KintanaSubmitPayload } from "../types";
import { PhoneInput } from "./PhoneInput";

export { PhoneInput } from "./PhoneInput";
export type { PhoneInputProps } from "./PhoneInput";
export {
  PHONE_COUNTRIES,
  defaultDialFromCountryHint,
  formatPhoneE164,
  parsePhoneE164,
} from "../phone-countries";

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
        style={{ marginTop: 24, minHeight: 480, borderRadius: 8 }}
      />
    </article>
  );
}

function inputTypeForField(t: string): React.HTMLInputTypeAttribute {
  switch (t) {
    case "email":
      return "email";
    case "number":
      return "number";
    case "date":
      return "date";
    case "url":
      return "url";
    case "phone":
      return "tel";
    default:
      return "text";
  }
}

/** @deprecated Build your own form UI and use {@link useKintanaSubmit} or {@link KintanaClient.submitEndpoint}. */
export function EmbedForm({
  id,
  kind,
  slug,
  className,
  onSuccess,
}: {
  /** Explicit embed form id (optional when `kind` or `slug` is set). */
  id?: string;
  /** Resolve the first active form with this kind, e.g. `SHOW_REQUEST`. */
  kind?: string;
  /** Resolve by form slug when you have multiple forms of the same kind. */
  slug?: string;
  className?: string;
  /** Called after a successful submit when there is no redirect URL. */
  onSuccess?: (schema: KintanaPublicFormSchema) => void;
}) {
  const client = useKintana();
  const [schema, setSchema] = React.useState<KintanaPublicFormSchema | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<Record<string, File | undefined>>({});

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setMessage(null);
    setSchema(null);

    void (async () => {
      try {
        let formId = id?.trim() ?? "";
        if (!formId) {
          const match = await client.findForm({ kind, slug });
          formId = match?.id ?? "";
        }
        if (!formId) {
          if (alive) {
            setMessage(
              slug
                ? `No active form with slug “${slug}”.`
                : kind
                  ? `No active ${kind} form in this workspace. Create one in Kintana → Marketing → Forms.`
                  : "Pass id, kind, or slug to EmbedForm."
            );
          }
          return;
        }
        const s = await client.getFormSchema(formId);
        if (alive) setSchema(s);
      } catch {
        if (alive) setMessage("Could not load this form.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [client, id, kind, slug]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!schema) return;
    setSubmitting(true);
    setMessage(null);
    const formEl = e.currentTarget;
    try {
      const values: Record<string, string> = {};
      for (const f of schema.fields) {
        if (f.type === "multiselect") {
          const fd = new FormData(formEl);
          const picked = fd.getAll(f.id).filter((x): x is string => typeof x === "string");
          values[f.id] = picked.join(", ");
        } else if (f.type === "boolean") {
          const el = formEl.elements.namedItem(f.id);
          values[f.id] =
            el instanceof HTMLInputElement && el.type === "checkbox" && el.checked ? "true" : "";
        } else if (f.type === "file") {
          const pending = files[f.id];
          if (pending) {
            const up = await client.uploadEmbedFormFile(schema.id, f.id, pending);
            if (!up.ok || !up.url) {
              setMessage(up.error ?? "Upload failed.");
              return;
            }
            values[f.id] = up.url;
          } else {
            values[f.id] = "";
          }
        } else {
          const fd = new FormData(formEl);
          const v = fd.get(f.id);
          values[f.id] = typeof v === "string" ? v : "";
        }
      }
      const result = await client.submitForm(schema.id, values);
      if (result.ok !== true) {
        setMessage("Something went wrong.");
        return;
      }
      const successText = typeof result.successMessage === "string" ? result.successMessage : null;
      const redirectHint = typeof result.redirectUrl === "string" ? result.redirectUrl : null;

      setMessage(successText ?? "Submitted.");
      setFiles({});
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

  const controlStyle = { padding: 10, borderRadius: 8, border: "1px solid #ddd" } as const;

  return (
    <div className={className}>
      <h2 style={{ fontSize: "1.125rem", marginBottom: 12 }}>{schema.title}</h2>
      <form onSubmit={(e) => void submit(e)} style={{ display: "grid", gap: 14 }}>
        {schema.fields.map((f) => {
          const hint =
            f.helpText !== undefined && f.helpText !== "" ? (
              <span style={{ fontWeight: 400, fontSize: "0.8125rem", color: "#666" }}>{f.helpText}</span>
            ) : null;

          if (f.type === "textarea") {
            return (
              <label key={f.id} style={{ display: "grid", gap: 6, fontWeight: 500 }}>
                <span>
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {hint}
                <textarea
                  name={f.id}
                  required={Boolean(f.required)}
                  placeholder={f.placeholder}
                  rows={4}
                  style={{ ...controlStyle, fontFamily: "inherit" }}
                />
              </label>
            );
          }

          if (f.type === "boolean") {
            return (
              <label key={f.id} style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 500 }}>
                <input type="checkbox" name={f.id} value="true" required={Boolean(f.required)} />
                <span>{f.label}</span>
              </label>
            );
          }

          if (f.type === "select") {
            const choices = f.options?.choices ?? [];
            return (
              <label key={f.id} style={{ display: "grid", gap: 6, fontWeight: 500 }}>
                <span>
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {hint}
                <select name={f.id} required={Boolean(f.required)} style={controlStyle}>
                  <option value="">—</option>
                  {choices.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (f.type === "multiselect") {
            const choices = f.options?.choices ?? [];
            return (
              <div key={f.id} style={{ display: "grid", gap: 8 }}>
                <span style={{ fontWeight: 500 }}>
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {hint}
                <div style={{ display: "grid", gap: 6 }}>
                  {choices.map((c) => (
                    <label key={c} style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
                      <input type="checkbox" name={f.id} value={c} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (f.type === "file") {
            const accept = (f.options?.acceptMimeTypes ?? []).join(",");
            return (
              <div key={f.id} style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 500 }}>
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {hint}
                <input
                  type="file"
                  required={Boolean(f.required)}
                  accept={accept || undefined}
                  style={controlStyle}
                  onChange={(ev) => {
                    const fl = ev.target.files?.[0];
                    setFiles((prev) => ({ ...prev, [f.id]: fl }));
                  }}
                />
              </div>
            );
          }

          if (f.type === "phone") {
            return (
              <label key={f.id} style={{ display: "grid", gap: 6, fontWeight: 500 }}>
                <span>
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {hint}
                <PhoneInput
                  name={f.id}
                  required={Boolean(f.required)}
                  placeholder={f.placeholder ?? "412 345 678"}
                />
              </label>
            );
          }

          return (
            <label key={f.id} style={{ display: "grid", gap: 6, fontWeight: 500 }}>
              <span>
                {f.label}
                {f.required ? " *" : ""}
              </span>
              {hint}
              <input
                type={inputTypeForField(f.type)}
                name={f.id}
                required={Boolean(f.required)}
                placeholder={f.placeholder}
                style={controlStyle}
              />
            </label>
          );
        })}
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

function visitorKeyForSubmit(): string | undefined {
  try {
    const k = "_kvid";
    let v = localStorage.getItem(k);
    if (v) return v;
    v =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(k, v);
    return v;
  } catch {
    return undefined;
  }
}

/** Submit to a headless endpoint by slug from your own form UI. */
export function useKintanaSubmit(slug: string) {
  const client = useKintana();
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const submit = React.useCallback(
    async (payload: Omit<KintanaSubmitPayload, "visitorKey">) => {
      setSubmitting(true);
      setMessage(null);
      setError(null);
      try {
        const result = await client.submitEndpoint(slug, {
          ...payload,
          visitorKey: visitorKeyForSubmit(),
        });
        if (result.redirectUrl) {
          window.location.assign(result.redirectUrl);
          return result;
        }
        setMessage(result.successMessage ?? "Submitted.");
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong.";
        setError(msg);
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [client, slug]
  );

  return { submit, submitting, message, error, setMessage, setError };
}

const KINTANA_AUTH_STORAGE_KEY = "kintana_access_token";

type KintanaAuthContextValue = {
  client: KintanaClient;
  accessToken: string | null;
  isSignedIn: boolean;
  requestMagicLink: (email: string, redirectUrl: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<KintanaCustomerAuthResult>;
  verifyToken: (token: string) => Promise<KintanaCustomerAuthResult>;
  signOut: () => void;
};

const KintanaAuthContext = React.createContext<KintanaAuthContextValue | null>(null);

export function KintanaAuthProvider({
  apiKey,
  baseUrl,
  initialAccessToken,
  storageKey = KINTANA_AUTH_STORAGE_KEY,
  children,
}: {
  apiKey: string;
  baseUrl: string;
  initialAccessToken?: string | null;
  storageKey?: string;
  children: React.ReactNode;
}) {
  const trimmedKey = apiKey.trim();
  const normalizedBase = baseUrl.replace(/\/$/, "");

  const [accessToken, setAccessTokenState] = React.useState<string | null>(() => {
    if (initialAccessToken?.trim()) return initialAccessToken.trim();
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(storageKey)?.trim() || null;
    } catch {
      return null;
    }
  });

  const client = React.useMemo(
    () =>
      createKintanaClient({
        apiKey: trimmedKey,
        baseUrl: normalizedBase,
        accessToken: accessToken ?? undefined,
      }),
    [trimmedKey, normalizedBase, accessToken]
  );

  React.useEffect(() => {
    client.setAccessToken(accessToken);
  }, [client, accessToken]);

  const persistToken = React.useCallback(
    (token: string | null) => {
      setAccessTokenState(token);
      client.setAccessToken(token);
      if (typeof window === "undefined") return;
      try {
        if (token) localStorage.setItem(storageKey, token);
        else localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
    },
    [client, storageKey]
  );

  const requestMagicLink = React.useCallback(
    async (email: string, redirectUrl: string) => {
      await client.requestCustomerMagicLink(email, { redirectUrl });
    },
    [client]
  );

  const verifyCode = React.useCallback(
    async (email: string, code: string) => {
      const res = await client.verifyCustomerAuth({ email, code });
      if (res.accessToken) persistToken(res.accessToken);
      return res;
    },
    [client, persistToken]
  );

  const verifyToken = React.useCallback(
    async (token: string) => {
      const res = await client.verifyCustomerAuth({ token });
      if (res.accessToken) persistToken(res.accessToken);
      return res;
    },
    [client, persistToken]
  );

  const signOut = React.useCallback(() => {
    persistToken(null);
  }, [persistToken]);

  const value = React.useMemo(
    () => ({
      client,
      accessToken,
      isSignedIn: Boolean(accessToken),
      requestMagicLink,
      verifyCode,
      verifyToken,
      signOut,
    }),
    [client, accessToken, requestMagicLink, verifyCode, verifyToken, signOut]
  );

  return <KintanaAuthContext.Provider value={value}>{children}</KintanaAuthContext.Provider>;
}

export function useKintanaAuth(): KintanaAuthContextValue {
  const ctx = React.useContext(KintanaAuthContext);
  if (!ctx) {
    throw new Error("Wrap your tree in <KintanaAuthProvider /> from @kintana/sdk/react.");
  }
  return ctx;
}
