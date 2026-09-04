import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DangerBadge, VillainStatusBadge } from "@/components/badges";

export default async function VillainDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const villain = await prisma.villain.findUnique({
    where: { id: Number(id) },
  });

  if (!villain) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/villains"
        className="text-sm text-slate-400 transition hover:text-red-400"
      >
        ← Back to bounty board
      </Link>

      <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:flex-row">
        {villain.imageUrl ? (
          <Image
            src={villain.imageUrl}
            alt={villain.alias}
            width={160}
            height={160}
            className="h-40 w-40 shrink-0 rounded-xl object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 font-mono text-2xl font-bold text-red-400">
            WANTED
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-sm font-bold text-emerald-400">
              ${villain.bounty.toLocaleString()} bounty
            </span>
            <VillainStatusBadge status={villain.status} />
            <DangerBadge level={villain.dangerLevel} />
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-100">
            {villain.alias}
          </h1>
          <p className="text-slate-500">{villain.name}</p>
          {villain.lastKnownLocation && (
            <p className="mt-1 text-sm text-slate-400">
              Last known location: {villain.lastKnownLocation}
            </p>
          )}

          <div className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quirk
            </h2>
            <p className="font-semibold text-slate-200">{villain.quirk}</p>
            <p className="mt-1 text-slate-400">{villain.quirkDescription}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Case file
        </h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-300">
          {villain.bio}
        </p>
      </div>
    </div>
  );
}
