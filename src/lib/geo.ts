/**
 * IP Geolocation helper
 *
 * Returns the city and ISO 3166-1 alpha-2 country code for an IP address.
 *
 * Opt-in
 * ------
 * Geolocation is disabled by default to avoid unexpected outbound traffic.
 * Set GEOIP_ENABLED=true in your environment to enable it.
 *
 * Provider
 * --------
 * Uses ip-api.com (free tier, no API key required, 45 req/min limit).
 * You can swap the implementation for any other provider (MaxMind GeoIP2
 * database, ipinfo.io, etc.) without changing the call sites – just keep
 * the `GeoInfo` return shape.
 *
 * Private / loopback addresses always return { city: null, country: null }
 * without making a network request.
 */

import ipaddr from 'ipaddr.js';

export interface GeoInfo {
  city: string | null;
  /** ISO 3166-1 alpha-2 country code, e.g. "DE", "US" */
  country: string | null;
}

const EMPTY: GeoInfo = { city: null, country: null };

/** Named ranges considered non-routable / private. */
const PRIVATE_RANGES = new Set([
  'loopback',
  'private',
  'linkLocal',
  'uniqueLocal',
  'ipv4Mapped',  // ::ffff:0:0/96 — IPv4-mapped IPv6
  'rfc6145',     // IPv4-translated IPv6 (::ffff:0:0:0/96)
  'rfc6052',     // IPv4/IPv6 translation (64:ff9b::/96)
  '6to4',        // 2002::/16
  'teredo',      // 2001::/32
  'reserved',
]);

/**
 * Returns true for any address that should not be sent to an external
 * geo-lookup service: loopback, RFC-1918 private, link-local, IPv6
 * unique-local (ULA, fc00::/7), IPv4-mapped IPv6, and other non-routable
 * ranges.
 *
 * Uses ipaddr.js so that all IPv4 and IPv6 edge-cases are handled correctly
 * (case-insensitive, compressed notation, IPv4-mapped IPv6, etc.).
 */
function isPrivateIp(ip: string): boolean {
  try {
    // ipaddr.process() normalises IPv4-mapped IPv6 (::ffff:x.x.x.x) to plain
    // IPv4 before range-checking, so private IPv4-mapped addresses are caught.
    const range = ipaddr.process(ip).range();
    return PRIVATE_RANGES.has(range);
  } catch {
    // Unparseable string — treat as private to avoid leaking bad input.
    return true;
  }
}

/**
 * Look up `city` and `country` for an IP address.
 *
 * Never throws – returns `EMPTY` on any error or when geolocation is
 * disabled / not applicable.
 */
export async function getGeoInfo(ip: string | null | undefined): Promise<GeoInfo> {
  if (!ip || isPrivateIp(ip)) return EMPTY;
  if (process.env.GEOIP_ENABLED !== 'true') return EMPTY;

  try {
    const res = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}?fields=city,countryCode`, {
      signal: AbortSignal.timeout(2500),
    });

    if (!res.ok) return EMPTY;

    const data = (await res.json()) as { city?: string; countryCode?: string };
    return {
      city: data.city || null,
      country: data.countryCode || null,
    };
  } catch {
    return EMPTY;
  }
}
