import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HeroStatusBadge } from "@/components/badges";

export default async function HeroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hero = await prisma.hero.findUnique({ where: { id: Number(id) } });

  if (!hero) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/"
        className="text-sm text-slate-400 transition hover:text-amber-400"
      >
        ← Back to leaderboard
      </Link>

      <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:flex-row">
        {hero.imageUrl ? (
          <Image
            src={hero.imageUrl}
            alt={hero.heroName}
            width={160}
            height={160}
            className="h-40 w-40 shrink-0 rounded-xl object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 font-mono text-4xl font-bold text-amber-400">
            #{hero.rank}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-amber-400/60 bg-amber-400/10 px-3 py-1 font-mono text-sm font-bold text-amber-300">
              Rank #{hero.rank}
            </span>
            <HeroStatusBadge status={hero.status} />
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-100">
            {hero.heroName}
          </h1>
          <p className="text-slate-500">{hero.name}</p>
          {hero.agency && (
            <p className="mt-1 text-sm text-slate-400">{hero.agency}</p>
          )}

          <div className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quirk
            </h2>
            <p className="font-semibold text-slate-200">{hero.quirk}</p>
            <p className="mt-1 text-slate-400">{hero.quirkDescription}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Biography
        </h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-300">
          {hero.bio}
        </p>
      </div>
    </div>
  );
}
