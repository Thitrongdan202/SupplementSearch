const CACHE_TTL_MS = 30 * 60 * 1000;
const STALE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  value: unknown;
  expiresAt: number;
  staleUntil: number;
}

const providerCache = new Map<string, CacheEntry>();

export async function fetchProviderJson<T>(
  url: URL,
  providerName: string,
  cacheTtlMs = CACHE_TTL_MS,
): Promise<T> {
  const key = url.toString();
  const now = Date.now();
  const cached = providerCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  try {
    const response = await fetch(key, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "SupplementAtlas/2.1 (https://github.com/Thitrongdan202/SupplementSearch)",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`${providerName} responded with ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) {
      throw new Error(`${providerName} returned a non-JSON response`);
    }

    const value = (await response.json()) as T;
    providerCache.set(key, {
      value,
      expiresAt: now + cacheTtlMs,
      staleUntil: now + STALE_TTL_MS,
    });
    return value;
  } catch (error) {
    if (cached && cached.staleUntil > now) {
      return cached.value as T;
    }
    throw error;
  }
}
