import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DangerBadge, VillainStatusBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function VillainsPage() {
  const villains = await prisma.villain.findMany({
    orderBy: { bounty: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          Bounties &amp; Villains
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Active bounties issued by the Aegis Bay Public Safety Commission.
          Report sightings to your local hero agency — do not engage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {villains.map((villain) => (
          <Link
            key={villain.id}
            href={`/villains/${villain.id}`}
            className="group flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-red-500/60 hover:bg-slate-900/70"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate font-bold text-slate-100 group-hover:text-red-300">
                  {villain.alias}
                </h2>
                <p className="text-sm text-slate-500">{villain.name}</p>
              </div>
              <VillainStatusBadge status={villain.status} />
            </div>

            <p className="font-mono text-xl font-bold text-emerald-400">
              ${villain.bounty.toLocaleString()}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <DangerBadge level={villain.dangerLevel} />
              {villain.lastKnownLocation && (
                <span className="text-xs text-slate-500">
                  Last seen: {villain.lastKnownLocation}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-400">
              Quirk: <span className="text-slate-300">{villain.quirk}</span>
            </p>
          </Link>
        ))}
      </div>

      {villains.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
          No active bounties right now.
        </p>
      )}
    </div>
  );
}
