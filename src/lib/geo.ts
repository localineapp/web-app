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

export interface GeoInfo {
  city: string | null;
  /** ISO 3166-1 alpha-2 country code, e.g. "DE", "US" */
  country: string | null;
}

const EMPTY: GeoInfo = { city: null, country: null };

/** Returns true for RFC-1918 / loopback / link-local addresses. */
function isPrivateIp(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith('169.254.') ||
    ip.startsWith('fc') ||
    ip.startsWith('fd')
  );
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
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=city,countryCode`, {
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
