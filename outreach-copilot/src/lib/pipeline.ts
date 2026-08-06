import { prisma } from "./db";
import { scrapeSite } from "./scrape";
import { getSeoSignals } from "./seo";
import { getAdSignals } from "./ads";
import { extractInsights, draftEmail } from "./llm";

const SENDER_NAME = process.env.SENDER_NAME || "Your Name";
const SENDER_CONTEXT =
  process.env.SENDER_CONTEXT ||
  "I help companies improve their outreach and marketing operations.";

export async function runProspectPipeline(prospectId: string): Promise<void> {
  const prospect = await prisma.prospect.findUniqueOrThrow({ where: { id: prospectId } });

  await prisma.prospect.update({
    where: { id: prospectId },
    data: { status: "ANALYZING" },
  });

  try {
    const [scraped, seo, ads] = await Promise.all([
      scrapeSite(prospect.website),
      getSeoSignals(prospect.website),
      getAdSignals(prospect.companyName),
    ]);

    const insights = await extractInsights({
      companyName: prospect.companyName,
      website: prospect.website,
      scraped,
      seo,
      ads,
    });

    await prisma.insight.createMany({
      data: insights.map((insight) => ({
        prospectId,
        category: insight.category,
        summary: insight.summary,
        rawData: JSON.stringify({ evidence: insight.evidence }),
      })),
    });

    const email = await draftEmail({
      companyName: prospect.companyName,
      contactName: prospect.contactName,
      senderName: SENDER_NAME,
      senderContext: SENDER_CONTEXT,
      insights,
    });

    await prisma.emailDraft.create({
      data: {
        prospectId,
        subject: email.subject,
        body: email.body,
      },
    });

    await prisma.prospect.update({
      where: { id: prospectId },
      data: { status: "READY" },
    });
  } catch (err) {
    await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      },
    });
  }
}
