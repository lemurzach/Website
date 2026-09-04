"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return { error: "Enter your admin password." };
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return { error: "Admin login is not configured on the server." };
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return { error: "Incorrect password." };
  }

  await createAdminSession();
  redirect("/admin/heroes");
}
