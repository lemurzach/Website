"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { villainSchema } from "@/lib/validation";

export type VillainFormState = { error?: string } | undefined;

function parseVillainForm(formData: FormData) {
  return villainSchema.safeParse({
    name: formData.get("name"),
    alias: formData.get("alias"),
    quirk: formData.get("quirk"),
    quirkDescription: formData.get("quirkDescription"),
    bio: formData.get("bio"),
    imageUrl: formData.get("imageUrl"),
    bounty: formData.get("bounty"),
    dangerLevel: formData.get("dangerLevel"),
    status: formData.get("status"),
    lastKnownLocation: formData.get("lastKnownLocation"),
  });
}

export async function createVillain(
  _prevState: VillainFormState,
  formData: FormData
): Promise<VillainFormState> {
  await verifyAdmin();

  const parsed = parseVillainForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.villain.create({ data: parsed.data });

  revalidatePath("/villains");
  revalidatePath("/admin/villains");
  redirect("/admin/villains");
}

export async function updateVillain(
  id: number,
  _prevState: VillainFormState,
  formData: FormData
): Promise<VillainFormState> {
  await verifyAdmin();

  const parsed = parseVillainForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.villain.update({ where: { id }, data: parsed.data });

  revalidatePath("/villains");
  revalidatePath("/admin/villains");
  redirect("/admin/villains");
}

export async function deleteVillain(id: number) {
  await verifyAdmin();

  await prisma.villain.delete({ where: { id } });

  revalidatePath("/villains");
  revalidatePath("/admin/villains");
}
