import { chromium } from "playwright";

export interface ScrapedSite {
  url: string;
  title: string | null;
  metaDescription: string | null;
  headings: string[];
  bodyText: string;
  detectedTech: string[];
  loadTimeMs: number;
}

// Signatures we can detect straight from page HTML/scripts without any paid API.
// Each entry: a label to surface to the LLM, and a regex to test against the raw HTML.
const TECH_SIGNATURES: Array<{ label: string; pattern: RegExp }> = [
  { label: "Google Analytics (GA4)", pattern: /gtag\(['"]config['"]|googletagmanager\.com\/gtag/i },
  { label: "Google Tag Manager", pattern: /googletagmanager\.com\/gtm\.js/i },
  { label: "Google Ads conversion tracking", pattern: /googleadservices\.com|\/pagead\/conversion/i },
  { label: "Meta (Facebook) Pixel", pattern: /connect\.facebook\.net\/.*\/fbevents\.js/i },
  { label: "TikTok Pixel", pattern: /analytics\.tiktok\.com\/i18n\/pixel/i },
  { label: "LinkedIn Insight Tag", pattern: /snap\.licdn\.com\/li\.lms-analytics/i },
  { label: "HubSpot", pattern: /js\.hs-scripts\.com|hsforms\.net/i },
  { label: "Shopify", pattern: /cdn\.shopify\.com|Shopify\.theme/i },
  { label: "WordPress", pattern: /wp-content|wp-includes/i },
  { label: "Intercom", pattern: /widget\.intercom\.io/i },
  { label: "Drift chat", pattern: /js\.driftt\.com/i },
];

export async function scrapeSite(url: string): Promise<ScrapedSite> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (compatible; OutreachCopilotBot/0.1; +https://example.com/bot)",
    });

    const start = Date.now();
    await page.goto(normalizedUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
    const loadTimeMs = Date.now() - start;

    const html = await page.content();
    const title = await page.title();
    const metaDescription = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute("content")
      .catch(() => null);

    const headings = await page
      .locator("h1, h2")
      .allTextContents()
      .then((list) => list.map((h) => h.trim()).filter(Boolean).slice(0, 15));

    const bodyText = await page
      .locator("body")
      .innerText()
      .then((text) => text.replace(/\s+/g, " ").trim().slice(0, 6000));

    const detectedTech = TECH_SIGNATURES.filter((sig) => sig.pattern.test(html)).map(
      (sig) => sig.label
    );

    return {
      url: normalizedUrl,
      title: title || null,
      metaDescription,
      headings,
      bodyText,
      detectedTech,
      loadTimeMs,
    };
  } finally {
    await browser.close();
  }
}
