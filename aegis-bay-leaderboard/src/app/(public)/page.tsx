import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HeroStatusBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

const rankStyles = [
  "border-amber-400/60 bg-amber-400/10 text-amber-300",
  "border-slate-300/50 bg-slate-300/10 text-slate-200",
  "border-orange-400/50 bg-orange-400/10 text-orange-300",
];

export default async function HeroesPage() {
  const heroes = await prisma.hero.findMany({ orderBy: { rank: "asc" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Hero Leaderboard</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Official rankings of Aegis Bay&apos;s licensed pro heroes, updated by
          the Public Safety Commission.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {heroes.map((hero) => (
          <Link
            key={hero.id}
            href={`/heroes/${hero.id}`}
            className="group flex gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-amber-500/60 hover:bg-slate-900/70"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border font-mono text-lg font-bold ${
                rankStyles[hero.rank - 1] ??
                "border-slate-700 bg-slate-800/40 text-slate-300"
              }`}
            >
              #{hero.rank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate font-bold text-slate-100 group-hover:text-amber-300">
                  {hero.heroName}
                </h2>
                <HeroStatusBadge status={hero.status} />
              </div>
              <p className="text-sm text-slate-500">{hero.name}</p>
              <p className="mt-1 text-sm text-slate-400">
                Quirk: <span className="text-slate-300">{hero.quirk}</span>
              </p>
              {hero.agency && (
                <p className="mt-1 truncate text-xs text-slate-500">
                  {hero.agency}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {heroes.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
          No heroes have been registered yet. Check back soon.
        </p>
      )}
    </div>
  );
}
