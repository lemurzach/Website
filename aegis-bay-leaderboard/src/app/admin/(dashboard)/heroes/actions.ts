"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { heroSchema } from "@/lib/validation";

export type HeroFormState = { error?: string } | undefined;

function parseHeroForm(formData: FormData) {
  return heroSchema.safeParse({
    rank: formData.get("rank"),
    name: formData.get("name"),
    heroName: formData.get("heroName"),
    quirk: formData.get("quirk"),
    quirkDescription: formData.get("quirkDescription"),
    bio: formData.get("bio"),
    imageUrl: formData.get("imageUrl"),
    agency: formData.get("agency"),
    status: formData.get("status"),
  });
}

export async function createHero(
  _prevState: HeroFormState,
  formData: FormData
): Promise<HeroFormState> {
  await verifyAdmin();

  const parsed = parseHeroForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.hero.create({ data: parsed.data });

  revalidatePath("/");
  revalidatePath("/admin/heroes");
  redirect("/admin/heroes");
}

export async function updateHero(
  id: number,
  _prevState: HeroFormState,
  formData: FormData
): Promise<HeroFormState> {
  await verifyAdmin();

  const parsed = parseHeroForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.hero.update({ where: { id }, data: parsed.data });

  revalidatePath("/");
  revalidatePath("/admin/heroes");
  redirect("/admin/heroes");
}

export async function deleteHero(id: number) {
  await verifyAdmin();

  await prisma.hero.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/heroes");
}
