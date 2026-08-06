import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/prospects/[id]/draft">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const { draftId, subject, body: emailBody, status } = body;

  if (!draftId) {
    return NextResponse.json({ error: "draftId is required" }, { status: 400 });
  }

  const existing = await prisma.emailDraft.findUnique({ where: { id: draftId } });
  if (!existing || existing.prospectId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const draft = await prisma.emailDraft.update({
    where: { id: draftId },
    data: {
      ...(subject !== undefined ? { subject } : {}),
      ...(emailBody !== undefined ? { body: emailBody } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });

  return NextResponse.json(draft);
}
