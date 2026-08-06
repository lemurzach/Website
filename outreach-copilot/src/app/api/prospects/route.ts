import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { runProspectPipeline } from "@/lib/pipeline";
import { requireOrgSession, UnauthorizedError } from "@/lib/session";

export async function GET() {
  try {
    const { organizationId } = await requireOrgSession();
    const prospects = await prisma.prospect.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { drafts: true },
    });
    return NextResponse.json(prospects);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireOrgSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }

  const body = await request.json();
  const { companyName, website, contactName, contactEmail } = body;

  if (!companyName || !website) {
    return NextResponse.json(
      { error: "companyName and website are required" },
      { status: 400 }
    );
  }

  const prospect = await prisma.prospect.create({
    data: {
      companyName,
      website,
      contactName,
      contactEmail,
      organizationId: session.organizationId,
      createdById: session.userId,
    },
  });

  // Don't block the response on scraping + LLM calls — the client polls
  // GET /api/prospects/[id] for status until it moves past ANALYZING.
  after(() => runProspectPipeline(prospect.id));

  return NextResponse.json(prospect, { status: 201 });
}
