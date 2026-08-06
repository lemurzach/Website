import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/prospects/[id]">
) {
  const { id } = await ctx.params;
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: { insights: true, drafts: true },
  });

  if (!prospect) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(prospect);
}
