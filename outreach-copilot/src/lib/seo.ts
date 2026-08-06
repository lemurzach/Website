export interface SeoSignals {
  available: boolean;
  performanceScore: number | null; // 0-100
  seoScore: number | null; // 0-100
  largestContentfulPaintMs: number | null;
  cumulativeLayoutShift: number | null;
  note?: string;
}

// Uses Google's PageSpeed Insights API. It works without an API key at low,
// unauthenticated quota; set GOOGLE_PAGESPEED_API_KEY to raise the limit.
// Docs: https://developers.google.com/speed/docs/insights/v5/get-started
export async function getSeoSignals(url: string): Promise<SeoSignals> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
  );
  endpoint.searchParams.set("url", normalizedUrl);
  endpoint.searchParams.append("category", "SEO");
  endpoint.searchParams.append("category", "PERFORMANCE");
  endpoint.searchParams.set("strategy", "MOBILE");
  if (apiKey) endpoint.searchParams.set("key", apiKey);

  try {
    const res = await fetch(endpoint.toString(), { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      return {
        available: false,
        performanceScore: null,
        seoScore: null,
        largestContentfulPaintMs: null,
        cumulativeLayoutShift: null,
        note: `PageSpeed API returned ${res.status}`,
      };
    }
    const data = await res.json();
    const categories = data?.lighthouseResult?.categories;
    const audits = data?.lighthouseResult?.audits;

    return {
      available: true,
      performanceScore: categories?.performance?.score != null
        ? Math.round(categories.performance.score * 100)
        : null,
      seoScore: categories?.seo?.score != null ? Math.round(categories.seo.score * 100) : null,
      largestContentfulPaintMs: audits?.["largest-contentful-paint"]?.numericValue ?? null,
      cumulativeLayoutShift: audits?.["cumulative-layout-shift"]?.numericValue ?? null,
    };
  } catch (err) {
    return {
      available: false,
      performanceScore: null,
      seoScore: null,
      largestContentfulPaintMs: null,
      cumulativeLayoutShift: null,
      note: err instanceof Error ? err.message : "Unknown error fetching SEO signals",
    };
  }
}
