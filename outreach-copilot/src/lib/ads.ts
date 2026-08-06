export interface AdSignals {
  available: boolean;
  isRunningAds: boolean;
  activeAdCount: number;
  sampleAdCopy: string[];
  note?: string;
}

// Meta Ad Library API (official, public data — no scraping). Requires an access
// token from a Meta developer app with the ads_read permission.
// Docs: https://www.facebook.com/ads/library/api
//
// There is currently no equivalent public API for the Google Ads Transparency
// Center; scraping its UI is against Google's terms of service, so we don't
// attempt it here. If that data matters for your niche, consider a paid
// aggregator (e.g. SEMrush/SpyFu ad intelligence) behind the same interface.
export async function getAdSignals(companyName: string): Promise<AdSignals> {
  const accessToken = process.env.META_AD_LIBRARY_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      available: false,
      isRunningAds: false,
      activeAdCount: 0,
      sampleAdCopy: [],
      note: "META_AD_LIBRARY_ACCESS_TOKEN not configured; skipping ad lookup.",
    };
  }

  const endpoint = new URL("https://graph.facebook.com/v19.0/ads_archive");
  endpoint.searchParams.set("search_terms", companyName);
  endpoint.searchParams.set("ad_reached_countries", JSON.stringify(["US"]));
  endpoint.searchParams.set("ad_active_status", "ACTIVE");
  endpoint.searchParams.set(
    "fields",
    "page_name,ad_creative_bodies,ad_creative_link_titles,ad_delivery_start_time"
  );
  endpoint.searchParams.set("access_token", accessToken);

  try {
    const res = await fetch(endpoint.toString(), { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      return {
        available: false,
        isRunningAds: false,
        activeAdCount: 0,
        sampleAdCopy: [],
        note: `Meta Ad Library API returned ${res.status}`,
      };
    }
    const data = await res.json();
    const ads: Array<{ ad_creative_bodies?: string[] }> = data?.data ?? [];
    const sampleAdCopy = ads
      .flatMap((ad) => ad.ad_creative_bodies ?? [])
      .filter(Boolean)
      .slice(0, 5);

    return {
      available: true,
      isRunningAds: ads.length > 0,
      activeAdCount: ads.length,
      sampleAdCopy,
    };
  } catch (err) {
    return {
      available: false,
      isRunningAds: false,
      activeAdCount: 0,
      sampleAdCopy: [],
      note: err instanceof Error ? err.message : "Unknown error fetching ad signals",
    };
  }
}
