"use server";

import { redirect } from "next/navigation";
import { deleteAdminSession } from "@/lib/session";

export async function logout() {
  await deleteAdminSession();
  redirect("/admin/login");
}
