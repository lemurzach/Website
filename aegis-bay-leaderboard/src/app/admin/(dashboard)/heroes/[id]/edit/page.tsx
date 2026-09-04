import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HeroForm } from "../../hero-form";
import { updateHero } from "../../actions";

export default async function EditHeroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hero = await prisma.hero.findUnique({ where: { id: Number(id) } });

  if (!hero) notFound();

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-100">
        Edit {hero.heroName}
      </h2>
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <HeroForm hero={hero} action={updateHero.bind(null, hero.id)} />
      </div>
    </div>
  );
}
