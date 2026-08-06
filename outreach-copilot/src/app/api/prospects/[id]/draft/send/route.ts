import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgSession, UnauthorizedError } from "@/lib/session";
import { sendDraftViaGmail } from "@/lib/gmail";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/prospects/[id]/draft/send">
) {
  let session;
  try {
    session = await requireOrgSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }

  const { id } = await ctx.params;
  const { draftId } = await request.json();

  const draft = await prisma.emailDraft.findUnique({
    where: { id: draftId },
    include: { prospect: true },
  });

  if (
    !draft ||
    draft.prospectId !== id ||
    draft.prospect.organizationId !== session.organizationId
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await sendDraftViaGmail(draft.id, session.userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send";
    await prisma.emailDraft.update({
      where: { id: draft.id },
      data: { status: "FAILED", errorMessage: message },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const updated = await prisma.emailDraft.update({
    where: { id: draft.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      sentById: session.userId,
      errorMessage: null,
    },
  });

  return NextResponse.json(updated);
}
