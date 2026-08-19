/** Dial codes for the public phone picker (matches Kintana checkout). */
export const PHONE_COUNTRIES: { code: string; iso: string }[] = [
  { code: "+61", iso: "au" },
  { code: "+64", iso: "nz" },
  { code: "+44", iso: "gb" },
  { code: "+1", iso: "us" },
  { code: "+353", iso: "ie" },
  { code: "+31", iso: "nl" },
  { code: "+49", iso: "de" },
  { code: "+33", iso: "fr" },
  { code: "+39", iso: "it" },
  { code: "+34", iso: "es" },
  { code: "+351", iso: "pt" },
  { code: "+91", iso: "in" },
  { code: "+86", iso: "cn" },
  { code: "+81", iso: "jp" },
  { code: "+82", iso: "kr" },
  { code: "+65", iso: "sg" },
  { code: "+60", iso: "my" },
  { code: "+27", iso: "za" },
  { code: "+55", iso: "br" },
  { code: "+52", iso: "mx" },
];

export const PHONE_FALLBACK_DIAL = "+44";
export const PHONE_FALLBACK_ISO = "gb";

const COUNTRY_HINT_TO_DIAL: Record<string, string> = {
  "united kingdom": "+44",
  uk: "+44",
  england: "+44",
  scotland: "+44",
  wales: "+44",
  "northern ireland": "+44",
  "united states": "+1",
  usa: "+1",
  us: "+1",
  canada: "+1",
  australia: "+61",
  "new zealand": "+64",
  ireland: "+353",
  netherlands: "+31",
  germany: "+49",
  france: "+33",
  italy: "+39",
  spain: "+34",
  portugal: "+351",
  india: "+91",
  china: "+86",
  japan: "+81",
  "south korea": "+82",
  korea: "+82",
  singapore: "+65",
  malaysia: "+60",
  "south africa": "+27",
  brazil: "+55",
  mexico: "+52",
};

const ISO2_TO_DIAL: Record<string, string> = {
  US: "+1",
  CA: "+1",
  GB: "+44",
  GG: "+44",
  JE: "+44",
  IM: "+44",
  AU: "+61",
  NZ: "+64",
  IE: "+353",
  NL: "+31",
  DE: "+49",
  FR: "+33",
  IT: "+39",
  ES: "+34",
  PT: "+351",
  IN: "+91",
  CN: "+86",
  JP: "+81",
  KR: "+82",
  SG: "+65",
  MY: "+60",
  ZA: "+27",
  BR: "+55",
  MX: "+52",
};

export function defaultDialFromCountryHint(hint: string | null | undefined): string {
  const raw = hint?.trim();
  if (!raw) return PHONE_FALLBACK_DIAL;
  if (raw.startsWith("+") && PHONE_COUNTRIES.some((c) => c.code === raw)) return raw;
  const upper = raw.toUpperCase();
  if (upper.length === 2 && ISO2_TO_DIAL[upper]) return ISO2_TO_DIAL[upper]!;
  const lower = raw.toLowerCase();
  return COUNTRY_HINT_TO_DIAL[lower] ?? PHONE_FALLBACK_DIAL;
}

export function isoForDialCode(dialCode: string): string {
  return PHONE_COUNTRIES.find((c) => c.code === dialCode)?.iso ?? PHONE_FALLBACK_ISO;
}

export function formatPhoneE164(dialCode: string, national: string): string {
  const digits = national.replace(/\D/g, "");
  if (!digits) return "";
  return `${dialCode}${digits}`;
}

export function parsePhoneE164(
  value: string | null | undefined
): { dialCode: string; national: string } {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return { dialCode: PHONE_FALLBACK_DIAL, national: "" };
  }
  if (!trimmed.startsWith("+")) {
    return { dialCode: PHONE_FALLBACK_DIAL, national: trimmed.replace(/\D/g, "") };
  }
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const { code } of sorted) {
    if (trimmed.startsWith(code)) {
      return { dialCode: code, national: trimmed.slice(code.length).replace(/\D/g, "") };
    }
  }
  return { dialCode: PHONE_FALLBACK_DIAL, national: trimmed.replace(/\D/g, "") };
}
