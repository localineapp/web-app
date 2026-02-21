/**
 * Lightweight User-Agent parser
 *
 * No runtime dependency – uses regex only.
 * Returns a normalized `os` string and a `platform` category that are
 * suitable for display in a session management UI.
 */

export type Platform = 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';

export interface UAInfo {
  /** Human-readable OS name, e.g. "Windows 10/11", "iOS 17", "Android 14" */
  os: string | null;
  /** Device category */
  platform: Platform;
}

/**
 * Parse a raw User-Agent string into OS and platform.
 *
 * @param ua - The value of the `User-Agent` request header (may be null).
 */
export function parseUserAgent(ua: string | null | undefined): UAInfo {
  if (!ua) return { os: null, platform: 'unknown' };

  // ----- Bot / crawler -----
  if (/bot|crawl|spider|slurp|scraper|headless|puppeteer|playwright|selenium/i.test(ua)) {
    return { os: null, platform: 'bot' };
  }

  // ----- Platform category -----
  const isTablet =
    /ipad/i.test(ua) ||
    (/android/i.test(ua) && !/mobile/i.test(ua)) || // Android tablet UA lacks "Mobile"
    /tablet|kindle|silk|playbook/i.test(ua);

  const isMobile =
    !isTablet &&
    /mobile|iphone|ipod|blackberry|windows phone|opera mini|opera mobi/i.test(ua);

  const platform: Platform = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // ----- OS detection -----
  let os: string | null = null;

  // Windows
  if (/windows nt 10\.0/i.test(ua)) {
    // Windows 10 and 11 both report NT 10.0; we can't distinguish without extra hints
    os = 'Windows 10/11';
  } else if (/windows nt 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/windows nt 6\.2/i.test(ua)) {
    os = 'Windows 8';
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';

  // macOS / iOS
  } else if (/ipad.*cpu.*os (\d+)/i.test(ua)) {
    const m = ua.match(/cpu.*os (\d+)/i);
    os = `iPadOS${m ? ` ${m[1]}` : ''}`;
  } else if (/iphone.*cpu.*os (\d+)/i.test(ua)) {
    const m = ua.match(/cpu.*os (\d+)/i);
    os = `iOS${m ? ` ${m[1]}` : ''}`;
  } else if (/mac os x (\d+)[._](\d+)/i.test(ua)) {
    const m = ua.match(/mac os x (\d+)[._](\d+)/i);
    os = m ? `macOS ${m[1]}.${m[2]}` : 'macOS';

  // Android
  } else if (/android (\d+)/i.test(ua)) {
    const m = ua.match(/android (\d+)/i);
    os = `Android${m ? ` ${m[1]}` : ''}`;

  // Chrome OS
  } else if (/cros/i.test(ua)) {
    os = 'Chrome OS';

  // Linux (must come after Android / CrOS)
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  return { os, platform };
}
