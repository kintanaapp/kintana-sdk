import type { KintanaPublicVenueListed } from "./types";

/** One coarse city/country grouping for `/locations`-style menus (no bespoke API yet). */
export type KintanaGroupedCity = {
  /** Stable grouping key `${city}|${country}` (lowercase) */
  key: string;
  city: string | null;
  country: string | null;
  venues: KintanaPublicVenueListed[];
};

/**
 * Group venues for building local navigation from {@link createKintanaClient}.listVenues().
 *
 * Rows with unknown city collapse under `city = null`; country still partitions when known.
 */
export function groupVenuesByCity(
  venues: readonly KintanaPublicVenueListed[]
): KintanaGroupedCity[] {
  const map = new Map<string, KintanaGroupedCity>();
  const order: string[] = [];

  for (const v of venues) {
    const cityRaw = v.city?.trim();
    const countryRaw = v.country?.trim();
    const key = `${(cityRaw || "").toLowerCase()}|${(countryRaw || "").toLowerCase()}`;
    if (!map.has(key)) {
      order.push(key);
      map.set(key, {
        key,
        city: cityRaw ?? null,
        country: countryRaw ?? null,
        venues: [],
      });
    }
    map.get(key)!.venues.push(v);
  }

  const collator = new Intl.Collator(undefined, { sensitivity: "base" });
  for (const g of map.values()) {
    g.venues.sort((a, b) => collator.compare(a.name, b.name));
  }

  return order.map((k) => map.get(k)!);
}
