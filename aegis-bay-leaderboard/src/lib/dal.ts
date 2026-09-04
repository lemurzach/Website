import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { decryptSession, getAdminSessionCookie } from "@/lib/session";

export const verifyAdmin = cache(async () => {
  const cookie = await getAdminSessionCookie();
  const session = await decryptSession(cookie);

  if (!session?.admin) {
    redirect("/admin/login");
  }

  return { isAdmin: true as const };
});

export const isAdminAuthenticated = cache(async () => {
  const cookie = await getAdminSessionCookie();
  const session = await decryptSession(cookie);
  return Boolean(session?.admin);
});
