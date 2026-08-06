import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runProspectPipeline } from "@/lib/pipeline";

export async function GET() {
  const prospects = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
    include: { drafts: true },
  });
  return NextResponse.json(prospects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { companyName, website, contactName, contactEmail } = body;

  if (!companyName || !website) {
    return NextResponse.json(
      { error: "companyName and website are required" },
      { status: 400 }
    );
  }

  const prospect = await prisma.prospect.create({
    data: { companyName, website, contactName, contactEmail },
  });

  await runProspectPipeline(prospect.id);

  const result = await prisma.prospect.findUnique({
    where: { id: prospect.id },
    include: { insights: true, drafts: true },
  });

  return NextResponse.json(result, { status: 201 });
}
