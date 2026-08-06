import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgSession, UnauthorizedError } from "@/lib/session";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/prospects/[id]/draft">
) {
  let organizationId: string;
  try {
    ({ organizationId } = await requireOrgSession());
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }

  const { id } = await ctx.params;
  const body = await request.json();
  const { draftId, subject, body: emailBody, status } = body;

  if (!draftId) {
    return NextResponse.json({ error: "draftId is required" }, { status: 400 });
  }

  const existing = await prisma.emailDraft.findUnique({
    where: { id: draftId },
    include: { prospect: true },
  });
  if (
    !existing ||
    existing.prospectId !== id ||
    existing.prospect.organizationId !== organizationId
  ) {
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
