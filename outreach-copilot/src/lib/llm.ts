import Anthropic from "@anthropic-ai/sdk";
import type { ScrapedSite } from "./scrape";
import type { SeoSignals } from "./seo";
import type { AdSignals } from "./ads";

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export interface ProspectInsight {
  category: "content" | "seo" | "ads" | "tech";
  summary: string;
  evidence: string;
}

const INSIGHTS_SCHEMA = {
  type: "object" as const,
  properties: {
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["content", "seo", "ads", "tech"] },
          summary: {
            type: "string",
            description: "A specific, verifiable observation a salesperson could reference in an email.",
          },
          evidence: {
            type: "string",
            description: "The concrete data point backing the summary (a number, a quote, a detected tag).",
          },
        },
        required: ["category", "summary", "evidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["insights"],
  additionalProperties: false,
};

export async function extractInsights(input: {
  companyName: string;
  website: string;
  scraped: ScrapedSite;
  seo: SeoSignals;
  ads: AdSignals;
}): Promise<ProspectInsight[]> {
  const { companyName, website, scraped, seo, ads } = input;

  const evidenceBlock = `
Company: ${companyName}
Website: ${website}

--- Site content ---
Title: ${scraped.title}
Meta description: ${scraped.metaDescription}
Headings: ${scraped.headings.join(" | ")}
Body excerpt: ${scraped.bodyText.slice(0, 3000)}
Page load time: ${scraped.loadTimeMs}ms
Detected tech/pixels: ${scraped.detectedTech.join(", ") || "none detected"}

--- SEO signals ---
${seo.available
    ? `Performance score: ${seo.performanceScore}/100
SEO score: ${seo.seoScore}/100
Largest Contentful Paint: ${seo.largestContentfulPaintMs}ms
Cumulative Layout Shift: ${seo.cumulativeLayoutShift}`
    : `Unavailable (${seo.note})`}

--- Ad activity ---
${ads.available
    ? `Currently running ads: ${ads.isRunningAds}
Active ad count: ${ads.activeAdCount}
Sample ad copy: ${ads.sampleAdCopy.join(" | ") || "none"}`
    : `Unavailable (${ads.note})`}
`.trim();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    output_config: { effort: "high" },
    system:
      "You are a research analyst for a sales outreach tool. Extract only specific, verifiable observations that a human could point to as evidence — never generic praise or vague claims. Every insight must cite concrete evidence from the provided data. If the data doesn't support a category, omit it rather than inventing something.",
    messages: [
      {
        role: "user",
        content: `Analyze this prospect and extract 3-6 specific, verifiable insights that could inform a personalized outreach email.\n\n${evidenceBlock}`,
      },
    ],
    tools: [
      {
        name: "record_insights",
        description: "Record the extracted insights about the prospect.",
        input_schema: INSIGHTS_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "record_insights" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return [];
  const parsed = toolUse.input as { insights: ProspectInsight[] };
  return parsed.insights;
}

const EMAIL_SCHEMA = {
  type: "object" as const,
  properties: {
    subject: { type: "string", description: "A short, specific, non-spammy subject line." },
    body: {
      type: "string",
      description: "The full email body, plain text, no signature block.",
    },
  },
  required: ["subject", "body"],
  additionalProperties: false,
};

export async function draftEmail(input: {
  companyName: string;
  contactName?: string | null;
  senderName: string;
  senderContext: string;
  insights: ProspectInsight[];
}): Promise<{ subject: string; body: string }> {
  const { companyName, contactName, senderName, senderContext, insights } = input;

  const insightsBlock = insights
    .map((i) => `- [${i.category}] ${i.summary} (evidence: ${i.evidence})`)
    .join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    output_config: { effort: "high" },
    system: `You write cold outreach emails that get read because they are specific and short, not because they are clever. Rules:
- Reference at most 2-3 of the given insights — pick the most compelling, don't list them all.
- Never use generic flattery ("I love what you're doing", "impressive website").
- No corporate buzzwords, no exclamation points, no emoji.
- Sound like a real person who actually looked at the company, not a template.
- 4-6 short sentences total. One clear ask at the end (a reply or a quick call), not a hard sell.
- Do not fabricate any fact not present in the provided insights.`,
    messages: [
      {
        role: "user",
        content: `Write a cold outreach email.

Sender: ${senderName}
Sender's context (what they offer): ${senderContext}

Recipient company: ${companyName}
Recipient contact name: ${contactName || "unknown — do not invent a name, use no greeting name or a generic one"}

Verified insights about the recipient (use 2-3, not all):
${insightsBlock}`,
      },
    ],
    tools: [
      {
        name: "record_email",
        description: "Record the drafted email.",
        input_schema: EMAIL_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "record_email" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Model did not return a structured email");
  }
  return toolUse.input as { subject: string; body: string };
}
