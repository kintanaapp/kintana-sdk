import type { KintanaPublicFormSummary } from "./types";

export type FindFormOpts = {
  /** Embed form kind, e.g. `SHOW_REQUEST`, `NEWSLETTER`. Case-insensitive. */
  kind?: string;
  /** Stable slug from Business → Marketing → Forms. */
  slug?: string;
};

/** Pick the first active form matching slug (preferred) or kind. */
export function pickFormFromList(
  forms: readonly KintanaPublicFormSummary[],
  opts: FindFormOpts
): KintanaPublicFormSummary | null {
  const slug = opts.slug?.trim().toLowerCase();
  if (slug) {
    const bySlug = forms.find((f) => f.slug.toLowerCase() === slug);
    if (bySlug) return bySlug;
  }
  const kind = opts.kind?.trim().toUpperCase();
  if (kind) {
    return forms.find((f) => f.kind.toUpperCase() === kind) ?? null;
  }
  return null;
}
