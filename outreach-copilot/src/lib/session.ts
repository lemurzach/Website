import { auth } from "@/auth";

export class UnauthorizedError extends Error {}

export async function requireOrgSession() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    throw new UnauthorizedError("Not signed in");
  }
  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    userEmail: session.user.email ?? null,
    userName: session.user.name ?? null,
  };
}
