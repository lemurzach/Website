import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgSession, UnauthorizedError } from "@/lib/session";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/prospects/[id]">
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
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: { insights: true, drafts: true },
  });

  if (!prospect || prospect.organizationId !== organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(prospect);
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/prospects/[id]">
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
  const existing = await prisma.prospect.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { contactName, contactEmail } = await request.json();
  const prospect = await prisma.prospect.update({
    where: { id },
    data: {
      ...(contactName !== undefined ? { contactName } : {}),
      ...(contactEmail !== undefined ? { contactEmail } : {}),
    },
  });

  return NextResponse.json(prospect);
}
